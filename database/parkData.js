var mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ParkSchema = new Schema ({
    SpaceNum:{
        type: String, 
        required: 'Enter a Space Number'
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

var ParkData = mongoose.model('Parkdb', ParkSchema);


const initDatabase = (callback) =>{

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
        //make document
        createDocument(name, occupied_input);
    }
}


//FUNCTION: creates a single database entry

function createDocument (name, occupied_input){
    const Parkdocco = new ParkData(
        {
            SpaceNum: name, 
            Occupied: occupied_input
        });

    Parkdocco.save(function (err) {
        if (err) 
            return handleError(err)
    });


}

//appends database entry to the current measurement
const appendPark =(SpaceName, occupied_input) =>{
    const query =  {SpaceNum: SpaceName};
    console.log("MQTT Message Recieved= " + distUpdate);
    let doc= ParkData.findOneAndUpdate(query, {Occupied: occupied_input }, {new: true}, function(err) {
        if (err) console.log("Error: MQTT update")
         });
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

const getAllPark = (req, res) =>{
    ParkData.find({}, (err, Park) =>{
       res.render('index', {Park});
    })
}

//send data to other files
const dataFunctions ={
    initDatabase: initDatabase, 
    appendPark : appendPark, 
    getPark : getPark,
    getAllPark : getAllPark
};

module.exports = dataFunctions; 

