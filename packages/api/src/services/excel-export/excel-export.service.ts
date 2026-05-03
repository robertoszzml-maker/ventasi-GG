import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelExportService {
    async generarExcel(nombre: string, datos: any[]) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Datos');

        // Si hay datos, agregar las cabeceras
        if (datos.length > 0) {
            const cabeceras = Object.keys(datos[0]);
            const headerRow = worksheet.addRow(cabeceras);

            // Estilo de las cabeceras
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFF' } };  // Negrita y color de texto blanco
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4CAF50' } }; // Fondo verde
                cell.alignment = { horizontal: 'center', vertical: 'middle' };  // Centrado
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        }

        // Agregar las filas con los datos y aplicar formato
        datos.forEach((fila) => {
            const row = worksheet.addRow(Object.values(fila));

            // Estilo de las celdas
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });

        // Ajustar automáticamente el ancho de las columnas
        worksheet.columns?.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const columnLength = cell.value ? cell.value.toString().length : 0;
                maxLength = Math.max(maxLength, columnLength);
            });
            column.width = maxLength + 2; // Agregar un poco de espacio adicional
        });

        // Generar el archivo Excel en memoria y devolver el buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;  // Retornamos el buffer que contiene los datos del archivo
    }
}
