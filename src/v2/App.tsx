import { WorkspaceShell } from "./WorkspaceShell";

// V2 workspace entry point. Renders the persistent four-region shell
// (App Nav -> Explorer -> Live Preview -> Properties). V1 is unaffected.
export default function App() {
  return <WorkspaceShell />;
}
