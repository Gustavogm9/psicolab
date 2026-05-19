import { MainLayout } from "@/components/layout/main-layout";
import { ConsultoraDashboard as ConsultoraDashboardComponent } from "@/components/dashboard/consultora-dashboard";

const ConsultoraDashboard = () => {
  return (
    <MainLayout>
      <ConsultoraDashboardComponent />
    </MainLayout>
  );
};

export default ConsultoraDashboard;