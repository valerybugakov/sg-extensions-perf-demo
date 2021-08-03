import sourcegraph from "sourcegraph";

console.log("importing extension three");

export function activate() {
  sourcegraph.app.log("hello from extension three");
}

export default () => "hi";
