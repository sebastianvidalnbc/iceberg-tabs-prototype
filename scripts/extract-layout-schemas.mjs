import esbuild from 'esbuild';
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm';
const PKG='/tmp/iceberg-src/iceberg-commerce-main/packages/iceberg-commerce-elements-peacock';
const SRC=path.join(PKG,'src'); const TSCONFIG=path.join(PKG,'tsconfig.json');
const stubPlugin={name:'stub',setup(b){
  b.onResolve({filter:/.*/},a=>{ if(a.path.startsWith('.')||path.isAbsolute(a.path))return; if(a.path.startsWith('@elements/'))return; return {path:a.path,namespace:'stub'};});
  b.onLoad({filter:/.*/,namespace:'stub'},()=>({contents:'module.exports=new Proxy(function(){},{get:(t,p)=>p==="__esModule"?false:module.exports,apply:()=>module.exports,construct:()=>({})});',loader:'js'}));
}};
async function extractOne(file){
  const res=await esbuild.build({entryPoints:[file],bundle:true,write:false,format:'cjs',platform:'node',tsconfig:TSCONFIG,logLevel:'silent',
    jsx:'transform',jsxFactory:'__jsx',jsxFragment:'__frag',banner:{js:'var __jsx=function(){return {}};var __frag="";'},
    loader:{'.png':'text','.svg':'text','.jpg':'text','.jpeg':'text','.webp':'text','.gif':'text','.css':'empty','.scss':'empty'},plugins:[stubPlugin]});
  const mod={exports:{}}; const ctx={module:mod,exports:mod.exports,require:()=>({}),console:{log(){},warn(){},error(){}},process,globalThis:{}};
  vm.createContext(ctx); new vm.Script(res.outputFiles[0].text).runInContext(ctx,{timeout:8000});
  return mod.exports.default ?? mod.exports;
}
const clean=(o)=>JSON.parse(JSON.stringify(o,(k,v)=>typeof v==='function'?undefined:v));
// gather schema files
const roots=[path.join(SRC,'core/atomic/templates'),path.join(SRC,'core-next/atomic/templates')];
const files=[]; (function walk(d){ if(!fs.existsSync(d))return; for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name); if(e.isDirectory())walk(p); else if(/schema\.tsx?$/.test(e.name))files.push(p);} })(roots[0]); (function walk(d){ if(!fs.existsSync(d))return; for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name); if(e.isDirectory())walk(p); else if(/schema\.tsx?$/.test(e.name))files.push(p);} })(roots[1]);
const out={}; let ok=0,fail=0,skip=0; const fails=[];
for(const f of files){
  try{ const s=clean(await extractOne(f));
    if(s?.type!=='section'||s?.deprecated){skip++;continue;}
    if(!s._id){skip++;continue;}
    out[s._id]={_id:s._id,name:s.name,layoutType:s.layoutType,editorOptions:s.editorOptions,globalLayoutOptionData:s.globalLayoutOptionData||[],optionData:s.optionData||[]};
    ok++;
  }catch(e){fail++; fails.push(path.relative(SRC,f)+' :: '+e.message.split('\n')[0]);}
}
const DEST=path.join('src','v4-eos','schemas'); fs.mkdirSync(DEST,{recursive:true});
fs.writeFileSync(path.join(DEST,'layoutSchemas.json'),JSON.stringify(out,null,1));
const bytes=fs.statSync(path.join(DEST,'layoutSchemas.json')).size;
console.log(`OK=${ok} SKIP=${skip} FAIL=${fail} | ids=${Object.keys(out).length} | ${(bytes/1024).toFixed(0)}KB`);
if(fails.length) console.log('FAILS:\n'+fails.join('\n'));
