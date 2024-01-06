module.exports = {
  webpack: {
    plugins: [],
    configure: {
      entry: "/src/_sample",
      module: {
        rules: [
          {
            test: /\.(js|mjs|jsx)$/,
            enforce: "pre",
            use: ["source-map-loader"],
          },
        ],
      },
      ignoreWarnings: [/Failed to parse source map/],
    },
  },
};
