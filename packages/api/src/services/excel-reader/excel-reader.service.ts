import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelReaderService {
  /**
   * Lee un archivo Excel y devuelve los datos en formato estructurado
   * @param fileBuffer Buffer del archivo Excel
   * @param opciones Opciones para configurar la lectura
   * @returns Datos extraídos del Excel
   */
  async leerExcel(
    fileBuffer: any,
    opciones: {
      hoja?: number; // Número de hoja (por defecto 0)
      filaEncabezados?: number; // Fila donde están los encabezados (por defecto 1)
      filaInicioDatos?: number; // Fila donde inician los datos (por defecto 2)
    } = {},
  ): Promise<{
    encabezados: string[];
    filas: any[];
    resumen: {
      totalFilas: number;
      totalColumnas: number;
      filasConDatos: number;
    };
  }> {
    const {
      hoja = 0,
      filaEncabezados = 1,
      filaInicioDatos = 2,
    } = opciones;


    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    const worksheet = workbook.worksheets[hoja];
    if (!worksheet) {
      throw new Error(`No se encontró la hoja ${hoja} en el archivo Excel`);
    }


    // Obtener encabezados
    const filaEncabezado = worksheet.getRow(filaEncabezados);
    const encabezados: string[] = [];

    filaEncabezado.eachCell((cell, colNumber) => {
      const valor = cell.value?.toString().trim() || `Columna_${colNumber}`;
      encabezados.push(valor);
    });


    // Obtener datos
    const filas: any[] = [];
    let filasConDatos = 0;
    const totalFilas = worksheet.rowCount;

    for (let rowNumber = filaInicioDatos; rowNumber <= totalFilas; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const filaData: any = {};
      let tieneDatos = false;

      row.eachCell((cell, colNumber) => {
        const encabezado = encabezados[colNumber - 1];
        if (encabezado) {
          const valor = cell.value;
          filaData[encabezado] = valor;
          if (valor !== null && valor !== undefined && valor !== '') {
            tieneDatos = true;
          }
        }
      });

      if (tieneDatos) {
        filas.push(filaData);
        filasConDatos++;
      }
    }

    const resumen = {
      totalFilas: totalFilas - filaInicioDatos + 1,
      totalColumnas: encabezados.length,
      filasConDatos,
    };
    return {
      encabezados,
      filas,
      resumen,
    };
  }
}
