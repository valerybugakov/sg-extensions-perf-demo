console.log("worker init");

const extensionIDs = ["1", "2", "3"];

function createAPI() {
  const context = { id: undefined };

  return {
    api: {
      app: {
        log: (message) => {
          // determine what to do during init tick when context isn't set
          console.log(`from extension ${context.id}:`, message);
        },
      },
    },
    initContext: (id) => {
      context.id = id;
    },
  };
}

// TODO: import() with importScripts() fallback.
// - should we try to avoid user agent detection?
//    - how could we? try import() and see if it isn't implemented?
// - how to handle out of date extensions (incompatible w/ strict mode)?

/**
 * Tests whether `import()` is implemented in this context.
 *
 * Known contexts in which this returns `false`:
 * - Web Worker on Firefox
 *  */
const supportsDynamicImportPromise = (async () => {
  try {
    await import("data:text/javascript;charset=utf-8,");
    return true;
  } catch (error) {
    // console.error(error);
    return false;
  }
})();

// queue of API contexts
const initContextQueue = [];

globalThis.require = () => {
  // TODO: determine best way to limit extensions to importing "sourcegraph" once
  const { api, initContext } = createAPI();

  initContextQueue.push(initContext);

  return api;
};

const exports = {};
self.exports = exports;
// self.module = new Proxy(
//   { exports },
//   {
//     get: (target, prop, receiver) => {
//       console.log({ target, prop, receiver });
//       return {
//         activate: () => console.log("proxy activate"),
//       };
//     },
//     set: (obj, prop, value) => {
//       console.log({ obj, prop, value });
//       return true;
//     },
//   }
// );
self.module = { exports };

loadExtensions(extensionIDs);

async function loadExtensions(ids) {
  const supportsDynamicImport = await supportsDynamicImportPromise;

  console.log({ supportsDynamicImport });

  if (supportsDynamicImport) {
    await importLoader(ids);
  } else {
    importScriptsLoader(ids);
  }
}

// LOADER TYPE:
// - returns Promise for map of extension id -> activate + deactivate functions.

// Even when all extensions are returned at the same time, seems to be:
//   extension execution: 1-2-3----
// promise callback call: -1-2-3---
//               timeout: ------123
// which works for us since we can capture each extension's
// exports despite being imported asynchronously!
//
// as opposed to
//   extension execution: 123---
// promise callback call: ---123
async function importLoader(ids) {
  await Promise.all(
    ids.map((id) =>
      import(`./extensions/${id}/dist/index.js`)
        .then((module) => {
          // queueMicrotask(() => console.log(`microtask: ${id}`));
          setTimeout(() => console.log(`timeout: ${id}`), 0);

          const extensionExports = self.module.exports;

          initContextQueue.shift()(id);

          extensionExports.activate();
        })
        .catch((error) => console.log(`error importing ${id}`, error))
    )
  );
}

function importScriptsLoader(ids) {
  let nextImportIndex = 0;

  const exports = {};
  self.exports = exports;
  self.module = new Proxy(
    { exports },
    {
      get: (target, prop, receiver) => {
        console.log({ target, prop, receiver });
        return {
          activate: () => console.log("proxy activate"),
        };
      },
      set: (obj, prop, value) => {
        console.log({ obj, prop, value });
        if (typeof value === "object" && "activate" in value) {
          // We assume that it is a successful import if the extension was able to export its activate function.
          nextImportIndex++;
        }
        return true;
      },
    }
  );

  while (nextImportIndex < ids.length) {
    try {
      const restIds = ids.slice(nextImportIndex);
      importScripts(...restIds.map((id) => `./extensions/${id}/dist/index.js`));
    } catch (error) {
      console.log("error importing scripts", { nextImportIndex, error });
      nextImportIndex++;
    }
  }
  console.log({ initContextQueue });
}
