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

export function updateNutrients(nutrients, original_serving_size, new_serving_size, serving_count = 1) {

    return nutrients.map((nutrient) => {
        const new_amount = (new_serving_size / original_serving_size) * nutrient.amount;
        let new_composition = null;
        if (nutrient.composition) {
            new_composition = updateNutrients(nutrient.composition, original_serving_size, new_serving_size, serving_count);
        }
        const updated_nutrients = {
            ...nutrient,
            amount: new_amount / serving_count,
        }
        if (new_composition) {
            Object.assign(updated_nutrients, {
                composition: new_composition
            });
        }

        return updated_nutrients;
    });

}

export function transformNutrientsObjectToArray(nutrientsObject) {
    return Object.entries(nutrientsObject).map(([name, nutrient]) => {
      const transformedNutrient = {
        name,
        amount: nutrient.amount,
        unit: nutrient.unit
      };
  
      if (nutrient.hasOwnProperty('composition')) {
        transformedNutrient.composition = nutrient.composition.map(subNutrient => ({
          name: subNutrient.name,
          amount: subNutrient.amount,
          unit: subNutrient.unit
        }));
  
        transformedNutrient.composition.forEach((subNutrient) => {
          if (subNutrient.hasOwnProperty('composition')) {
            subNutrient.composition = subNutrient.composition.map(nestedSubNutrient => ({
              name: nestedSubNutrient.name,
              amount: nestedSubNutrient.amount,
              unit: nestedSubNutrient.unit
            }));
          }
        });
      }
  
      return transformedNutrient;
    });
};

export function aggregateNutrients (recipe, serving_sizes, serving_count = 1) {

    const aggregated_nutrients = {};
  
    recipe.forEach((food) => {
  
        const new_serving_size = serving_sizes[food.description_slug];

        const updated_nutrients = updateNutrients(food.nutrients, food.serving_size, new_serving_size, serving_count);
  
        updated_nutrients.forEach(nutrient => {
    
            const { name, amount, unit, composition } = nutrient;
            
            if (unit) {
                if (!aggregated_nutrients.hasOwnProperty(name)) {
                    aggregated_nutrients[name] = { amount: 0, unit };
                }
            
                aggregated_nutrients[name].amount += amount;
        
                if (nutrient.hasOwnProperty('composition')) {
                    if (!aggregated_nutrients[name].hasOwnProperty('composition')) {
                        aggregated_nutrients[name].composition = composition.map(subNutrient => ({
                            ...subNutrient,
                            amount: 0
                        }));
                    }
                    composition.forEach((subNutrient, index) => {
                        if (aggregated_nutrients[name].composition[index]) {
                            aggregated_nutrients[name].composition[index].amount += subNutrient.amount;
                        }
                    });
                }
            }

        });
  
    });
  
    return transformNutrientsObjectToArray(aggregated_nutrients);
  
}


export function filterNutrients(nutrients, filterNames) {
    const filtered_nutrients = [];
  
    nutrients.forEach(item => {
        if (filterNames.includes(item.name)) {
            filtered_nutrients.push(item);
        }
  
        if (item.composition) {
            item.composition.forEach(subItem => {
                if (filterNames.includes(subItem.name)) {
                    filtered_nutrients.push(subItem);
                }
            });
        }
    });

    const sorted_nutrients = filtered_nutrients.sort((a, b) => {
        return filterNames.indexOf(a.name) - filterNames.indexOf(b.name);
    });
  
    return sorted_nutrients;
}