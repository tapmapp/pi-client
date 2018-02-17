var io = require('socket.io-client');
var credentials = require('./credentials');
var sensor = require('./sensor');
var farmConfig = require('./farm-config');

var url = 'https://cityfarmers-api.herokuapp.com/';

module.exports = {

    startSocket: function(farmerId, farmId, reconnect, reconnectCb, token) {

        console.log('Farmer id: ' + farmerId);

        // SOCKET CONNECTION
        var socket = io(url + farmerId);

        socket.on('connect', function() {
            console.log('connected to server');
            socket.emit('subscribe', farmId);
            sensor.start(token, farmerId, farmId);
        });

        socket.on('rasp-switch-light', function(data) {
            console.log(data.status);
            sensor.pinState(11, data.status);
        });

        socket.on('farm-config-changed', function(data) {
            farmConfig.reqFarmConfig(token);
        });

        socket.on('disconnect', function() {
            console.log('disconnected!');
            sensor.stop();
            socket.disconnect();
            reconnect(reconnectCb);
        });

    }

}