import { StoreProvider } from "./store";
import { IcebergSidebar } from "./components/IcebergSidebar";
import { ContentEditor } from "./components/ContentEditor";
import { PreviewPane } from "./components/PreviewPane";

export default function App() {
  return (
    <StoreProvider>
      <div className="app">
        <header className="topbar">
          <div className="brand">
            <span className="logo">◭</span>
            <span className="brand-name">Iceberg</span>
          </div>
        </header>
        <div className="workspace">
          <IcebergSidebar />
          <ContentEditor />
          <PreviewPane />
        </div>
      </div>
    </StoreProvider>
  );
}
