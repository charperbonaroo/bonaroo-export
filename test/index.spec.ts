import { exportXlsx, exportPdf, IExportColumn } from "../src";
import * as XLSX from "xlsx";
import * as fs from "fs";

const rows = require("./data.json");
const cols: IExportColumn[] = [{
  prop: "id",
}, {
  prop: "title"
}, {
  prop: "bookingPrice"
}, {
  prop: "banner.hash",
  format: (val) => val ? val.substr(0, 6) : null,
}, {
  prop: "startAt",
  format: (val) => val ? val.substr(0, 10) : null,
}];

test("exportXlsx() creates XLSX file", () => {
  const blob = exportXlsx({ rows, cols });
  const workbook = XLSX.read(blob.data, { type: "array" });
  XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  fs.writeFileSync(__dirname + "/../sample/" + blob.name, Buffer.from(blob.data));
  // this test doesn't actually assert anything, it's just here to see nothing is obviously broken.
  // see `sample/*` for yourself to verify everything looks decent. See README
});

test("exportPdf() creates PDF file", async () => {
  const blob = await exportPdf({ rows, cols });
  fs.writeFileSync(__dirname + "/../sample/" + blob.name, Buffer.from(blob.data));
  // this test doesn't actually assert anything, it's just here to see nothing is obviously broken.
  // see `sample/*` for yourself to verify everything looks decent. See README
});
