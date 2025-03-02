import { calculatePercentage } from '@/helpers/Numbers';

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
    "fluoride": "mg",
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
        'mcg RAE': 1,
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

export function amountPerContainer(amount, servingsPerContainer, displayValuesPerContainer, originalServingSize, newServingSize = 100, newServingCount = null) {
   
    const servingCount = newServingCount ? newServingCount : servingsPerContainer;
   
    const multiplier = displayValuesPerContainer ? servingCount : 1;
   
    const originalNutrientAmount = amount * multiplier;
    
    if (isNumeric(newServingSize)) {
        return modifyServingSize(originalServingSize, newServingSize, originalNutrientAmount); 
    }
    return originalNutrientAmount;
}

export function modifyServingSize(originalServingSize, newServingSize, originalNutrientAmount) {
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
            
            let standard_amount = itm.amount;
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

const mineral_names = [
    'calcium', 'chloride', 'chromium', 'copper', 
    'iodine', 'iron', 'magnesium', 'manganese', 'molybdenum', 
    'phosphorus', 'potassium', 'selenium', 'sodium', 'zinc'
];

export function getMinerals(nutrients)
{
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
                            amount: 0 
                        }));
                    }

                    composition.forEach((subNutrient, index) => {
                        
                        const aggregatedSubNutrient = aggregated_nutrients[name].composition.find(
                            sub => sub.name === subNutrient.name
                        );
    
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

const moderatedNutrients = ['cholesterol', 'calcium']; 

const excludedNutrients = ['saturated fat', 'trans fat', 'sugar'];

export function filterDeficientNutrients(nutrients, limits) {
  
    const deficient_nutrients = [];
  
    nutrients.forEach(item => {
        
        if (!excludedNutrients.includes(item.name)) {

            const limit = limits[item.name];
            let new_limit = limit * .74;
            
            if (item.amount <= new_limit) {
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

                    let new_sub_limit = sub_limit * .74;

                    if (subItem.amount <= new_sub_limit) {
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
        let adjusted_limit = limit * 1.25; // DV + 125%

        if (excludedNutrients.includes(item.name) || moderatedNutrients.includes(item.name)) {
            adjusted_limit = limit;
        }

        if (item.amount > adjusted_limit) {
            overconsumed_nutrients.push({
                name: item.name,
                amount: item.amount,
                unit: item.unit,
            });  
        }

        
        if (item.composition) {
            item.composition.forEach(subItem => {

                const sub_limit = limits[subItem.name];
                let adjusted_limit = sub_limit  * 1.25; // DV + 125%
                if (excludedNutrients.includes(subItem.name) || moderatedNutrients.includes(subItem.name)) {
                    adjusted_limit = sub_limit; 
                }

                if (subItem.amount > adjusted_limit || (subItem.name === 'trans fat' && subItem.amount > 0)) {
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
           
            const lower_limit = limit * 0.75;
            const upper_limit = limit * 1.25;

            let condition = item.amount >= lower_limit && item.amount <= upper_limit;

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

                  
                    const lower_limit = sub_limit * 0.75;
                    const upper_limit = sub_limit * 1.25;
                    let condition = subItem.amount >= lower_limit && subItem.amount <= upper_limit;

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


export function convertWeight(density, household_weight)
{
    // household units has a direct equivalent
    if (density && household_weight) {
        const weight_in_grams = household_weight * density;
        return Math.ceil(weight_in_grams);
    }
}

export function normalizeFoodState(foodState)
{
    if (foodState === 'Liquids') {
        return 'liquid';
    }
    return 'solid';
}


export function extractFAOClaimReferenceValue(fao_nutrient_content_claims, component, claim)
{   
    if (fao_nutrient_content_claims) {
        const match = fao_nutrient_content_claims.find(itm => itm.component === component && itm.claim === claim);
        if (match) {
            if (match.condition_type === 'amount') {
                return getValueAndUnit(match.condition);   
            }
            return match.condition;
        }
    }
    
    return {
        value: null,
        unit: null
    };
}

export function extractFAOClaim(fao_nutrient_content_claims, component, claim)
{
    if (fao_nutrient_content_claims) {
        const match = fao_nutrient_content_claims.find(itm => itm.component === component && itm.claim === claim);
        if (match) {
            return match;
        }
    }

    return null;
}


// originalNutrientAmount = original nutrient value as per nutrition label
// component = energy, fat, saturated fat, cholesterol, sugars, sodium, protein, vitamins and minerals, dietary fiber
// foodState = Solids, Liquids, Powdered, Semi-solid, Frozen (the last 3 are considered Solids so effectively there are only two states)
export function FAONutrientContentClaim(component, originalNutrientAmount, nutrientPercentage, originalServingSize, foodState, fao_nutrient_content_claims, calories = null, saturated_fat = null)
{
    const normalized_food_state = normalizeFoodState(foodState);
    const newServingSize = 100; // 100g
    const normalized_nutrient_amount = modifyServingSize(originalServingSize, newServingSize, originalNutrientAmount);

    if (component === 'energy') {

        const low_energy_condition = extractFAOClaimReferenceValue(fao_nutrient_content_claims, 'energy', 'low');
      
        if (normalized_nutrient_amount <= low_energy_condition.value) {
            return 'low';
        }

        const free_energy_condition = extractFAOClaimReferenceValue(fao_nutrient_content_claims, 'energy', 'free');
      
        if (normalized_food_state === 'liquid' && normalized_nutrient_amount <= free_energy_condition.value) {
            return 'free';
        }
    } else if (component === 'total fat') {
        const low_fat_condition = extractFAOClaimReferenceValue(fao_nutrient_content_claims, 'fat', 'low');
       
        if (normalized_nutrient_amount <= low_fat_condition.value) {
            return 'low';
        }

        const free_fat_condition = extractFAOClaimReferenceValue(fao_nutrient_content_claims, 'fat', 'free');
       
        if (normalized_nutrient_amount <= free_fat_condition.value) {
            return 'free';
        }
    } else if (component === 'sugar') {
        const free_sugar_condition = extractFAOClaimReferenceValue(fao_nutrient_content_claims, 'sugars', 'free');
      
        if (normalized_nutrient_amount <= free_sugar_condition.value) {
            return 'free';
        }
    } else if (component === 'sodium') {
        const low_sodium_condition = extractFAOClaimReferenceValue(fao_nutrient_content_claims, 'sodium', 'low');
        
        if (normalized_nutrient_amount <= low_sodium_condition.value) {
            return 'low';
        }

        const very_low_sodium_condition = extractFAOClaimReferenceValue(fao_nutrient_content_claims, 'sodium', 'very low');
       
        if (normalized_nutrient_amount <= very_low_sodium_condition.value) {
            return 'very low';
        }

        const free_sodium_condition = extractFAOClaimReferenceValue(fao_nutrient_content_claims, 'sodium', 'free');
       
        if (normalized_nutrient_amount <= free_sodium_condition.value) {
            return 'free';
        } 
    } else if (component.startsWith('vitamin') || mineral_names.indexOf(component) !== -1) {
        const source_of_vitamins_and_minerals_condition = extractFAOClaimReferenceValue(fao_nutrient_content_claims, 'vitamins and minerals', 'source');
        const high_in_vitamins_and_minerals_condition = extractFAOClaimReferenceValue(fao_nutrient_content_claims, 'vitamins and minerals', 'high');

        const fao_claim = extractFAOClaim(fao_nutrient_content_claims, 'vitamins and minerals', 'source'); // note: doesn't matter what the claim is bec the ref value doesn't change
        const nutrient_reference_value = fao_claim.reference_values.find(itm => itm.nutrient === component);
      
        // normalized_nutrient_amount
        if (nutrient_reference_value) {
            const percentage_per_100g = calculatePercentage(normalized_nutrient_amount, nutrient_reference_value.daily_value); 
            if (percentage_per_100g > high_in_vitamins_and_minerals_condition) {
                return 'high';
            }
            
            // if nutrientPercentage is used, how to ensure that the percentage is expressed in 100g serving
            if (percentage_per_100g > source_of_vitamins_and_minerals_condition) {
                return 'source';
            }
        }

    } else if (component === 'dietary fiber') {
        const source_of_fiber_condition = extractFAOClaimReferenceValue(fao_nutrient_content_claims, 'dietary fiber', 'source');
        const high_in_fiber_condition = extractFAOClaimReferenceValue(fao_nutrient_content_claims, 'dietary fiber', 'high');

        if (normalized_nutrient_amount > high_in_fiber_condition.value) {
            return 'high';
        }

        if (normalized_nutrient_amount > source_of_fiber_condition.value) {
            return 'source';
        }
    } else if (component === 'protein') {
        const source_of_protein_condition = extractFAOClaimReferenceValue(fao_nutrient_content_claims, 'protein', 'source');
        const high_in_protein_condition = extractFAOClaimReferenceValue(fao_nutrient_content_claims, 'protein', 'high');

        if (nutrientPercentage > high_in_protein_condition.value) {
            return 'high';
        }  

        if (nutrientPercentage > source_of_protein_condition.value) {
            return 'source';
        }
    } else if (component === 'saturated fat') {

        const free_of_saturated_fat_condition = extractFAOClaimReferenceValue(fao_nutrient_content_claims, 'saturated fat', 'free');
        
        // get 10% of energy per 100g serving
        // multiply by 9 to get the kcal equivalent (there are 9 calories per gram of fat)
        // compare the two
        const calories_per_100g = modifyServingSize(originalServingSize, 100, calories);
        const ten_percent_of_total_energy = calories_per_100g * .10;
        const calories_per_gram_of_fat = 9;
        const saturated_fat_energy = normalized_nutrient_amount * calories_per_gram_of_fat;

        const low_saturated_fat_condition = extractFAOClaimReferenceValue(fao_nutrient_content_claims, 'saturated fat', 'low');
        const low_saturated_fat_condition_two = ten_percent_of_total_energy > saturated_fat_energy;

        if (normalized_nutrient_amount <= free_of_saturated_fat_condition.value) {
            return 'free';
        }

        if (normalized_nutrient_amount <= low_saturated_fat_condition.value && low_saturated_fat_condition_two) {
            return 'low';
        }

    } else if (component === 'cholesterol') {

        const free_of_cholesterol_condition = extractFAOClaimReferenceValue(fao_nutrient_content_claims, 'cholesterol', 'free');
        const low_saturated_fat_condition = extractFAOClaimReferenceValue(fao_nutrient_content_claims, 'saturated fat', 'low');

        const normalized_saturated_fat_amount = modifyServingSize(originalServingSize, 100, saturated_fat);

        const calories_per_100g = modifyServingSize(originalServingSize, 100, calories);
        const ten_percent_of_total_energy = calories_per_100g * .10;

        const calories_per_gram_of_fat = 9;
        const saturated_fat_energy = normalized_saturated_fat_amount * calories_per_gram_of_fat;
       
        const saturated_fat_condition = normalized_saturated_fat_amount <= low_saturated_fat_condition.value;
        const saturated_fat_condition_two = ten_percent_of_total_energy > saturated_fat_energy;

        if (normalized_nutrient_amount <= free_of_cholesterol_condition.value && saturated_fat_condition && saturated_fat_condition_two) {
            return 'free';
        }

        const low_cholesterol_condition = normalized_food_state === 'solid' ? 0.02 : 0.01;
        if (normalized_nutrient_amount <= low_cholesterol_condition) {
            return 'low';
        }
    }
}

function getValueAndUnit(text) {
    const matches = text.match(/^([\d.]+)(\D+)/);

    if (matches) {
        return {
            value: parseFloat(matches[1]),
            unit: matches[2]
        };
    }

    return {
        value: 1,
        unit: 'g'
    };
}


const sortOrder = [
    "total fat", "cholesterol", "sodium", 
    "total carbohydrates", "protein",
];

function isVitamin(name) {
    return name.startsWith("vitamin ");
} 

function isMineral(name) {
    return [
        "calcium",
        "iron",
        "potassium",
        "magnesium",
        "zinc",
        "selenium",
        "fluoride",
        "chloride",
        "chromium",
        "copper",
        "iodine",
        "manganese",
        "molybdenum",
        "phosphorus",
    ].includes(name);
}
  
export function sortNutrients(nutrients) {
    return nutrients.sort((a, b) => {
      const indexA = sortOrder.indexOf(a.name);
      const indexB = sortOrder.indexOf(b.name);
  
      const aIsVitamin = isVitamin(a.name);
      const bIsVitamin = isVitamin(b.name);
  
      const aIsMineral = isMineral(a.name);
      const bIsMineral = isMineral(b.name);
  
      // Sort based on explicit sortOrder
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1; // a is in sortOrder, so it comes first
      if (indexB !== -1) return 1;  // b is in sortOrder, so it comes first
  
      // Vitamins should always come before minerals
      if (aIsVitamin && bIsVitamin) return a.name.localeCompare(b.name); // Sort vitamins alphabetically
      if (aIsVitamin) return -1; // a is a vitamin, it comes first
      if (bIsVitamin) return 1;  // b is a vitamin, it comes first
  
      // Minerals should always come after vitamins, sorted alphabetically
      if (aIsMineral && bIsMineral) return a.name.localeCompare(b.name);
      if (aIsMineral) return -1; // a is a mineral, it comes before unlisted nutrients
      if (bIsMineral) return 1;  // b is a mineral, it comes before unlisted nutrients
  
      return 0; // Maintain order for unlisted nutrients
    });
  }


export function convertKjToKcal(value, unit)
{
    if (unit === 'kj') {
        return Math.round(value * 0.239);
    }

    return Math.round(value);
}