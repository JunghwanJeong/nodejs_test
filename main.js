var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Jung09150!',
  database : 'opentutorials'
});

connection.connect();

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){

        connection.query('SELECT * from topic', function (error, topics, fields) {
          if (error)  console.log(error);
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.list(topics);
          var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
          );
          response.writeHead(200);
          response.end(html);
        });

      } else {
       connection.query('SELECT * from topic', function (error, topics, fields) {
        if (error)  console.log(error);
        connection.query(`SELECT * FROM topic WHERE id=?`,[queryData.id], function(error2, topic){
          if(error2) console.log(error2);
 
          var title = topic[0].title;
          var description = topic[0].description;
          var list = template.list(topics);
          var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            ` <a href="/create">create</a>
                <a href="/update?id=${queryData.id}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${queryData.id}">
                  <input type="submit" value="delete">
                </form>`
          );
          response.writeHead(200);
          response.end(html);
          
        });
      });
      
   }
    } else if(pathname === '/create'){
 
      connection.query('SELECT * from topic', function (error, topics, fields) {
        if (error)  console.log(error);
      
        var title = 'WEB - create';
        var list = template.list(topics);
        var html = template.HTML(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, '');
        response.writeHead(200);
        response.end(html);
      });
    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var title = post.title;
          var description = post.description;
          connection.query(`
            INSERT INTO topic (title, description, created, author_id) 
              VALUES(?, ?, NOW(), ?)`,
            [post.title, post.description, 1], 
            function(error, result){
              if(error){
                throw error;
              }
              response.writeHead(302, {Location: `/?id=${result.insertId}`});
              response.end();
            }
          )
      });
    } else if(pathname === '/update'){
 
      connection.query('SELECT * from topic', function (error, topics, fields) {
        if (error)  console.log(error);
      
        connection.query(`SELECT * FROM topic WHERE id=?`,[queryData.id], function(error2, topic){
          if(error2) console.log(error2);
          var list = template.list(topics);
          console.log(topic);

          var title = topic[0].title;
          var description = topic[0].description;
          var html = template.HTML(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${queryData.id}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${queryData.id}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });


    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var title = post.title;
          var description = post.description;

          connection.query(`
            UPDATE topic SET title=?, description=? WHERE id=?`,
            [post.title, post.description,  post.id], 
            function(error, result){
              if(error){
                throw error;
              }
              response.writeHead(302, {Location: `/?id=${id}`});
              response.end();
            }
          )
      });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          connection.query(`
            DELETE from topic WHERE id=?`,
            [post.id], 
            function(error, result){
              if(error){
                throw error;
              }
              response.writeHead(302, {Location: `/`});
              response.end();
            }
          )
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
