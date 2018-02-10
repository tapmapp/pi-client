// RASPBERRY MODULES
var sensorLib = require("node-dht-sensor");
var GPIO = require('rpi-gpio');
var request = require('request');

var sensor = {
    name: "Indoor",
    type: 11,
    pin: 4
};

var timer;

var valuesStore = [];

var readSensor = function(socket, room, token, farmerId, farmId) {

    var sensorValues = sensorLib.read(sensor.type, sensor.pin);

    var json = { farmerId: farmerId, farmId: farmId, room: room, temperature: sensorValues.temperature, humidity: sensorValues.humidity };

    // REQUEST OPTIONS
    var options = {
        url: 'https://cityfarmers-api.herokuapp.com/environment/save',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        json: json
    };

    var requestCallBack = function(err, res, body) {
        if(!err && res.statusCode == 200) {
            console.log('saved!');
        } else {
            console.log('error!');
            console.log(err);
        }
    }

    request(options, requestCallBack);

    timer = setTimeout(function() {
        readSensor(socket, room, token, farmerId, farmId);
    }, 10000);

}

var releStatus = function(pin, status) {

    GPIO.write(pin, status, function(err) {
        if (err) throw err;
        console.log('Written to pin');
    });

}

// RELE PIN CONFIG
GPIO.setup(11, GPIO.DIR_OUT, releStatus.bind(this, 11, true));

module.exports = {
    start: function(socket, room, token, farmerId, farmId) {
        socket.emit('subscribe', room);
        readSensor(socket, room, token, farmerId, farmId);
    },
    stop: function() {
        clearTimeout(timer);
    },
    rele: function(pin, status) {
        releStatus(pin, status)
    }
}