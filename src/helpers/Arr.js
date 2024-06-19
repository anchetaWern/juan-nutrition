export function getSortedByName(arr) {
    return arr.map(item => {
        let newItem = { ...item };

        if (newItem.composition && Array.isArray(newItem.composition)) {
            newItem.composition = getSortedByName(newItem.composition);
        }

        return newItem;
    }).sort((a, b) => a.name.localeCompare(b.name));
}

export function findAgeData(age, ageType = 'year', data) {
    return data.find(item => {
        return item.age_type === ageType &&
            item.age_from <= age &&
            (item.age_to === null || item.age_to >= age);
    });
}