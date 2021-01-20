const assert = require("assert");
const BonarooExport = require("./dist");

assert("exportPdf" in BonarooExport);
assert("exportXlsx" in BonarooExport);
