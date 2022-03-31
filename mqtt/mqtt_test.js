//in this file make a function to put the latest measurement in a database file. 
//then make a function to call on and send data

var mqtt = require('mqtt');
const databaseFunctions = require('../database/parkData');

//subscribe to mqtt topic, set 
const mqttSubscribe = (client) => {
    client.subscribe("starto/attempt");
    client.on('message', function(topic, message, packet){
        databaseFunctions.appendPark('Park001', Number(message));
    });
    
}

module.exports = mqttSubscribe;


