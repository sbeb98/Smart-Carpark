const databaseFunctions = require('../database/parkData');
const PastDatabaseFunctions = require('../database/pastParkData');
const { BookData } = require('../database/bookingData');

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
                    BookData.find(query);
                    let startStringHours = Number(toString(bookingData.hourStartDropdown).slice(0,2));
                    let endStringHours = Number(toString(bookingData.hourEndDropdown).slice(0,2));
                    let startStringMin = Number(toString(bookingData.hourStartDropdown).slice(2));
                    let endStringMin = Number(toString(bookingData.hourEndDropdown).slice(2));

                    let durationHours = endStringHours - startStringHours + (endStringMin - startStringMin)/60
                    let noPoints = durationHours * 2;
                    let startPoint = (startStringHours - 8) + startStringMin/30;

                    let i;
                    let bin=0b00000000000000000000000000000000; 
                    
                    //push into var, number of positive data points
                    for(i=0; i<noPoints; ++i){
                        bin << 1;
                        bin + 1; 
                    }

                    //push all bits to the starting pos
                    for(i=0; i<startPoint; ++i)
                    {
                        bin<<1;
                    }



                    res.send("Your Booking has been made")

                    }

                    
                })
    }


module.exports = routes; 