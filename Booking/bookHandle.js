const {BookData} = require('../database/bookingData');

//function to create binary data point var
async function createBin(bookingData){

    let startStringHours = Number(bookingData.hourStartDropdown.toString().slice(0,2));
    let endStringHours = Number(bookingData.hourEndDropdown.toString().slice(0,2));
    let startStringMin = Number(bookingData.hourStartDropdown.toString().slice(2));
    let endStringMin = Number(bookingData.hourEndDropdown.toString().slice(2));

    let durationHours = endStringHours - startStringHours + (endStringMin - startStringMin)/60
    let noPoints = durationHours * 2 +1;
    let startPoint = (startStringHours - 8)*2 + startStringMin/30;


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
    return bin;
}
//function to add booking into database
async function addBooking(day, startTime, endTime, binary){
    const bookDocco = new BookData(
        {
            Day: day, 
            TimeStart: startTime,
            TimeEnd: endTime,
            dataBinPoints: binary
        });

    await bookDocco.save(function (err) {
        if (err) 
            return handleError(err)
    });
}


//function to set async timers and make events to send commands to raspberry pi via mqtt
function setBookingTimers (client, bookData) {

}

module.exports = {createBin : createBin,
                    addBooking : addBooking};
