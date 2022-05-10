var mongoose = require('mongoose');
var PastParkData = require('./newPastParkDataModel');

//FUNCTION: function to call other intialisation functions
function initPastParkDatabase (){
    return new Promise(async(Resolve, Reject)=>{

        try{
            //clear database
            await PastParkData.deleteMany({});
            //fill database with random data
            const pArray = createPastParkDatabase(2);
            await Promise.all(pArray.map(p => p.save()));
            console.log('Database 2 Initialised!!')
            Resolve();

        } catch (err){
            console.error('Database 2 could not be initalised :(')
        }
    })
        
    
}

function createPastParkDatabase(weeks){
    let i=0;
    let pArray= [""];
    //pass day, week and hour to next function
    //use 3 nested loops to pass the correct var for each one
    let weekCount;
    for (weekCount=1; weekCount<=weeks; ++weekCount){ //weeks loop
        let dayCount;
        for (dayCount=0; dayCount<7; ++dayCount){ //days loop
            let hourCount;
            for(hourCount=1;hourCount<=24; ++hourCount){//hours loop
                pArray[i]=createPastParkDocument(weekCount, dayCount, hourCount);
                ++i;
            }

        }

    }
    //return to create array of promises 
   
    return pArray;
}
//FUNCTION: creates a single database entry in past database

function createPastParkDocument (week, day, hour){
    

    //enter passed data
    let Parkdocco = new PastParkData(
        {
            Week: week,
            Day: day,
            Hour: hour 
        });
        //generate random data for every carspace
        let spotCount; 
        //loop for number of car spots (20)
        for (spotCount=1; spotCount<=20; ++spotCount){

                
                Parkdocco['Park0' + String(spotCount).padStart(2,'0')] = Math.floor(Math.random()*100);
            }
        
    return Parkdocco;
        
}




async function appendPastDocument(nameArray, week, day, hour, newPercentageArray){

    const query =  {Week: week, Day: day, Hour: hour};
    try{

        //find this database entry to append
        let PastPark = await PastParkData.findOne(query).exec().catch(e=>{throw new Error('PastParkData could not be found')})

        let spotCount; 
        //loop for number of car spots (20)
        for (spotCount=0; spotCount<20; ++spotCount){

                //insert new percentage
                PastPark[nameArray[spotCount]] = newPercentageArray[spotCount];
            }
            //console.log(PastPark);
        await PastPark.save();

    } catch(err){
        console.error('Error appending Past Park Database')
        console.error(err);
    }
}

const PastDatabaseFunctions= {
    initPastParkDatabase: initPastParkDatabase,
    appendPastDocument : appendPastDocument,
    PastParkData : PastParkData
};

module.exports = PastDatabaseFunctions;