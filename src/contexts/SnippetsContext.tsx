import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Snippet } from "../types";

interface SnippetsContextType {
  snippets: Snippet[];
  selectedSnippetId: string | null;
  selectedSnippet: Snippet | null;
  createSnippet: () => void;
  updateSnippet: (snippet: Snippet) => void;
  deleteSnippet: (id: string) => void;
  setSelectedSnippetId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredSnippets: Snippet[];
}

const SnippetsContext = createContext<SnippetsContextType | undefined>(undefined);

const createDefaultSnippet = (): Snippet => ({
  id: crypto.randomUUID(),
  title: "Nouveau snippet",
  content: "// Écrivez votre code ici",
  language: "javascript",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export function SnippetsProvider({ children }: { children: ReactNode }) {
  const [snippets, setSnippets] = useState<Snippet[]>(() => {
    try {
      const savedSnippets = localStorage.getItem("snippets");
      if (savedSnippets) {
        const parsed = JSON.parse(savedSnippets);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Si pas de snippets ou données invalides, créer un snippet par défaut
      const defaultSnippet = createDefaultSnippet();
      localStorage.setItem("snippets", JSON.stringify([defaultSnippet]));
      return [defaultSnippet];
    } catch (error) {
      console.error("Error loading snippets from localStorage:", error);
      const defaultSnippet = createDefaultSnippet();
      localStorage.setItem("snippets", JSON.stringify([defaultSnippet]));
      return [defaultSnippet];
    }
  });

  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(() => {
    return snippets.length > 0 ? snippets[0].id : null;
  });

  const [searchQuery, setSearchQuery] = useState<string>("");

  // Save snippets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("snippets", JSON.stringify(snippets));
    } catch (error) {
      console.error("Error saving snippets to localStorage:", error);
    }
  }, [snippets]);

  const createSnippet = () => {
    const newSnippet = createDefaultSnippet();
    setSnippets([newSnippet, ...snippets]);
    setSelectedSnippetId(newSnippet.id);
  };

  const updateSnippet = (updatedSnippet: Snippet) => {
    setSnippets(
      snippets.map((snippet) =>
        snippet.id === updatedSnippet.id
          ? { ...updatedSnippet, updatedAt: new Date().toISOString() }
          : snippet
      )
    );
  };

  const deleteSnippet = (id: string) => {
    const newSnippets = snippets.filter((snippet) => snippet.id !== id);
    setSnippets(newSnippets);

    // Select another snippet if the current one is deleted
    if (selectedSnippetId === id && newSnippets.length > 0) {
      setSelectedSnippetId(newSnippets[0].id);
    } else if (newSnippets.length === 0) {
      setSelectedSnippetId(null);
    }
  };

  const filteredSnippets = snippets.filter((snippet) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      snippet.title.toLowerCase().includes(lowerQuery) ||
      snippet.content.toLowerCase().includes(lowerQuery)
    );
  });

  const selectedSnippet = snippets.find((snippet) => snippet.id === selectedSnippetId) || null;

  const value = {
    snippets,
    selectedSnippetId,
    selectedSnippet,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    setSelectedSnippetId,
    searchQuery,
    setSearchQuery,
    filteredSnippets,
  };

  return <SnippetsContext.Provider value={value}>{children}</SnippetsContext.Provider>;
}

export function useSnippets() {
  const context = useContext(SnippetsContext);
  if (context === undefined) {
    throw new Error("useSnippets must be used within a SnippetsProvider");
  }
  return context;
}
