import React from "react";
import { cn } from "@/lib/utils";

interface CellColumnProps {
  className?: string;
  children: React.ReactNode;
}

const CellColumn: React.FC<CellColumnProps> = ({ className, children }) => {
  return <div className={cn("pl-4 text-regular", className)}>{children}</div>;
};

export { CellColumn };
