import { createContext, useContext, useState, ReactNode, useRef } from "react";
import { Snippet } from "../types";

interface InspectorObject {
  id: string;
  timestamp: number;
  data: any;
  label?: string;
}

// Type for the setActiveTab function
type SetConsoleTabFunction = (tab: "console" | "inspector") => void;

interface ConsoleContextType {
  consoleOutput: string[];
  inspectorObjects: InspectorObject[];
  runCode: (snippet: Snippet) => void;
  clearConsole: () => void;
  setConsoleTab: (setTabFn: SetConsoleTabFunction) => void;
}

const ConsoleContext = createContext<ConsoleContextType | undefined>(undefined);

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [inspectorObjects, setInspectorObjects] = useState<InspectorObject[]>([]);
  const logsRef = useRef<string[]>([]);
  const inspectorObjectsRef = useRef<InspectorObject[]>([]);
  const originalConsoleRef = useRef<any>(null);
  const setActiveTabRef = useRef<SetConsoleTabFunction | null>(null);

  const setConsoleTab = (setTabFn: SetConsoleTabFunction) => {
    setActiveTabRef.current = setTabFn;
  };

  const clearConsole = () => {
    setConsoleOutput([]);
    setInspectorObjects([]);
    logsRef.current = [];
    inspectorObjectsRef.current = [];
  };

  // Function to restore original console methods
  const restoreConsole = () => {
    if (originalConsoleRef.current) {
      console.log = originalConsoleRef.current.log;
      console.error = originalConsoleRef.current.error;
      originalConsoleRef.current = null;
    }
  };

  // Function to update the console output with current logs
  const updateConsoleOutput = () => {
    setConsoleOutput([...logsRef.current]);
    setInspectorObjects([...inspectorObjectsRef.current]);
  };

  // Function to safely stringify objects, handling circular references and complex objects
  const safeStringify = (obj: any): string => {
    if (obj === null || obj === undefined) {
      return String(obj);
    }

    if (typeof obj !== "object") {
      return String(obj);
    }

    // Handle special objects
    if (obj instanceof Response) {
      return `Response { 
  status: ${obj.status}, 
  statusText: "${obj.statusText}", 
  ok: ${obj.ok}, 
  redirected: ${obj.redirected}, 
  type: "${obj.type}", 
  url: "${obj.url}" 
}`;
    }

    if (obj instanceof Headers) {
      const headersObj: Record<string, string> = {};
      obj.forEach((value, key) => {
        headersObj[key] = value;
      });
      return `Headers ${JSON.stringify(headersObj, null, 2)}`;
    }

    if (obj instanceof Error) {
      return `Error: ${obj.message}\n${obj.stack || ""}`;
    }

    if (obj instanceof Promise) {
      return "[Promise]";
    }

    if (obj instanceof Date) {
      return obj.toISOString();
    }

    if (Array.isArray(obj)) {
      try {
        return JSON.stringify(
          obj,
          (key, value) => {
            if (typeof value === "object" && value !== null) {
              if (
                value instanceof Response ||
                value instanceof Headers ||
                value instanceof Error ||
                value instanceof Promise
              ) {
                return safeStringify(value);
              }
            }
            return value;
          },
          2
        );
      } catch (e) {
        return `[Array(${obj.length})]`;
      }
    }

    // For regular objects, try to stringify with a circular reference handler
    const seen = new WeakSet();
    try {
      return JSON.stringify(
        obj,
        (key, value) => {
          if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
              return "[Circular Reference]";
            }
            seen.add(value);

            // Handle special objects inside regular objects
            if (
              value instanceof Response ||
              value instanceof Headers ||
              value instanceof Error ||
              value instanceof Promise
            ) {
              return safeStringify(value);
            }
          }
          return value;
        },
        2
      );
    } catch (e) {
      // If JSON.stringify fails, create a simplified representation
      const props = Object.getOwnPropertyNames(obj).slice(0, 10);
      const simplified: Record<string, string> = {};

      for (const prop of props) {
        try {
          const value = obj[prop];
          if (typeof value === "function") {
            simplified[prop] = "[Function]";
          } else if (typeof value === "object" && value !== null) {
            simplified[prop] = "[Object]";
          } else {
            simplified[prop] = String(value);
          }
        } catch {
          simplified[prop] = "[Error accessing property]";
        }
      }

      if (props.length < Object.getOwnPropertyNames(obj).length) {
        simplified["..."] = `and ${
          Object.getOwnPropertyNames(obj).length - props.length
        } more properties`;
      }

      return `Object ${JSON.stringify(simplified, null, 2)}`;
    }
  };

  const runCode = (snippet: Snippet) => {
    clearConsole();

    try {
      // Store original console methods if not already stored
      if (!originalConsoleRef.current) {
        originalConsoleRef.current = {
          log: console.log,
          error: console.error,
        };
      } else {
        // Restore first to avoid stacking overrides
        restoreConsole();
        originalConsoleRef.current = {
          log: console.log,
          error: console.error,
        };
      }

      // Override console methods
      console.log = (...args) => {
        // Create text representation for console
        const logMessage = args.map((arg) => safeStringify(arg)).join(" ");

        logsRef.current.push(logMessage);

        // Add complex objects to inspector
        args.forEach((arg) => {
          if (arg !== null && typeof arg === "object") {
            inspectorObjectsRef.current.push({
              id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: Date.now(),
              data: arg,
            });
          }
        });

        updateConsoleOutput();
        originalConsoleRef.current.log(...args);
      };

      console.error = (...args) => {
        const errorMessage = `🔴 Error: ${args.map((arg) => safeStringify(arg)).join(" ")}`;

        logsRef.current.push(errorMessage);

        // Add complex objects to inspector
        args.forEach((arg) => {
          if (arg !== null && typeof arg === "object") {
            inspectorObjectsRef.current.push({
              id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: Date.now(),
              data: arg,
              label: "Error",
            });
          }
        });

        // Switch to console tab when an error occurs
        if (setActiveTabRef.current) {
          setActiveTabRef.current("console");
        }

        updateConsoleOutput();
        originalConsoleRef.current.error(...args);
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

      // Handle promises and async results
      if (executedCode instanceof Promise) {
        executedCode
          .then((result) => {
            if (result !== undefined) {
              console.log(`→ Result: ${safeStringify(result)}`);

              // Add result to inspector if it's an object
              if (result !== null && typeof result === "object") {
                inspectorObjectsRef.current.push({
                  id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  timestamp: Date.now(),
                  data: result,
                  label: "Result",
                });
                updateConsoleOutput();
              }
            }
          })
          .catch((error) => {
            console.error(`Promise rejected: ${error.message}`);

            // Switch to console tab when a promise is rejected
            if (setActiveTabRef.current) {
              setActiveTabRef.current("console");
            }
          });
      } else if (executedCode !== undefined) {
        // If code returns a non-promise value, add it to logs
        logsRef.current.push(`→ ${safeStringify(executedCode)}`);

        // Add result to inspector if it's an object
        if (executedCode !== null && typeof executedCode === "object") {
          inspectorObjectsRef.current.push({
            id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            data: executedCode,
            label: "Result",
          });
        }

        updateConsoleOutput();
      }

      // We don't restore the console immediately to capture async logs
      // Instead, we'll set a timeout to restore after a reasonable time
      // or provide a manual way to restore it when needed

      // Set a long timeout to eventually restore console (e.g., 30 seconds)
      setTimeout(() => {
        restoreConsole();
      }, 30000);
    } catch (error) {
      logsRef.current.push(`🔴 Error: ${(error as Error).message}`);

      // Switch to console tab when an error occurs
      if (setActiveTabRef.current) {
        setActiveTabRef.current("console");
      }

      updateConsoleOutput();
      restoreConsole();
    }
  };

  const value = {
    consoleOutput,
    inspectorObjects,
    runCode,
    clearConsole,
    setConsoleTab,
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
