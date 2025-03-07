import { createContext, useContext, ReactNode } from "react";
import { useTheme } from "./ThemeContext";

// Types for object preview data
export interface ValuePreviewData {
  type: string;
  value: any;
  displayValue?: string;
}

export interface ObjectPreviewItem {
  key?: string | number;
  value: ValuePreviewData;
}

export interface ObjectPreviewData {
  type: "array" | "object" | "primitive";
  size?: number;
  preview: ObjectPreviewItem[];
  hasMore: boolean;
}

interface ObjectInspectorContextType {
  getTypeColor: (type: string) => string;
  getValuePreviewData: (value: any) => ValuePreviewData;
  formatObjectKey: (key: string | number) => string;
  getObjectPreviewData: (obj: any) => ObjectPreviewData;
  isDark: boolean;
}

const ObjectInspectorContext = createContext<ObjectInspectorContextType | undefined>(undefined);

export function ObjectInspectorProvider({ children }: { children: ReactNode }) {
  const { isDark } = useTheme();

  const getTypeColor = (type: string): string => {
    if (isDark) {
      switch (type) {
        case "string":
          return "text-blue-400";
        case "number":
          return "text-green-400";
        case "boolean":
          return "text-orange-400";
        case "function":
          return "text-purple-400";
        case "undefined":
          return "text-gray-400";
        case "null":
          return "text-gray-400";
        default:
          return "text-white";
      }
    } else {
      switch (type) {
        case "string":
          return "text-blue-600";
        case "number":
          return "text-green-600";
        case "boolean":
          return "text-orange-600";
        case "function":
          return "text-purple-600";
        case "undefined":
          return "text-gray-600";
        case "null":
          return "text-gray-600";
        default:
          return "text-gray-900";
      }
    }
  };

  const getValuePreviewData = (value: any): ValuePreviewData => {
    const type = value === null ? "null" : typeof value;
    const MAX_STRING_LENGTH = 50; // Maximum length for string display before truncation

    switch (type) {
      case "string":
        const truncated =
          value.length > MAX_STRING_LENGTH ? value.substring(0, MAX_STRING_LENGTH) + "…" : value;
        return {
          type,
          value,
          displayValue: `"${truncated}"`,
        };
      case "number":
      case "boolean":
        return {
          type,
          value,
          displayValue: String(value),
        };
      case "undefined":
        return {
          type,
          value,
          displayValue: "undefined",
        };
      case "null":
        return {
          type,
          value,
          displayValue: "null",
        };
      case "function":
        const functionName = value.name || "anonymous";
        const truncatedFunctionName =
          functionName.length > MAX_STRING_LENGTH
            ? functionName.substring(0, MAX_STRING_LENGTH) + "…"
            : functionName;
        return {
          type,
          value,
          displayValue: `ƒ ${truncatedFunctionName}()`,
        };
      case "object":
        if (Array.isArray(value)) {
          return {
            type: "array",
            value,
            displayValue: `Array(${value.length})`,
          };
        }
        if (value instanceof Date) {
          return {
            type: "date",
            value,
            displayValue: value.toISOString(),
          };
        }
        if (value instanceof Error) {
          const errorMessage = value.message;
          const truncatedMessage =
            errorMessage.length > MAX_STRING_LENGTH
              ? errorMessage.substring(0, MAX_STRING_LENGTH) + "…"
              : errorMessage;
          return {
            type: "error",
            value,
            displayValue: `Error: ${truncatedMessage}`,
          };
        }
        if (value instanceof RegExp) {
          const regExpString = value.toString();
          const truncatedRegExp =
            regExpString.length > MAX_STRING_LENGTH
              ? regExpString.substring(0, MAX_STRING_LENGTH) + "…"
              : regExpString;
          return {
            type: "regexp",
            value,
            displayValue: truncatedRegExp,
          };
        }
        return {
          type: "object",
          value,
          displayValue: "Object { ... }",
        };
      default:
        return {
          type,
          value,
          displayValue: String(value),
        };
    }
  };

  // Helper function to format object keys
  const formatObjectKey = (key: string | number): string => {
    return String(key);
  };

  // Generate a preview of object contents
  const getObjectPreviewData = (obj: any): ObjectPreviewData => {
    // Constants for preview limits
    const MAX_ARRAY_ITEMS = 3;
    const MAX_OBJECT_KEYS = 5;

    if (obj === null || obj === undefined || typeof obj !== "object") {
      return {
        type: "primitive",
        preview: [{ value: getValuePreviewData(obj) }],
        hasMore: false,
      };
    }

    if (Array.isArray(obj)) {
      // For arrays, show first few elements
      const hasMore = obj.length > MAX_ARRAY_ITEMS;
      const previewItems = obj.slice(0, MAX_ARRAY_ITEMS);

      return {
        type: "array",
        size: obj.length,
        preview: previewItems.map((item) => ({
          value: getValuePreviewData(item),
        })),
        hasMore,
      };
    }

    // For objects, show first few key-value pairs
    const keys = Object.keys(obj);
    const hasMore = keys.length > MAX_OBJECT_KEYS;
    const previewKeys = keys.slice(0, MAX_OBJECT_KEYS);

    return {
      type: "object",
      size: keys.length,
      preview: previewKeys.map((key) => ({
        key,
        value: getValuePreviewData(obj[key]),
      })),
      hasMore,
    };
  };

  const value = {
    getTypeColor,
    getValuePreviewData,
    formatObjectKey,
    getObjectPreviewData,
    isDark,
  };

  return (
    <ObjectInspectorContext.Provider value={value}>{children}</ObjectInspectorContext.Provider>
  );
}

export function useObjectInspector() {
  const context = useContext(ObjectInspectorContext);
  if (context === undefined) {
    throw new Error("useObjectInspector must be used within an ObjectInspectorProvider");
  }
  return context;
}
