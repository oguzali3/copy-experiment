import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface IncomeStatementErrorProps {
  error?: Error;
  ticker?: string;
}

export const IncomeStatementError = ({ error, ticker }: IncomeStatementErrorProps) => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {error ? error.message : `No financial data available for ${ticker}.`}
      </AlertDescription>
    </Alert>
  );
};