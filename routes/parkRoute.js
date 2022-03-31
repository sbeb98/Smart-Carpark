const databaseFunctions = require('../database/parkData');

//for future declarations 

const routes = (app) =>{ 
    app.route('/')
        .get((req, res)=>{
            databaseFunctions.getAllPark(req, res);  //here reference a function from a database/mqtt file that retrieves data and displays
            });

//insert other operations at this address



}

module.exports = routes; 