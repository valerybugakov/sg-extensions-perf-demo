const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    library: {
      type: "umd",
    },
    globalObject: "self",
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 1234,
    inline: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    writeToDisk: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "./package.json", to: "package.json" }],
    }),
  ],
};
