import { useRef, useEffect, useState } from "react";
import { useConsole } from "../contexts/ConsoleContext";
import { useTheme } from "../contexts/ThemeContext";
import ObjectInspector from "./ObjectInspector";

type TabType = "console" | "inspector";

const Console = () => {
  const consoleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("console");
  const { consoleOutput, inspectorObjects, clearConsole, setConsoleTab } = useConsole();
  const { isDark } = useTheme();

  // Set the setActiveTab function in the context
  useEffect(() => {
    setConsoleTab(setActiveTab);
  }, [setConsoleTab]);

  useEffect(() => {
    if (consoleRef.current && activeTab === "console") {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleOutput, activeTab]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const container = consoleRef.current?.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;

      // Set minimum and maximum heights
      const minHeight = 100;
      const maxHeight = window.innerHeight * 0.8;

      container.style.height = `${Math.min(Math.max(newHeight, minHeight), maxHeight)}px`;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const renderTabContent = () => {
    if (activeTab === "console") {
      return (
        <div
          className={`flex-1 overflow-auto p-3 font-mono text-sm ${
            isDark ? "text-gray-300" : "text-gray-800"
          }`}
          style={{ fontFamily: '"Fira Code", monospace' }}
        >
          {consoleOutput.length === 0 ? (
            <div className={`italic ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Exécutez le code pour voir la sortie de la console...
            </div>
          ) : (
            <div>
              {consoleOutput.map((line, index) => (
                <div
                  key={index}
                  className={`py-0.5 ${
                    line.includes("Error") || line.includes("🔴")
                      ? "text-red-500"
                      : isDark
                      ? "text-green-400"
                      : "text-green-600"
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className={`flex-1 overflow-auto p-3 ${isDark ? "text-gray-300" : "text-gray-800"}`}>
          {inspectorObjects.length === 0 ? (
            <div className={`italic ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Aucun objet à inspecter. Utilisez console.log avec des objets pour les voir ici.
            </div>
          ) : (
            <div>
              {inspectorObjects.map((obj) => (
                <div
                  key={obj.id}
                  className={`mb-4 pb-4 ${
                    isDark ? "border-b border-gray-700" : "border-b border-gray-200"
                  }`}
                >
                  {obj.label && (
                    <div
                      className={`text-xs mb-1 ${
                        obj.label === "Error"
                          ? "text-red-500"
                          : isDark
                          ? "text-blue-400"
                          : "text-blue-600"
                      }`}
                    >
                      {obj.label}
                    </div>
                  )}
                  <ObjectInspector data={obj.data} isRoot={true} />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <>
      <div
        className={`h-2 cursor-row-resize ${
          isDark ? "hover:bg-[#3c3c3c] bg-[#252526]" : "hover:bg-gray-200"
        } transition-colors`}
        onMouseDown={() => setIsDragging(true)}
      />
      <div
        ref={consoleRef}
        className={`flex-1 border-t h-full ${
          isDark ? "border-[#2a2a2a] bg-[#1e1e1e]" : "border-gray-200 bg-white"
        } flex flex-col`}
      >
        <div
          className={`px-4 py-2 ${
            isDark ? "border-b border-[#2a2a2a]" : "border-b border-gray-200"
          } flex items-center justify-between`}
        >
          <div className="flex space-x-4">
            <button
              className={`text-sm font-medium px-3 py-1 rounded-md transition-colors ${
                activeTab === "console"
                  ? isDark
                    ? "bg-[#2a2a2a] text-white"
                    : "bg-gray-200 text-gray-900"
                  : isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("console")}
            >
              Console
            </button>
            <button
              className={`text-sm font-medium px-3 py-1 rounded-md transition-colors ${
                activeTab === "inspector"
                  ? isDark
                    ? "bg-[#2a2a2a] text-white"
                    : "bg-gray-200 text-gray-900"
                  : isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("inspector")}
            >
              Inspecteur {inspectorObjects.length > 0 && `(${inspectorObjects.length})`}
            </button>
          </div>
          <button
            className={`text-xs px-2 py-1 rounded ${
              isDark
                ? "text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
            onClick={clearConsole}
          >
            Effacer
          </button>
        </div>

        {renderTabContent()}
      </div>
    </>
  );
};

export default Console;
