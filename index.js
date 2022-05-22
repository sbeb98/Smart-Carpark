//declarations
const express = require('express');
const routes = require('./routes/parkRoute');
const mqtt = require('mqtt'); 
const mongoose = require('mongoose');
const {mqttInit} = require('./mqtt/mqtt_mod');
const {initParkDatabase} = require('./database/parkData');
const {initPastParkDatabase} = require('./database/pastParkData');
const {ClearBookDatabase} = require('./database/bookingData')
const bodyparser = require('body-parser');
const pug =require('pug');
const { initialiseTrendDatabase } = require('./database/trendDatabase');


//setup
const app = express();
const PORT = 4000;
app.set('view engine', 'pug');

//use body Parser
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())


const init = async () =>{
    try {

    //connect to Mongoose
    //setup mqtt and pass client object to parkRoutes file
    await Promise.all([connectToMongoose()], [mqttSetup()])
    //initalise databases
    await Promise.all([initParkDatabase()], [initPastParkDatabase()], [ClearBookDatabase()])
    //THEN: average data into trend database
    await initialiseTrendDatabase();
    //THEN: start server
    //server setup
    await app.listen(PORT);

          //if success:
    console.log(`Your server is running on port ${PORT}`)


  

        
    } catch (err) {
        console.error(err.message)
        
    }
    
}

const connectToMongoose = async () => {

    try{
        mongoose.Promise =global.Promise;

        await mongoose.connect('mongodb+srv://sbeb:568Wy714GQbzX0f3@db-mongodb-sgp1-01087-parkdb-475842c7.mongo.ondigitalocean.com/Parkdb?tls=true&authSource=admin&replicaSet=db-mongodb-sgp1-01087-parkdb&tlsCAFile=ca-certificate.crt', {
            useNewUrlParser: true, 
            useUnifiedTopology: true,
        });

        //if successful
        console.log('Successfully Connected to Mongoose!!')
        
        //make error event for disconnection
        mongoose.connection.on('error', err => {
            console.error(err);
          });

        //await initDatabases();
        
    }
    catch (err){
        console.error(err);
        throw new Error('Unable to Connect to Mongoose')
    }

}

const mqttSetup = async() =>{

    try{
        //mqtt client
        const client  = await mqtt.connect("mqtt://test.mosquitto.org",{clientId:"mqttjs02"});
        //if successful
        console.log('Connected to MQTT Broker')

        mqttInit(client);
        //send app access to routes.js
        routes(app, client); 
    }
    catch (err){
        throw new Error('Failed to Connect to MQTT Broker')
    }
    
}

init();

