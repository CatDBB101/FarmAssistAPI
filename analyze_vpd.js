const math = require("mathjs");

const CONSTANT_A = 0.61078; // In kPa
const CONSTANT_B = 17.27;
const CONSTANT_C = 237.3;

function calculateSVP(temperature) {
    return (
        CONSTANT_A *
        Math.exp((CONSTANT_B * temperature) / (temperature + CONSTANT_C))
    );
}

function calculateVPD(temperature, humidity) {
    const svp = calculateSVP(temperature);
    const actualVP = (humidity / 100) * svp;
    return Number((svp - actualVP).toFixed(2));
}

// Example Data (Replace with sensor input or API data)
// const temperature = 20; // Celsius
// const humidity = 40; // Percentage
// const soilMoisture = 20; // Percentage
// const airPressure = 1000; // hPa

// const vpd = calculateVPD(temperature, humidity);
// const recommendation = analyzeWateringNeeds(temperature, humidity, soilMoisture, airPressure);

// console.log(`VPD: ${vpd.toFixed(2)} kPa`);
// console.log(`Soil Moisture: ${soilMoisture}%`);
// console.log(`Recommendation: ${recommendation}`);


module.exports = { calculateSVP, calculateVPD };
