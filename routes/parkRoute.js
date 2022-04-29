const databaseFunctions = require('../database/parkData');
const PastDatabaseFunctions = require('../database/pastParkData');
const { BookData } = require('../database/bookingData');
const bookHandleFunc= require('../Booking/bookHandle');
const {mqttSend} = require('../mqtt/mqtt_test')

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
                        .then(results => {
                            let i, overlapCount =0;
                            for (i=0; i< results[0].length ; ++i ){
                                //console.log(results[0][i])
                                let test = results[1].bin & results[0][i].DataBinPoints;
                                if(test){
                                    ++overlapCount;
                                    if (overlapCount>=10){
                                        throw new Error ('No Bookings Available');
                                    }
                                }

                            }
                            
                            res.send("Your Booking has been made")
                            console.log(results[1]);
                            return results[1]; 

                        })
                        .then(dataPassed => bookHandleFunc.addBooking(bookingData.dayDropdown, dataPassed.startHours,
                                dataPassed.endHours, dataPassed.bin))
                        .then(parkDocco => parkDocco.save(), () => { throw new Error('Booking Not Saved to Database')})
                        .then(doc => {
                            let now = new Date;
                            let currentHours = now.getHours() + now.getMinutes()/60;
                            let dayNum; 
                            switch(doc.Day){

                                case 'Monday':
                                    dayNum = 1; 
                                    break;

                                case 'Tuesday': 
                                    dayNum = 2;
                                    break; 

                                case 'Wednesday':
                                    dayNum = 3; 
                                    break;

                                case 'Thursday': 
                                    dayNum = 4;
                                    break;

                                case 'Friday': 
                                    dayNum = 5;
                                    break;

                                case 'Saturday':
                                    dayNum = 6;
                                    break;

                                case 'Sunday': 
                                    dayNum = 7; 
                                    break;
                                
                                default : 
                                    throw new Error('Incorrect Date Input')
                            }

                            let timerLength = doc.TimeStart- currentHours;
                            let days; 

                            if (now.getDay() === dayNum){
                                
                                //if booking is in a week, add the hours in 7 days - the time between now and the booking
                                if(timerLength < 0)
                                    days = 7;
                                else
                                    return {timerLength : timerLength, id : doc.id}
                                    
                            }
                            //if later this week
                            if (dayNum > now.getDay())
                                days = dayNum- now.getDay();
                            else 
                                days = 7 - now.getDay() + dayNum; 
                            
                            timerLength = days*24 + timerLength; 
                            console.log(days);
                            console.log(timerLength);

                            return {timerLength : timerLength, id : doc.id}
                            

                        })
                        .then(dataToPass => {

                            return delay((dataToPass.timerLength-0.25)*60*60*1000, dataToPass)
                            //Set timer for 15 mins before booking with callback (lock spot)
                        })  
                        .then(dataToPass => {

                            //function to check if space free TODO
                            //send command to rasp to raise bollard
                            mqttSend('Raise');

                            return delay((dataToPass.timerLength)*60*60*1000, dataToPass.id)
                        })
                        .then(id =>{
                            mqttSend('Lower');


                            let query = {_id : id};
                            return BookData.deleteOne(query).exec();

                        })

                        .catch((e) => {
                            console.error(e.message)
                            res.send(e.message)

                        })

                    }

                    
                })
    }

function delay(milliseconds, dataToPass) {
    return new Promise(function(resolve) { 
        setTimeout(resolve(dataToPass), milliseconds)
    });
    }


module.exports = routes; 