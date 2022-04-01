//declarations
var express = require('express');
var routes = require('./routes/parkRoute');
var mqtt = require('mqtt'); 
var mongoose = require('mongoose');
const mqttSubscribe = require('./mqtt/mqtt_test');
const databaseFunctions = require('./database/parkData');
const pug = require('pug');

//setup
const app = express();
const PORT = 4000;
app.set('view engine', 'pug');

//mongoose connection
mongoose.Promise =global.Promise;
mongoose.connect('mongodb://localhost/PARKdb', {
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

//check for successful connection 
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
 
db.once('open', function() {
    console.log(" MongoDb Connection Successful!");
});

//intialise database
databaseFunctions.initDatabase(()=> {
    console.log('Database Initialised!!')
}); //create all spaces and fill with data. 

//setup mqtt
var client  = mqtt.connect("mqtt://test.mosquitto.org",{clientId:"mqttjs01"});
console.log("MQTT connected flag  "+client.connected);
client.once("MQTT connect",function(){	
	console.log("MQTT connected  "+client.connected);
})

//mqtt subscribe       //link to a function in mqtt/database to put data in a database
mqttSubscribe(client);

//send app access to routes.js
routes(app); 

//server setup
app.listen(PORT, () =>{
console.log(`Your server is running on port ${PORT}`)
});

