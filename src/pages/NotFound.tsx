import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <MainLayout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-2xl font-semibold">Página não encontrada</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            A página que você está procurando não existe ou foi movida.
          </p>
          <Button asChild className="gap-2">
            <a href="/">
              <Home className="h-4 w-4" />
              Voltar ao Início
            </a>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
