import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, ChevronDown, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { NotificationsModal } from "./notifications-modal";
import { useAuth } from "@/contexts/AuthContext";
import { useWhiteLabel } from "@/hooks/useWhiteLabel";
import { useImpersonation } from "@/hooks/useImpersonation";

interface NavbarProps {
  userType: "consultora" | "gestor" | "admin";
  userName?: string;
  companyName?: string;
}

export function Navbar({ userType, userName = "Usuário", companyName }: NavbarProps) {
  const isConsultora = userType === "consultora";
  const isAdmin = userType === "admin";
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { config } = useWhiteLabel();
  const { isImpersonating, impersonatedProfile } = useImpersonation();

  const displayCompanyName = config?.nome_empresa || companyName || "Sistema";
  const displayName = isImpersonating && impersonatedProfile 
    ? impersonatedProfile.name 
    : userName;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };
  
  return (
    <div className="flex items-center space-x-4">
      {/* User Type Badge */}
      {isImpersonating ? (
        <Badge variant="destructive" className="text-xs gap-1 animate-pulse">
          <UserCog className="h-3 w-3" />
          Impersonificando
        </Badge>
      ) : (
        <Badge variant={isAdmin ? "destructive" : isConsultora ? "default" : "secondary"} className="text-xs">
          {isAdmin ? "Admin" : isConsultora ? "Consultora" : "Gestor"}
        </Badge>
      )}
      
      {(config?.nome_empresa || companyName) && (
        <span className="text-sm text-muted-foreground">
          {displayCompanyName}
        </span>
      )}

      {/* Notifications */}
      <NotificationsModal />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-2 hover:bg-muted/50">
            <Avatar className="h-8 w-8">
              <AvatarFallback className={isImpersonating ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}>
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {isImpersonating ? "Em impersonificação" : isAdmin ? "Administrador" : isConsultora ? "Consultora Especialista" : "Gestor Cliente"}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
