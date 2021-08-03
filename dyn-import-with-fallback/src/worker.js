"use strict";
console.log("worker init");

const extensionIDs = ["1", "2", "3"];

globalThis.require = () => {
  console.log("called require");
  return {
    app: {
      log: (message) => console.log("from extension:", message),
    },
  };
};

globalThis.tag = "demo";

importScripts(...extensionIDs.map((id) => `./extensions/${id}/dist/index.js`));

import("./extensions/1/dist/index.js")
  .then((module) => console.log({ module }))
  .catch((error) => console.log({ error }));
