import { IFile } from "./IFile";
import * as XLSX from "xlsx";

export function exportPdf(config: Readonly<ExportConfig>): IFile {

}

export function exportXlsx(config: Readonly<ExportConfig>): IFile {
  const { rows, cols, name } = parseExportConfig(config);
  const workbook = XLSX.utils.book_new();
  const sheetName = name;
  workbook.SheetNames.push(sheetName);

  const toArray = new Function(`row`, `return [ ${cols.map((_) => `row[${JSON.stringify(_)}]`).join(",")} ]`) as (row: any) => any[];
  const arrayOfArrays = rows.map(toArray);
  arrayOfArrays.unshift(cols);
  workbook.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(arrayOfArrays);

  const data = XLSX.write(workbook, {
    type: "array",
    bookType: "xlsb",
    compression: true,
    sheet: sheetName,
  });

  return {
    type: `application/vnd.ms-excel.sheet.binary.macroEnabled.12`,
    data,
    name: `${name}.xlsb`,
  };
}

function parseExportConfig(config: Readonly<ExportConfig>): IExportConfig {
  const name = "name" in config && config.name ? config.name : "Export";
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
