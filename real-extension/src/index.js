import sourcegraph from "sourcegraph";

export function activate(context) {
  context.subscriptions.add(
    sourcegraph.languages.registerHoverProvider(["*"], {
      provideHover: () => ({
        contents: {
          value: "Hello world from WEBPACK EXTENSION! 🎉🎉🎉",
          kind: sourcegraph.MarkupKind.Markdown,
        },
      }),
    })
  );
}
