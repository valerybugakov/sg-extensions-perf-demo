Initial thoughts

- mock interaction from the main thread as well. this is essential to making the extension host interactive AND initializing quickly. will solve the linked line jump issue.
- each demo should have its own bundling strategy. `importScripts()` only can get away with old style (parcel v1), dynamic `import()` only can get away with only module extensions, dynamic `import()` with fallback should be able to handle both.
- should run tests on each major browser (Chrome, Safari, Firefox). the import-scripts-only architecture, which we use in Sourcegraph right now, downloads in serial on Chrome.
- initial download speed is not the only performance concerns. responsiveness to the main thread has already shown to be an issue (e.g. scrolling to line)
  - it's possible that fixing download speed is enough to alleviate line scroll concerns, however, so prioritize that work first. after that, I can integrate scheduling into the loading solution

Medium-to-long-term migration plan:

- import-scripts-only architecture -> dyn-import-with-fallback architecture (while migrating extensions) -> naive-dyn-import-only (w/ graceful error handling for incompatible extensions)

TODO: UML Sequence diagram to demonstrate what the problem and solution look like.

- legacy and new extensions will have to have different export mechanisms (`module.exports = { activate }` vs `export activate`), but can have the same import mechanism (`global.require('sourcegraph')`)

- think about how to port `sourcegraph.app.log` without synchronous extension loading. two options come to mind:
  - 1. in `"sourcegraph"` module, add `setContext` function to `module.exports`. when called with id, sets that property on the API instance passed to the extension (create new API instance to pass to extension on each call of `globalThis.require`)
  - 2. include extension id from manifest in compiled output.
