const databaseFunctions = require('../database/parkData');
const PastDatabaseFunctions = require('../database/pastParkData');
const { BookData } = require('../database/bookingData');
const bookHandleFunc= require('../Booking/bookHandle');

//for future declarations 

const routes = (app, client) =>{ 
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
    
    app.route('/book')
                .get((req, res)=>{
                
                    let time = [""];
                    let i;
                    for(i=0;i<32; ++i){

                        let str = String(Math.trunc((i+16)/2)).padStart(2,'0');

                        if(i%2){
                            time[i]= str + '30';
                        }
                        else {
                            time[i]= str + '00' 
                        }

                    }
                    res.render('book',{time})
                })
                .post((req, res)=>{

                    let bookingData = req.body;
                    console.log(bookingData);

                    

                    if (bookingData.hourStartDropdown >= bookingData.hourEndDropdown){
                        res.send("ERROR: Booking must end after it begins")
                    }
                        
                    else{

                    let query = {Day: bookingData.dayDropdown}
                    Promise.all([BookData.find(query).exec(), bookHandleFunc.createBin(bookingData)])
                        .then(results => {
                            let i, overlapCount =0;
                            for (i=0; i< results[0].length ; ++i ){
                                let test = results[1] | results[0][i].dataBinPoints;
                                if(test){
                                    ++overlapCount;
                                    if (overlapCount>=10){
                                        throw new Error ('No Bookings Available');
                                    }
                                }

                            }
                            
                            res.send("Your Booking has been made")

                        })
                        .then() //store data in database and process async timer for mqtt
                        .catch((e) => {
                            if (e === 'No Bookings Available')
                                res.send('No Bookings Available')
                            else{
                                res.send ('Unknown Booking Error')
                                console.error('Unknown Booking Error')
                            }

                        })

                    }

                    
                })
    }


module.exports = routes; 