import sourcegraph from "sourcegraph";

console.log("importing extension one");

export function activate() {
    sourcegraph.app.log("activating extension one");
}
