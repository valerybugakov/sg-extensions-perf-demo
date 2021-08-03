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

importScripts(...extensionIDs.map((id) => `./extensions/${id}/dist/index.js`));
