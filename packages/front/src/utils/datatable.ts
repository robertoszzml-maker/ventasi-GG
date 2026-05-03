export const getColumnVisibility = (columns: any[], visibilityColumns: any) =>
    columns
        .filter((e) => visibilityColumns[e.id] !== false && e.id !== 'acciones' && e.id !== 'select') // Filtramos las columnas con false y "acciones"
        .reduce((acc, e) => ({ ...acc, [e.id]: true }), {});
