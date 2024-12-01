const zlib = require("zlib");

// Function to zip an object
const zipObject = (data) => {
    const jsonData = JSON.stringify(data);  // Convert object to string
    const buffer = Buffer.from(jsonData, 'utf-8');  // Convert string to buffer
    return zlib.gzipSync(buffer);  // Compress the buffer with gzip
};

// Function to unzip a gzipped object
const unzipObject = (zippedBuffer) => {
    const unzippedBuffer = zlib.gunzipSync(zippedBuffer);  // Decompress the buffer
    return JSON.parse(unzippedBuffer.toString('utf-8'));  // Convert back to string and parse to object
};

// Exaple Usage :
var zip_data = zipObject([10, 10, "a"]);
console.log(zip_data);
console.log(unzipObject(zip_data));

module.exports = {
	zipObject,
	unzipObject
}