//in this file make a function to put the latest measurement in a database file. 
//then make a function to call on and send data

var mqtt = require('mqtt');
const { BookData } = require('../database/bookingData');
const ParkData = require('../database/parkData');
const databaseFunctions = require('../database/parkData');
const PastDatabaseFunctions = require('../database/pastParkData');

let timePastRecieved; 

//let interval = 5; 

//initialise mqtt  
function mqttInit (client) {
    //subscribe to topic
    client.subscribe("SACapstone/ParkData");
    client.subscribe("SACapstone/Booking/Ack");
    // client.publish("SACapstone/Booking", 'hello');
    client.on('message', function(topic, message, packet){

        //convert to string from hex object
        message = message + ' '
        console.log(message);
        if(topic === "SACapstone/ParkData")
            mqttPacketProcess(message);
        else if(topic === "SACapstone/Booking/Ack")
            mqttAckRecieve(message);
        else
            console.log('Message Topic not Found')
        
    });    
}


async function mqttPacketProcess(message){
    
        //get all current Park Data
    try{
        let Park = await databaseFunctions.ParkData.find().exec();  //TODO: MAKE THIS SYNCHRONOUS/AWAIT

        console.log(Park[0].SpaceNum);

        //use regex to seperate message into spotname + data
        let messageArray = message.split(" ");

        //determine interval from last packet
        let totalPastTime;
        let interval; 
        let timeRecieved = new Date;
        let newHourFlag = false;

        if (!timePastRecieved){   //if this is the first packet of data ignore percentage and set up for next packet
            timePastRecieved = new Date;
            totalPastTime= timePastRecieved.getMinutes() + timePastRecieved.getSeconds()/60;
            interval =0; 
        }
        else {
            totalPastTime= timePastRecieved.getMinutes() + timePastRecieved.getSeconds()/60;
            interval = (timeRecieved.getMinutes() + timeRecieved.getSeconds()/60)  - totalPastTime; 

            //console.log(interval)
        }
         //if a new hour entered
         if (interval <0) {
            interval*=-1; 

            newHourFlag = true; 
        }

        //loop through and store data into custom class
        let i;

        for (i=0;i<=19;++i){
            let name = messageArray[i].slice(0,7);//Park001 -6 cha
            let distance = messageArray[i].slice(8);//Park001-xxx
        

            //find correct parkSpot, makes new array of spacenames and finds the correct index
            let currentIndex = Park.map(function(e) {return e.SpaceNum}).indexOf(name);

            //calculate new percentage
            let pastTimeOccupied = totalPastTime*Park[currentIndex].Percentage/100;
            let newTimeOccupied;

            //Is this spot occupied for this interval or no
            let occupied_input;
            if (distance <= 15){
                occupied_input = true;
                newTimeOccupied = interval;
            }       
            else{
                occupied_input = false;
                newTimeOccupied =0; 
            }  

            let percentage_input= 100*(newTimeOccupied + pastTimeOccupied)/(interval + totalPastTime); 

            //amend current document
            databaseFunctions.appendPark(Park[currentIndex].SpaceNum, occupied_input, percentage_input);


            //update past database
        if(newHourFlag)
            PastDatabaseFunctions.appendPastDocument(Park[currentIndex].SpaceNum, percentage_input);
        
        }

        //update time of last packet recieved
        timePastRecieved =timeRecieved; 


    }catch(error){
        console.log(error)
    }

    
}

//function to process ack messages
async function mqttAckRecieve(message){

    //seperate message into id, park spot and command
    let messageArray = message.split(" ");
    let update = {Acknowledged : true}
    const test = await BookData.findByIdAndUpdate(messageArray[0], update, {new : true}).exec().catch(e =>{console.error('Not Changed to Ack')});
    console.log('Ack:' + test.Acknowledged);
}

//function to send commands to raspberry pi
function mqttSend (client, message){
    //"SACapstone/Booking"
    console.log("MQTT connected flag  "+client.connected);
    console.log('Sending ' + message)
    client.publish("SACapstone/Booking", message );
}

module.exports = {mqttInit: mqttInit, mqttSend : mqttSend};


