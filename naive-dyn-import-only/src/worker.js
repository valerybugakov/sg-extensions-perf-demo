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

for (const id of extensionIDs) {
  //   const exports = {};
  //   self.exports = exports;
  //   self.module = { exports };
  import(`./extensions/${id}/dist/index.js`)
    .then((module) =>
      console.log({
        module: module,
        // TODO: import() only works with export, not module.exports
        activate: module.activate,
      })
    )
    .catch((error) => console.error(error));
}
