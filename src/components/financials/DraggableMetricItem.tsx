
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { BarChart3, LineChart, GripVertical } from "lucide-react";
import { getMetricDisplayName } from "@/utils/metricDefinitions";

interface DraggableMetricItemProps {
  metric: string;
  index: number;
  type: 'bar' | 'line';
  onTypeChange: (type: 'bar' | 'line') => void;
}

export const DraggableMetricItem = ({
  metric,
  index,
  type,
  onTypeChange,
}: DraggableMetricItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: metric });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center bg-white border border-gray-200 px-2 py-1.5 rounded-md mb-1.5 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab p-0.5 hover:bg-gray-50 rounded mr-2"
      >
        <GripVertical className="h-3.5 w-3.5 text-gray-400" />
      </button>
      <span className="text-xs font-medium text-gray-700 flex-1">
        {getMetricDisplayName(metric)}
      </span>
      <div className="flex items-center border border-gray-200 rounded-md divide-x divide-gray-200 overflow-hidden bg-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTypeChange('bar')}
          className={`h-6 px-2 rounded-none ${
            type === 'bar'
              ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTypeChange('line')}
          className={`h-6 px-2 rounded-none ${
            type === 'line'
              ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <LineChart className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
