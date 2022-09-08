var mysql = require("mysql2")

var conn = mysql.createConnection({
    host: "database-1.c76fclnfyi0o.us-west-2.rds.amazonaws.com",
    user: "admin",
    password: "devyanshpagal",
    database: "my_db",
    port: "3306"
});



module.exports = conn;