import { Moon, Sun } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSnippets } from "../contexts/SnippetsContext";
import { useTheme } from "../contexts/ThemeContext";

const Toolbar = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { selectedSnippet, updateSnippet } = useSnippets();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    if (selectedSnippet) {
      setTitle(selectedSnippet.title);
    }
  }, [selectedSnippet?.title]);

  const handleTitleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
    if (selectedSnippet) {
      updateSnippet({ ...selectedSnippet, title });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      if (selectedSnippet) {
        updateSnippet({ ...selectedSnippet, title });
      }
    }
  };

  if (!selectedSnippet) {
    return (
      <div
        className={`${
          isDark
            ? "bg-[#252526] border-[#2a2a2a] text-white"
            : "bg-white border-gray-200 text-gray-800"
        } border-b px-4 py-2 flex items-center justify-between`}
      >
        <div className="flex-1" />
        <button
          onClick={toggleTheme}
          className={`p-1.5 rounded-md ${
            isDark ? "hover:bg-[#3c3c3c]" : "hover:bg-gray-100"
          } transition-colors`}
          title={isDark ? "Mode clair" : "Mode sombre"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`${
        isDark
          ? "bg-[#252526] border-[#2a2a2a] text-white"
          : "bg-white border-gray-200 text-gray-800"
      } border-b px-4 py-2 flex items-center justify-between`}
    >
      <div className="flex-1 min-w-0 flex items-center">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleKeyDown}
            className={`${
              isDark
                ? "bg-[#3c3c3c] border-[#555] text-white"
                : "bg-white border-blue-500 text-gray-800"
            } 
                      border rounded-md px-2 py-1 w-full max-w-sm text-base focus:outline-none`}
          />
        ) : (
          <h1
            onClick={handleTitleClick}
            className={`text-base font-medium truncate cursor-pointer ${
              isDark ? "hover:text-blue-400" : "hover:text-blue-600"
            }`}
          >
            {title || "Sans titre"}
          </h1>
        )}
      </div>

      <div className="flex items-center">
        <button
          onClick={toggleTheme}
          className={`p-1.5 rounded-md ${
            isDark ? "hover:bg-[#3c3c3c]" : "hover:bg-gray-100"
          } transition-colors`}
          title={isDark ? "Mode clair" : "Mode sombre"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
