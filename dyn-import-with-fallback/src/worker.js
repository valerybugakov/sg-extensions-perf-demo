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
// - how to handle out of date extensions (incompatible w/ strict mode) when import() IS supported?

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

async function main() {
  // This is where we would determine which extensions to activate
  await loadExtensions(extensionIDs);
}

main();

/**
 * To be called with IDs of extensions that have not yet been activated.
 */
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
// - returns Promise for map of extension id -> activate + deactivate functions?
// - loaders should activate extensions themselves so they have control over scheduling,
// which is different based on the type of loader.

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
  // Map<Index, { activate:ActivateFunction, deactivate?: deactivateFunction }>
  const extensionExportsByID = new Map();

  // queue of API context setters
  const initContextQueue = [];

  globalThis.require = () => {
    // TODO: determine best way to limit extensions to importing "sourcegraph" once
    const { api, initContext } = createAPI();

    // We can't assume index in `importLoader()` since extensions
    // can be executed out of order. Fortunately, the Promise callbacks
    // are called in order of extension execution, so a simple queue solves the problem.
    initContextQueue.push(initContext);

    return api;
  };

  const exports = {};
  self.exports = exports;
  self.module = { exports };

  const erroredIDs = [];

  await Promise.all(
    ids.map((id) =>
      import(`./extensions/${id}/dist/index.js`)
        .then(() => {
          const extensionExports = self.module.exports;

          initContextQueue.shift()(id);

          extensionExportsByID.set(id, {
            activate: extensionExports.activate,
            deactivate: extensionExports.deactivate,
          });
        })
        .catch((error) => {
          console.log(`error importing ${id}`, error);
          erroredIDs.push(id);
        })
    )
  );

  for (const [, { activate }] of extensionExportsByID) {
    activate();
  }

  if (erroredIDs.length > 0) {
    // NEXT UP: what do we do with extensions here? send them to importScriptsLoader?
    // Unfortunately, `importScripts()` cannot load scripts in parallel in some
    // contexts in which `import()` is defined (like Chrome desktop), so we should
    // leave some room for main thread messages before initiating importScripts loading.
    await new Promise((resolve) => setTimeout(resolve, 100));
    // importScriptsLoader, then merge extensionDeactivate Maps?
    importScriptsLoader(erroredIDs);
  }

  return extensionExportsByID;
}

function importScriptsLoader(ids) {
  // Map<Index, { activate:ActivateFunction, deactivate?: deactivateFunction }>
  const extensionExportsByID = new Map();

  let nextImportIndex = 0;
  let erroredExtensions = 0;
  const contexts = [];

  globalThis.require = () => {
    // TODO: determine best way to limit extensions to importing "sourcegraph" once
    const { api, initContext } = createAPI();

    // What if an uploaded extension doesn't export activate()??
    // Alert the user that one of the imported extensions is not valid and should be disabled?
    // That's easy since the user can use their judgement to efficiently determine the bad extension
    // through trial and error (they'd probably disable something like "123/asbdbs" before "sourcegraph/git-extras").
    contexts[nextImportIndex] = initContext;

    return api;
  };

  const exports = {};
  self.exports = exports;
  self.module = new Proxy(
    { exports },
    {
      set: (obj, prop, value) => {
        if (typeof value === "object" && "activate" in value) {
          extensionExportsByID.set(ids[nextImportIndex], {
            activate: value.activate,
            deactivate: value.deactivate,
          });
        }
        nextImportIndex++;
        return true;
      },
    }
  );

  while (nextImportIndex < ids.length) {
    try {
      const restIds = ids.slice(nextImportIndex);
      importScripts(...restIds.map((id) => `./extensions/${id}/dist/index.js`));
      // TODO: The condition would never break if an extension doesn't export anything, so we break explicitly
      // after importing all extensions.
      // This loop is meant for unhandled errors, not bad extensions that don't follow our contract (must export `activate`).
      // TODO: add check for activate export in prepublish, possible lint rule. add to extension generator.
      break;
    } catch (error) {
      erroredExtensions++;
      nextImportIndex++;
    }
  }

  // We assume that it is a successful import if the extension was able to export its activate function.
  if (extensionExportsByID.size !== ids.length - erroredExtensions) {
    // some extension didn't export `activate`, so we can't associate extensions'
    // ids with their `activate` and `deactivate` functions, which we usually do by index.
    // user has to fix this. This is a rare issue and should be fixed at the registry level.
    console.log("not eq!");
  }

  // If everything has gone well up to this point, we should be able to initialize context!
  for (const [, { activate }] of extensionExportsByID) {
    activate();
  }

  return extensionExportsByID;
}
