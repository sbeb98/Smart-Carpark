var mongoose = require('mongoose');
var PastParkData = require('./pastParkDataModel');

//FUNCTION: function to call other intialisation functions
async function initPastParkDatabase (){

    await ClearDatabase();
    await createTrendDatabase(20);
    console.log('Database 2 Initialised!!')
}
//FUNCTION: removes all enteries from current database, 
async function ClearDatabase() {
    try{
        await PastParkData.deleteMany({})
    }
    catch(err){
        throw new Error('Database not deleted');
    }
}

function createTrendDatabase(numSpots){

    let i; 

    for(i=1;i<=numSpots;i++)
    {
        //Choose the name in the form 'Park001'
        let name = 'Park0' + String(i).padStart(2,'0');
        createPastParkDocument(name); 
    }
}
//FUNCTION: creates a single database entry in past database

async function createPastParkDocument (name){

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
    
        await Parkdocco.save();

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