var mongoose = require('mongoose');
const PastParkData = require('./newPastParkDataModel');

const Schema = mongoose.Schema;

const TrendParkSchema = new Schema({

    Day:{
        type: String,
    },
    DayNum:{
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

let TrendParkData = mongoose.model('TrendParkCol', TrendParkSchema);

async function initialiseTrendDatabase (){

    //erase all data in current database
    await TrendParkData.deleteMany({});

    await createTrendDatabase();
}

async function createTrendDatabase(){

    
    //get trend data for each hour of all weeks, average and save
    try{
        
        let pArray =[""];
        let i=0;
        let dayCount;
        for (dayCount=0; dayCount<7; ++dayCount){ //days loop
            let dayString;
            //define day based on 
            switch(dayCount){

                case(0):
                    dayString= 'Sunday';
                    break;
                case(1):
                    dayString= 'Monday';
                    break;
                case(2):
                    dayString= 'Tuesday';
                    break;
                case(3):
                    dayString= 'Wednesday';
                    break;
                case(4):
                    dayString= 'Thursday';
                    break;
                case(5):
                    dayString= 'Friday';
                    break;
                case(6):
                    dayString= 'Saturday';
                    break;
            }
            
            let hourCount;
            for(hourCount=1;hourCount<=24; ++hourCount){//hours loop
                
                const query = {Day: dayCount, Hour: hourCount}
                const dataFetched = await PastParkData.find(query).exec();

                let TrendDocco = new TrendParkData(
                    {
                        DayNum: dayCount,
                        Day: dayString,
                        Hour: hourCount
                    }); 

                    
                let spotCount; 
                //loop for number of car spots (20)
                for (spotCount=1; spotCount<=20; ++spotCount){
                    const parkString = 'Park0' + String(spotCount).padStart(2,'0');
                    
                        //console.log(dataFetched[0][parkString] + ' + ' + dataFetched[1][parkString])
                        TrendDocco[parkString] = (dataFetched[0][parkString] + dataFetched[1][parkString])/2;

                        
                    }

                    

                pArray[i]=TrendDocco;
                ++i;
                

                
                
            }

        }
    
        await Promise.all(pArray.map(p => p.save()));

        console.log('Database 4 Initialised!!');

    } catch(e){
        console.error('Error Initialising Park 4')
    }

}


async function appendTrendDatabase(day, hour){
    //get the two documents from pastpark database
    const pastQuery = {Day: day, Hour: hour};
    const trendQuery={DayNum: day, Hour: hour};
        try{

            let pastData;
            let trendDocco;
            [pastData, trendDocco] = await Promise.all([PastParkData.find(pastQuery).exec(), TrendParkData.findOne(trendQuery).exec() ])

            //  pastData = await PastParkData.find(pastQuery).exec();
            //  trendDocco =await  TrendParkData.findOne(trendQuery).exec();

            

            let spotCount; 
            //loop for number of car spots (20) and calculate average data
            for (spotCount=1; spotCount<=20; ++spotCount){
                const parkString = 'Park0' + String(spotCount).padStart(2,'0');
                
                    trendDocco[parkString] = (pastData[0][parkString] + pastData[1][parkString])/2;
                    
                }
            
            
            await trendDocco.save();

        } catch (err){
            console.error('Trend Data not updated')
            console.error(err)

        }
    

}

module.exports= {TrendParkData :TrendParkData, initialiseTrendDatabase : initialiseTrendDatabase, appendTrendDatabase: appendTrendDatabase}; 