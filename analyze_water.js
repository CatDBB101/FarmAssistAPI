const cropDatabase = require("./cropDatabase.json");

function analyzeWateringNeeds(
    temperature,
    soilHumidity,
    humidity,
    light,
    cropName
) {
    var result = {
        found: false,
        water: undefined,
        amount: undefined,
        unit: undefined,
    };

    // Get plant thresholds
    const cropDataset = cropDatabase[cropName];
    if (!cropDataset) {
        console.log("Invalid plant type");
        return result;
    }

    result.found = true;

    console.log(cropDataset);

    const advice_temp = cropDataset.temp;
    const advice_light = cropDataset.light;
    const advice_humi = cropDataset.humi;
    const advice_soil_humi = cropDataset.soil_humi;

    const baseWater = cropDataset.base_water;

    // Check if watering is needed based on soil moisture
    if (soilHumidity < advice_soil_humi.min) {
        // Adjust the water amount based on environmental factors

        // Temperature Factor
        let temperatureFactor = 1.0;
        if (temperature < advice_temp.min) {
            temperatureFactor = 0.8; // Less water needed below 20°C
        } else if (temperature > advice_temp.max) {
            temperatureFactor = 1.2; // More water needed above 35°C
        }

        // Light Factor
        let lightFactor = 1.0;
        if (light < advice_light.min) {
            lightFactor = 0.8; // Less water needed for low light
        } else if (light > advice_light.max) {
            lightFactor = 1.5; // More water needed for high light
        }

        // Humidity Factor
        let humidityFactor = 1.0;
        if (humidity < advice_humi.min) {
            humidityFactor = 1.2; // More water needed for low humidity
        } else if (humidity > advice_humi.max) {
            humidityFactor = 0.8; // Less water needed for high humidity
        }

        // Calculate the final water amount
        var waterAmount = Number(
            (
                baseWater *
                temperatureFactor *
                lightFactor *
                humidityFactor
            ).toFixed(2)
        );
        if (waterAmount < 1) {
            waterAmount = waterAmount * 1000;
            result.unit = "milliliter";
        } else {
            result.unit = "liter";
        }

        result.water = true;
        result.raw_amount = Number(
            (
                baseWater *
                temperatureFactor *
                lightFactor *
                humidityFactor
            ).toFixed(2)
        );
        result.amount = waterAmount;
        result.unit = "liter";
    } else {
        result.water = false;
    }

    return result;
}

// Example
// var result = analyzeWateringNeeds(10, 10, 10, 10, "Rice");
// console.log(result);

module.exports = { analyzeWateringNeeds };
