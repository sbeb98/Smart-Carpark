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
        for (dayCount=1; dayCount<=7; ++dayCount){ //days loop
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




async function appendPastDocument(Spotname, newPercentage){

    const query =  {SpotNum: Spotname};
    try{

        //find this database entry to append
        let PastPark = await PastParkData.findOne(query).exec().catch(e=>{throw new Error('PastParkData could not be found')})

        let dayIndex, hourIndex;

        //loop through each day/hour and shift each entry up 
        //note there is no day/hour 0
        for(dayIndex= 14; dayIndex>0; --dayIndex){

            


            for(hourIndex =23; hourIndex>0; --hourIndex){

                let dayHourStr= 'Day'+ String(dayIndex) + 'Hour' + String(hourIndex + 1);
                let newdayHourStr= 'Day'+ String(dayIndex) + 'Hour' + String(hourIndex);

                PastPark[dayHourStr] = PastPark[newdayHourStr];
                //day14H1: 14H2 = 14H1
                //day13H24: 14H1 = 13H24 ---below
                //day13H23: 13H24 = 13H23
                
            }

            if (dayIndex !== 1){
                
            let dayHourStr= 'Day'+ String(dayIndex) + 'Hour' + String(1);
            let newdayHourStr= 'Day'+ String(dayIndex-1) + 'Hour' + String(24);

            PastPark[dayHourStr] = PastPark[newdayHourStr];

            }

        }

        PastPark.Day1Hour1 = newPercentage; 

        PastPark.save();

    } catch(err){
        console.error(err);
    }
}

const PastDatabaseFunctions= {
    initPastParkDatabase: initPastParkDatabase,
    appendPastDocument : appendPastDocument,
    PastParkData : PastParkData
};

module.exports = PastDatabaseFunctions;