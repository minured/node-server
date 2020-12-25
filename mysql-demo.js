const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "user",
  port: "3306",
});

const myCon = connection.connect();

const selectAll = "SELECT * FROM login";
const insertUserInfo =
  "INSERT INTO login (username, password) VALUE ('username1', 'password1')";

// connection.query(insertUserInfo, (err, res, fields) => {
//   if (err) {
//     console.log(err.message);
//     return;
//   }
//   console.log(res);
//   //   console.log(fields);
// });

connection.query(selectAll, (err, res, fields) => {
  if (err) {
    console.log(err.message);
    return;
  }
  console.log(res);
  console.log(res[0]);
  console.log(JSON.stringify(res[0]));
});
