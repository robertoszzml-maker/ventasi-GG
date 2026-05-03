import { format, isValid } from "date-fns";

/**
 * Formatea una fecha en el formato "dd/MM/yyyy".
 * Si la fecha no es válida, devuelve "-".
 *
 * @param {string} date - La fecha en formato string (ej. "2023-10-01").
 * @returns {string} - La fecha formateada o "-" si no es válida.
 */
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


export const today = (): string => format(new Date(), 'yyyy-MM-dd')


export const getTodayDateTime = (): string => {
    const now = new Date();

    // Obtener componentes de fecha/hora en zona horaria de Argentina
    const year = now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric' });
    const month = now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires', month: '2-digit' });
    const day = now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit' });
    const hour = now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', hour12: false });
    const minute = now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires', minute: '2-digit' });
    const second = now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires', second: '2-digit' });

    // Formato: YYYY-MM-DD HH:mm:ss
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

export const formatTime = (date?: string) => {
    if (!date) return ""



    try {
        return format(new Date(date), "dd/MM/yyyy • HH:mm")
    } catch (error) {
        // Fallback for legacy date format
        const fecha = date?.split("T")[0]?.split("-")?.reverse()?.join("/")
        const hora = date?.split("T")[1]?.slice(0, 5)
        return `${fecha} • ${hora}`
    }
}



export const formatDay = (date: string | null | undefined | Date): string => {
    if (!date) return ''

    let d: Date
    if (typeof date === 'string') {
        const [year, month, day] = date.split('-').map(Number) // YYYY-mm-dd
        d = new Date(year, month - 1, day)
    } else {
        d = date
    }

    const weekday = d.toLocaleDateString('es-AR', { weekday: 'long', timeZone: 'America/Argentina/Buenos_Aires' })
    return weekday.charAt(0).toUpperCase() + weekday.slice(1)
}

/**
 * Obtiene solo la hora de un string de fecha/datetime
 * Maneja formatos: "2024-01-15T14:30:00" o "2024-01-15 14:30:00"
 *
 * @param {string | null | undefined} date - La fecha con hora
 * @returns {string} - La hora en formato "HH:mm" o string vacío
 */
export const getTime = (date: string | null | undefined): string => {
    if (!date) return '';

    try {
        // Si tiene la hora en el string (formato ISO o con espacio)
        if (date.includes('T') || date.includes(' ')) {
            const timePart = date.split('T')[1] || date.split(' ')[1];
            if (timePart) {
                return timePart.slice(0, 5); // HH:mm
            }
        }

        // Si es solo fecha, retornar vacío
        return '';
    } catch (error) {
        return '';
    }
}
