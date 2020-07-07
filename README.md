# static-to-html
简介：将特定的css,js文件内容打包进目标html文件

### 解决问题
vue或react的单页面项目，首页加载慢会导致白屏的问题，使用ssr难度较高，如果把首页的js,css文件内容直接打包进index.html,是可以减少首屏加载时间，并且实施很简单。

### 测试效果
加载时间由 2.6s 缩减为 1.7s;
根据本地测试结果，正常的单页面项目的首页load时间一般为2.6s左右，用此方法优化后，时间缩短至1.7s,所有还是有一定帮助的。

### 使用方法
1. 一个正常的vue或react单页面项目

2. 安装包
```shell
npm install --save-dev static-to-html-plugin
```

3. 创建配置:plugins
    ```javascript
    chainWebpack: config => {
        if (process.env.NODE_ENV === 'production') {
          config.plugin('StaticToHtmlPlugin').use(statictohtml, [{
            fileNames: [
              /app\.[\w\d]+\.css/,//插入head尾部
              /app\.[\w\d]+\.js/ // 插入body尾部
            ],
            html: 'index.html',// default
            extensions: {
              '.css': 'style',
              '.js': 'script',
              '.json': 'script',
            },
          }]);
        }
    ```

 参数 | descript |类型| 默认值
-------|------ | ------|-----------------
 html|需要处理的html文件|string|index.html
 fileNames|需要处理的文件| []string/RegExg | []
 extensions|包裹内容的标签|Object| 


