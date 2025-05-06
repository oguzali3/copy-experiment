
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, GripVertical } from "lucide-react";
import { fetchFinancialData } from "@/utils/financialApi";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

const indices = [
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "^IXIC", name: "NASDAQ" },
  { symbol: "^RUT", name: "Russell 2000" },
  { symbol: "^N225", name: "Nikkei 225" },
  { symbol: "^FTSE", name: "FTSE 100" },
  { symbol: "^GDAXI", name: "DAX" },
];

type IndexData = {
  id: string;
  name: string;
  value: string;
  change: string;
  isPositive: boolean;
};

const SortableIndexCard = ({ index }: { index: IndexData }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "p-4 hover:shadow-lg transition-shadow", 
        isDragging && "shadow-lg"
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-[#111827]">{index.name}</h3>
          <p className="text-2xl font-bold mt-1">{index.value}</p>
        </div>
        <div className="flex gap-2">
          <div className={`flex items-center ${index.isPositive ? 'text-success' : 'text-warning'}`}>
            {index.isPositive ? (
              <ArrowUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 mr-1" />
            )}
            <span className="font-medium">{index.change}</span>
          </div>
          <button
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export const MarketIndices = () => {
  const [indexData, setIndexData] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchIndicesData = async () => {
    try {
      const promises = indices.map(async (index) => {
        const quoteData = await fetchFinancialData('quote', index.symbol);
        if (!quoteData || !quoteData[0]) {
          throw new Error(`No data received for ${index.name}`);
        }
        
        const quote = quoteData[0];
        const change = quote.change || 0;
        const changePercent = quote.changesPercentage || 0;
        
        return {
          id: index.symbol,
          name: index.name,
          value: quote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
          isPositive: changePercent >= 0
        };
      });

      const results = await Promise.all(promises);
      setIndexData(results);
      setError(null);
    } catch (err) {
      console.error('Error fetching market indices:', err);
      setError('Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicesData();
    // Refresh data every minute
    const interval = setInterval(fetchIndicesData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setIndexData((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-[#111827]">Market Indices</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#111827]">Market Indices</h2>
      {loading ? (
        // Loading skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // Sortable cards with indices data
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={indexData.map((index) => index.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {indexData.map((index) => (
                <SortableIndexCard key={index.id} index={index} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
