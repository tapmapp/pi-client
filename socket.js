var io = require('socket.io-client');
var credentials = require('./credentials');
var farmConfig = require('./farm-config');
var sensor = require('./sensor');

module.exports = {

    startSocket: function(farmerId, farmId, reconnect, reconnectCb, room, token) {
        
        var url = 'https://cityfarmers-api.herokuapp.com/';

        console.log('Farmer id: ' + farmerId);

        // SOCKET CONNECTION
        var socket = io(url + farmerId);

        socket.on('connect', function() {
            console.log('connected to server');
            socket.emit('subscribe', room);
            sensor.start(room, token, farmerId, farmId);
        });

        socket.on('rasp-switch-light', function(data) {
            console.log(data.status);
            sensor.rele(11, data.status);
        });

        socket.on('disconnect', function() {
            console.log('disconnected!');
            sensor.stop();
            socket.disconnect();
            reconnect(reconnectCb);
        });

    }

}