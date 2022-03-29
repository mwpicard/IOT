const fs = require("fs");
const csv = require("csv-parser");

function readCsv(path) {
    const readResult = new Promise((resolve, reject) => {
        let results = [];
        fs.createReadStream(path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                console.log("CSV read successfully!");
                resolve(results);
            })
            .on("error", e => {
                console.error("CSV read failed!");
                reject(e);
            });
    })

    return readResult;
}

module.exports = {
    read: readCsv
}