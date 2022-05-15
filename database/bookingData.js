var mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BookSchema = new Schema ({
    Day:{
        type: String, 
    },
    TimeStart:{
        type: Number 
        
    },
    TimeEnd:{
        type: Number
    },
    DataBinPoints:{
        type: Number
    }, 
    SpaceNum :{
        type: String
    },
    Acknowledged :{
        type: Boolean
    }
    

});

let BookData = mongoose.model('BookCol', BookSchema);

async function ClearDatabase() {
    
    try {
        await BookData.deleteMany({});

        console.log('Database 3 Initialised!!'); 
    }
    catch (err){
        throw new Error('Booking Database not Cleared')
    }
    
}

module.exports = {BookData : BookData, 
                ClearBookDatabase : ClearDatabase}



