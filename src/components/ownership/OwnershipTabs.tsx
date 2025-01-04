import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InsidersTable } from "./InsidersTable";
import { HoldersTable } from "./HoldersTable";

interface OwnershipTabsProps {
  ticker?: string;
}

export const OwnershipTabs = ({ ticker = "AAPL" }: OwnershipTabsProps) => {
  return (
    <Tabs defaultValue="insiders" className="w-full">
      <TabsList className="w-full border-b rounded-none h-auto p-0 bg-transparent">
        <TabsTrigger
          value="insiders"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#077dfa] data-[state=active]:bg-blue-50/50 data-[state=active]:text-[#077dfa] px-8 py-3"
        >
          Insider Transactions
        </TabsTrigger>
        <TabsTrigger
          value="holders"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#077dfa] data-[state=active]:bg-blue-50/50 data-[state=active]:text-[#077dfa] px-8 py-3"
        >
          Holders
        </TabsTrigger>
      </TabsList>
      <TabsContent value="insiders" className="mt-6">
        <InsidersTable ticker={ticker} />
      </TabsContent>
      <TabsContent value="holders" className="mt-6">
        <HoldersTable ticker={ticker} />
      </TabsContent>
    </Tabs>
  );
};