"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CalendarDays,
} from "lucide-react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const DIAS_SEMANA = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

export type CalendarView = "week" | "month";

export interface GenericCalendarProps<T> {
  /**
   * Datos a mostrar en el calendario
   */
  data: T[];

  /**
   * Función para extraer la fecha de cada elemento
   * @param item - El elemento del cual extraer la fecha
   * @returns La fecha como string o Date
   */
  getDate: (item: T) => string | Date | null | undefined;

  /**
   * Función para renderizar cada card/evento en el calendario (vista semanal)
   * @param item - El elemento a renderizar
   * @returns El componente React a mostrar
   */
  renderCard: (item: T) => React.ReactNode;

  /**
   * Función para renderizar componente compacto en vista mensual
   * @param item - El elemento a renderizar
   * @returns El componente React compacto a mostrar
   */
  renderCompactCard?: (item: T) => React.ReactNode;

  /**
   * Función para generar una key única para cada elemento
   * @param item - El elemento del cual extraer el ID
   * @returns El ID único
   */
  getId: (item: T) => string | number;

  /**
   * Título del calendario (opcional)
   */
  titulo?: string;

  /**
   * Toolbar personalizada que aparece en el header del calendario
   */
  toolbar?: React.ReactNode;

  /**
   * Componente de filtros que aparece entre el header y el calendario
   */
  filtros?: React.ReactNode;

  /**
   * Estado de carga
   */
  isLoading?: boolean;

  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;

  /**
   * Clases CSS de Tailwind para altura mínima de cada celda del calendario
   * @default "min-h-[200px] sm:min-h-[250px] lg:min-h-[300px]"
   */
  cellHeightClass?: string;

  /**
   * Callback cuando cambia la semana
   * @param inicio - Fecha de inicio de la semana
   * @param fin - Fecha de fin de la semana
   */
  onWeekChange?: (inicio: Date, fin: Date) => void;

  /**
   * Callback cuando cambia el mes
   * @param inicio - Fecha de inicio del mes
   * @param fin - Fecha de fin del mes
   */
  onMonthChange?: (inicio: Date, fin: Date) => void;

  /**
   * Fecha actual controlada desde el padre
   */
  currentDate?: Date;

  /**
   * Setter para la fecha actual
   */
  setCurrentDate?: (date: Date) => void;

  /**
   * Vista inicial del calendario
   * @default "week"
   */
  defaultView?: CalendarView;

  /**
   * Mostrar botón para alternar entre vistas
   * @default true
   */
  showViewToggle?: boolean;
}

export function GenericCalendar<T>({
  data,
  getDate,
  renderCard,
  renderCompactCard,
  getId,
  titulo,
  toolbar,
  filtros,
  isLoading = false,
  onWeekChange,
  onMonthChange,
  className,
  cellHeightClass = "min-h-[200px] sm:min-h-[250px] lg:min-h-[300px]",
  currentDate: controlledDate,
  setCurrentDate: controlledSetDate,
  defaultView = "week",
  showViewToggle = true,
}: GenericCalendarProps<T>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // Inicializar fecha desde URL o usar fecha actual
  const getInitialDate = () => {
    const dateParam = searchParams?.get("fecha");
    if (dateParam) {
      try {
        return parseISO(dateParam);
      } catch {
        return new Date();
      }
    }
    return new Date();
  };

  const [internalDate, setInternalDate] = useState(getInitialDate);
  const [view, setView] = useState<CalendarView>(defaultView);

  // Usar fecha controlada o interna
  const currentDate = controlledDate ?? internalDate;

  // Función para actualizar la fecha y la URL
  const setCurrentDate = (date: Date) => {
    if (controlledSetDate) {
      controlledSetDate(date);
    } else {
      setInternalDate(date);
    }

    // Actualizar URL con la nueva fecha
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("fecha", format(date, "yyyy-MM-dd"));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Sincronizar con cambios en URL
  useEffect(() => {
    if (!controlledDate) {
      const dateParam = searchParams?.get("fecha");
      if (dateParam) {
        try {
          const newDate = parseISO(dateParam);
          setInternalDate(newDate);
        } catch {
          // Ignorar fechas inválidas
        }
      }
    }
  }, [searchParams, controlledDate]);

  // Notificar al padre sobre la fecha inicial desde URL
  useEffect(() => {
    const dateParam = searchParams?.get("fecha");
    if (dateParam && (onWeekChange || onMonthChange)) {
      try {
        const initialDate = parseISO(dateParam);

        if (view === "week" && onWeekChange) {
          const inicio = startOfWeek(initialDate, { weekStartsOn: 1 });
          const fin = endOfWeek(initialDate, { weekStartsOn: 1 });
          onWeekChange(inicio, fin);
        } else if (view === "month" && onMonthChange) {
          const inicio = startOfMonth(initialDate);
          const fin = endOfMonth(initialDate);
          onMonthChange(inicio, fin);
        }
      } catch {
        // Ignorar fechas inválidas
      }
    }
    // Solo ejecutar en el montaje inicial
  }, []);
  useEffect(() => {
    if (view === "month" && onMonthChange) {
      const inicio = startOfMonth(currentDate);
      const fin = endOfMonth(currentDate);
      onMonthChange(inicio, fin);
    }

    if (view === "week" && onWeekChange) {
      const inicio = startOfWeek(currentDate, { weekStartsOn: 1 });
      const fin = endOfWeek(currentDate, { weekStartsOn: 1 });
      onWeekChange(inicio, fin);
    }
  }, [view]);

  // Calcular inicio y fin según la vista
  const inicioSemana = startOfWeek(currentDate, { weekStartsOn: 1 }); // Lunes
  const finSemana = endOfWeek(currentDate, { weekStartsOn: 1 }); // Domingo
  const inicioMes = startOfMonth(currentDate);
  const finMes = endOfMonth(currentDate);

  // Generar array de días según la vista
  const dias = useMemo(() => {
    if (view === "week") {
      return Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i));
    } else {
      // Para vista mensual, generar grid completo (comenzando desde lunes)
      const primerDiaMes = startOfWeek(inicioMes, { weekStartsOn: 1 });
      const ultimoDiaMes = endOfWeek(finMes, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: primerDiaMes, end: ultimoDiaMes });
    }
  }, [view, inicioSemana, inicioMes, finMes]);

  // Agrupar elementos por día
  const elementosPorDia = useMemo(() => {
    const grupos: Record<string, T[]> = {};

    dias.forEach((dia) => {
      const diaKey = format(dia, "yyyy-MM-dd");
      grupos[diaKey] = data.filter((elemento) => {
        const fecha = getDate(elemento);
        if (!fecha) return false;

        // Convertir a string y extraer solo la parte de fecha (YYYY-MM-DD)
        const fechaStr = String(fecha).split("T")[0].split(" ")[0];
        return fechaStr === diaKey;
      });
    });

    return grupos;
  }, [dias, data, getDate]);

  const cambiarPeriodo = (direccion: number) => {
    if (view === "week") {
      const nuevaFecha = addDays(currentDate, direccion * 7);
      setCurrentDate(nuevaFecha);

      if (onWeekChange) {
        const nuevoInicio = startOfWeek(nuevaFecha, { weekStartsOn: 1 });
        const nuevoFin = endOfWeek(nuevaFecha, { weekStartsOn: 1 });
        onWeekChange(nuevoInicio, nuevoFin);
      }
    } else {
      const nuevaFecha = addMonths(currentDate, direccion);
      setCurrentDate(nuevaFecha);

      if (onMonthChange) {
        const nuevoInicio = startOfMonth(nuevaFecha);
        const nuevoFin = endOfMonth(nuevaFecha);
        onMonthChange(nuevoInicio, nuevoFin);
      }
    }
  };

  const irHoy = () => {
    const hoy = new Date();
    setCurrentDate(hoy);

    if (view === "week" && onWeekChange) {
      const nuevoInicio = startOfWeek(hoy, { weekStartsOn: 1 });
      const nuevoFin = endOfWeek(hoy, { weekStartsOn: 1 });
      onWeekChange(nuevoInicio, nuevoFin);
    } else if (view === "month" && onMonthChange) {
      const nuevoInicio = startOfMonth(hoy);
      const nuevoFin = endOfMonth(hoy);
      onMonthChange(nuevoInicio, nuevoFin);
    }
  };

  const formatoPeriodo =
    view === "week"
      ? `${format(inicioSemana, "d", { locale: es })} - ${format(finSemana, "d MMM, yyyy", { locale: es })}`
      : format(currentDate, "MMMM yyyy", { locale: es });

  if (isLoading) {
    return <div className="p-4">Cargando...</div>;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header con navegación */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <h2 className="text-lg sm:text-xl font-semibold capitalize">
            {titulo && `${titulo} `}
            {formatoPeriodo}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Toolbar personalizada */}
          {toolbar}

          {/* Botón de cambio de vista */}
          {showViewToggle && (
            <Button
              onClick={() => setView(view === "week" ? "month" : "week")}
              variant="outline"
              size="sm"
            >
              {view === "week" ? (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Mes
                </>
              ) : (
                <>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Semana
                </>
              )}
            </Button>
          )}

          {/* Navegación de periodos */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => cambiarPeriodo(-1)}
              variant="outline"
              size="icon"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button onClick={irHoy} variant="outline">
              Hoy
            </Button>
            <Button
              onClick={() => cambiarPeriodo(1)}
              variant="outline"
              size="icon"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros (si existen) */}
      {filtros && <div>{filtros}</div>}

      {/* Grid del calendario */}
      {view === "week" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
          {dias.map((dia, index) => {
            const diaKey = format(dia, "yyyy-MM-dd");
            const elementosDia = elementosPorDia[diaKey] || [];
            const esHoy = isSameDay(dia, new Date());

            return (
              <div key={diaKey} className="flex flex-col">
                {/* Header del día */}
                <div
                  className={cn(
                    "text-center p-2 sm:p-3 rounded-t-lg border-b-2",
                    esHoy
                      ? "bg-primary/10 border-primary"
                      : "bg-muted border-border"
                  )}
                >
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                    {DIAS_SEMANA[index]}
                  </div>
                  <div
                    className={cn(
                      "text-base sm:text-lg font-semibold",
                      esHoy && "text-primary"
                    )}
                  >
                    {format(dia, "d")}
                  </div>
                </div>

                {/* Elementos del día */}
                <div
                  className={cn(
                    "flex-1 p-1.5 sm:p-2 space-y-1.5 sm:space-y-2 bg-background border border-t-0 rounded-b-lg overflow-y-auto",
                    cellHeightClass
                  )}
                >
                  {elementosDia.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Sin elementos
                    </p>
                  ) : (
                    elementosDia.map((elemento) => (
                      <React.Fragment key={getId(elemento)}>
                        {renderCard(elemento)}
                      </React.Fragment>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          {/* Header de días de la semana */}
          <div className="grid grid-cols-7 bg-muted border-b">
            {DIAS_SEMANA.map((dia) => (
              <div
                key={dia}
                className="text-center p-2 text-xs sm:text-sm font-medium text-muted-foreground border-r last:border-r-0"
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Grid mensual */}
          <div className="grid grid-cols-7">
            {dias.map((dia) => {
              const diaKey = format(dia, "yyyy-MM-dd");
              const elementosDia = elementosPorDia[diaKey] || [];
              const esHoy = isSameDay(dia, new Date());
              const esMesActual = dia.getMonth() === currentDate.getMonth();

              return (
                <div
                  key={diaKey}
                  className={cn(
                    "min-h-[100px] p-1 border-r border-b last:border-r-0",
                    !esMesActual && "bg-muted/30",
                    esHoy && "bg-primary/5"
                  )}
                >
                  {/* Número del día */}
                  <div
                    className={cn(
                      "text-xs sm:text-sm font-medium mb-1",
                      esHoy
                        ? "text-primary font-bold"
                        : esMesActual
                          ? "text-foreground"
                          : "text-muted-foreground"
                    )}
                  >
                    {format(dia, "d")}
                  </div>

                  {/* Elementos compactos */}
                  <div className="space-y-0.5">
                    {elementosDia.map((elemento) => (
                      <React.Fragment key={getId(elemento)}>
                        {renderCompactCard
                          ? renderCompactCard(elemento)
                          : renderCard(elemento)}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
