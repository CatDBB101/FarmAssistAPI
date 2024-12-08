const cropDatabase = require("./cropDatabase.json");

function scoring(value, min, max, byTen = false) {
    const middle = (min + max) / 2;
    const distance = Math.abs(value - middle);
    const maxScore = 100;
    const maxDistance = (max - min) / 2;
    let score = maxScore - (distance / maxDistance) * maxScore;
    score = Math.max(score, 0);

    if (byTen) {
        score = Math.floor(score / 10);
    }
    return score;
}

/* 
values = {
    temp,
    humi,
    soil_humi,
    light,
    wind_speed,
}
*/
data_require = ["temp", "humi", "soil_humi", "light", "wind_speed"];
const scoreEnvironment = (cropName, values) => {
    var cropDataset = cropDatabase[cropName];
    // console.log(cropDataset);

    var result = {
        found: false,
    };

    if (!cropDataset) {
        return result;
    }

    var sum=0;    
    Object.keys(values).forEach((data_name) => {
        var value = values[data_name];
        var min = cropDataset[data_name].min;
        var max = cropDataset[data_name].max;

        // console.log(value, min, max);

        var cal_result = scoring(value, min, max, (byTen = true));
        result[data_name] = cal_result;

        sum+=cal_result;    
    });
    result.overall = sum/data_require.length;

    result.found = true;
    return result;
};

// Example
// console.log(
//     scoreEnvironment("Rice", {
//         temp: 30,
//         humi: 75,
//         soil_humi: 70,
//         light: 20000,
//         wind_speed: 15,
//     })
// );

module.exports = {
    scoreEnvironment,
};
