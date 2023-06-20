const fs = require("fs");
const MemoryStream = require("memorystream");
const getStream = require("get-stream");

async function generateCSV(data) {
  // if (!isArray(data) || data.length == 0) return;
  var memStream = new MemoryStream();
  let dataStr = Object.keys(data[0]).toString();
  for (row in data) {
    // console.log(row);
    const tmp = [];
    for (heading in data[row]) {
      //   console.log(heading);
      //   if (Array.isArray(data[row][heading])) {
      //     tmp.push(JSON.stringify(data[row][heading]).replaceAll(",", " "));
      //   } else {
      //     tmp.push(data[row][heading]);
      //   }
      tmp.push(JSON.stringify(data[row][heading]).replaceAll(",", "^"));
    }
    // console.log(tmp);
    dataStr += "\n" + tmp.toString().replace(/\n/g, "");
  }
  memStream.write(dataStr);
  memStream.end(); // important -- you have to end the stream before storing it as a buffer
  const buffer = await getStream.buffer(memStream);
  return buffer;
}

module.exports = { generateCSV };
