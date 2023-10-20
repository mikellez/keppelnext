// This func returns the select portion of the query. See https://www.postgresql.org/docs/current/fuzzystrmatch.html 
// Basically this calculates the Levenshtein distance between the search term and the respective column values
const fuzzySearchSelectQuery = (columns, searchTerm) => {
    if(searchTerm === ""){
        return ``;
    }
    const distanceColumns = columns.map((col) => `LEVENSHTEIN(LOWER(${col}), LOWER('${searchTerm}'))`).join(' + ');
  
    return `
        ${distanceColumns} AS similarity_score
    `;
  };
// This func returns the where clause of the query.
const fuzzySearchWhereQuery = (columns, searchTerm) => {
    if(searchTerm === ""){
        return ``;
    }
    const distanceConditions = columns.map((col) => `LEVENSHTEIN(LOWER(${col}), LOWER('${searchTerm}')) <= 2`).join(' OR ');
    // Note that two opening brackets (( are used as it should be combined with the original search condition query. These conditions are
    // Only for checking based on fuzzy matching
    return `
        AND ((${distanceConditions})
    `;
  };
// This func returns the order by query. Similarity score represents how similar the 2 strings are based on the levenshtein distance 
// calculated. Higher score = more similar
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