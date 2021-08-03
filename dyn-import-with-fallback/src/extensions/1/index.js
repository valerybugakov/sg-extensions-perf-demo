import sourcegraph from "sourcegraph";

console.log("importing extension 1", {
  sourcegraph,
});
sourcegraph.app.log("hello from extension 1");
