import { exportXlsx } from "../src";
import * as XLSX from "xlsx";
import fs from "fs";

const rows = [{
  id: 1,
  name: "bar",
}, {
  id: 2,
  name: "baz",
}] as const;

test("exportXlsx() creates XLSX file", () => {
  const blob = exportXlsx(rows);
  const workbook = XLSX.read(blob.data, { type: "array" });
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  expect(data).toEqual(rows);
});

test("exportPdf() creates PDF file", () => {
  const blob = exportPdf(rows);
  fs.writeFileSync("../sample/export.pdf", blob.data);
});
