export function getSortedByName(arr) {
    return arr.map(item => {
        let newItem = { ...item };

        if (newItem.composition && Array.isArray(newItem.composition)) {
            newItem.composition = getSortedByName(newItem.composition);
        }

        return newItem;
    }).sort((a, b) => a.name.localeCompare(b.name));
}