import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Currency } from "@/components/ui/currency";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetricCardProps {
  titulo: string;
  monto?: number;
  texto?: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  accentHex?: string;
  isLoading?: boolean;
  seleccionada?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function MetricCard({
  titulo,
  monto,
  texto,
  icon: Icon,
  color,
  bgColor,
  accentHex,
  isLoading,
  seleccionada,
  onClick,
  children,
}: MetricCardProps) {
  return (
    <Card
      className={`transition-shadow ${onClick ? "cursor-pointer hover:shadow-md" : ""} ${seleccionada ? "ring-2" : ""}`}
      style={seleccionada && accentHex ? { "--tw-ring-color": accentHex, boxShadow: `0 0 0 2px ${accentHex}` } as React.CSSProperties : undefined}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{titulo}</CardTitle>
        <div className={`${bgColor} p-2 rounded-md`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-32 mb-2" />
        ) : texto !== undefined ? (
          <div className="text-2xl font-bold mb-1 truncate">{texto}</div>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`text-2xl font-bold ${color} mb-1 truncate`}>
                  <Currency>{monto ?? 0}</Currency>
                </div>
              </TooltipTrigger>
              <TooltipContent
                className="text-lg font-bold px-5 py-3 shadow-xl border-2"
                style={
                  accentHex
                    ? { color: accentHex, borderColor: accentHex }
                    : undefined
                }
              >
                <Currency>{monto ?? 0}</Currency>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {children && (
          <div className="text-xs text-muted-foreground">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
