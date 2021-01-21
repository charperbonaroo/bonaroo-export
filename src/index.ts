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
    bookType: "xlsx",
    compression: true,
    sheet: workbook.SheetNames[0],
  });

  return {
    type: `application/vnd.ms-excel`,
    data,
    name: `${config.name || "export"}.xlsx`,
  };
}

function getHeader(config: IExportConfig): string[] {
  return config.cols.map((_) => _.label || String(_.prop || ""));
}

function createTable(config: IExportConfig): any[][] {
  const { rows, cols } = config;
  const colsWithFormatters = cols.map(({ format, prop }) => [ format || (x => x), prop ] as [ TExportFormat, TExportProp ]);
  const createRow = (row: any) => colsWithFormatters.map(([ format, prop ]) => format(get(row, prop), prop, row) || "");
  return rows.map(createRow);
}

function createWorkbook(config: IExportConfig): XLSX.WorkBook {
  const workbook = getBlankWorkbook() as XLSX.WorkBook;
  const sheetName = workbook.SheetNames[0];

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

function getBlankWorkbook(): XLSX.WorkBook {
  // A blank workbook as imported by XLSX
  return {
    "Directory": {
      "workbooks": [
        "/xl/workbook.xml"
      ],
      "sheets": [
        "/xl/worksheets/sheet1.xml"
      ],
      "charts": [],
      "dialogs": [],
      "macros": [],
      "rels": [],
      "strs": [],
      "comments": [],
      "links": [],
      "coreprops": [
        "/docProps/core.xml"
      ],
      "extprops": [
        "/docProps/app.xml"
      ],
      "custprops": [],
      "themes": [
        "/xl/theme/theme1.xml"
      ],
      "styles": [
        "/xl/styles.xml"
      ],
      "vba": [],
      "drawings": [],
      "TODO": [],
      "xmlns": "http://schemas.openxmlformats.org/package/2006/content-types",
      "calcchain": "",
      "sst": "",
      "style": "/xl/styles.xml",
      "defaults": {
        "rels": "application/vnd.openxmlformats-package.relationships+xml",
        "xml": "application/xml"
      }
    },
    "Workbook": {
      "AppVersion": {
        "appName": "xl",
        "appname": "xl",
        "lastEdited": "7",
        "lastedited": "7",
        "lowestEdited": "7",
        "lowestedited": "7",
        "rupBuild": "10111",
        "rupbuild": "10111"
      },
      "WBProps": {
        "defaultThemeVersion": 166925,
        "allowRefreshQuery": false,
        "autoCompressPictures": true,
        "backupFile": false,
        "checkCompatibility": false,
        "CodeName": "",
        "date1904": false,
        "filterPrivacy": false,
        "hidePivotFieldList": false,
        "promptedSolutions": false,
        "publishItems": false,
        "refreshAllConnections": false,
        "saveExternalLinkValues": true,
        "showBorderUnselectedTables": true,
        "showInkAnnotation": true,
        "showObjects": "all",
        "showPivotChartFilter": false,
        "updateLinks": "userSet"
      },
      "WBView": [
        {
          "xWindow": "0",
          "xwindow": "0",
          "yWindow": "0",
          "ywindow": "0",
          "windowWidth": "0",
          "windowwidth": "0",
          "windowHeight": "0",
          "windowheight": "0",
          "uid": "",
          "activeTab": 0,
          "autoFilterDateGrouping": true,
          "firstSheet": 0,
          "minimized": false,
          "showHorizontalScroll": true,
          "showSheetTabs": true,
          "showVerticalScroll": true,
          "tabRatio": 600,
          "visibility": "visible"
        }
      ],
      "Sheets": [
        {
          "name": "Sheet1",
          "sheetId": "1",
          "sheetid": "1",
          "id": "rId1",
          "Hidden": 0
        }
      ],
      "CalcPr": {
        "calcId": "181029",
        "calcid": "181029",
        "calcCompleted": "true",
        "calcMode": "auto",
        "calcOnSave": "true",
        "concurrentCalc": "true",
        "fullCalcOnLoad": "false",
        "fullPrecision": "true",
        "iterate": "false",
        "iterateCount": "100",
        "iterateDelta": "0.001",
        "refMode": "A1"
      },
      "Names": [],
      "xmlns": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
      "Views": [
        {}
      ]
    },
    "Props": {
      "LastAuthor": "",
      "Author": "",
      "CreatedDate": "2021-01-21T14:00:00.000Z",
      "ModifiedDate": "2021-01-21T14:00:00.000Z",
      "Application": "Microsoft Macintosh Excel",
      "AppVersion": "16.0300",
      "DocSecurity": "0",
      "HyperlinksChanged": false,
      "SharedDoc": false,
      "LinksUpToDate": false,
      "ScaleCrop": false,
      "Worksheets": 1,
      "SheetNames": [
        "Sheet1"
      ]
    },
    "Custprops": {},
    "Deps": {},
    "Sheets": {
      "Sheet1": {
        "!margins": {
          "left": 0.7,
          "right": 0.7,
          "top": 0.75,
          "bottom": 0.75,
          "header": 0.3,
          "footer": 0.3
        }
      }
    },
    "SheetNames": [
      "Sheet1"
    ],
    "Strings": [],
    "Styles": {
      "Fonts": [
        {
          "sz": 12,
          "color": {
            "theme": 1
          },
          "name": "Calibri",
          "family": 2,
          "scheme": "minor"
        }
      ],
      "Fills": [
        {
          "patternType": "none"
        },
        {
          "patternType": "gray125"
        }
      ],
      "Borders": [
        {}
      ],
      "CellXf": [
        {
          "numFmtId": 0,
          "numfmtid": "0",
          "fontId": 0,
          "fontid": "0",
          "fillId": 0,
          "fillid": "0",
          "borderId": 0,
          "borderid": "0",
          "xfId": 0,
          "xfid": "0"
        }
      ]
    },
    "Themes": {},
    "SSF": {
      "0": "General",
      "1": "0",
      "2": "0.00",
      "3": "#,##0",
      "4": "#,##0.00",
      "9": "0%",
      "10": "0.00%",
      "11": "0.00E+00",
      "12": "# ?/?",
      "13": "# ??/??",
      "14": "m/d/yy",
      "15": "d-mmm-yy",
      "16": "d-mmm",
      "17": "mmm-yy",
      "18": "h:mm AM/PM",
      "19": "h:mm:ss AM/PM",
      "20": "h:mm",
      "21": "h:mm:ss",
      "22": "m/d/yy h:mm",
      "37": "#,##0 ;(#,##0)",
      "38": "#,##0 ;[Red](#,##0)",
      "39": "#,##0.00;(#,##0.00)",
      "40": "#,##0.00;[Red](#,##0.00)",
      "45": "mm:ss",
      "46": "[h]:mm:ss",
      "47": "mmss.0",
      "48": "##0.0E+0",
      "49": "@",
      "56": "\"上午/下午 \"hh\"時\"mm\"分\"ss\"秒 \""
    }
  } as any;
}
