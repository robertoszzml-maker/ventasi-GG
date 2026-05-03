import * as React from "react";
import { cn } from "@/lib/utils";

interface SeparatorWithTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const SeparatorWithText = React.forwardRef<HTMLDivElement, SeparatorWithTextProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {children}
          </span>
        </div>
      </div>
    );
  }
);

SeparatorWithText.displayName = "SeparatorWithText";

export { SeparatorWithText };
