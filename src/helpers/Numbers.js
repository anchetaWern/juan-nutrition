export function calculatePercentage(number, total) {
    return (number / total) * 100;
}

export function formatNumber(number) {
    if (number && !Number.isInteger(number)) {
        return number.toFixed(2);
    }
    return number;
}