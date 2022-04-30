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
    }
    

});

let BookData = mongoose.model('BookCol', BookSchema);

function ClearDatabase(callback) {
    BookData.deleteMany({}, function(err){
        if (err)
            throw err;
    });

    callback(); 
}

module.exports = {BookData : BookData, 
                ClearDatabase : ClearDatabase}



