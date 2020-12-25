var http = require('http')
var fs = require('fs') 
var url = require('url')
const { parse } = require('path')

//一个数组,node命令后面的参数 node server.js 8888 => ['server.js','8888']
var port = process.argv[2]   
if(!port){
  console.log('请指定端口, 如:  \nnode server.js 8888')
  process.exit(1)
}

// 每接受一个请求 就创建一个服务
var server = http.createServer(function(request, response){
    //url.parse()可以将一个完整的URL地址，分为很多部分，常用的有：host、port、pathname、path、query。
    //返回:
    // parsedUrl = {
    //     protocol: null,
    //     slashes: null,
    //     auth: null,
    //     host: null,
    //     port: null,
    //     hostname: null,
    //     hash: null,
    //     search: null,
    //     query: [Object: null prototype] {},
    //     pathname: '/js/chunk-vendors.6ed3c944.js',
    //     path: '/js/chunk-vendors.6ed3c944.js',
    //     href: '/js/chunk-vendors.6ed3c944.js' 
    // },

    // 参数true是生成对象, 默认为false 生成字符串
  var parsedUrl = url.parse(request.url, true)

    //   非完整路径,如:/css/app.cd1a63b3.css(带查询参数)
  var pathWithQuery = request.url 

  var queryString = ''
  if(pathWithQuery.indexOf('?') >= 0){ queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  
   //不带查询参数的路径
  var path = parsedUrl.pathname 
  var query = parsedUrl.query
  var method = request.method

  console.log('收到请求！路径为：' + pathWithQuery)

  response.statusCode = 200
  // 默认首页
  const filePath = path === '/' ? '/index.html' : path

    //获取后缀
  const index = filePath.lastIndexOf('.')
  const suffix = filePath.substring(index)
  
    //   后缀与文件类型表
  const fileTypes = {
    '.html':'text/html',
    '.css':'text/css',
    '.js':'text/javascript',
    '.png':'image/png',
    '.jpg':'image/jpeg'
  }

    //   根据后缀设置相应的响应头
  response.setHeader('Content-Type', `${fileTypes[suffix] || 'text/html'};charset=utf-8`)

    //   读取文件,写入响应的内容
  let content 
  try{
    content = fs.readFileSync(`./public${filePath}`)
  } catch(error) {
    content = '404 文件不存在'
    response.statusCode = 404
  }
  response.write(content)
  response.end()
})

server.listen(port)  //监听指定端口
console.log('监听 ' + port + ' 成功\n地址 http://localhost:' + port)