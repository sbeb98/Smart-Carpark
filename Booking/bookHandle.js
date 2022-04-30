const {BookData} = require('../database/bookingData');

//function to create binary data point var
async function createBin(bookingData){

    let startHours = Number(bookingData.hourStartDropdown.toString().slice(0,2));
    let endHours = Number(bookingData.hourEndDropdown.toString().slice(0,2));
    let startMin = Number(bookingData.hourStartDropdown.toString().slice(2));
    let endMin = Number(bookingData.hourEndDropdown.toString().slice(2));

    let durationHours = endHours - startHours + (endMin - startMin)/60
    let noPoints = durationHours * 2 +1;
    let startPoint = (startHours - 8)*2 + startMin/30;


    let i;
    let bin=0b00000000000000000000000000000000; 
    
    //push into var, number of positive data points
    for(i=0; i<noPoints; ++i){
        bin = bin << 1;
        bin = bin + 1; 
    }

    //push all bits to the starting pos
    for(i=0; i<startPoint; ++i)
    {
       bin = bin<<1;
    }
    console.log('Start Point = ' + startPoint + ' NO Points = ' + noPoints + ' result= ' + bin);
    return {bin : bin, startHours: (startHours + startMin), endHours : (endHours + endMin)}
}
//function to add booking into database
function addBooking(day, startTime, endTime, binary){

    const bookDocco = new BookData(
        {
            Day: day, 
            TimeStart: startTime,
            TimeEnd: endTime,
            DataBinPoints: binary
        });

        console.log(bookDocco);

        return bookDocco;
}

function checkBookingAvailable (results){

    return new Promise( (resolve, reject) =>{
        let i, overlapCount =0;
        for (i=0; i< results[0].length ; ++i ){
            //console.log(results[0][i])
            let test = results[1].bin & results[0][i].DataBinPoints;
            if(test){
                ++overlapCount;
                if (overlapCount>=2){
                    reject();
                }
            }

        }
        resolve(results);

    })

    
    //res.send("Your Booking has been made")
    
}

//function to find timer length
function findTimerLength(doc){
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
            throw new Error('Incorrect Date Input')  //TODO:EDIT
    }

    let timerLength = doc.TimeStart- currentHours;
    let days; 

    if (now.getDay() === dayNum){
        
        //if booking is in a week, add the hours in 7 days - the time between now and the booking
        if(timerLength < 0)
            days = 7;
        else
            return timerLength;

        }
        //if later this week
        if (dayNum > now.getDay())
            days = dayNum- now.getDay();
        else 
            days = 7 - now.getDay() + dayNum; 
        
        timerLength = days*24 + timerLength;
        return timerLength;
                                    
}


module.exports = {createBin : createBin,
                    addBooking : addBooking,
                    checkBookingAvailable : checkBookingAvailable,
                    findTimerLength : findTimerLength};
