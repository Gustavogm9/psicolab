import { MainLayout } from "@/components/layout/main-layout";
import { GestorDashboard as GestorDashboardComponent } from "@/components/dashboard/gestor-dashboard";

const GestorDashboard = () => {
  return (
    <MainLayout>
      <GestorDashboardComponent />
    </MainLayout>
  );
};

export default GestorDashboard;