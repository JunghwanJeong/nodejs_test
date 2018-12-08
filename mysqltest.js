
//ALTER USER 'nodejs'@'%' IDENTIFIED WITH mysql_native_password BY 'Jung09150!'
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'nodejs',
  password : 'Jung09150!',
  database : 'opentutorials'
});
 
connection.connect();
 
connection.query('SELECT * from topic', function (error, results, fields) {
  if (error) throw error;
  console.log( results);
});
 
connection.end();