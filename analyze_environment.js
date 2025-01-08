const cropDatabase = require("./cropDatabase.json");

function scoring(value, min, max, byTen = false) {
    const middle = (min + max) / 2;
    const distance = Math.abs(value - middle);
    const maxScore = 100;
    const maxDistance = (max - min) / 2;
    let score = maxScore - (distance / maxDistance) * maxScore;
    score = Math.max(score, 0);

    if (byTen) {
        0;
        score = Math.floor(score / 10);
    }
    return score;
}

function overall_word(overall_score) {
    if (overall_score >= 0 || overall_score < 1) {
        return "แย่มาก";
    } else if (overall_score >= 1 && overall_score <= 2) {
        return "แย่";
    } else if (overall_score >= 3 && overall_score <= 4) {
        return "ค่อนข้างแย่";
    } else if (overall_score > 4 || overall_score < 6) {
        return "ปานกลาง";
    } else if (overall_score >= 6 && overall_score <= 7) {
        return "ค่อนข้างดี";
    } else if (overall_score >= 8 && overall_score <= 9) {
        return "ดี";
    } else if (overall_score == 10) {
        return "ดีมาก";
    }
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
data_require = ["temp", "humi", "soil_humi", "light", "ph"];
const scoreEnvironment = (cropName, values) => {
    var cropDataset = cropDatabase[cropName];
    // console.log(cropDataset);

    var result = {
        found: false,
    };

    if (!cropDataset) {
        return result;
    }

    var sum = 0;
    Object.keys(values).forEach((data_name) => {
        if (data_name == "ph") {
            return;
        }
        var value = values[data_name];
        var min = cropDataset[data_name].min;
        var max = cropDataset[data_name].max;

        // console.log(value, min, max);

        var cal_result = scoring(value, min, max, (byTen = true));
        result[data_name] = cal_result;

        sum += cal_result;
    });
    result.overall = sum / data_require.length;

    // ph
    result["ph"] = scoring(values.ph, 5.9, 7.1, (byTen = true));

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
//         ph: 6
//     })
// );

module.exports = {
    scoreEnvironment,
    overall_word,
};
