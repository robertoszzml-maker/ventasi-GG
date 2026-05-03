// import React from "react";
// import { Input } from "@/components/ui/input";
// type InputMoneyProps = {
//     value?: number | string;
//     onChange?: (value: string) => void;
//     placeholder?: string;
//     className?: string;
//     disabled?: boolean;
// };
// export const InputMoney = React.forwardRef<HTMLInputElement, InputMoneyProps>(
//     ({ value = "", onChange, disabled, placeholder, className, ...props }, ref) => {
//         // Función para formatear números con separadores de miles
//         const formatNumber = (num: string): string => {
//             const parts = num.replace(/,/g, "").split(".");
//             parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//             return parts.join(".");
//         };

//         // Función para manejar el cambio en el input
//         const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//             const input = event.target;
//             const rawValue = input.value.replace(/,/g, ""); // Remover comas
//             const cursorPosition = input.selectionStart; // Guardar posición actual del cursor

//             if (/^\d*\.?\d*$/.test(rawValue)) { // Validar solo números y un punto decimal
//                 const previousCommas = (input.value.slice(0, cursorPosition!).match(/,/g) || []).length;

//                 if (onChange) onChange(rawValue); // Enviar el valor sin formato
//                 input.value = formatNumber(rawValue); // Actualizar el valor con formato

//                 // Calcular las comas después de formatear y ajustar la posición del cursor
//                 const newCommas = (input.value.slice(0, cursorPosition!).match(/,/g) || []).length;
//                 const commaOffset = newCommas - previousCommas;

//                 // Restaurar la posición del cursor ajustando por la diferencia de comas
//                 const newCursorPosition = cursorPosition! + commaOffset;
//                 input.setSelectionRange(newCursorPosition, newCursorPosition);
//             }
//         };
//         // Manejar el evento de entrada para evitar caracteres no numéricos
//         const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
//             const invalidKeys = ["e", "E", "+", "-"];
//             if (invalidKeys.includes(event.key)) {
//                 event.preventDefault();
//             }
//         };

//         return (

//             <div className={`relative ${className}`}>
//                 <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
//                     $
//                 </span>
//                 <Input
//                     disabled={disabled}
//                     ref={ref}
//                     value={formatNumber(value?.toString() || "")} // Formatear el valor
//                     onChange={handleChange} // Manejar cambios
//                     onKeyDown={handleKeyDown} // Bloquear caracteres no numéricos
//                     placeholder={placeholder}
//                     className="pl-8" // Espacio para el símbolo
//                     {...props} // Permitir pasar otros props como `...field`
//                 />
//             </div>
//         );
//     }
// );
// InputMoney.displayName = "InputMoney";

import React from "react";
import { Input } from "@/components/ui/input";

type InputMoneyProps = {
  value?: number | string;
  onChange?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export const InputMoney = React.forwardRef<HTMLInputElement, InputMoneyProps>(
  (
    { value = "", onChange, onKeyDown, disabled, placeholder, className = "", ...props },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState("");

    // 👉 Formatear número para UI: "." miles, "," decimales
    const formatNumber = (num: string): string => {
      if (!num || num === "0" || num === "-0") return "";

      // Detectar si es negativo
      const isNegative = num.startsWith("-");
      const absNum = isNegative ? num.substring(1) : num;

      const normalized = absNum.replace(".", ","); // backend -> UI (decimal . -> ,)
      const parts = normalized.split(",");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");

      const formatted = parts.join(",");
      return isNegative ? `-${formatted}` : formatted;
    };

    // Sincronizar displayValue con value cuando viene del prop
    React.useEffect(() => {
      setDisplayValue(formatNumber(value?.toString() || ""));
    }, [value]);

    // 👉 Manejo del cambio en el input
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = event.target.value;

      // Quitar todos los separadores de miles (puntos)
      const rawValue = inputValue.replace(/\./g, "");

      // Permitir campo vacío
      if (rawValue === "" || rawValue === "-") {
        setDisplayValue(rawValue);
        if (onChange) onChange("0");
        return;
      }

      // Validar: números (con opcional signo negativo al inicio) y una coma decimal
      if (/^-?\d*(,\d*)?$/.test(rawValue)) {
        // Formatear para mostrar
        const formatted = formatNumber(rawValue.replace(",", "."));
        setDisplayValue(formatted);

        // Backend: convertir "," -> "."
        const backendValue = rawValue.replace(",", ".");
        if (onChange) onChange(backendValue);
      }
    };

    // 👉 Bloquear caracteres no válidos
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      const invalidKeys = ["e", "E", "+"];

      // Bloquear punto porque usamos coma para decimales
      if (event.key === "." && !event.currentTarget.value.includes(",")) {
        event.preventDefault();

        const input = event.currentTarget;
        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? 0;

        const newValue =
          input.value.substring(0, start) + "," + input.value.substring(end);

        input.value = newValue;
        input.setSelectionRange(start + 1, start + 1);

        input.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }
      // Permitir signo menos solo al inicio
      if (event.key === "-") {
        const input = event.currentTarget;
        const currentValue = input.value;
        const cursorPosition = input.selectionStart || 0;

        // Permitir solo si está al inicio y no hay ya un signo menos
        if (cursorPosition !== 0 || currentValue.includes("-")) {
          event.preventDefault();
        }
        return;
      }

      if (invalidKeys.includes(event.key)) {
        event.preventDefault();
      }
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none z-10">
          $
        </span>
        <input
          type="text"
          disabled={disabled}
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={(e) => { handleKeyDown(e); onKeyDown?.(e); }}
          placeholder={placeholder}
          className={`flex w-full rounded-md border border-input bg-background pl-8 px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...props}
        />
      </div>
    );
  }
);

InputMoney.displayName = "InputMoney";
