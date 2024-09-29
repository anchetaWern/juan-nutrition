export function capitalizeWords(str) {
    return str.split(' ').map(word => {
        if (word === word.toUpperCase()) {
            return word; 
        } else {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
    }).join(' ');
}

export function unslugify(slug) {
    let result = slug.replace(/[-_]/g, ' ');
    result = result.replace(/\b\w/g, (char) => char.toUpperCase());
    return result;
}

export function limit(str, char_count = 30) {
    if (str.length > char_count) {
        return str.substr(0, char_count) + '..';
    }
    return str;
}