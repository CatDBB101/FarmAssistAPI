const cropDatabase = require("./cropDatabase.json");

function analyzeFertilizer(
    cropName,
    temp,
    humi,
    soil_humi,
    light,
    gram = false
) {
    var result = {
        found: false,
        n: 0,
        p: 0,
        k: 0,
        stress_score: 0,
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

    var stress_score = 0;

    if (temp < advice_temp.min || temp > advice_temp.max) {
        stress_score += 1;
    }

    if (humi < advice_humi.min || humi > advice_humi.max) {
        stress_score += 1;
    }

    if (soil_humi < advice_soil_humi.min || soil_humi > advice_soil_humi.max) {
        stress_score += 1;
    }

    if (light < advice_light.min || light > advice_light.max) {
        stress_score += 1;
    }

    var base_n = (cropDataset.N.max + cropDataset.N.min) / 2;
    var base_p = (cropDataset.P.max + cropDataset.P.min) / 2;
    var base_k = (cropDataset.K.max + cropDataset.K.min) / 2;

    var fertilizer_factor = 1.0 + stress_score * 0.1;

    result.n = base_n * fertilizer_factor;
    result.p = base_p * fertilizer_factor;
    result.k = base_k * fertilizer_factor;

    if (gram) {
        result.n = Math.floor(result.n * 100);
        result.p = Math.floor(result.p * 100);
        result.k = Math.floor(result.k * 100);
    }

    result.stress_score = stress_score;

    return result;
}

// Example
// var result = analyzeFertilizer("Rice", 10, 10, 10, 10, (gram = true));
// console.log(result);

module.exports = {
    analyzeFertilizer,
};
