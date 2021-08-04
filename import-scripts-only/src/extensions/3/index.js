import sourcegraph from "sourcegraph";

console.log("importing extension 3", { sourcegraph });
sourcegraph.app.log("hello from extension 3");

export function activate() {
  sourcegraph.app.log("extension 3 activated");
}
