"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  label?: string;
  onChange: (range: { from: string; to: string } | null) => void;
  fromYear?: number;
  disabled?: boolean;
  defaultValue?: { from: string; to: string } | null;
}

export function DateRangePicker({
  label,
  onChange,
  fromYear = 1900,
  disabled = false,
  defaultValue = null,
}: DateRangePickerProps) {
  const parseDate = (str: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(str) ? new Date(`${str}T00:00:00`) : undefined;

  const initialRange =
    defaultValue && defaultValue.from && defaultValue.to
      ? {
          from: parseDate(defaultValue.from),
          to: parseDate(defaultValue.to),
        }
      : undefined;

  const [dateRange, setDateRange] = React.useState<{
    from?: Date;
    to?: Date;
  }>(initialRange || {});
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const handleSelectRange = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) return;

    setDateRange(range);

    if (range.from && range.to) {
      onChange({
        from: format(range.from, "yyyy-MM-dd"),
        to: format(range.to, "yyyy-MM-dd"),
      });
      setCalendarOpen(false);
    }
  };

  const resetSelection = () => {
    setDateRange({});
    onChange(null);
  };

  return (
    <div className="flex flex-col mt-2">
      <label>{label}</label>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "pl-3 text-left font-normal",
              !dateRange.from && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            {dateRange.from ? (
              dateRange.to ? (
                `${format(dateRange.from, "dd/MM/yyyy")} - ${format(
                  dateRange.to,
                  "dd/MM/yyyy"
                )}`
              ) : (
                format(dateRange.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Seleccione rango</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {/* Header con fecha seleccionada y botón reiniciar */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="text-sm font-medium">
              {dateRange.from
                ? dateRange.to
                  ? `${format(dateRange.from, "dd/MM/yy")} - ${format(dateRange.to, "dd/MM/yy")}`
                  : format(dateRange.from, "dd/MM/yy")
                : "Seleccione rango"}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSelection}
              disabled={!dateRange.from && !dateRange.to}
              className="h-7 text-xs"
            >
              Reiniciar
            </Button>
          </div>

          {/* Calendar con captionLayout para forzar dropdowns */}
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleSelectRange}
            captionLayout="dropdown-buttons"
            fromYear={fromYear}
            toYear={2040}
            defaultMonth={dateRange.from || new Date()}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
