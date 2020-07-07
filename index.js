
const pluginName = 'StaticToHtmlPlugin';

let defaultOptions = {
  html: 'index.html',
  fileNames: [],
  extensions: {
    '.css': 'style',
    '.js': 'script',
    '.json': 'script',
  },
};

function getExtension(name) {
  if (!name) return null;
  let res = name.match(/\.[\s\w]+$/);
  return res && res[0];
};

// 清除字符串中特定href或src值的标签
function clearLabel(html, srcOrHref) {
  return html.replace(/<(link|script)\b[^>]+(\/?>|><\0>)/gi, function (args) {
    let temp = args.match(/\s('|")?(\w+)\1=('|")?[^\s>]+\2?/g) || [];
    let attrs = {};
    // 提取属性
    temp.forEach(item => {
      let arr = (item || '').split('=');
      attrs[arr[0]] = arr[1];
    });

    let { rel, script, href } = attrs;
    // get url
    let src = script || href;

    if (src && src == `${srcOrHref}`) args = ''; // 清除
    return args;
  })
};

class StaticToHtmlPlugin {

  constructor(options) {//object

    let mergeOptions = {};
    if (({}).toString.call(options) === '[object Array]') {
      mergeOptions = options;
    } else if (({}).toString.call(options) === '[object Object]') {
      mergeOptions = [options];
    } else {
      mergeOptions = defaultOptions;
    };

    mergeOptions = mergeOptions.map(item => {
      return Object.assign(JSON.parse(JSON.stringify(defaultOptions)), item);
    });
    // mergeOptions.forEach(item=>{
    //   Object.assign(item,JSON.parse(JSON.stringify(defaultOptions)),item);
    // });

    this.options = mergeOptions;
  }

  apply(compiler) {
    // console.log('\n Static to Html Plugin work ...');

    compiler.plugin('emit', (compilation, callback) => {
      let publicPath = compiler.options.output.publicPath;
      var assets = compilation.assets;

      // 将所有html进行修改替换
      this.options.forEach(({ html, fileNames, extensions }) => {

        // 目标html
        let htmlFile = assets[html];
        let htmlContent = htmlFile.source();

        if (!fileNames || !html || !htmlFile) return;  //文件不存在

        if (!fileNames instanceof Array) fileNames = [fileNames];

        // 找出所有需要插入的文件名称
        let targetFileNames = [];
        fileNames.forEach(name => {
          // string
          if (typeof name === 'string' && assets[name]) {
            targetFileNames = [name];
          } else if (name instanceof RegExp) {
            // regex,将所有符合的文件名找出来
            let names = Object.keys(assets).filter(item => name.test(item));
            targetFileNames.push(...names);
          }
        });
        // 去重
        targetFileNames = [...new Set(targetFileNames)];

        // 清空所有目标文件的引用连接：script,link标签
        for (let i = 0; i < targetFileNames.length; i++) {
          const name = targetFileNames[i];
          htmlContent = clearLabel(htmlContent, `${publicPath}${name}`);
        }

        // 按类型将文件分别拼接
        let cssContent = '', jsContent = '';
        for (let i = 0; i < targetFileNames.length; i++) {
          let name = targetFileNames[i];
          let fileExt = getExtension(name);
          let label = (extensions || defaultOptions.extensions)[fileExt];
          let appendContent = `<${label}>` + assets[name].source() + `</${label}>`;
          if (label === 'script') {
            jsContent += appendContent;
          } else if (label === 'style') {
            cssContent += appendContent;
          }
        };


        // 依次插入:css插入到head尾部，js插入到body的底部
        htmlContent = htmlContent.replace(/<\/head><body>/, function (args) {
          return cssContent + '</head><body>';
        });

        htmlContent = htmlContent.replace(/<\/body><\/html>/, function (args) {
          return jsContent + '</body></html>';
        });

        // 将内容返回
        assets[html].source = () => {
          return htmlContent;
        };
        console.log(`\n StaticToHtmlPlugin:${html} append success ...`);

      })

      callback();
    });

    // console.log('\n Static to Html Plugin end ...');
  }
};

module.exports = StaticToHtmlPlugin;
exports.default = StaticToHtmlPlugin;