const databaseFunctions = require('../database/parkData');
const PastDatabaseFunctions = require('../database/pastParkData');
const { BookData } = require('../database/bookingData');
const bookHandleFunc= require('../Booking/bookHandle');
const {mqttSend} = require('../mqtt/mqtt_test')


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

                    
//TODO: what if booking made within 15mins of current time
                    if (bookingData.hourStartDropdown >= bookingData.hourEndDropdown){
                        res.send("ERROR: Booking must end after it begins")
                    }
                        
                    else{

                    let query = {Day: bookingData.dayDropdown}
                    Promise.all([BookData.find(query).exec(), bookHandleFunc.createBin(bookingData)])
                        .then(results =>{
                           return bookHandleFunc.checkBookingAvailable(results);

                        })
                        .then(results =>{

                            res.send("Your Booking has been made")
                            const bookDocco = bookHandleFunc.addBooking(bookingData.dayDropdown, results[1].startHours,
                                results[1].endHours, results[1].bin)

                            return bookDocco.save();
                            
                        }, () => { handleError(res, 'No Booking Available')})
                        .then(doc => {
                            let timerLength = bookHandleFunc.findTimerLength(doc);
                            let dataToPass = {timerLength : timerLength, id : doc.id}
                            //Set timer for 15 mins before booking with callback (lock spot)
                            return delay(3000, dataToPass)  //(timerLength-0.25)*60*60*1000
                            
                        }, () => {handleError(res,'Booking Not Saved to Database')})  
                        .then(dataToPass => {
                            //function to check if space free TODO
                            //send command to rasp to raise bollard
                            console.log('timer 1 ended')
                            console.log('reach')
                            mqttSend(client, 'Raise');

                            return delay(4000, dataToPass.id) //(dataToPass.timerLength)*60*60*1000
                        })
                        .then(id =>{

                            console.log('timer 2 ended')
                            mqttSend(client, 'Lower');


                            let query = {_id : id};
                            return BookData.deleteOne(query).exec();
                       })
                       .then(()=>{
                           console.log('Booking Deleted');
                       })
                        
                        .catch(err =>{
                            console.log('promise ended')
                        })
                            

                    }

                    
                })
    }

function handleError(res, err){
    console.error(err)
    res.send(err)
    throw err;
}

function delay(milliseconds, dataToPass) {

    return new Promise(function(resolve) { 

        setTimeout(() =>{            
            return resolve(dataToPass)
        }, milliseconds)
    })
}

module.exports = routes; 