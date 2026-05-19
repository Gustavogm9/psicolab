import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive?: boolean;
  };
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  className?: string;
}

const variantStyles = {
  default: "border-border/50",
  primary: "border-primary/20 bg-primary-soft/50",
  secondary: "border-secondary/20 bg-secondary-soft/50", 
  success: "border-success/20 bg-success/10",
  warning: "border-warning/20 bg-warning/10",
  danger: "border-destructive/20 bg-destructive/10",
};

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  variant = "default",
  className 
}: StatCardProps) {
  return (
    <Card className={cn(
      "card-premium transition-all duration-300 hover:scale-[1.02]",
      variantStyles[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              vs mês anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}