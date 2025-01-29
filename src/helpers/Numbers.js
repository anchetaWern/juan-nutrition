export function calculatePercentage(number, total) {
    let percent = (number / total) * 100;
    if (percent < 1) {
        return percent;
    }
    return Math.floor(percent);
}

export function formatNumber(number) {
    if (number && !Number.isInteger(number)) {
        return number.toFixed(2);
    }
    return number;
}

export function wholeNumber(number) {
    if (number && !Number.isInteger(number)) {
        return Math.ceil(number);
    }
    return number;
}