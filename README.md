NOTE: This is a scratchpad for my thoughts on the issue. Move these to RFC 411 once they're coherent.

Thoughts

- mock interaction from the main thread as well. this is essential to making the extension host interactive AND initializing quickly. will solve the linked line jump issue.
- each demo should have its own bundling strategy. importScripts only can get away with old style (parcel v1), dynamic import only can get away with only module extensions, dynamic import with fallback should be able to handle both.

Medium-to-long-term migration plan:

- import-scripts-only architecture -> dyn-import-with-fallback architecture (while migrating extensions) -> naive-dyn-import-only (w/ error messages for incompatible extensions)
