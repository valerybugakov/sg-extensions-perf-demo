import sourcegraph from "sourcegraph";

console.log("importing extension two");

export function activate() {
    sourcegraph.app.log("activating extension two");
}
