// NODE MODULES
var http = require('http');
var request = require('request');

// SOCKET
var socket = require('./socket');

// CREDENTIALS
var credentials = require('./credentials');

// REQUEST CONTENT
var json = { "email": credentials.farmer, "password": credentials.password, "farm": credentials.farm };

var url = 'https://cityfarmers-api.herokuapp.com/farmer/login';
var url2 = 'http://192.168.1.102:5000/farmer/login';

// REQUEST OPTIONS
var options = {
    url: url,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    json: json
};

// RECONNECT TIMER VARIABLE
var timer;

// CONNECTION REQUEST FUNCTION
var requestFunc = function(requestCallBack) {

    console.log('Connecting...');
    request(options, requestCallBack);

}

var requestCallBack = function(err, res, body) {
    if(!err && res.statusCode == 200) {
        
        console.log(' ');
        console.log('Connected!');
        console.log('Starting socket...');
        console.log(' ');

        // START SOCKET
        socket.startSocket(res.body.farmerId, credentials.farmId, requestFunc, requestCallBack, credentials.farm, res.body.token);

    } else {

        console.log('Retrying connection...');
        setTimeout(function(){
            requestFunc(requestCallBack);
        }, 30000);

    }
}

module.exports = {
    connect: function() {
        requestFunc(requestCallBack);
    }
 }