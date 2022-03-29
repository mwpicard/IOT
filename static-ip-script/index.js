const myArgs = process.argv.slice(2);
const inputPath = myArgs[0] || "example.csv";
const reader = require("./reader");
const manipulator = require("./ip-manipulator");

console.debug(`Reading file "${inputPath}"`);
reader.read(inputPath)
    .then(results => {
        console.log(results);
        manipulator.setStaticIps(results);
    })
    .catch(err => {
        console.error(err);
    });