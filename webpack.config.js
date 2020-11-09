const { resolve } = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TsConfigsPathPlugin = require("tsconfig-paths-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");

const isProd = process.env.NODE_ENV === "production";
const babelConfig = () => ({
  presets: [
    require.resolve("@babel/preset-env", {
      loose: true,
      modules: true,
      exclude: ["transform-regenerator", "transform-async-to-generator"],
    }),
    require.resolve("@babel/preset-typescript", {
      jsxPragma: "h",
    }),
  ].filter(Boolean),
  plugins: [
    require.resolve("fast-async", {
      spec: true,
    }),
    require.resolve("@babel/plugin-transform-react-jsx", {
      pragma: "h",
    }),
  ].filter(Boolean),
});

const postcssConfig = () => ({
  postcssOptions: {
    plugins: [
      require("postcss-preset-env")({}),
      isProd &&
        require("cssnano")({
          preset: [
            "advanced",
            {
              cssDeclarationSorter: true,
              discardComments: { removeAll: true },
            },
          ],
        }),
    ].filter(Boolean),
  },
});

const config = {
  entry: "./src/index",
  output: {
    path: resolve(__dirname, "build"),
    publicPath: "/",
    filename: isProd ? "[name].[chunkhash:5].js" : "[name].js",
    chunkFilename: "[name].chunk.[chunkhash:5].js",
  },
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom": "preact/compat",
    },
    extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx"],
    plugins: [new TsConfigsPathPlugin()],
  },
  optimization: {
    minimizer: [],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: "pre",
        exclude: /node_modules/,
        loader: "ts-loader",
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: babelConfig(),
      },
      {
        test: /\.css$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: postcssConfig(),
          },
        ],
      },
      {
        test: /\.s[ac]ss$/,
        enforce: "pre",
        use: [
          isProd ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader",
          "sass-loader",
          {
            loader: "postcss-loader",
            options: postcssConfig(),
          },
        ],
      },
      {
        test: /\.(svg|woff2?|ttf|eot|jpe?g|png|webp|gif|mp4|mov|ogg|webm)(\?.*)?$/i,
        loader: "file-loader",
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
    }),
    new MiniCssExtractPlugin({
      filename: isProd ? "[name].[contenthash:5].css" : "[name].css",
      chunkFilename: isProd
        ? "[name].chunk.[contenthash:5].css"
        : "[name].chunk.css",
    }),
    new HtmlWebpackPlugin({
      template: "./src/template.html",
    }),
  ],
  mode: isProd ? "production" : "development",
  devtool: isProd ? false : "source-map",
  stats: "errors-only",
  devServer: {
    contentBase: "./public",
    clientLogLevel: "none",
    host: "0.0.0.0",
    port: 3000,
    quiet: true,
    hot: true,
    compress: true,
    historyApiFallback: true,
    watchContentBase: false,
  },
};

if (isProd) {
  config.plugins.push(
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./public",
          noErrorOnMissing: true,
        },
      ],
    })
  );

  config.optimization.runtimeChunk = "single";

  config.optimization.minimizer = [new TerserWebpackPlugin()];
}

module.exports = config;
