import { useRef, useEffect, useState } from "react";
import { useConsole } from "../contexts/ConsoleContext";
import { useTheme } from "../contexts/ThemeContext";

const Console = () => {
  const consoleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { consoleOutput } = useConsole();
  const { isDark } = useTheme();

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleOutput]);

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
          } flex items-center`}
        >
          <div className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
            Console
          </div>
        </div>

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
                    line.includes("Error")
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
      </div>
    </>
  );
};

export default Console;
