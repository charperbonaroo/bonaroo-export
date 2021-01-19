import { IFile } from "./IFile";
import * as XLSX from "xlsx";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

export async function exportPdf(inputConfig: Readonly<ExportConfig>): Promise<IFile> {
  const config = parseExportConfig(inputConfig);
  const arrayOfArrays = createTable(config);
  arrayOfArrays.unshift(config.cols);

  const docDefinition = {
    header: config.name,
    content: [{
      layout: "lightHorizontalLines",
      table: {
        headerRows: 1,
        widths: config.cols.map((_) => "auto"),
        body: arrayOfArrays,
      },
    }]
  };


  const pdf = pdfMake.createPdf(docDefinition);
  const data = await new Promise<ArrayBuffer>((resolve) => pdf.getBuffer(resolve));

  return {
    data,
    name: `${config.name || "export"}.pdf`,
    type: "application/pdf",
  };
}

export function exportXlsx(inputConfig: Readonly<ExportConfig>): IFile {
  const config = parseExportConfig(inputConfig);
  const workbook = createWorkbook(config);

  const data = XLSX.write(workbook, {
    type: "array",
    bookType: "biff2",
    sheet: workbook.SheetNames[0],
  });

  return {
    type: `application/vnd.ms-excel`,
    data,
    name: `${config.name || "export"}.xls`,
  };
}

function createTable(config: IExportConfig): any[][] {
  const { rows, cols } = config;
  const toArray = new Function(`row`, `return [ ${cols.map((_) => `row[${JSON.stringify(_)}]`).join(",")} ]`) as (row: any) => any[];
  return rows.map(toArray);
}

function createWorkbook(config: IExportConfig): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  const sheetName = config.name;
  workbook.SheetNames.push(sheetName);

  const arrayOfArrays = createTable(config);
  arrayOfArrays.unshift(config.cols);
  workbook.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(arrayOfArrays);

  return workbook;
}

function parseExportConfig(config: Readonly<ExportConfig>): IExportConfig {
  const name = "name" in config && config.name ? config.name : "";
  const rows = config instanceof Array ? config.slice() : config.rows.slice();
  const cols = "rows" in config && config.rows ? config.rows : inferColsInRows(rows);

  return {
    name,
    rows,
    cols,
  };
}

function inferColsInRows(rows: any[]): string[] {
  return Object.keys(rows[0]);
}

export type ExportConfig = IExportConfig|(Partial<IExportConfig>&Pick<IExportConfig, "rows">)|IExportConfig["rows"];

export interface IExportConfig {
  name: string;
  rows: any[];
  cols: string[];
}
