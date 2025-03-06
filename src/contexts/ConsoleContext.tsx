import { createContext, useContext, useState, ReactNode } from "react";
import { Snippet } from "../types";

interface ConsoleContextType {
  consoleOutput: string[];
  runCode: (snippet: Snippet) => void;
  clearConsole: () => void;
}

const ConsoleContext = createContext<ConsoleContextType | undefined>(undefined);

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  const clearConsole = () => {
    setConsoleOutput([]);
  };

  const runCode = (snippet: Snippet) => {
    clearConsole();

    try {
      // Store original console methods
      const originalConsole = { ...console };
      const logs: string[] = [];

      // Override console methods
      console.log = (...args) => {
        logs.push(
          args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" ")
        );
        originalConsole.log(...args);
      };

      console.error = (...args) => {
        logs.push(
          `🔴 Error: ${args
            .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
            .join(" ")}`
        );
        originalConsole.error(...args);
      };

      let codeToExecute = snippet.content;

      // Basic TypeScript to JavaScript conversion
      if (snippet.language === "typescript") {
        codeToExecute = codeToExecute
          .replace(/:\s*[a-zA-Z<>[\]]+(?=[\s,)])/g, "") // Remove type annotations
          .replace(/public\s+|private\s+|protected\s+/g, "") // Remove access modifiers
          .replace(/interface\s+\w+\s*\{[^}]*\}/g, "") // Remove interfaces
          .replace(/implements\s+\w+/g, ""); // Remove implements clauses
      }

      // Execute the code
      const executedCode = new Function(codeToExecute)();

      // If code returns a value, add it to logs
      if (executedCode !== undefined) {
        logs.push(
          `→ ${typeof executedCode === "object" ? JSON.stringify(executedCode) : executedCode}`
        );
      }

      setConsoleOutput(logs);

      // Restore original console
      console.log = originalConsole.log;
      console.error = originalConsole.error;
    } catch (error) {
      setConsoleOutput([`🔴 Error: ${(error as Error).message}`]);
    }
  };

  const value = {
    consoleOutput,
    runCode,
    clearConsole,
  };

  return <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>;
}

export function useConsole() {
  const context = useContext(ConsoleContext);
  if (context === undefined) {
    throw new Error("useConsole must be used within a ConsoleProvider");
  }
  return context;
}
