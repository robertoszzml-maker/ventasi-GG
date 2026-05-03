import React from "react";

type CurrencyProps = {
  className?: string;
  children: React.ReactNode;
};

export const Currency: React.FC<CurrencyProps> = ({ children, className }) => {
  // Verificar si el contenido de children es un número
  const value =
    typeof children === "number" ? children : parseFloat(children as string);
  // Si el valor no es un número, retornamos un mensaje o un valor vacío
  if (isNaN(value))
    return <span className={`italic ${className}`}>Invalid value</span>;

  // Formatear el número con comas como separador de miles
  const formattedValue = new Intl.NumberFormat().format(value);

  return <span className={`italic ${className}`}> $ {formattedValue}</span>;
};
