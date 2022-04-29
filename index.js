//declarations
var express = require('express');
var routes = require('./routes/parkRoute');
var mqtt = require('mqtt'); 
var mongoose = require('mongoose');
const {mqttInit} = require('./mqtt/mqtt_test');
const databaseFunctions = require('./database/parkData');
const PastDatabaseFunctions = require('./database/pastParkData');
const BookDatabase = require('./database/bookingData')
const pug = require('pug');
const bodyparser = require('body-parser');

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

//intialise databases create all spaces and fill with data. 
databaseFunctions.initParkDatabase(()=> {
    console.log('Database 1 Initialised!!')
}); 
PastDatabaseFunctions.initPastParkDatabase(() => {
    console.log('Database 2 Initialised!!')
});
BookDatabase.ClearDatabase(()=>{
    console.log('Database 3 Initialised!!')
})


//setup mqtt
mqttInit();

//use body Parser
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())

//send app access to routes.js
routes(app); 

//server setup
app.listen(PORT, () =>{
console.log(`Your server is running on port ${PORT}`)
});

