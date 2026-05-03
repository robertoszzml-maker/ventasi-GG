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

interface DatePickerProps {
  label?: string;
  onChange: (date: string | null) => void;
  booked?: string[];
  fromYear?: number;
  disabled?: boolean;
  defaultValue?: string | null; // Aseguramos que es un string con formato "YYYY-MM-DD"
}

export function DatePicker({
  label,
  onChange,
  booked,
  fromYear = 1900,
  disabled = false,
  defaultValue = null,
}: DatePickerProps) {
  // Validamos que defaultValue sea un string en formato correcto antes de convertirlo
  const initialDate =
    defaultValue && /^\d{4}-\d{2}-\d{2}$/.test(defaultValue)
      ? new Date(`${defaultValue}T00:00:00`)
      : null;

  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    initialDate
  );
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);

    onChange(format(date, "yyyy-MM-dd")); // Devuelve formato "YYYY-MM-DD"
    setCalendarOpen(false);
  };

  return (
    <div className="flex flex-col mt-2">
      <label>{label}</label>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "pl-3 text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            {selectedDate ? (
              format(selectedDate, "dd/MM/yyyy")
            ) : (
              <span>Seleccione Fecha</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelectDate}
            captionLayout="dropdown-buttons"
            fromYear={fromYear}
            defaultMonth={selectedDate || new Date()}
            toYear={2040}
            initialFocus
            modifiers={{ disabled: booked }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
