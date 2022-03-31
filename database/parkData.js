var mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ParkSchema = new Schema ({
    SpaceNum:{
        type: String, 
        required: 'Enter a Space Number'
    },
    Distance:{
        type: Number, 
        
    },
    created_date:{
        type: Date, 
    default: Date.now
    }

});

var ParkData = mongoose.model('Parkdb', ParkSchema);

//creates the database entry that will be edited in this initial program
const createFirstEntry = () =>{
    const Park001 = new ParkData(
        {
            SpaceNum: 'Park001', 
            Distance: 0
        });
  Park001.save(function (err) {
        if (err) 
            return handleError(err)
    });
} 

//appends database entry to the current measurement
const appendPark =(SpaceName, distUpdate) =>{
    const query =  {SpaceNum: SpaceName};
    console.log("MQTT Message Recieved= " + distUpdate);
    let doc= ParkData.findOneAndUpdate(query, {Distance: distUpdate }, {new: true}, function(err) {
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
        //res.json(Park);
        console.log(Park[0].SpaceNum);
        console.log(Park[0].Distance);
       // let parkArray = JSON.parse(Park);
       res.render('index', {Park});
    })
}

//send data to other files
const dataFunctions ={
    createFirstEntry: createFirstEntry, 
    appendPark : appendPark, 
    getPark : getPark,
    getAllPark : getAllPark
};

module.exports = dataFunctions; 

