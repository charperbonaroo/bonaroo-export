# Bonaroo: Export

A tool for exporting stuff to XLSX or PDF in NodeJS or the browser.

Usage:

```js
const file = exportXlsx({ rows, cols }); // < browser or node
const file = await exportPdf({ rows, cols }); // < browser or node


fs.writeFileSync(file.name, Buffer.from(file.data)); // < save to file (nodejs)

// in browser, assign this url to `href` attribute in an A-element,
// and use `download` attribute to force download
const url = URL.createObjectURL(new Blob([ file.data ], { type: file.type }));
```

## About the tests

The test do not verify the correctness of the results, they just generate an excel & pdf file. There is no easy & reliable way to verify the generated files without checking them manually, so that's what you're supposed to do:

No error? Check the exported files yourself!
