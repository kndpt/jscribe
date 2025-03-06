import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useSnippets } from "../contexts/SnippetsContext";
import { useTheme } from "../contexts/ThemeContext";
import { Loader2 } from "lucide-react";

const CodeEditor = () => {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedSnippet, updateSnippet } = useSnippets();
  const { theme, isDark } = useTheme();

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  // Map our language types to Monaco's supported languages
  const mapLanguage = (language: string) => {
    switch (language) {
      case "javascript":
        return "javascript";
      case "typescript":
        return "typescript";
      default:
        return "javascript";
    }
  };

  // Use an effect to create hover detection zone at the bottom
  useEffect(() => {
    // Function to show the toolbar
    const showToolbar = () => {
      const toolbar = document.querySelector('[data-role="editor-toolbar"]');
      if (toolbar) {
        toolbar.classList.remove("opacity-0");
        toolbar.classList.add("opacity-100");
      }
    };

    // Function to hide the toolbar (with delay)
    const hideToolbar = () => {
      setTimeout(() => {
        const toolbar = document.querySelector('[data-role="editor-toolbar"]');
        if (toolbar && !toolbar.matches(":hover")) {
          toolbar.classList.remove("opacity-100");
          toolbar.classList.add("opacity-0");
        }
      }, 300);
    };

    // Create a bottom hover detection zone with actual hover events
    if (containerRef.current) {
      const hoverZone = document.createElement("div");
      hoverZone.style.position = "absolute";
      hoverZone.style.bottom = "0";
      hoverZone.style.left = "0";
      hoverZone.style.width = "100%";
      hoverZone.style.height = "100px";
      hoverZone.style.zIndex = "20";
      hoverZone.style.pointerEvents = "none"; // Don't block editor interaction

      // Make the entire container show the toolbar on hover
      containerRef.current.addEventListener("mouseenter", showToolbar);
      containerRef.current.addEventListener("mouseleave", hideToolbar);

      containerRef.current.appendChild(hoverZone);

      return () => {
        if (containerRef.current) {
          containerRef.current.removeEventListener("mouseenter", showToolbar);
          containerRef.current.removeEventListener("mouseleave", hideToolbar);
          containerRef.current.contains(hoverZone) && containerRef.current.removeChild(hoverZone);
        }
      };
    }
  }, []);

  if (!selectedSnippet) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center text-gray-500 ${
          isDark ? "bg-[#1e1e1e]" : "bg-white"
        }`}
      >
        Sélectionnez un snippet ou créez-en un nouveau
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Editor
        height="100%"
        defaultLanguage={mapLanguage(selectedSnippet.language)}
        language={mapLanguage(selectedSnippet.language)}
        value={selectedSnippet.content}
        theme={theme === "light" ? "vs" : "vs-dark"}
        onChange={(value) => value && updateSnippet({ ...selectedSnippet, content: value })}
        onMount={handleEditorDidMount}
        loading={
          <div
            className={`${
              isDark ? "text-white bg-[#1e1e1e]" : ""
            } w-full h-full flex items-center justify-center`}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        }
        options={{
          fontSize: 14,
          fontFamily: '"Fira Code", Consolas, Monaco, "Andale Mono", monospace',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          lineNumbers: "on",
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 10,
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
      />
    </div>
  );
};

export default CodeEditor;
