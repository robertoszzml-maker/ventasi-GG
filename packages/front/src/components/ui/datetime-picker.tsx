"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface DateTimePickerProps {
  value?: string; // YYYY-MM-DD HH:mm:ss
  onChange: (value: string) => void;
  disabled?: boolean;
  allowPast?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  disabled,
  allowPast = true,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Extraer fecha y hora del value inicial (soporta "T" o espacio como separador)
  const initialDateTime = React.useMemo(() => {
    if (!value) return { date: undefined, time: "09:00" };

    // Normalizar el string: reemplazar "T" por espacio y quitar zona horaria/milisegundos
    let normalized = value.replace("T", " ");
    // Remover .000Z o cualquier zona horaria
    normalized = normalized.replace(/\.\d{3}Z?$/, "");

    // Separar fecha y hora
    const [datePart, timePart] = normalized.split(" ");

    return {
      date: datePart,
      time: timePart?.slice(0, 5) || "09:00",
    };
  }, [value]);

  const [selectedDate, setSelectedDate] = React.useState<string | undefined>(
    initialDateTime.date
  );
  const [selectedTime, setSelectedTime] = React.useState<string>(
    initialDateTime.time
  );

  // Convertir string de fecha a Date para el Calendar
  const calendarDate = React.useMemo(() => {
    if (!selectedDate) return undefined;
    const [year, month, day] = selectedDate.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, [selectedDate]);

  // Slots cada 30 min de 00:00 a 23:30 (24 horas)
  const timeSlots = React.useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => {
      const totalMinutes = i * 30;
      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      return `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
    });
  }, []);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;

    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const day = String(newDate.getDate()).padStart(2, "0");

    const newDateString = `${year}-${month}-${day}`;
    setSelectedDate(newDateString);

    // Emitir en formato MySQL datetime (sin T, con espacio)
    const newDateTime = `${newDateString} ${selectedTime}:00`;
    onChange(newDateTime);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);

    if (!selectedDate) return;

    // Emitir en formato MySQL datetime (sin T, con espacio)
    const newDateTime = `${selectedDate} ${time}:00`;
    onChange(newDateTime);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            <span>
              {selectedDate.split("-").reverse().join("/")} • {selectedTime}
            </span>
          ) : (
            <span>Seleccionar fecha y hora</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <Calendar
            mode="single"
            selected={calendarDate}
            onSelect={handleDateSelect}
            initialFocus
            disabled={
              allowPast
                ? undefined
                : (d) => d < new Date(new Date().setHours(0, 0, 0, 0))
            }
            captionLayout="dropdown-buttons"
            fromYear={2020}
            toYear={2030}
          />

          <div className="border-l">
            <ScrollArea className="h-[300px]">
              <div className="flex flex-col gap-1 p-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => handleTimeSelect(time)}
                    className="w-full justify-start text-sm font-normal"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
