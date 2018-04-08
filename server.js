const azure = require('azure');
const azureKey = 'Endpoint=sb://servicequeues.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=AUNiefT6dHz3ivqbYvpteI+LlwvOWE2M0OleRycSXzs=';
const asbService = azure.createServiceBusService(azureKey);

var fs = require("fs");
var http = require('http');

var html = fs.readFileSync("HTMLPage.html").toString();
html = html.replace("<style></style>","<style>"+fs.readFileSync("style.css")+"</style>");
var output = "<p>none</p>";
var trackingID = "0"

http.createServer(function (req, res) {
    output = "";
    if(trackingID > 100000)
        trackingID = 0;

    var incoming = unescape(req.url.substring(2,));
    var lines = incoming.split('&');
    var send = true;

    var payraw
    try{
        payraw = getvalue("payload",lines);
    var pay = JSON.parse(payraw);
    }
    catch(error) {
        send = false;
        output += "<p class='err'> JSON error: " + error.toString() + "in: " + payraw+" </p><br>" 
    }

    if(send){
        var message = {
            "trackingID": trackingID,
            "sender":  "queueui",
            "reciver": getvalue("reciver",lines),
            "type": getvalue("type",lines),
            "payload": pay
        }

        asbService.sendQueueMessage('queueui-send', message, function(error){
            if(error){
               output += "<p class='err'> send error: " + error.toString() + "</p><br>" 
            }
        });

        asbService.receiveQueueMessage('queueui-send', { isPeekLock: true }, function(error, lockedMessage){
            if(!error){
                output += "<h2>Incoming Message</h2><br><p>" + lockedMessage.toString() + "</p>";
                asbService.deleteMessage(lockedMessage, function (deleteError){
                    if(!deleteError){
                        // Message deleted
                    }
                });
                
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html.replace("<output>",output));
        });
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html.replace("<output>",output));
    
    
    trackingID +1;
}).listen(process.env.PORT || 8090);

function getvalue (name,lines){
    return lines.find(function(el){return el.startsWith(name)}).split('=')[1];
}

/*
asbService.sendQueueMessage('myqueue', message, function(error){
    if(!error){
        // message sent
    }
});

asbService.receiveQueueMessage('myqueue', { isPeekLock: true }, function(error, lockedMessage){
    if(!error){
        // Message received and locked
        serviceBusService.deleteMessage(lockedMessage, function (deleteError){
            if(!deleteError){
                // Message deleted
            }
        });
    }
});
*/