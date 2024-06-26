const common_nutrient_units = {
    "dietary fiber": "g",
    "protein": "g",
    "total fat": "g",
    "cholesterol": "mg",
    "total carbohydrates": "g",
    "sugar": "g",
    "sodium": "mg",
    "potassium": "mg",
    "calcium": "mg",
    "iron": "mg",
    "magnesium": "mg",
    "zinc": "mg",
    "selenium": "mcg",
    "vitamin a": "mcg RAE", // mcg RAE
    "vitamin c": "mg",
    "vitamin d": "mcg",
    "vitamin e": "mg α-tocopherol", // mg alpha-tocopherol
    "vitamin k": "mcg",
    "vitamin b1": "mg",
    "vitamin b2": "mg",
    "vitamin b3": "mg NE",
    "vitamin b6": "mg",
    "vitamin b9": "mcg DFE",
    "vitamin b12": "mcg",
    "biotin": "mcg",
    "chloride": "mg",
    "choline": "mg",
    "chromium": "mcg",
    "copper": "mg",
    "total fiber": "g",
    "iodine": "mcg",
    "manganese": "mg",
    "molybdenum": "mcg",
    "vitamin b5": "mg",
    "phosphorus": "mg",
    "saturated fat": "g"
}  

export function nutrientUnit(nutrient) {
    return common_nutrient_units[nutrient];
}

export function standardizeVitaminD(value, unit) {
    const standard_unit = 'mcg';
    const conversion_factors = {
        'IU': 0.025,
        'mg': 1000,
    };

    if (unit !== standard_unit) {
        return value * conversion_factors[unit];
    }

    return value;
}

export function standardizeVitaminA(value, unit) {
    const standard_unit = 'mcg'; // mcg of RAE
    const conversion_factors = {
        'IU': 0.05,
        'µg': 0.05,
        'μgre': 1, // can be used interchangeably
    };

    if (unit !== standard_unit) {
        return value * conversion_factors[unit];
    }

    return value;
}

export function standardizeVitaminE(value, unit) {
    const standard_unit = 'mg'; // mg alpha-tocopherol 
    const conversion_factors = {
        'IU': 0.67,
    };

    if (unit !== standard_unit) {
        return value * conversion_factors[unit];
    }

    return value;
}

export function standardizeVitaminB3(value, unit) {
    const standard_unit = 'NE'; // niacin equivalents 
    const conversion_factors = {
        'mg': 1,
        'mgNE': 1, // used interchangeably
    };

    if (unit !== standard_unit) {
        return value * conversion_factors[unit];
    }

    return value;
}

export function standardizeVitaminB9(value, unit) {
    const standard_unit = 'mcg'; // mcg of DFE 
    const conversion_factors = {
        'µgDFE': 1, // used interchangeably
        'mg': 1000, 
    };

    if (unit !== standard_unit) {
        return value * conversion_factors[unit];
    }

    return value;
}