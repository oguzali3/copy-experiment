
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
      className={`flex items-center bg-zinc-900 px-3 py-2 rounded-md mb-2 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab p-1 hover:bg-zinc-800 rounded mr-2"
      >
        <GripVertical className="h-4 w-4 text-zinc-400" />
      </button>
      <span className="text-sm font-medium text-white flex-1">
        {getMetricDisplayName(metric)}
      </span>
      <div className="flex items-center border border-zinc-700 rounded-md divide-x divide-zinc-700 overflow-hidden bg-zinc-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTypeChange('bar')}
          className={`h-8 px-3 rounded-none ${
            type === 'bar'
              ? 'bg-zinc-700 text-white hover:bg-zinc-700/90'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTypeChange('line')}
          className={`h-8 px-3 rounded-none ${
            type === 'line'
              ? 'bg-zinc-700 text-white hover:bg-zinc-700/90'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <LineChart className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
