/**
 * SQL Minifier utility that safely removes comments and unnecessary whitespace
 * while preserving string literals and essential SQL syntax
 */

/**
 * Minifies SQL by removing comments and unnecessary whitespace while preserving string literals
 */
export function minifySQL(sql: string): string {
  if (typeof sql !== 'string') {
    throw new Error('Input must be a string');
  }
  
  if (sql.trim() === '') {
    return '';
  }
  
  try {
    let result = '';
    let i = 0;
    
    while (i < sql.length) {
      const char = sql[i];
      
      // Handle single-quoted strings
      if (char === "'") {
        let stringContent = "'";
        i++; // skip opening quote
        
        while (i < sql.length) {
          stringContent += sql[i];
          if (sql[i] === "'") {
            // Check if it's escaped (doubled quote)
            if (i + 1 < sql.length && sql[i + 1] === "'") {
              i++; // skip first quote
              stringContent += sql[i]; // add second quote
            } else {
              // End of string
              break;
            }
          }
          i++;
        }
        
        result += stringContent;
        i++;
        continue;
      }
      
      // Handle double-quoted strings
      if (char === '"') {
        let stringContent = '"';
        i++; // skip opening quote
        
        while (i < sql.length) {
          stringContent += sql[i];
          if (sql[i] === '"') {
            // Check if it's escaped (doubled quote)
            if (i + 1 < sql.length && sql[i + 1] === '"') {
              i++; // skip first quote
              stringContent += sql[i]; // add second quote
            } else {
              // End of string
              break;
            }
          }
          i++;
        }
        
        result += stringContent;
        i++;
        continue;
      }
      
      // Handle multi-line comments /* ... */
      if (char === '/' && i + 1 < sql.length && sql[i + 1] === '*') {
        i += 2; // skip /*
        
        // Find closing */ or end of string
        let found = false;
        while (i < sql.length - 1) {
          if (sql[i] === '*' && sql[i + 1] === '/') {
            i += 2; // skip */
            found = true;
            break;
          }
          i++;
        }
        
        // If we didn't find closing */, we consumed everything to the end
        if (!found) {
          i = sql.length;
        }
        
        // Add space if we removed a comment between words
        if (result.length > 0 && /\w/.test(result.slice(-1))) {
          // Look ahead to see if next non-whitespace character is a word character
          let j = i;
          while (j < sql.length && /\s/.test(sql[j])) {
            j++;
          }
          if (j < sql.length && /\w/.test(sql[j])) {
            result += ' ';
          }
        }
        continue;
      }
      
      // Handle single-line comments --
      if (char === '-' && i + 1 < sql.length && sql[i + 1] === '-') {
        // Find end of line or end of string
        while (i < sql.length && sql[i] !== '\n' && sql[i] !== '\r') {
          i++;
        }
        
        // Add space if we removed a comment between words and there's more content
        if (result.length > 0 && /\w/.test(result.slice(-1))) {
          // Look ahead to see if there's more content after the newline
          let j = i;
          while (j < sql.length && /[\r\n\s]/.test(sql[j])) {
            j++;
          }
          if (j < sql.length && /\w/.test(sql[j])) {
            result += ' ';
          }
        }
        continue;
      }
      
      // Handle regular characters and whitespace
      if (/\s/.test(char)) {
        // Replace multiple whitespace characters with single space
        // but only if we don't already have a space at the end
        if (result.length > 0 && !result.endsWith(' ')) {
          result += ' ';
        }
        
        // Skip additional whitespace
        while (i + 1 < sql.length && /\s/.test(sql[i + 1])) {
          i++;
        }
      } else {
        // Regular character
        result += char;
      }
      
      i++;
    }
    
    // Final cleanup
    return result.trim();
  } catch (error) {
    throw new Error(`Failed to minify SQL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates that the input is a valid string for SQL minification
 */
export function validateSQLInput(input: string): { isValid: boolean; error?: string } {
  if (typeof input !== 'string') {
    return { isValid: false, error: 'Input must be a string' };
  }
  
  if (input.trim() === '') {
    return { isValid: false, error: 'Input cannot be empty' };
  }
  
  // Basic validation - check for unmatched quotes
  let singleQuoteCount = 0;
  let doubleQuoteCount = 0;
  let i = 0;
  
  while (i < input.length) {
    if (input[i] === "'") {
      if (i + 1 < input.length && input[i + 1] === "'") {
        // Skip escaped quote
        i += 2;
      } else {
        singleQuoteCount++;
        i++;
      }
    } else if (input[i] === '"') {
      if (i + 1 < input.length && input[i + 1] === '"') {
        // Skip escaped quote
        i += 2;
      } else {
        doubleQuoteCount++;
        i++;
      }
    } else {
      i++;
    }
  }
  
  if (singleQuoteCount % 2 !== 0) {
    return { isValid: false, error: 'Unmatched single quote' };
  }
  
  if (doubleQuoteCount % 2 !== 0) {
    return { isValid: false, error: 'Unmatched double quote' };
  }
  
  return { isValid: true };
}