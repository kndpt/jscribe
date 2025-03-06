import { useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import Console from "./components/Console";
import Toolbar from "./components/Toolbar";
import EditorToolbar from "./components/EditorToolbar";
import { SnippetsProvider } from "./contexts/SnippetsContext";
import { ConsoleProvider } from "./contexts/ConsoleContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./index.css";

function AppContent() {
  // Add Google Font for UI
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Fira+Code:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-hidden flex flex-col">
        <Toolbar />
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 relative">
            <Editor />
            <EditorToolbar />
          </div>
          <div className="h-1/4">
            <Console />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SnippetsProvider>
        <ConsoleProvider>
          <AppContent />
        </ConsoleProvider>
      </SnippetsProvider>
    </ThemeProvider>
  );
}

export default App;
