const databaseFunctions = require('../database/parkData');
const PastDatabaseFunctions = require('../database/pastParkData');

//for future declarations 

const routes = (app) =>{ 
    app.route('/')
        .get((req, res)=>{
            databaseFunctions.ParkData.find()
            .then(Park =>{
                res.render('index', {Park})
            })
            .catch(e =>{
                console.error(e);
            })
        })
            

//insert other operations at this address


app.route('/trend')
            .get((req,res)=>{
                PastDatabaseFunctions.PastParkData.find()
                .then(trendPark =>{
                    res.render('trend', {trendPark})
                })
                .catch((err)=>{
                console.error(err)
            })
                })
 }

module.exports = routes; 