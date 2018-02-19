var sensorLib = require("node-dht-sensor");
var GPIO = require('rpi-gpio');
var request = require('request');
var farmConfig = require('./farm-config');

// TEMP / HUMIDITY PIN CONFIG
var sensor = {
    name: "Temp/Hum",
    type: 11,
    pin: 4
};

// TEMP HUM VALUE
var tempHumVal = [];

// COUNTER
var i = 0;

// SENSOR TIMER
var piTimer;

// CHECK PI CONFIG
var checkPiConfig = function() {

    var actualFarmConfig = farmConfig.getFarmConfig();

    // CHECK LIGHTING CONFIG
    checkLightingConfig(actualFarmConfig);

    // CHECK TEMP CONFIG
    checkTempConfig(actualFarmConfig);

    piTimer = setTimeout(function(){
        checkPiConfig();
    }, 1000);

}

// CHECK TEMP CONFIG
var checkTempConfig = function(actualFarmConfig) {

    let tempHumActual = sensorLib.read(sensor.type, sensor.pin);
    tempHumVal.push([tempHumActual.temperature, tempHumActual.humidity]);

    // CHECK TEMP CONFIG
    if(actualFarmConfig.length > 0) {

        if(tempHumActual.temperature > actualFarmConfig[0].temperatureVent) {

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

// CHECK LIGHTING CONFIG
var checkLightingConfig = function(actualFarmConfig) {

    // CHECK TEMP CONFIG
    if(actualFarmConfig.length > 0) {

        let date = new Date();
        let hours = date.getHours() + 1;
        let minutes = date.getMinutes();

        let timeOn = actualFarmConfig[0].lightingOn.split(':');
        let timeOff = actualFarmConfig[0].lightingOff.split(':');
        
        let lightingOnHours = parseInt(timeOn[0]);
        let lightingOnMins = parseInt(timeOn[1]);

        let lightingOffHours = parseInt(timeOff[0]);
        let lightingOffMins = parseInt(timeOff[1]);

        if(lightingOnHours < lightingOffHours) {

            if(hours >= lightingOnHours && hours < lightingOffHours) {
                if(hours > lightingOnHours) {
                    
                    console.log('ON');

                    // TURN LIGHT ON
                    GPIO.read(13, function(err, value) {
                        if(value !== true) {
                            pinState(13, true);
                        }
                    });

                } else {

                    if(minutes >= lightingOnMins) {

                        console.log('ON');

                        // TURN LIGHT ON
                        GPIO.read(13, function(err, value) {
                            if(value !== true) {
                                pinState(13, true);
                            }
                        });

                    } else {
                        
                        console.log('OFF');

                        // TURN LIGHT OFF
                        GPIO.read(13, function(err, value) {
                            if(value !== false) {
                                pinState(13, false);
                            }
                        });

                    }

                }
            } else {

                if(hours == lightingOffHours && minutes < lightingOffMins) {

                    console.log('ON');

                    // TURN LIGHT ON
                    GPIO.read(13, function(err, value) {
                        if(value !== true) {
                            pinState(13, true);
                        }
                    });

                } else {
                
                    console.log('OFF');

                    // TURN LIGHT OFF
                    GPIO.read(13, function(err, value) {
                        if(value !== false) {
                            pinState(13, false);
                        }
                    });

                }

            }

        } else {

            if(hours >= lightingOffHours && hours < lightingOnHours) {
                if(hours > lightingOffHours) {
                    
                    console.log('OFF');

                    // TURN LIGHT OFF
                    GPIO.read(13, function(err, value) {
                        if(value !== false) {
                            pinState(13, false);
                        }
                    });

                } else {

                    if(minutes >= lightingOffMins) {
                        
                        console.log('OFF');

                        // TURN LIGHT OFF
                        GPIO.read(13, function(err, value) {
                            if(value !== false) {
                                pinState(13, false);
                            }
                        });

                    } else {
                        
                        console.log('ON');

                        // TURN LIGHT ON
                        GPIO.read(13, function(err, value) {
                            if(value !== true) {
                                pinState(13, true);
                            }
                        });

                    }

                }
            } else {

                if(hours == lightingOnHours && minutes < lightingOnMins) {

                    console.log('OFF');

                    // TURN LIGHT OFF
                    GPIO.read(13, function(err, value) {
                        if(value !== false) {
                            pinState(13, false);
                        }
                    });

                } else {
                    
                    console.log('ON');

                    // TURN LIGHT ON
                    GPIO.read(13, function(err, value) {
                        if(value !== true) {
                            pinState(13, true);
                        }
                    });

                }
            }
        }
    }
}

// SENSOR TIMER
var timer;

// READ SENSOR FUNCTION
var sendData = function(token, farmerId, farmId) {

    console.log(i);

    if(i == 4) {

        let temp = 0;
        let hum = 0;

        for(let i = 0; i < tempHumVal.length; i++) {
            temp += tempHumVal[i][0];
            hum += tempHumVal[i][1];
        }

        temp = (temp / tempHumVal.length).toFixed(1);
        hum = (hum / tempHumVal.length).toFixed(1);

        var json = { farmerId: farmerId, farmId: farmId, temperature: temp, humidity: hum };

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

        // SEND REQUEST
        request(options, requestCallBack);
        
        tempHumVal.length = 0;
        i = 0;

    } else {
        
        i++;
    }

    timer = setTimeout(function() {
        sendData(token, farmerId, farmId);
    }, 1000);

}

// CHANGE PIN STATUS
var pinState = function(pin, status) {

    GPIO.write(pin, status, function(err) {
        if (err) throw err;
        console.log('Written to pin');
    });

}

// LIGHTING PIN CONFIG
GPIO.setup(13, GPIO.DIR_OUT, pinState.bind(this, 13, false));

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