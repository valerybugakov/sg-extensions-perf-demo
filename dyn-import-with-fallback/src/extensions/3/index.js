import sourcegraph from "sourcegraph";

console.log("importing extension three");

export function activate() {
    sourcegraph.app.log("activating extension three");
}

export function deactivate() {
    sourcegraph.app.log("deactivating extension three");
}
