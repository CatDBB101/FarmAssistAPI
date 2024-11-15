const analyzeEnvironmentStatus = (
    plantType,
    temperature,
    humidity,
    soilMoisture,
    light,
    rain
) => {
    // Define thresholds for the 10 popular Thai plants
    const plantThresholds = {
        Rice: {
            temperature: { min: 20, max: 35 },
            humidity: { min: 70, max: 90 },
            soilMoisture: { min: 50, max: 80 },
            light: { min: 8, max: 10 }, // Hours
            rain: { min: 1000, max: 1500 },
        },
        Cassava: {
            temperature: { min: 25, max: 35 },
            humidity: { min: 50, max: 70 },
            soilMoisture: { min: 30, max: 60 },
            light: { min: 6, max: 8 }, // Hours
            rain: { min: 800, max: 1200 },
        },
        Sugarcane: {
            temperature: { min: 20, max: 35 },
            humidity: { min: 60, max: 80 },
            soilMoisture: { min: 40, max: 70 },
            light: { min: 8, max: 12 }, // Hours
            rain: { min: 1000, max: 1500 },
        },
        Maize: {
            temperature: { min: 21, max: 30 },
            humidity: { min: 60, max: 80 },
            soilMoisture: { min: 40, max: 70 },
            light: { min: 8, max: 10 }, // Hours
            rain: { min: 500, max: 800 },
        },
        OilPalm: {
            temperature: { min: 24, max: 30 },
            humidity: { min: 70, max: 90 },
            soilMoisture: { min: 50, max: 80 },
            light: { min: 10, max: 12 }, // Hours
            rain: { min: 1800, max: 2500 },
        },
        Rubber: {
            temperature: { min: 25, max: 30 },
            humidity: { min: 75, max: 90 },
            soilMoisture: { min: 50, max: 75 },
            light: { min: 8, max: 10 }, // Hours
            rain: { min: 1500, max: 2000 },
        },
        Pineapple: {
            temperature: { min: 22, max: 32 },
            humidity: { min: 50, max: 70 },
            soilMoisture: { min: 30, max: 60 },
            light: { min: 6, max: 10 }, // Hours
            rain: { min: 1000, max: 1500 },
        },
        Mango: {
            temperature: { min: 25, max: 35 },
            humidity: { min: 50, max: 70 },
            soilMoisture: { min: 30, max: 60 },
            light: { min: 8, max: 10 }, // Hours
            rain: { min: 800, max: 1200 },
        },
        Durian: {
            temperature: { min: 25, max: 35 },
            humidity: { min: 70, max: 90 },
            soilMoisture: { min: 50, max: 70 },
            light: { min: 8, max: 10 }, // Hours
            rain: { min: 1600, max: 2000 },
        },
        Longan: {
            temperature: { min: 18, max: 32 },
            humidity: { min: 50, max: 70 },
            soilMoisture: { min: 40, max: 60 },
            light: { min: 8, max: 10 }, // Hours
            rain: { min: 1000, max: 1500 },
        },
    };

    // Validate plant type
    if (!plantThresholds[plantType]) {
        throw new Error(`Plant type "${plantType}" is not recognized.`);
    }

    const thresholds = plantThresholds[plantType];

    // Evaluate conditions
    const advice = {
        temperature:
            temperature >= thresholds.temperature.min &&
            temperature <= thresholds.temperature.max
                ? 1
                : 0,
        humidity:
            humidity >= thresholds.humidity.min &&
            humidity <= thresholds.humidity.max
                ? 1
                : 0,
        soilMoisture:
            soilMoisture >= thresholds.soilMoisture.min &&
            soilMoisture <= thresholds.soilMoisture.max
                ? 1
                : 0,
        light:
            light >= thresholds.light.min && light <= thresholds.light.max
                ? 1
                : 0,
        rain:
            rain >= thresholds.rain.min && rain <= thresholds.rain.max ? 1 : 0,
    };

    // Summarize
    const totalScore = Object.values(advice).reduce(
        (sum, value) => sum + value,
        0
    );
    const status =
        totalScore === 5
            ? "เหมาะสมที่สุด"
            : totalScore >= 3
            ? "ค่อนข้างเหมาะสม"
            : "ไม่เหมาะสม";

    const thaiAdvice = {
        temperature: advice.temperature
            ? "อุณหภูมิเหมาะสม"
            : "อุณหภูมิไม่เหมาะสม",
        humidity: advice.humidity ? "ความชื้นเหมาะสม" : "ความชื้นไม่เหมาะสม",
        soilMoisture: advice.soilMoisture
            ? "ความชื้นในดินเหมาะสม"
            : "ความชื้นในดินไม่เหมาะสม",
        light: advice.light ? "แสงสว่างเพียงพอ" : "แสงสว่างไม่เพียงพอ",
        rain: advice.rain ? "ปริมาณฝนเหมาะสม" : "ปริมาณฝนไม่เหมาะสม",
    };

    return {
        numericalSummary: {
            score: totalScore,
            advice,
        },
        thaiSummary: {
            status,
            details: thaiAdvice,
        },
    };
};

// Example usage
const exampleInput = {
    plantType: "Rice",
    temperature: 30,
    humidity: 70,
    soilMoisture: 60,
    light: 10,
    rain: 1200,
};

console.log(
    analyzeEnvironmentStatus(
        exampleInput.plantType,
        exampleInput.temperature,
        exampleInput.humidity,
        exampleInput.soilMoisture,
        exampleInput.light,
        exampleInput.rain
    )
);

module.exports = {
    analyzeEnvironmentStatus,
};
