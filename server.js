const azure = require('azure');
var fs = require("fs");
var http = require('http');

var html = fs.readFileSync("HTMLPage.html").toString();
html = html.replace("<style></style>","<style>"+fs.readFileSync("style.css")+"</style>");
var output = "<p>none</p>";

http.createServer(function (req, res) {
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html.replace("<output>",output));
    
}).listen(process.env.PORT || 8080);