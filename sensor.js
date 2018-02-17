var sensorLib = require("node-dht-sensor");
var GPIO = require('rpi-gpio');
var request = require('request');
var farmConfig = require('./farm-config');

// TEMP / HUMIDITY PIN CONFIG
var sensor = {
    name: "Indoor",
    type: 11,
    pin: 4
};

// TEMP HUM VALUE
var tempHumVal;

// SENSOR TIMER
var piTimer;

// CHECK PI CONFIG
var checkPiConfig = function() {

    // CHECK LIGHTING CONFIG
    var date = new Date();

    // CHECK TEMP CONFIG
    checkTempConfig();

    piTimer = setTimeout(function(){
        checkPiConfig();
    }, 1000);

}

// CHECK TEMP CONFIG
var checkTempConfig = function() {

    var actualFarmConfig = farmConfig.getFarmConfig();

    tempHumVal = sensorLib.read(sensor.type, sensor.pin);

    // CHECK TEMP CONFIG
    if(actualFarmConfig.length > 0) {

        if(tempHumVal.temperature > actualFarmConfig[0].temperatureVent) {

            // READ PIN
            GPIO.read(11, function(err, value) {
                if(value !== true) {
                    // TURN VENTILATION ON
                    pinState(11, true);
                }
            });
            
        } else {

            // READ PIN
            GPIO.read(11, function(err, value) {
                if(value !== false) {
                    // TURN VENTILATION ON
                    pinState(11, false);
                }
            });
    
        }
    }

}

// SENSOR TIMER
var timer;

// READ SENSOR FUNCTION
var sendData = function(token, farmerId, farmId) {

    var json = { farmerId: farmerId, farmId: farmId, temperature: tempHumVal.temperature, humidity: tempHumVal.humidity };

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
        sendData(token, farmerId, farmId);
    }, 5000);

}

// CHANGE PIN STATUS
var pinState = function(pin, status) {

    GPIO.write(pin, status, function(err) {
        if (err) throw err;
        console.log('Written to pin');
    });

}

// VENTILATION PIN CONFIG
GPIO.setup(11, GPIO.DIR_OUT, pinState.bind(this, 11, false));

module.exports = {
    start: function(token, farmerId, farmId) {

        // START RASP CONFIG LOOP
        checkPiConfig();

        // START READING SENSOR
        sendData(token, farmerId, farmId);

    },
    stop: function() {
        clearTimeout(timer);
    },
    pinState: function(pin, status) {
        pinState(pin, status)
    }
}