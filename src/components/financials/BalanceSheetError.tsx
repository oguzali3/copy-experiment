import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface BalanceSheetErrorProps {
  error?: Error;
  ticker: string;
}

export const BalanceSheetError = ({ error, ticker }: BalanceSheetErrorProps) => {
  return error ? (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Error loading balance sheet data. Please try again later.
      </AlertDescription>
    </Alert>
  ) : (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        No balance sheet data available for {ticker}.
      </AlertDescription>
    </Alert>
  );
};