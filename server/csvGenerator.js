const fs = require("fs");
const MemoryStream = require('memorystream');
const getStream = require('get-stream');

async function generateCSV(data) {
    // if (!isArray(data) || data.length == 0) return;
    var memStream = new MemoryStream();
    let dataStr = Object.keys(data[0]).toString();
    for (row in data) {
        const tmp = [];
        for (heading in data[row]) {
            tmp.push(data[row][heading])
        }
        dataStr +=  "\n" + tmp.toString();
    }
    memStream.write(dataStr);
    memStream.end(); // important -- you have to end the stream before storing it as a buffer
    const buffer = await getStream.buffer(memStream);
    return buffer;
};


module.exports = { generateCSV };