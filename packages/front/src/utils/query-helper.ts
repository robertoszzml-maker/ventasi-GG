import { Query } from "@/types";

/**
 * Prepara un valor para ser incluido en los query params.
 * Si el valor es un string JSON, lo parsea primero para evitar doble encoding.
 */
export function prepareFilterValue(value: any): any {
    // Si es un string que parece JSON, parsearlo
    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try {
            return JSON.parse(value);
        } catch {
            // Si falla el parse, retornar como string normal
            return value;
        }
    }
    return value;
}

export function generateQueryParams(query: Query): string {
    const { pagination, columnFilters, sorting, globalFilter, columnVisibility } = query;

    const skip = pagination.pageIndex * pagination.pageSize;
    const limit = pagination.pageSize;

    // Construir objeto de filtros, parseando strings JSON si es necesario
    const filtersObject = columnFilters?.reduce((acc, filter) => {
        acc[filter.id] = prepareFilterValue(filter.value);
        return acc;
    }, {} as { [key: string]: any });

    // Usar JSON.stringify para construir el filtro correctamente
    const filters = filtersObject && Object.keys(filtersObject).length > 0
        ? `filter=${encodeURIComponent(JSON.stringify(filtersObject))}`
        : "";

    // Construir objeto de ordenamiento
    const ordersObject = sorting?.reduce((acc, { id, desc }) => {
        acc[id] = desc ? "DESC" : "ASC";
        return acc;
    }, {} as { [key: string]: string });

    const order = ordersObject && Object.keys(ordersObject).length > 0
        ? `order=${encodeURIComponent(JSON.stringify(ordersObject))}`
        : "";

    const queryParams = [
        `skip=${skip}`,
        `limit=${limit}`,
        filters,
        order,
        ...(globalFilter ? [`search=${globalFilter}`] : []),
        ...(columnVisibility ? [`columns=${encodeURIComponent(JSON.stringify(columnVisibility))}`] : [])
    ]
        .filter(Boolean)
        .join("&");

    return queryParams;
}
