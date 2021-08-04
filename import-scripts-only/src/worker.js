"use strict";
console.log("worker init");

const extensionIDs = ["3"];

globalThis.require = () => {
  console.log("called require");
  return {
    app: {
      log: (message) => console.log("from extension:", message),
    },
  };
};

const exports = {};
self.exports = exports;
self.module = { exports };
importScripts(...extensionIDs.map((id) => `./extensions/${id}/dist/index.js`));

const extensionExports = self.module.exports;
console.log("extension exports", extensionExports);
console.log("exports object", exports);

import("./extensions/3/dist/index.js");
