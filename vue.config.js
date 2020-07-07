// const compression = require('compression-webpack-plugin');
const statictohtml = require('../static-to-html-plugin');

module.exports = {
  chainWebpack: config => {
    // config.plugin('compression').use(compression, [{ algorithm: 'gzip', }]);// gzip压缩
    if (process.env.NODE_ENV === 'production') {
      config.plugin('statictohtml').use(statictohtml, [{
        fileNames: [
          /app\.[\w\d]+\.css/,//插入head尾部
          /app\.[\w\d]+\.js/ // 插入body尾部
        ],
        html: 'index.html',// 默认值
        extensions: { // 默认值
          '.css': 'style',
          '.js': 'script',
          '.json': 'script',
        },
      }]);
    }
  },

  // 压缩
  // configureWebpack: {
  //   plugins: [
  //     new compression({
  //       algorithm: 'gzip',
  //     }),
  //   ],
  // },
  productionSourceMap: false,
}