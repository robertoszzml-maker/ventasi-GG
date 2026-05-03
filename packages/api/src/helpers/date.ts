import { format, isValid, addDays, parseISO } from "date-fns";

export const getTodayDateTime = (): string => {
    const now = new Date();

    // Extraer componentes directamente en zona Argentina, sin pasar por new Date()
    // (evita ambigüedad de parsing de toLocaleString en distintos OS)
    const pad = (n: number) => String(n).padStart(2, '0');
    const year  = Number(now.toLocaleString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric' }));
    const month = now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires', month: '2-digit' });
    const day   = now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit' });
    const hour  = now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', hour12: false });
    const min   = now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires', minute: '2-digit' });
    const sec   = now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires', second: '2-digit' });

    return `${year}-${month}-${day} ${pad(Number(hour))}:${pad(Number(min))}:${pad(Number(sec))}`;
};

/**
 * Convierte un Date o string ISO a formato MySQL datetime (YYYY-MM-DD HH:mm:ss)
 * sin zona horaria, preservando la hora local
 */
export const formatToMySQLDateTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};


export const getToday = (): string => {
    return format(new Date(), 'yyyy-MM-dd')
}

export const formatDate = (date: string | null | undefined | Date): string => {
    // Crear un objeto Date a partir del string (agregando "T00:00:00" para evitar problemas de zona horaria)
    const dateObj = new Date(date + "T00:00:00");

    // Verificar si la fecha es válida
    if (!isValid(dateObj)) {
        return "##/##/####";
    }

    // Formatear la fecha en "dd/MM/yyyy"
    return format(dateObj, "dd/MM/yyyy");
};


export const addDaysToDateString = (dateStr: string, daysToAdd: number): string => {
    // Parsea el string ISO ("YYYY-MM-DD") como Date
    const date = parseISO(dateStr);

    // Suma días
    const newDate = addDays(date, daysToAdd);

    // Lo devuelve en formato string sin horas -> "YYYY-MM-DD"
    return format(newDate, "yyyy-MM-dd");
}




