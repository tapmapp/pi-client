var http = require('http');
var request = require('request');
var farmConfig = require('./farm-config');
var socket = require('./socket');
var credentials = require('./credentials');

// CONNECTION REQUEST FUNCTION
var login = function(loginCallBack) {

    // REQUEST CONTENT
    var json = { 'email': credentials.farmer, 'password': credentials.password, 'farm': credentials.farm };

    var url = 'https://cityfarmers-api.herokuapp.com/farmer/login';
    // var url2 = 'http://192.168.1.102:5000/farmer/login';

    // REQUEST OPTIONS
    var options = {
        url: url,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        json: json
    };

    console.log('Connecting...');
    request(options, loginCallBack);

}

var loginCallBack = function(err, res, body) {
    if(!err && res.statusCode == 200) {
        
        console.log(' ');
        console.log('Connected!');
        console.log('Starting socket...');
        console.log(' ');

        // REQUEST FARM CONFIG
        farmConfig.reqFarmConfig(res.body.token);

        // START SOCKET
        socket.startSocket(res.body.farmerId, credentials.farmId, login, loginCallBack, res.body.token);

    } else {

        console.log('Retrying connection...');
        setTimeout(() => {
            login(loginCallBack);
        }, 30000);

    }
}

module.exports = {
    connect: function() {
        login(loginCallBack);
    }
}