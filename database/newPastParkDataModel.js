var mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PastParkSchema = new Schema({

    Day:{
        type: Number,
    },
    Week:{
        type: Number,
    },
    Hour:{
        type: Number,
    },
    Park001:{
        type: Number
    },
    Park002:{
        type: Number
    },
    Park003:{
        type: Number
    },
    Park004:{
        type: Number
    },
    Park005:{
        type: Number
    },
    Park006:{
        type: Number
    },
    Park007:{
        type: Number
    },
    Park008:{
        type: Number
    },
    Park009:{
        type: Number
    },
    Park010:{
        type: Number
    },
    Park011:{
        type: Number
    },
    Park012:{
        type: Number
    },
    Park013:{
        type: Number
    },
    Park014:{
        type: Number
    },
    Park015:{
        type: Number
    },
    Park016:{
        type: Number
    },
    Park017:{
        type: Number
    },
    Park018:{
        type: Number
    },
    Park019:{
        type: Number
    },
    Park020:{
        type: Number
    }

})

let PastParkData = mongoose.model('PastParkCol', PastParkSchema);

module.exports= PastParkData; 