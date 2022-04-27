//function to create binary data point var
async function createBin(bookingData){

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
        bin | 1; 
    }

    //push all bits to the starting pos
    for(i=0; i<startPoint; ++i)
    {
        bin<<1;
    }

    return bin;
}


//function to set async timers and make events to send commands to raspberry pi via mqtt
function setBookingTimers (client, bookData) {

}

module.exports = {createBin : createBin};
