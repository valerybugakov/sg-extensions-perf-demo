NOTE: This is a scratchpad for my thoughts on the issue. Move these to RFC 411 once they're coherent.

Initial thoughts

- mock interaction from the main thread as well. this is essential to making the extension host interactive AND initializing quickly. will solve the linked line jump issue.
- each demo should have its own bundling strategy. `importScripts()` only can get away with old style (parcel v1), dynamic `import()` only can get away with only module extensions, dynamic `import()` with fallback should be able to handle both.
- should run tests on each major browser (Chrome, Safari, Firefox). the import-scripts-only architecture, which we use in Sourcegraph right now, downloads in serial on Chrome.
- initial download speed is not the only performance concerns. responsiveness to the main thread has already shown to be an issue (e.g. scrolling to line)
  - it's possible that fixing download speed is enough to alleviate line scroll concerns, however, so prioritize that work first. after that, I can integrate scheduling into the loading solution

Medium-to-long-term migration plan:

- import-scripts-only architecture -> dyn-import-with-fallback architecture (while migrating extensions) -> naive-dyn-import-only (w/ graceful error handling for incompatible extensions)

TODO: UML Sequence diagram to demonstrate what the problem and solution look like.
