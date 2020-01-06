const path = require("path");
const webpack = require("webpack");
const glob = require("glob");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

function getEntry() {
  var entry = {};
  //读取src目录所有page入口
  glob.sync("./src/page/**/*.js").forEach(function(name) {
    var start = name.indexOf("src/") + 4,
      end = name.length - 3;
    var eArr = [];
    var n = name.slice(start, end);
    n = n.slice(0, n.lastIndexOf("/")); //保存各个组件的入口
    n = n.split("/")[1];
    eArr.push(name);
    entry[n] = eArr;
  });
  return entry;
}

module.exports = {
  mode: "development",
  entry: getEntry(),
  // entry: autoWebPlugin.entry({}),
  output: {
    filename: "[name]/js/[name]-[contenthash:8].js",
    path: path.resolve(__dirname, "./dist/"),
    chunkFilename: "vendors/[name]-[contenthash].js"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "",
              hmr: process.env.NODE_ENV === "development"
            }
          },
          "css-loader"
        ]
      }
    ]
  },
  devServer: {
    compress: true,
    port: 8080,
    hot: true
  },
  devtool: false,
  resolve: {
    alias: {
      "@css": path.resolve(__dirname, "./src/css"),
      "@page": path.resolve(__dirname, "./src/page"),
      "@utils": path.resolve(__dirname, "./src/utils")
    },
    extensions: [".js", ".css"]
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: "~",
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          // chunks: "initial",
          // name: "vendor", // 打包后的文件名，任意命名
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin(),

    new MiniCssExtractPlugin({
      filename: "[name]/css/[name]-[contenthash:8].css"
      //   chunkFilename: "[id].css",
      //   ignoreOrder: false // Enable to remove warnings about conflicting order
    })
    // new webpack.SourceMapDevToolPlugin({})
    // new HtmlWebpackPlugin(),
    // new HtmlWebpackPlugin({
    //   // Also generate a test.html
    //   filename: "[name]/index.[id].html",
    //   template: "src/assets/template.html"
    // })
  ]
};

// 获取html-webpack-plugin参数的方法
var getHtmlConfig = function(name, chunks, excludeChunks) {
  return {
    template: `src/assets/template.html`,
    filename: `${name}.html`,
    // favicon: './favicon.ico',
    // title: title,
    inject: true,
    // hash: true, //开启hash  ?[hash]
    chunks,
    // chunks: ["test"],
    excludeChunks,
    minify:
      process.env.NODE_ENV === "development"
        ? false
        : {
            removeComments: true, //移除HTML中的注释
            collapseWhitespace: true, //折叠空白区域 也就是压缩代码
            removeAttributeQuotes: true //去除属性引用
          }
  };
};

//配置页面
const entryObj = getEntry();
const htmlArray = [];
Object.keys(entryObj).forEach(element => {
  htmlArray.push({
    _html: element,
    title: "",
    excludeChunks: Object.keys(entryObj).filter(filename => filename != element)
  });
});

//自动生成html模板
htmlArray.forEach(element => {
  module.exports.plugins.push(
    new HtmlWebpackPlugin(
      getHtmlConfig(element._html, element.chunks, element.excludeChunks)
    )
  );
});
