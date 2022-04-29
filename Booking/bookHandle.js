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

        return bookDocco;
}


//function to set async timers and make events to send commands to raspberry pi via mqtt
function setBookingTimers (client, bookData) {

}

module.exports = {createBin : createBin,
                    addBooking : addBooking};
