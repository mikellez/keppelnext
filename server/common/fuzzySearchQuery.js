const fuzzySearchSelectQuery = (columns, searchTerm) => {
    if(searchTerm === ""){
        return ``;
    }
    const distanceColumns = columns.map((col) => `LEVENSHTEIN(LOWER(${col}), LOWER('${searchTerm}'))`).join(' + ');
  
    return `
        ${distanceColumns} AS similarity_score
    `;
  };

const fuzzySearchWhereQuery = (columns, searchTerm) => {
    if(searchTerm === ""){
        return ``;
    }
    const distanceConditions = columns.map((col) => `LEVENSHTEIN(LOWER(${col}), LOWER('${searchTerm}')) <= 2`).join(' OR ');
  
    return `
        AND ((${distanceConditions})
    `;
  };

const fuzzySearchOrderByQuery = (searchTerm) => {
    if(searchTerm === ""){
        return ``;
    }
    return `
        ORDER BY similarity_score
    `;
  };
module.exports = {
    fuzzySearchSelectQuery,
    fuzzySearchWhereQuery,
    fuzzySearchOrderByQuery,
};