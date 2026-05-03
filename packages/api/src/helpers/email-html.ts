/**
 * Helper para generar HTML compatible con clientes de email.
 * Replica el estilo de las tablas usadas en los templates PDF del proyecto
 * (border-gray-300, bg-gray-100 para encabezados, text-sm, etc.) pero con
 * estilos inline ya que los clientes de email no soportan CSS externo.
 */

export interface ColumnaTablaEmail {
    titulo: string;
    alinear?: 'izquierda' | 'derecha' | 'centro';
    negrita?: boolean;
    noSalto?: boolean;
}

const ESTILOS_BASE = {
    tabla: 'width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;',
    th: 'border:1px solid #d1d5db;padding:6px 12px;background-color:#f3f4f6;font-size:13px;font-weight:600;font-family:Arial,sans-serif;',
    td: 'border:1px solid #d1d5db;padding:6px 12px;font-size:13px;font-family:Arial,sans-serif;',
};

function alineacionCss(alinear?: ColumnaTablaEmail['alinear']): string {
    if (alinear === 'derecha') return 'text-align:right;';
    if (alinear === 'centro') return 'text-align:center;';
    return 'text-align:left;';
}

export function tablaEmail(
    columnas: ColumnaTablaEmail[],
    filas: (string | number)[][],
): string {
    const encabezados = columnas
        .map(
            (col) =>
                `<th style="${ESTILOS_BASE.th}${alineacionCss(col.alinear)}">${col.titulo}</th>`,
        )
        .join('');

    const cuerpo = filas
        .map((fila) => {
            const celdas = fila
                .map((celda, i) => {
                    const col: ColumnaTablaEmail = columnas[i] ?? { titulo: '' };
                    const extra = [
                        col.negrita ? 'font-weight:600;' : '',
                        col.noSalto ? 'white-space:nowrap;' : '',
                        alineacionCss(col.alinear),
                    ]
                        .filter(Boolean)
                        .join('');
                    return `<td style="${ESTILOS_BASE.td}${extra}">${celda}</td>`;
                })
                .join('');
            return `<tr>${celdas}</tr>`;
        })
        .join('');

    return `<table style="${ESTILOS_BASE.tabla}"><thead><tr>${encabezados}</tr></thead><tbody>${cuerpo}</tbody></table>`;
}
