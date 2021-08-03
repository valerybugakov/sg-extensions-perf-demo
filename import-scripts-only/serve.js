const express = require("express");
const path = require("path");
const app = express();

// Build extensions
// TODO

// Serve webpage
app.use((req, res, next) => {
  // fake latency to emulate real extension registry
  if (req.path.endsWith("dist/index.js")) {
    setTimeout(() => {
      next();
    }, 1000);
  } else {
    next();
  }
});
app.use(express.static(path.join(__dirname, "src")));
app.listen(3000, () => {
  console.log("Web Worker demo listening on port 3000");
});
