const { ParkData } = require('../database/parkData');
const { PastParkData } = require('../database/pastParkData');
const { BookData } = require('../database/bookingData');
const bookHandleFunc= require('../Booking/bookHandle');
const {mqttSend} = require('../mqtt/mqtt_test');
const { TrendParkData } = require('../database/trendDatabase');
//constant to use:

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



//for future declarations 

const routes = (app, client) =>{ 
    app.route('/')
        .get(async(req, res)=>{
            try{
                //find all data to display                
                const Park = await ParkData.find();
                //display data
                res.render('index', {Park});

                //if error
            }catch (err){
                console.error(err)
                res.send('Park Spots could not be loaded. Please Try Again.')
            }
        })


    app.route('/trend')
        .get(async(req,res)=>{
            try{
                //get defualt data to display
               const query= {Day: 'Monday', Hour: 12}
               const trendPark= await TrendParkData.findOne(query);
               //display data
                res.render('trend', {trendPark});

            }catch (err){
            console.error(err)
            }
        })
        .post(async(req,res)=>{
            const trendTime = req.body;
            console.log(trendTime) 
            const query = {Day: trendTime.dayDropdown, Hour: trendTime.hourDropdown.substring(4)}
            console.log(query);
            const trendPark= await TrendParkData.findOne(query);
            //display data
            res.render('trend', {trendPark});

        })
    
    app.route('/book')
        .get((req, res)=>{
            //time object already created
            res.render('book',{time})
        })
        .post(async(req, res)=>{

            let bookingData = req.body;
            console.log('hello');

            try{

                                    
                //TODO: what if booking made withithin 15mins of current time``

                if (bookingData.hourStartDropdown >= bookingData.hourEndDropdown){
                    throw new Error("ERROR: Booking must end after it begins")
                }
                
                
        
                //fetch other booking data and determine if space is available
                let query = {Day: bookingData.dayDropdown}
                const results= await Promise.all([BookData.find(query).exec(), bookHandleFunc.createBin(bookingData)])
               
                await bookHandleFunc.checkBookingAvailable(results);
                //if available send success message
                res.send("Your Booking has been made");

                console.log('Creating booking')
                //create booking and store in database
                let bookDocco = await bookHandleFunc.addBooking(bookingData.dayDropdown, results[1].startHours,
                                results[1].endHours, results[1].bin)
                bookDocco.save().catch(e => { throw new Error('Booking Not Saved to Database')});
                        
                //find timer length
                let timerLength = bookHandleFunc.findTimerLength(bookDocco)
                
                //Set timer for 15 mins before booking with callback (lock spot)        
                await delay(3000)  //(timerLength-0.25)*60*60*1000
                console.log('timer 1 ended')

                //wait for next update from field
                //await waitForNextUpdate();
                //ideally instead of this the mcu connected to the motor
                //is the same as the sensor mcu. This could check if space is free
                //before implementation and stop implementation

                //check if a space is free
                let docDetails = await checkForSpace(bookDocco);

                //send command to rasp to raise bollard
                mqttSend(client, docDetails.id + ' ' +  docDetails.name + ' Raise');
                //wait 20 seconds and check if a reply came
                await delay(20000);
                //check if reply was placed in database for this parking spot (update bookDocco)
                bookDocco = await BookData.findById(docDetails.id);
                while (!bookDocco.Acknowledged)
                {
                    //if space still free, resend message
                    query = {SpaceNum : docDetails.name}
                    let parkDoc = await ParkData.findOne(query);

                    //if space not free change entry from booked and find new space
                    if(!parkDoc.Occupied){
                        parkDoc.Booked = false;
                        await parkDoc.save();

                        //await waitForNextUpdate();
                        docDetails = await checkForSpace(bookDocco);
                    }
                    //resend message with new (or old data)
                     mqttSend(client, docDetails.id + ' ' +  docDetails.name+ ' Raise');
                    //wait 20 seconds 
                     await delay(5000);
                     //check to exit
                     bookDocco = await BookData.findById(docDetails.id);

                }

                //wait 15 minutes and reset ackflag
                bookDocco.Acknowledged= false;
                await Promise.all([delay(10000)], bookDocco.save()) //15mins, 
                
                //when timer finished, send LOWER command to rapb
                console.log('timer 2 ended')
                mqttSend(client, docDetails.id + ' ' +  docDetails.name+ ' Lower');

                //wait 20 seconds
                await delay(5000);
                //check if ack recieved
                bookDocco = await BookData.findById(docDetails.id);
                while (!bookDocco.Acknowledged){
                    //resend message
                    mqttSend(client, docDetails.id + ' ' +  docDetails.name+ ' Lower');
                    //wait 20 seconds 
                     await delay(20000);
                     //check to exit
                     bookDocco = await BookData.findById(docDetails.id);
                }

                //change booked status
                query = {SpaceNum : bookDocco.SpaceNum};
                let update = {Booked: false} ;
                await ParkData.findOneAndUpdate(query,update, {new : true}).exec();
                //delete booking from database
                query = {_id : bookDocco.id};
                await BookData.deleteOne(query).exec().catch((e) => { throw new Error('Booking not deleted from database')});;
                console.log('Booking Deleted')


            } catch(err){
                console.error(err.message)
                res.send(err.message)
            }

                        
    
                
        })


}
function checkForSpace(bookDocco){
    return new Promise(async(Resolve, Reject) => {

        query = {Occupied : false, Booked : false};
        let update = {Booked : true}
        //TODO what if no spaces are free
        //set park to booked status-- assume that no other thread can access this database once found
        let parkFound = await ParkData.findOneAndUpdate(query,update, {new : true}).exec().catch(e =>{throw new Error('No Free Spots Found')});

        //update Booking database so it includes the correct database
        bookDocco.SpaceNum =parkFound.SpaceNum;
        bookDocco.save();

        Resolve({id : bookDocco._id, name : bookDocco.SpaceNum });

    })
} 
               

function handleError(res, err){
    console.error(err)
    res.send(err)
    throw err;
}

function delay(milliseconds) {

    return new Promise(function(resolve) { 

        setTimeout(() =>{            
            return resolve()
        }, milliseconds)
    })
}

module.exports = routes; 