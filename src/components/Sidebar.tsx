import { Plus, Search, Trash2 } from "lucide-react";
import { useSnippets } from "../contexts/SnippetsContext";
import { useTheme } from "../contexts/ThemeContext";
import { formatDistanceToNow } from "../utils/date";

const Sidebar = () => {
  const {
    filteredSnippets,
    selectedSnippetId,
    setSelectedSnippetId,
    createSnippet,
    deleteSnippet,
    searchQuery,
    setSearchQuery,
  } = useSnippets();
  const { isDark } = useTheme();

  return (
    <div
      className={`w-64 h-full ${
        isDark
          ? "bg-[#252526] border-[#3c3c3c] text-white"
          : "bg-gray-50 border-gray-200 text-gray-800"
      } border-r flex flex-col overflow-hidden`}
    >
      <div className={`p-3 ${isDark ? "border-b border-[#3c3c3c]" : "border-b border-gray-200"}`}>
        <button
          onClick={createSnippet}
          className={`flex items-center justify-center space-x-2 w-full py-2 px-3 rounded-md
                    ${
                      isDark
                        ? "bg-[#3c3c3c] text-white hover:bg-[#4c4c4c]"
                        : "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50"
                    }
                    transition-colors duration-150 text-sm font-medium mb-2`}
        >
          <Plus size={16} />
          <span>Nouveau snippet</span>
        </button>

        <div className={`relative mt-2 ${isDark ? "text-white" : "text-gray-800"}`}>
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search size={16} className={isDark ? "text-gray-400" : "text-gray-500"} />
          </div>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 text-sm rounded-md
                      ${
                        isDark
                          ? "bg-[#3c3c3c] border-[#555] text-white placeholder-gray-400 focus:border-blue-500"
                          : "bg-white border-gray-200 text-gray-800 placeholder-gray-500 focus:border-blue-500"
                      }
                      border focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {filteredSnippets.length === 0 ? (
          <div className={`text-center p-4 ${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}>
            {searchQuery ? "Aucun résultat trouvé" : "Aucun snippet disponible"}
          </div>
        ) : (
          <ul>
            {filteredSnippets.map((snippet) => (
              <li
                key={snippet.id}
                className={`group relative px-3 py-2 mx-2 mb-1 rounded-md cursor-pointer
                          ${
                            selectedSnippetId === snippet.id
                              ? isDark
                                ? "bg-blue-600 text-white"
                                : "bg-blue-100 text-blue-800"
                              : ""
                          }
                          ${
                            isDark
                              ? "hover:bg-[#3c3c3c] transition-colors duration-150"
                              : "hover:bg-gray-100 transition-colors duration-150"
                          }`}
              >
                <div onClick={() => setSelectedSnippetId(snippet.id)} className="flex flex-col">
                  <div className="font-medium text-sm truncate">
                    {snippet.title || "Sans titre"}
                  </div>
                  <div
                    className={`text-xs mt-1 truncate flex items-center space-x-2
                              ${
                                selectedSnippetId === snippet.id
                                  ? isDark
                                    ? "text-blue-200"
                                    : "text-blue-600"
                                  : isDark
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                  >
                    <span className="uppercase text-[10px]">
                      {snippet.language === "javascript" ? "JS" : "TS"}
                    </span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(snippet.updatedAt))}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSnippet(snippet.id);
                  }}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md
                            ${
                              selectedSnippetId === snippet.id
                                ? isDark
                                  ? "text-blue-200 hover:text-white hover:bg-blue-700"
                                  : "text-blue-600 hover:bg-blue-200"
                                : isDark
                                ? "text-gray-400 hover:text-white hover:bg-[#4c4c4c]"
                                : "text-gray-400 hover:text-gray-700 hover:bg-gray-200"
                            }
                            opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
