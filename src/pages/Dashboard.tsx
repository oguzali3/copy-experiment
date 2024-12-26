import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { MarketIndices } from "@/components/MarketIndices";
import { TopCompanies } from "@/components/TopCompanies";

const Dashboard = () => {
  return (
    <AuthenticatedLayout>
      <MarketIndices />
      <TopCompanies />
    </AuthenticatedLayout>
  );
};

export default Dashboard;