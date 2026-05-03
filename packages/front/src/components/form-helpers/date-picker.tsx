'use client'
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
import {
  FormControl,
  FormItem,
  FormLabel,
  FormField,
  FormMessage, // Importa el componente para mostrar mensajes de error
} from "@/components/ui/form";

interface DatePickerProp {
  form: any;
  name: string;
  label: string;
  onChange?: (date: Date | null) => void;
  booked?: string[];
  fromYear?: number;
  disabled?: boolean
  className?: string;
}

export function DatePicker({
  form,
  name,
  label,
  onChange,
  booked,
  fromYear = 1900,
  disabled = false,
  className
}: DatePickerProp) {
  const selectedDate = form.getValues(name)
    ? new Date(`${form.getValues(name)}T00:00:00`)
    : null;
  // const [selectedDate, setSelectedDate] = React.useState<Date | null>(
  //   initialDate
  // );
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const handleSelectDate = (date: Date) => {
    // setSelectedDate(date);
    const formattedDate = date ? format(date, "yyyy-MM-dd") : null;
    form.setValue(name, formattedDate);
    setCalendarOpen(false);
    if (onChange) onChange(date);
  };
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={`flex flex-col mt-2 ${className}`}>
          <FormLabel>{label}</FormLabel>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen} modal={true}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "pl-3 text-left font-normal",
                    !selectedDate && "text-muted-foreground",
                    fieldState.error && "border-red-500" // Añade un borde rojo si hay un error
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
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 " align="start">
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
                className="z-1000"
              />
            </PopoverContent>
          </Popover>
          {fieldState.error && ( // Mostrar mensaje de error si existe
            <FormMessage>{fieldState.error.message}</FormMessage>
          )}
        </FormItem>
      )}
    />
  );
}
