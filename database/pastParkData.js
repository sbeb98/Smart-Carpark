var mongoose = require('mongoose');
var PastParkData = require('./pastParkDataModel');

//FUNCTION: function to call other intialisation functions
async function initPastParkDatabase (){
    try{
        //clear database
        await PastParkData.deleteMany({});
        //fill database with random data
        const pArray = await createTrendDatabase(20);
        await Promise.all(pArray.map(p => p.save()));
        console.log('Database 2 Initialised!!')

    } catch (err){
        console.error('Database 2 could not be initalised :(')
    }
    
}

function createTrendDatabase(numSpots){

    let i; 
    let pArray= [""];

    for(i=1;i<=numSpots;i++)
    {
        //Choose the name in the form 'Park001'
        let name = 'Park0' + String(i).padStart(2,'0');
        pArray[i-1]= createPastParkDocument(name); 
    }
    return pArray;
}
//FUNCTION: creates a single database entry in past database

function createPastParkDocument (name){

    try{

        let Parkdocco = new PastParkData(
            {
                SpotNum: name, 
            });
    
            let daysCount, hoursCount;
            //loop for number of days (14)
            for (daysCount=1; daysCount<=14; ++daysCount){
    
                //loop for every hour(24)
                for(hoursCount=1; hoursCount<=24; ++hoursCount){
    
                    Parkdocco['Day' + daysCount + 'Hour' + hoursCount] = Math.floor(Math.random()*100);
                }
            }

        return Parkdocco;

    }
    catch (err){
        throw new Error('Document not Saved')
    }

        
}

const getAllPastPark = (req, res) =>{
    let query = PastParkData.find({});
    return query;
}



function appendPastDocument(Spotname, newPercentage){

    const query =  {SpotNum: Spotname};
    PastParkData.findOne(query).exec()
    .then(PastPark =>{
        //trendPark[dataNum][dayHourStr];

        let dayIndex, hourIndex;

        for(dayIndex= 14; dayIndex>0; --dayIndex){

            for(hourIndex =23; hourIndex>0; --hourIndex){

                let dayHourStr= 'Day'+ String(dayIndex) + 'Hour' + String(hourIndex + 1);
                let newdayHourStr= 'Day'+ String(dayIndex) + 'Hour' + String(hourIndex);

                PastPark[dayHourStr] = PastPark[newdayHourStr];
            }

        }

        PastPark.Day1Hour1 = newPercentage; 

        return PastPark;
    })
    .then(PastPark =>{
        PastPark.save();
    })
    .catch((err)=>{
        console.error(err);
    })
}

const PastDatabaseFunctions= {
    initPastParkDatabase: initPastParkDatabase, 
    getAllPastPark : getAllPastPark,
    appendPastDocument : appendPastDocument,
    PastParkData : PastParkData
};

module.exports = PastDatabaseFunctions;