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
        'mg': 1000,
        'IU': 0.3, // note: this is for retinol. the conversion factor for beta-carotene (a precursor of vit A) it's 0.6 µg. no way of distinguishing between the two yet in the database though
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

export function amountPerContainer(amount, servingsPerContainer, displayValuesPerContainer, newServingSize = 100, newServingCount = null) {
    const servingCount = newServingCount ? newServingCount : servingsPerContainer;
   
    const multiplier = displayValuesPerContainer ? servingCount : 1;
   
    const originalNutrientAmount = amount * multiplier;

    if (isNumeric(newServingSize)) {
        return modifyServingSize(100, newServingSize, originalNutrientAmount);
    }
    return originalNutrientAmount;
}

function modifyServingSize(originalServingSize, newServingSize, originalNutrientAmount) {
    return (newServingSize / originalServingSize) * originalNutrientAmount;
}

export function servingSize(originalServingSize, newServingSize) {
    if (isNumeric(newServingSize)) {
        return newServingSize;
    }
    return originalServingSize;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

export function getElements(nutrients)
{
    const element_names = ['total ash', 'water'];

    return nutrients.filter((itm) => {
        return element_names.indexOf(itm.name) !== -1;
    });
}

export function getMacros(nutrients) 
{
    const macro_names = ['total carbohydrates', 'total fat', 'protein'];

    return nutrients.filter((itm) => {
        return macro_names.indexOf(itm.name) !== -1;
    });
}

export function getVitamins(nutrients)
{
    const vitamin_names = [
        'vitamin a', 'vitamin c', 'vitamin d', 
        'vitamin e', 'vitamin k', 'vitamin b1', 
        'vitamin b2', 'vitamin b3',
        'vitamin b5', 'vitamin b6', 'vitamin b7', 
        'vitamin b9', 'vitamin b12'
    ];

    return nutrients
        .filter((itm) => {
            return vitamin_names.indexOf(itm.name) !== -1;
        })
        .map((itm) => {
            const standard_unit = nutrientUnit(itm.name);
            
            let standard_amount = null;
            if (itm.name === 'vitamin d') {
                standard_amount = standardizeVitaminD(itm.amount, itm.unit);
            } else if (itm.name === 'vitamin a') {
                standard_amount = standardizeVitaminA(itm.amount, itm.unit);
            } else if (itm.name === 'vitamin e') {
                standard_amount = standardizeVitaminE(itm.amount, itm.unit);
            } else if (itm.name === 'vitamin b3') {
                standard_amount = standardizeVitaminB3(itm.amount, itm.unit);
            } else if (itm.name === 'vitamin b9') {
                standard_amount = standardizeVitaminB9(itm.amount, itm.unit);
            }
            
            return {...itm, amount: standard_amount, unit: standard_unit};
        });
}

export function getMinerals(nutrients)
{
    const mineral_names = [
        'calcium', 'chloride', 'chromium', 'copper', 
        'iodine', 'iron', 'magnesium', 'manganese', 'molybdenum', 
        'phosphorus', 'potassium', 'selenium', 'sodium', 'zinc'
    ];

    return nutrients.filter((itm) => {
        return mineral_names.indexOf(itm.name) !== -1;
    });
}

export function getOthers(nutrients)
{
    const other_names = [
        'lactose'
    ];

    return nutrients.filter((itm) => {
        return other_names.indexOf(itm.name) !== -1;
    });
}