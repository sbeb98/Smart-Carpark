var mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ParkSchema = new Schema ({
    SpaceNum:{
        type: String, 
    },
    Occupied:{
        type: Boolean, 
        
    },
    Percentage:{
        type: Number,
    },
    created_date:{
        type: Date, 
    default: Date.now
    }

});

let ParkData = mongoose.model('ParkCol', ParkSchema);

//FUNCTION: function to call other intialisation functions
const initParkDatabase = (callback) =>{

    ClearDatabase();
    createRealTimeDatabase(20);
    callback();       
}

//FUNCTION: removes all enteries from current database, 
function ClearDatabase() {
    ParkData.deleteMany({}, function(err){
        if (err)
            throw err;
    });
}

//FUNCTION: creates entries for all 20 carspots in the carpark
function createRealTimeDatabase (numOfDocs){
    let i; 

    for(i=1;i<=numOfDocs;i++)
    {
        //Choose the name in the form 'Park001'
        let name = 'Park0' + String(i).padStart(2,'0');
        //find random Bool value
        let occupied_input= Math.random() < 0.5;
        //choose random percentage to start
        let percentage_input = Math.floor(Math.random()*100);
        //make document
        createParkDocument(name, occupied_input, percentage_input);
    }
}


//FUNCTION: creates a single database entry in real time database

function createParkDocument (name, occupied_input, percentage_input){
    const Parkdocco = new ParkData(
        {
            SpaceNum: name, 
            Occupied: occupied_input,
            Percentage: percentage_input
        });

    Parkdocco.save(function (err) {
        if (err) 
            return handleError(err)
    });


}


//appends database entry to the current measurement
const appendPark =(SpaceName, occupied_input, percentage_input) =>{
    const query =  {SpaceNum: SpaceName};
    ParkData.findOneAndUpdate(query, {Occupied: occupied_input , Percentage: percentage_input}, {new: true})
    .catch((err)=> {
        if (err) console.error(err);
         })
}

//gathers and returns distance data from selected database entry and sends result
const getPark = (SpaceName, req, res) =>{
    const query =  {SpaceNum: SpaceName};
    ParkData.findOne(query, (err, Park)=> {
        if(err){
            res.send(err)
        }
        console.log(Park.Distance);
        res.send("Current Distance From Sensor is " + Park.Distance +  " cm"); 
    })
}

const getAllPark = async() =>{
    let query = ParkData.find({});
    return query;
}

//send data to other files
const dataFunctions ={
    initParkDatabase: initParkDatabase, 
    appendPark : appendPark, 
    getPark : getPark,
    getAllPark : getAllPark,
    ParkData: ParkData
};

module.exports = dataFunctions; 


