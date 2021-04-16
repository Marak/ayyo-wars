// load starmap as csv

// format to json

// output starmap

const csvFilePath = __dirname + '/../data/stars.csv';
const csv=require('csvtojson');
const fs = require('fs');
csv()
.fromFile(csvFilePath)
.then((jsonObj)=>{
    console.log(jsonObj);
    fs.writeFileSync(__dirname + '/../data/stars.json', JSON.stringify(jsonObj, true, 2));
    /**
     * [
     * 	{a:"1", b:"2", c:"3"},
     * 	{a:"4", b:"5". c:"6"}
     * ]
     */ 
})