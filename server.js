const express = require("express");
const fs = require("fs");
const mysql = require("mysql");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

// 静态文件的处理
app.use("/public", express.static("public"));

// mysql 连接池
const sqlOptions = {
  host: "localhost",
  user: "root",
  password: "123456",
  database: "user",
};
const pool = mysql.createPool(sqlOptions);

// TODO 使用async await 解决回调问题

// cookie过期时间
const setCookieTime = () => {
  let da = new Date();
  // 一天后过期，单位毫秒
  // da.setTime(da.getTime() + 24 * 60 * 60 * 1000);
  da.setTime(da.getTime() + 10 * 1000);
  return da.toUTCString(); //将 1598789234953这种格式的转换成=> "Sat, 29 Aug 2020 12:06:33 GMT"
};

// 设置响应头
const allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
};
app.use(allowCrossDomain);

const setCookie = () => {
  
};

let content = { loginState: 0, msg: "登陆失败" };

app.get("/", (req, res) => {
  console.log(req.url);
  const content = fs.readFileSync("./src/index.html");
  res.setHeader("Content-Type", "text/html");
  res.write(content);
  res.end();
});
app.post("/register", (req, res) => {
  let userInfo = null;
  let chunks = [];
  // 接收post数据
  req.on("data", (chunk) => {
    chunks.push(chunk);
  });
  req.on("end", () => {
    let buf = Buffer.concat(chunks);
    userInfo = JSON.parse(buf.toString());
    console.log(userInfo);

    // 写入注册用户
    pool.getConnection((err, connection) => {
      if (err) {
        console.log("连接数据库失败");
        console.log(err.message);
        res.write("注册失败");
        return;
      }
      console.log(`当前连接数量：${pool._allConnections.length}`);
      const registerSQL = `INSERT INTO login (username, password) VALUE ("${userInfo.username}", "${userInfo.password}")`;
      console.log(registerSQL);
      // query会隐式地连接数据库，不再需要connect()
      connection.query(registerSQL, (err, sqlRes) => {
        if (err) {
          console.log(`数据插入出错: ${err.message}`);
          return;
        }
        console.log(sqlRes);
        connection.release();
        res.write("注册成功");
        res.end();
      });
    });
  });
});
app.post("/login", (req, res) => {
  // 接收post数据
  let userInfo = null;
  let chunks = [];
  req.on("data", (chunk) => {
    chunks.push(chunk);
  });
  req.on("end", () => {
    let buf = Buffer.concat(chunks);
    userInfo = JSON.parse(buf.toString());
    // 查数据库
    pool.getConnection((err, connection) => {
      if (err) {
        console.log("连接数据库失败");
        console.log(err.message);
        content.msg = "连接数据库失败";
        res.write(content);
        res.end();
        return;
      }
      console.log(`mysql连接数量：${pool._allConnections.length}`);
      const selectPassW = `SELECT password FROM login WHERE username="${userInfo.username}"`;
      connection.query(selectPassW, (err, sqlRes) => {
        if (err) {
          console.log(`查询密码出错: ${err.message}`);
          content.msg = "查询密码出错";
          res.write(content);
          res.end();
          return;
        }
        const { password } = JSON.parse(JSON.stringify(sqlRes))[0] || "";
        if (userInfo.password !== password) {
          content.msg = "账号或密码错误";
          res.send(JSON.stringify(content));
        } else {
          // 设置登录信息
          content.loginState = 1;
          content.msg = "登陆成功";
          content.toString("utf8");

          res.cookie(
            `token=${userInfo.username}; httpOnly; expires==${setCookieTime()}`
          );

          res.send(JSON.stringify(content));
        }
        connection.release();
        return;
      });
    });
  });
});
app.get("/test", (req, res) => {
  console.log(req.cookies);
  content = fs.readFileSync("./src/test.html");
  res.write(content);
  res.end();
});

app.listen(1234);
console.log("服务启动： http://localhost:1234");
