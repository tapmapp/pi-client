var credentials = require('./credentials');

// FARM CONFIG
var farmConfig = {};

// CONNECTION REQUEST FUNCTION
var farmConfig = function(farmConfigCallBack) {

    // REQUEST CONTENT
    var json = { 'farmId': credentials.farmId };

    var url = 'https://cityfarmers-api.herokuapp.com/farm/farm-config';
    // var url2 = 'http://192.168.1.102:5000/farmer/login';

    // REQUEST OPTIONS
    var options = {
        url: url,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        json: json
    };

    console.log('Requesting Farm Config...');
    request(options, farmConfigCallBack);

}

// FARM CONFIG REQUEST CALLBACK
var farmConfigCallBack = function(err, res, body) {
    if(!err && res.statusCode == 200) {

        // RETURN FARM CONFIG
        return farmConfig = res.body;

    } else {

        console.log('Retrying Farm Config...');
        setTimeout(function() {
            farmConfig(farmConfigCallBack);
        }, 30000);

    }
}

module.exports = {
    reqFarmConfig: function() {
        farmConfig(farmConfigCallBack);
    }, 
    getFarmConfig: function() {
        return farmConfig;
    }
}