import { IFile } from "./IFile";
import * as XLSX from "xlsx";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { get } from "lodash";

if (typeof window === "undefined") {
  (<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
}

export async function exportPdf(inputConfig: Readonly<ExportConfig>): Promise<IFile> {
  const config = parseExportConfig(inputConfig);
  const arrayOfArrays = createTable(config);
  arrayOfArrays.unshift(getHeader(config));

  const pdf = pdfMake.createPdf({
    pageMargins: [ 8, 8, 8, 8 ],
    header: config.name,
    defaultStyle: {
      fontSize: 8,
      lineHeight: 0.8,
    },
    content: [{
      layout: "lightHorizontalLines",
      table: {
        headerRows: 1,
        widths: config.cols.map((_) => "auto"),
        body: arrayOfArrays,
      },
    }]
  });

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

function getHeader(config: IExportConfig): string[] {
  return config.cols.map((_) => _.label || String(_.prop || ""));
}

function createTable(config: IExportConfig): any[][] {
  const { rows, cols } = config;
  const colsWithFormatters = cols.map(({ format, prop }) => [ format || (x => x), prop ] as [ TExportFormat, TExportProp ]);
  const createRow = (row: any) => colsWithFormatters.map(([ format, prop ]) => format(get(row, prop), prop, row));
  return rows.map(createRow);
}

function createWorkbook(config: IExportConfig): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  const sheetName = config.name;
  workbook.SheetNames.push(sheetName);

  const arrayOfArrays = createTable(config);
  arrayOfArrays.unshift(getHeader(config));
  workbook.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(arrayOfArrays);

  return workbook;
}

function parseExportConfig(config: Readonly<ExportConfig>): IExportConfig {
  const name = "name" in config && config.name ? config.name : "";
  const rows = config instanceof Array ? config.slice() : config.rows.slice();
  const cols = "cols" in config && config.cols ? config.cols : inferColsInRows(rows);

  return {
    name,
    rows,
    cols,
  };
}

function inferColsInRows(rows: any[]): IExportColumn[] {
  const row = rows[0];
  if (!row) {
    return [];
  }
  return Object.keys(row)
    .filter((_) => typeof row[_] !== "object" || row[_] === null)
    .map((prop) => ({ prop }));
}

export type ExportConfig = IExportConfig|(Partial<IExportConfig>&Pick<IExportConfig, "rows">)|IExportConfig["rows"];

export interface IExportConfig {
  name: string;
  rows: any[];
  cols: IExportColumn[];
}

export type TExportProp = string|number|symbol|(string|number|symbol)[];
export type TExportFormat = (val: any, prop: TExportProp, obj: any) => any;

export interface IExportColumn {
  prop: TExportProp;
  label?: string;
  format?: TExportFormat;
}
