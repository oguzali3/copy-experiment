import { z } from "zod";

export const SearchItemSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  id: z.string().optional(),
  fullName: z.string().optional(),
});

export type SearchItem = z.infer<typeof SearchItemSchema>;

export interface SearchResultProps {
  item: SearchItem;
  type: "countries" | "industries" | "exchanges" | "metrics";
  onSelect: (item: SearchItem) => void;
}