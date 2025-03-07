import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useObjectInspector } from "../contexts/ObjectInspectorContext";
import { ValuePreviewData, ObjectPreviewData } from "../contexts/ObjectInspectorContext";

interface ObjectInspectorProps {
  data: any;
  name?: string;
  depth?: number;
  isRoot?: boolean;
}

const ObjectInspector = ({ data, name, depth = 0, isRoot = false }: ObjectInspectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getTypeColor, getValuePreviewData, formatObjectKey, getObjectPreviewData, isDark } =
    useObjectInspector();

  // Helper function to get indentation class based on depth
  const getIndentClass = (depth: number): string => {
    switch (depth) {
      case 1:
        return "pl-2";
      case 2:
        return "pl-4";
      case 3:
        return "pl-6";
      case 4:
        return "pl-8";
      default:
        return depth > 4 ? "pl-8" : "";
    }
  };

  // Render a value preview based on its type
  const renderValuePreview = (valueData: ValuePreviewData): JSX.Element => {
    // Check if the value is truncated by looking for the ellipsis character
    const isValueTruncated =
      valueData.displayValue &&
      valueData.displayValue.includes("…") &&
      valueData.value !== undefined;

    return (
      <span
        className={getTypeColor(valueData.type)}
        title={isValueTruncated ? String(valueData.value) : undefined}
      >
        &nbsp;{valueData.displayValue}
      </span>
    );
  };

  // Render a preview of object contents
  const renderObjectPreview = (previewData: ObjectPreviewData): JSX.Element => {
    if (previewData.type === "primitive") {
      return renderValuePreview(previewData.preview[0].value);
    }

    const isArray = previewData.type === "array";
    const totalItems = previewData.size || 0;
    const shownItems = previewData.preview.length;
    const hiddenItems = totalItems - shownItems;

    const ellipsisTitle = previewData.hasMore
      ? `${hiddenItems} more item${hiddenItems > 1 ? "s" : ""} not shown`
      : undefined;

    return (
      <span className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
        {isArray ? "[" : "{ "}
        <span className="space-x-1">
          {previewData.preview.map((item, index) => (
            <span key={index} className="inline-flex items-center">
              {index > 0 && <span>,&nbsp;</span>}
              {!isArray && item.key && (
                <>
                  <span className={isDark ? "text-white" : "text-gray-800"}>{item.key}</span>
                  <span>: </span>
                </>
              )}
              {renderValuePreview(item.value)}
            </span>
          ))}
          {previewData.hasMore && (
            <span className="text-gray-500" title={ellipsisTitle}>
              , …
            </span>
          )}
        </span>
        {isArray ? "]" : " }"}
      </span>
    );
  };

  const renderObjectProperties = (obj: any): JSX.Element[] => {
    if (!obj) return [];

    const entries = Array.isArray(obj) ? [...obj.entries()] : Object.entries(obj);

    return entries.map(([key, value], index) => (
      <div key={index} className={`ml-4 text-sm mt-1 ${getIndentClass(depth)}`}>
        <ObjectInspector data={value} name={formatObjectKey(key)} depth={depth + 1} />
      </div>
    ));
  };

  // Get preview data for the current value
  const valuePreviewData = getValuePreviewData(data);
  const objectPreviewData =
    data !== null && typeof data === "object" ? getObjectPreviewData(data) : null;

  // Simple values (not objects or arrays)
  if (data === null || typeof data !== "object") {
    return (
      <div className="flex items-center">
        {name && <span className={`mr-1 ${isDark ? "text-white" : "text-gray-800"}`}>{name}:</span>}
        {renderValuePreview(valuePreviewData)}
      </div>
    );
  }

  // Empty arrays or objects
  const isEmpty = Array.isArray(data) ? data.length === 0 : Object.keys(data).length === 0;

  if (isEmpty) {
    return (
      <div className="flex items-center">
        {name && (
          <span className={`mr-1 ${isDark ? "text-white" : "text-gray-800"}`}>{name}:&nbsp;</span>
        )}
        <span>{Array.isArray(data) ? "[]" : "{}"}</span>
      </div>
    );
  }

  // Arrays and objects with content
  return (
    <div className={isRoot ? "my-2" : ""}>
      <div className="flex items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="mr-1 text-gray-500">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>

        {name && (
          <span className={`mr-1 text-sm ${isDark ? "text-white" : "text-gray-800"}`}>
            {name}:&nbsp;
          </span>
        )}

        <div className="flex items-center">
          <span className={`mr-2 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            {Array.isArray(data) ? `Array(${data.length})` : `Object`}
          </span>

          {/* Preview of object contents */}
          <span className="text-xs">
            {objectPreviewData && renderObjectPreview(objectPreviewData)}
          </span>
        </div>
      </div>

      {isExpanded && renderObjectProperties(data)}
    </div>
  );
};

export default ObjectInspector;
