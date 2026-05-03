import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputNumberProps extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
    onChange?: (value: string) => void
}

const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
    ({ className, onChange, ...props }, ref) => {
        const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
            e.currentTarget.value = e.currentTarget.value
                .replace(/[^0-9.,]/g, "")
                .replace(",", ".")
        }

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e.target.value)
        }

        return (
            <input
                type="text"
                inputMode="decimal"
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    className
                )}
                ref={ref}
                onInput={handleInput}
                onChange={handleChange}
                {...props}
            />
        )
    }
)
InputNumber.displayName = "InputNumber"

export { InputNumber }
