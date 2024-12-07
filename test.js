function scoring(value, min, max, byTen = false) {
    const middle = (min + max) / 2;
    const distance = Math.abs(value - middle);
    const maxScore = 100;
    const maxDistance = (max - min) / 2;
    let score = maxScore - (distance / maxDistance) * maxScore;
    score = Math.max(score, 0);

    if (byTen) {
        score = score / 10;
    }
    return score;
}

// Example usage:
for (let userTemperature = 10; userTemperature < 41; userTemperature++) {
    const score1 = scoring(userTemperature, 20.5, 30.5, (byTen = true));
    const score2 = scoring(userTemperature, 20.5, 30.5, (byTen = false));
    console.log(`${userTemperature} = ${score1} ${score2}`);
}
