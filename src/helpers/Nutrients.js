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

const essential_nutrients = [
    'dietary fiber',
    'protein',
    'total fat',
    'cholesterol',
    'total carbohydrates',
    'sodium',
    'potassium',
    'calcium',
    'iron',
    'magnesium',
    'zinc',
    'selenium',
    'vitamin a',
    'vitamin c',
    'vitamin d',
    'vitamin e',
    'vitamin k',
    'vitamin b1',
    'vitamin b2',
    'vitamin b3',
    'vitamin b6',
    'vitamin b9',
    'vitamin b12',
    'phosphorus',
];

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

                if (composition && composition.length > 0) {
                    if (!aggregated_nutrients[name].hasOwnProperty('composition')) {
                        aggregated_nutrients[name].composition = composition.map(subNutrient => ({
                            ...subNutrient,
                            amount: 0 // Start with amount 0 to allow for aggregation
                        }));
                    }

                    composition.forEach((subNutrient, index) => {
                        // Check if the sub-nutrient already exists in the aggregated composition
                        const aggregatedSubNutrient = aggregated_nutrients[name].composition.find(
                            sub => sub.name === subNutrient.name
                        );
    
                        // If the sub-nutrient exists, aggregate the amount; otherwise, add it
                        if (aggregatedSubNutrient) {
                            aggregatedSubNutrient.amount += subNutrient.amount;
                        } else {
                            aggregated_nutrients[name].composition.push({ ...subNutrient });
                        }
                    });
                }
        
            }

        });
  
    });

    for (const nutrient in aggregated_nutrients) {
        if (aggregated_nutrients[nutrient].composition && aggregated_nutrients[nutrient].composition.length === 0) {
            delete aggregated_nutrients[nutrient].composition;
        }
    }
    
  
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

// note: moderated nutrients should only be considered deficient if its less than 50% of the limit
// exclude: saturated fat, trans fat, sugar


const moderatedNutrients = ['cholesterol', 'calcium']; 
// deficient: Consumption < 60% of DV
// good coverage: Consumption < 60% of DV
// over consumed Consumption > DV

const excludedNutrients = ['saturated fat', 'trans fat', 'sugar'];
// deficient: excluded
// good coverage: excluded
// over consumed: if it goes beyond the DV. for trans fat there should be none.

const highPriorityNutrients = [
    'protein', 'dietary fiber', 'calcium', 'iron', 'magnesium', 
    'vitamin a', 'vitamin d', 'zinc', 'iodine', 'vitamin b12', 'vitamin b9'
]; 
// deficient: Consumption < 90% of DV
// good coverage: Consumption ≤ 100% to 120% of DV
// over consumed: Consumption > DV + 50%

const mediumPriorityNutrients = [
    'total fat', 'total carbohydrates', 'vitamin c', 'vitamin e', 'vitamin k', 'potassium',
    'vitamin b1', 'vitamin b2', 'vitamin b3', 'vitamin b5', 'vitamin b6', 'phosphorus', 'selenium',
    'copper', 'manganese', 'chromium', 'molybdenum', 'choline',
];
// deficient: Consumption < 80% of DV
// good coverage: Consumption ≤ 90% to 120% of DV
// over consumed: Consumption > DV + 50%

const lowPriorityNutrients = ['biotin', 'sodium', 'chloride'];
// deficient: Consumption < 70% of DV
// good coverage: Consumption ≤ 80% to 120% of DV
// over consumed: Consumption > DV + 50%

export function filterDeficientNutrients(nutrients, limits) {

    const deficient_nutrients = [];
  
    nutrients.forEach(item => {
        
        if (!excludedNutrients.includes(item.name)) {

            const limit = limits[item.name];
            let new_limit = limit;

            if (moderatedNutrients.includes(item.name)) {

                new_limit = limit - (limit * 0.6);

            } else if (highPriorityNutrients.includes(item.name)) {
               
                new_limit = limit - (limit * 0.9);

            } else if (mediumPriorityNutrients.includes(item.name)) {

                new_limit = limit - (limit * 0.8);
            
            } else if (lowPriorityNutrients.includes(item.name)) {

                new_limit = limit - (limit * 0.70);
            }


            if (item.amount < new_limit) {
                deficient_nutrients.push({
                    name: item.name,
                    amount: item.amount,
                    unit: item.unit,
                });  
            }

        }
        
        if (item.composition) {
            item.composition.forEach(subItem => {

                if (!excludedNutrients.includes(subItem.name)) {
                    const sub_limit = limits[subItem.name];

                    let new_sub_limit = sub_limit;

                    if (moderatedNutrients.includes(item.name)) {

                        new_sub_limit = sub_limit - (sub_limit * 0.6);

                    } else if (highPriorityNutrients.includes(item.name)) {
                    
                        new_sub_limit = sub_limit - (sub_limit * 0.9);

                    } else if (mediumPriorityNutrients.includes(item.name)) {

                        new_sub_limit = sub_limit - (sub_limit * 0.8);
                    
                    } else if (lowPriorityNutrients.includes(item.name)) {

                        new_sub_limit = sub_limit - (sub_limit * 0.70);
                    }

                    if (subItem.amount < new_sub_limit) {
                        deficient_nutrients.push({
                            name: subItem.name,
                            amount: subItem.amount,
                            unit: subItem.unit,
                        });
                    }
                
                }
            });
        }
    });


    const nutrients_arr = [];
    nutrients.forEach((itm) => {
        nutrients_arr.push(itm.name);
        if (itm.composition) {
            itm.composition.forEach((sub_item) => {
                nutrients_arr.push(sub_item.name);
            });
        }
    });

    const non_existent_nutrients = essential_nutrients.filter(item => !nutrients_arr.includes(item));

    const non_existent = non_existent_nutrients.map((itm) => {
        return { 
            name: itm,
            amount: 0,
            unit: common_nutrient_units[itm]
        };
    });

    return [...deficient_nutrients, ...non_existent].reduce((acc, current) => {
        const x = acc.find(item => item.name === current.name);
        if (!x) {
          acc.push(current);
        }
        return acc;
    }, []);
}


export function filterOverconsumedNutrients(nutrients, limits) {

    const overconsumed_nutrients = [];
  
    nutrients.forEach(item => {
        
        const limit = limits[item.name];
        let adjusted_limit = limit * 1.5; // DV + 50%

        if (excludedNutrients.includes(item.name) || moderatedNutrients.includes(item.name)) {
            adjusted_limit = limit;
        }

        if (item.amount >= adjusted_limit) {
            overconsumed_nutrients.push({
                name: item.name,
                amount: item.amount,
                unit: item.unit,
            });  
        }

        
        if (item.composition) {
            item.composition.forEach(subItem => {

                const sub_limit = limits[subItem.name];
                let adjusted_limit = sub_limit  * 1.5; // DV + 50%
                if (excludedNutrients.includes(subItem.name) || moderatedNutrients.includes(subItem.name)) {
                    adjusted_limit = sub_limit; 
                }

                if (subItem.amount >= adjusted_limit || subItem.name === 'trans fat') {
                    overconsumed_nutrients.push({
                        name: subItem.name,
                        amount: subItem.amount,
                        unit: subItem.unit,
                    });
                }

            });
        }
    });

    return overconsumed_nutrients;
}


export function filterGoodCoverageNutrients(nutrients, limits, overConsumedNutrients) {

    const good_coverage_nutrients = [];
  
    nutrients.forEach(item => {
        
        if (!excludedNutrients.includes(item.name) && !overConsumedNutrients.includes(item.name)) {

            const limit = limits[item.name];
            let condition = false;
            const upper_limit = limit * 1.2;

            if (moderatedNutrients.includes(item.name)) {
                condition = item.amount > limit * 0.6;
        
            } else if (highPriorityNutrients.includes(item.name)) { // 90 to 120

                const lower_limit = limit * 0.9;
                condition = item.amount >= lower_limit && item.amount <= upper_limit;

            } else if (mediumPriorityNutrients.includes(item.name)) { // 80 to 120

                const lower_limit = limit * 0.8;
                condition = item.amount >= lower_limit && item.amount <= upper_limit;
            
            } else if (lowPriorityNutrients.includes(item.name)) { // 70 to 120

                const lower_limit = limit * 0.7;
                condition = item.amount >= lower_limit && item.amount <= upper_limit;
            }


            if (condition) {
                good_coverage_nutrients.push({
                    name: item.name,
                    amount: item.amount,
                    unit: item.unit,
                });  
            }

        }
        
        if (item.composition) {
            item.composition.forEach(subItem => {

                if (!excludedNutrients.includes(subItem.name) && !overConsumedNutrients.includes(subItem.name)) {
                    const sub_limit = limits[subItem.name];

                    let condition = false;
                    const upper_limit = sub_limit * 1.2;

                    if (moderatedNutrients.includes(subItem.name)) {
                        
                        condition = subItem.amount > sub_limit * 0.6;

                    } else if (highPriorityNutrients.includes(subItem.name)) { // 90 to 120

                        const lower_limit = sub_limit * 0.9;
                        condition = subItem.amount >= lower_limit && subItem.amount <= upper_limit;

                    } else if (mediumPriorityNutrients.includes(subItem.name)) { // 80 to 120

                        const lower_limit = sub_limit * 0.8;
                        condition = subItem.amount >= lower_limit && subItem.amount <= upper_limit;
                    
                    } else if (lowPriorityNutrients.includes(subItem.name)) { // 70 to 120

                        const lower_limit = sub_limit * 0.7;
                        condition = subItem.amount >= lower_limit && subItem.amount <= upper_limit;
                    }


                    if (condition) {
                        good_coverage_nutrients.push({
                            name: subItem.name,
                            amount: subItem.amount,
                            unit: subItem.unit,
                        });
                    }
                
                }
            });
        }
    });

    return good_coverage_nutrients;
}