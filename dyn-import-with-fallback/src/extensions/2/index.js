import sourcegraph from "sourcegraph";

console.log("importing extension two");
throw new Error("hi");
export function activate() {
    sourcegraph.app.log("activating extension two");
}
