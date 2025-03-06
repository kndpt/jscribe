import { useState, useEffect } from "react";
import { Code, Copy, Play } from "lucide-react";
import { useSnippets } from "../contexts/SnippetsContext";
import { useConsole } from "../contexts/ConsoleContext";
import { useTheme } from "../contexts/ThemeContext";

const EditorToolbar = () => {
  const [visible, setVisible] = useState(false);
  const { selectedSnippet, updateSnippet } = useSnippets();
  const { runCode } = useConsole();
  const { isDark } = useTheme();

  // Always make the toolbar visible on component mount
  useEffect(() => {
    setVisible(true);
  }, []);

  const copyToClipboard = () => {
    // This will be handled by the parent component, but we include the button for UI completeness
    document.execCommand("copy");
  };

  const formatCode = () => {
    // This is a placeholder for a potential code formatting feature
    // In a real implementation, you might use libraries like prettier
    alert("Format code functionality would be implemented here");
  };

  if (!selectedSnippet) return null;

  return (
    <div
      data-role="editor-toolbar"
      className={`absolute bottom-6 left-0 right-0 flex justify-center py-2 z-50 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <div
        className={`flex items-center space-x-2 px-3 py-2 rounded-[0.80rem] shadow-md  ${
          isDark ? "bg-[#2C2C2C]" : "bg-white shadow-gray-100 border border-gray-100"
        }`}
      >
        <div
          className={`flex items-center rounded-lg overflow-hidden border ${
            isDark ? "border-gray-400" : "border-gray-300"
          }`}
        >
          <button
            onClick={() => updateSnippet({ ...selectedSnippet, language: "javascript" })}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              selectedSnippet.language === "javascript"
                ? "bg-blue-600 text-white"
                : isDark
                ? "bg-transparent text-gray-100 hover:bg-[#3c3c3c]"
                : "bg-transparent text-gray-700 hover:bg-gray-100"
            }`}
          >
            JS
          </button>
          <button
            onClick={() => updateSnippet({ ...selectedSnippet, language: "typescript" })}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              selectedSnippet.language === "typescript"
                ? "bg-blue-600 text-white"
                : isDark
                ? "bg-transparent text-gray-100 hover:bg-[#3c3c3c]"
                : "bg-transparent text-gray-700 hover:bg-gray-100"
            }`}
          >
            TS
          </button>
        </div>

        <div className={`w-px ml-4 h-4 ${isDark ? "bg-gray-100" : "bg-gray-300"}`} />

        <button
          onClick={formatCode}
          className={`p-2 rounded-full transition-colors ${
            isDark
              ? "text-gray-100 hover:bg-[#3c3c3c] hover:text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
          title="Formatter le code (⌘I)"
        >
          <Code size={18} />
        </button>

        <button
          onClick={copyToClipboard}
          className={`p-2 rounded-full transition-colors ${
            isDark
              ? "text-gray-100 hover:bg-[#3c3c3c] hover:text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
          title="Copier le code"
        >
          <Copy size={18} />
        </button>

        <button
          onClick={() => runCode(selectedSnippet)}
          className={`flex items-center space-x-1 rounded-md px-4 py-2 text-sm font-medium
                    ${
                      isDark
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-green-500 text-white hover:bg-green-600"
                    } 
                    active:translate-y-[1px] transition-all`}
          title="Exécuter (⌘S)"
        >
          <Play size={16} />
          <span>Exécuter</span>
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;
