var mongoose = require('mongoose');
var PastParkData = require('./pastParkDataModel');

//FUNCTION: function to call other intialisation functions
const initPastParkDatabase = (callback) =>{

    ClearDatabase();
    createTrendDatabase(20);
    callback();       
}

//FUNCTION: removes all enteries from current database, 
function ClearDatabase() {
    PastParkData.deleteMany({}, function(err){
        if (err)
            throw err;
    });
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

function createPastParkDocument (name){

    //let randomValue = 

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

    Parkdocco.save(function (err) {
        if (err) 
            return handleError(err)
    });    
}

const getAllPastPark = (req, res) =>{
    PastParkData.find({}, (err, trendPark) =>{
       res.render('trend', {trendPark});
    })
}


const PastDatabaseFunctions= {
    initPastParkDatabase: initPastParkDatabase, 
    getAllPastPark : getAllPastPark
};

module.exports = PastDatabaseFunctions;