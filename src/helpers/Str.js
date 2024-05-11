export function capitalizeWords(str) {
    return str.split(' ').map(word => {
        if (word === word.toUpperCase()) {
            return word; 
        } else {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
    }).join(' ');
}