var request = require('request');
var credentials = require('./credentials');

// FARM CONFIG
var farmConfigInfo = [];

// CONNECTION REQUEST FUNCTION
var farmConfig = function(token) {

    // REQUEST CONTENT
    var json = {'farmId': credentials.farmId };

    var url = 'https://cityfarmers-api.herokuapp.com/farm/farm-config';
 // var url = 'http://192.168.1.102:5000/farmer/login';

    // REQUEST OPTIONS
    var options = {
        url: url,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        json: json
    };

    // FARM CONFIG REQUEST CALLBACK
    function farmConfigCallBack(err, res, body) {
        if(!err && res.statusCode == 200) {

            // RETURN FARM CONFIG
            return farmConfigInfo = res.body;

        } else {

            console.log('Retrying Farm Config...');
            setTimeout(() => {
                farmConfig(token);
            }, 30000);

        }
    }

    console.log('Requesting Farm Config...');
    request(options, farmConfigCallBack);

}

module.exports = {
    reqFarmConfig: function(token) {
        farmConfig(token);
    },
    getFarmConfig: function() {
        return farmConfigInfo;
    }
}