import { minifySQL, validateSQLInput } from './sql-minifier.utils';

describe('sql-minifier.utils', () => {
  describe('minifySQL', () => {
    test('should handle basic SQL without comments', () => {
      const input = 'SELECT   *   FROM   users   WHERE   id = 1';
      const expected = 'SELECT * FROM users WHERE id = 1';
      expect(minifySQL(input)).toBe(expected);
    });

    test('should remove single-line comments', () => {
      const input = `SELECT * FROM users -- this is a comment
WHERE id = 1`;
      const expected = 'SELECT * FROM users WHERE id = 1';
      expect(minifySQL(input)).toBe(expected);
    });

    test('should remove multi-line comments', () => {
      const input = `SELECT * /* this is a
multi-line comment */ FROM users WHERE id = 1`;
      const expected = 'SELECT * FROM users WHERE id = 1';
      expect(minifySQL(input)).toBe(expected);
    });

    test('should preserve strings with spaces', () => {
      const input = `SELECT 'hello   world' FROM users WHERE name = 'John   Doe'`;
      const expected = `SELECT 'hello   world' FROM users WHERE name = 'John   Doe'`;
      expect(minifySQL(input)).toBe(expected);
    });

    test('should not remove double dashes inside strings', () => {
      const input = `SELECT 'this -- is not a comment' FROM users`;
      const expected = `SELECT 'this -- is not a comment' FROM users`;
      expect(minifySQL(input)).toBe(expected);
    });

    test('should handle single quotes inside double quotes', () => {
      const input = `SELECT "It's a test" FROM users`;
      const expected = `SELECT "It's a test" FROM users`;
      expect(minifySQL(input)).toBe(expected);
    });

    test('should handle double quotes inside single quotes', () => {
      const input = `SELECT 'He said "hello"' FROM users`;
      const expected = `SELECT 'He said "hello"' FROM users`;
      expect(minifySQL(input)).toBe(expected);
    });

    test('should handle escaped quotes in strings', () => {
      const input = `SELECT 'It''s a test' FROM users WHERE name = "John ""Big"" Doe"`;
      const expected = `SELECT 'It''s a test' FROM users WHERE name = "John ""Big"" Doe"`;
      expect(minifySQL(input)).toBe(expected);
    });

    test('should handle complex query with mixed content', () => {
      const input = `
        SELECT 
          u.name,  -- user name
          u.email,
          p.title /* post title */
        FROM users u
        JOIN posts p ON u.id = p.user_id
        WHERE u.name = 'John -- not a comment'
          AND p.created_at > '2023-01-01'
          /* AND p.status = 'published' -- this is commented out */
      `;
      const expected = `SELECT u.name, u.email, p.title FROM users u JOIN posts p ON u.id = p.user_id WHERE u.name = 'John -- not a comment' AND p.created_at > '2023-01-01'`;
      expect(minifySQL(input)).toBe(expected);
    });

    test('should handle comments at end of line correctly', () => {
      const input = `SELECT * FROM users WHERE id = 1 -- comment`;
      const expected = 'SELECT * FROM users WHERE id = 1';
      expect(minifySQL(input)).toBe(expected);
    });

    test('should handle comments in middle of line', () => {
      const input = `SELECT * /* comment */ FROM users`;
      const expected = 'SELECT * FROM users';
      expect(minifySQL(input)).toBe(expected);
    });

    test('should handle multiple consecutive comments', () => {
      const input = `SELECT * -- comment1
-- comment2  
FROM users /* comment3 */ /* comment4 */`;
      const expected = 'SELECT * FROM users';
      expect(minifySQL(input)).toBe(expected);
    });

    test('should preserve necessary whitespace around operators', () => {
      const input = `SELECT * FROM users WHERE id=1 AND name<>'test'`;
      const expected = `SELECT * FROM users WHERE id=1 AND name<>'test'`;
      expect(minifySQL(input)).toBe(expected);
    });

    test('should handle empty input', () => {
      expect(minifySQL('')).toBe('');
      expect(minifySQL('   ')).toBe('');
    });

    test('should handle input with only comments', () => {
      const input = `-- just a comment
/* another comment */`;
      expect(minifySQL(input)).toBe('');
    });

    test('should throw error for non-string input', () => {
      expect(() => minifySQL(null as unknown as string)).toThrow('Input must be a string');
      expect(() => minifySQL(undefined as unknown as string)).toThrow('Input must be a string');
      expect(() => minifySQL(123 as unknown as string)).toThrow('Input must be a string');
    });

    test('should handle nested comment-like patterns in strings', () => {
      const input = `SELECT 'Price: $/* not a comment */' FROM products`;
      const expected = `SELECT 'Price: $/* not a comment */' FROM products`;
      expect(minifySQL(input)).toBe(expected);
    });

    test('should handle SQL with line breaks and tabs', () => {
      const input = `SELECT\t*\nFROM\tusers\n\tWHERE\tid = 1`;
      const expected = 'SELECT * FROM users WHERE id = 1';
      expect(minifySQL(input)).toBe(expected);
    });

    test('should handle malformed comments gracefully', () => {
      // Unclosed multi-line comment should be treated as comment to end of string
      const input = `SELECT * FROM users /* unclosed comment`;
      const expected = 'SELECT * FROM users';
      expect(minifySQL(input)).toBe(expected);
    });

    test('should preserve strings with newlines', () => {
      const input = `SELECT 'line1\nline2' FROM users`;
      const expected = `SELECT 'line1\nline2' FROM users`;
      expect(minifySQL(input)).toBe(expected);
    });

    test('should handle multiple single-line comments on same line', () => {
      const input = `SELECT * FROM users -- comment1 -- comment2`;
      const expected = 'SELECT * FROM users';
      expect(minifySQL(input)).toBe(expected);
    });
  });

  describe('validateSQLInput', () => {
    test('should validate correct string input', () => {
      const result = validateSQLInput('SELECT * FROM users');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject non-string input', () => {
      const result = validateSQLInput(123 as unknown as string);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Input must be a string');
    });

    test('should reject empty input', () => {
      const result = validateSQLInput('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Input cannot be empty');
    });

    test('should reject whitespace-only input', () => {
      const result = validateSQLInput('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Input cannot be empty');
    });

    test('should validate input with comments', () => {
      const result = validateSQLInput('SELECT * FROM users -- comment');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should validate input with strings containing special characters', () => {
      const result = validateSQLInput(`SELECT 'test -- not comment' FROM users`);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});