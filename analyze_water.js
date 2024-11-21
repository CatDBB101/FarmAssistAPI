const { recommender_v1beta1 } = require("googleapis");
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
    return svp - actualVP;
}

function analyzeWateringNeeds(
    vpd,
    soilMoisture,
    soil_misture_limit,
    high_vpd,
    low_vpd
) {
    const moistureThreshold = parseFloat(soil_misture_limit || 30); // Default: 30%
    const highVPDThreshold = parseFloat(high_vpd || 1.5); // Default: 1.5 kPa
    const lowVPDThreshold = parseFloat(low_vpd || 0.5); // Default: 0.5 kPa

    var recommendation = "";
    var watering = false;

    if (soilMoisture < moistureThreshold) {
        if (vpd > highVPDThreshold) {
            recommendation = `ค่า VPD สูง (${vpd.toFixed(
                2
            )} kPa) และ ความชื้นในดินต่ำ (${soilMoisture}%) ควรรดน้ำตอนนี้`;
            watering = true;
        } else {
            recommendation = `ค่า VPD ต่ำ (${soilMoisture}%) ควรรดน้ำในเร็วๆนี้`;
        }
    } else if (vpd < lowVPDThreshold) {
        recommendation = `ค่า VPD ต่ำ (${vpd.toFixed(
            2
        )} kPa) อากาศมีความชื้นมาก ไม่ควรให้น้ำเวลานี้`;
    } else {
        recommendation = `สภาวะเหมาะสมที่สุด (${vpd.toFixed(
            2
        )} kPa) รวมถึงความชื้นในดิน (${soilMoisture}%). ไม่ควรรดน้ำในเวลานี้`;
    }

    return { watering: watering, recommendation: recommendation };
}

// Example Data (Replace with sensor input or API data)
const temperature = 20; // Celsius
const humidity = 40; // Percentage
const soilMoisture = 20; // Percentage

// Analyze
const vpd = calculateVPD(temperature, humidity);
const recommendation = analyzeWateringNeeds(vpd, soilMoisture, 30, 1.5, 0.5);

console.log(`VPD: ${vpd.toFixed(2)} kPa`);
console.log(`Soil Moisture: ${soilMoisture}%`);
console.log(`Recommendation: ${recommendation}`);

module.exports = { calculateSVP, calculateVPD, analyzeWateringNeeds };
