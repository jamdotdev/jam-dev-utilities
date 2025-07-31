import { minifySQL, validateSQLInput } from "./sql-minifier.utils";

const COMPLEX_SQL_QUERY = `
WITH RECURSIVE employee_hierarchy AS (
    -- Anchor member: top-level employees
    SELECT
        e.employee_id,
        e.first_name || ' ' || e.last_name AS full_name, -- Concatenate names
        e.manager_id,
        e.department_id,
        0 AS level,
        CAST(e.employee_id AS VARCHAR(1000)) AS path
    FROM
        employees e
    WHERE
        e.manager_id IS NULL -- Top level employees have no manager

    UNION ALL

    -- Recursive member: employees with managers
    SELECT
        e.employee_id,
        e.first_name || ' ' || e.last_name,
        e.manager_id,
        e.department_id,
        eh.level + 1,
        eh.path || ' -> ' || CAST(e.employee_id AS VARCHAR(1000))
    FROM
        employees e
        INNER JOIN employee_hierarchy eh ON e.manager_id = eh.employee_id
    WHERE
        eh.level < 10 -- Prevent infinite recursion
),

-- CTE for department statistics
department_stats AS (
    SELECT
        d.department_id,
        d.department_name,
        COUNT(DISTINCT e.employee_id) AS employee_count,
        AVG(e.salary) AS avg_salary,
        MIN(e.hire_date) AS earliest_hire,
        MAX(e.hire_date) AS latest_hire,
        /* Calculate salary ranges */
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY e.salary) AS salary_q1,
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY e.salary) AS salary_median,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY e.salary) AS salary_q3
    FROM
        departments d
        LEFT JOIN employees e ON d.department_id = e.department_id
    WHERE
        e.is_active = TRUE -- Only active employees
        AND e.hire_date >= '2020-01-01'::DATE
    GROUP BY
        d.department_id,
        d.department_name
),

-- CTE for project allocations
project_allocations AS (
    SELECT
        p.project_id,
        p.project_name,
        pa.employee_id,
        pa.allocation_percentage,
        pa.start_date,
        pa.end_date,
        -- Complex date calculations
        CASE
            WHEN pa.end_date IS NULL THEN CURRENT_DATE - pa.start_date
            ELSE pa.end_date - pa.start_date
        END AS days_on_project,
        -- Nested CASE for status
        CASE
            WHEN pa.end_date IS NULL THEN
                CASE
                    WHEN p.status = 'ACTIVE' THEN 'ONGOING'
                    WHEN p.status = 'PAUSED' THEN 'PAUSED'
                    ELSE 'UNKNOWN'
                END
            WHEN pa.end_date < CURRENT_DATE THEN 'COMPLETED'
            ELSE 'SCHEDULED'
        END AS allocation_status
    FROM
        projects p
        INNER JOIN project_assignments pa ON p.project_id = pa.project_id
    WHERE
        p.budget > 100000 -- High-value projects only
        AND (
            pa.end_date IS NULL
            OR pa.end_date >= DATEADD(MONTH, -6, CURRENT_DATE)
        )
)

-- Main query combining all CTEs
SELECT
    eh.employee_id,
    eh.full_name,
    eh.level AS hierarchy_level,
    eh.path AS reporting_path,
    ds.department_name,
    ds.employee_count AS dept_employee_count,
    ROUND(ds.avg_salary, 2) AS dept_avg_salary,

    -- Subquery for individual employee salary comparison
    (
        SELECT
            ROUND(
                (e.salary - ds.avg_salary) / ds.avg_salary * 100,
                2
            )
        FROM
            employees e
        WHERE
            e.employee_id = eh.employee_id
    ) AS salary_variance_percentage,

    -- Correlated subquery for direct reports count
    (
        SELECT
            COUNT(*)
        FROM
            employees sub_e
        WHERE
            sub_e.manager_id = eh.employee_id
            AND sub_e.is_active = TRUE
    ) AS direct_reports_count,

    -- JSON aggregation of projects
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'project_id', pa.project_id,
            'project_name', pa.project_name,
            'allocation', pa.allocation_percentage,
            'days', pa.days_on_project,
            'status', pa.allocation_status
        ) ORDER BY pa.allocation_percentage DESC
    ) FILTER (WHERE pa.project_id IS NOT NULL) AS projects,

    -- Window functions for ranking
    RANK() OVER (
        PARTITION BY eh.department_id
        ORDER BY eh.level DESC, eh.employee_id
    ) AS dept_seniority_rank,

    DENSE_RANK() OVER (
        ORDER BY ds.avg_salary DESC
    ) AS dept_salary_rank,

    -- Running totals
    SUM(COALESCE(pa.allocation_percentage, 0)) OVER (
        PARTITION BY eh.employee_id
        ORDER BY pa.start_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_allocation

FROM
    employee_hierarchy eh
    INNER JOIN department_stats ds ON eh.department_id = ds.department_id
    LEFT JOIN project_allocations pa ON eh.employee_id = pa.employee_id

    -- Additional joins with complex conditions
    LEFT JOIN (
        SELECT
            employee_id,
            STRING_AGG(skill_name, ', ' ORDER BY proficiency_level DESC) AS skills
        FROM
            employee_skills es
            INNER JOIN skills s ON es.skill_id = s.skill_id
        WHERE
            proficiency_level >= 3
        GROUP BY
            employee_id
    ) AS emp_skills ON eh.employee_id = emp_skills.employee_id

WHERE
    -- Complex WHERE conditions
    eh.level <= 5
    AND ds.employee_count > 10
    AND (
        ds.avg_salary BETWEEN 50000 AND 200000
        OR eh.employee_id IN (
            SELECT
                employee_id
            FROM
                employee_awards
            WHERE
                award_date >= '2023-01-01'
        )
    )
    AND NOT EXISTS (
        SELECT
            1
        FROM
            employee_violations ev
        WHERE
            ev.employee_id = eh.employee_id
            AND ev.severity = 'HIGH'
    )

GROUP BY
    eh.employee_id,
    eh.full_name,
    eh.level,
    eh.path,
    eh.department_id,
    ds.department_name,
    ds.employee_count,
    ds.avg_salary,
    pa.allocation_percentage,
    pa.start_date

HAVING
    COUNT(DISTINCT pa.project_id) <= 5 -- Not overallocated
    OR SUM(pa.allocation_percentage) <= 120

ORDER BY
    eh.level ASC,
    ds.avg_salary DESC,
    eh.full_name ASC

LIMIT 100 OFFSET 0;`;

const MINIFIED_COMPLEX_SQL_QUERY = `WITH RECURSIVE employee_hierarchy AS ( SELECT e.employee_id, e.first_name || ' ' || e.last_name AS full_name, e.manager_id, e.department_id, 0 AS level, CAST(e.employee_id AS VARCHAR(1000)) AS path FROM employees e WHERE e.manager_id IS NULL UNION ALL SELECT e.employee_id, e.first_name || ' ' || e.last_name, e.manager_id, e.department_id, eh.level + 1, eh.path || ' -> ' || CAST(e.employee_id AS VARCHAR(1000)) FROM employees e INNER JOIN employee_hierarchy eh ON e.manager_id = eh.employee_id WHERE eh.level < 10 ), department_stats AS ( SELECT d.department_id, d.department_name, COUNT(DISTINCT e.employee_id) AS employee_count, AVG(e.salary) AS avg_salary, MIN(e.hire_date) AS earliest_hire, MAX(e.hire_date) AS latest_hire, PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY e.salary) AS salary_q1, PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY e.salary) AS salary_median, PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY e.salary) AS salary_q3 FROM departments d LEFT JOIN employees e ON d.department_id = e.department_id WHERE e.is_active = TRUE AND e.hire_date >= '2020-01-01'::DATE GROUP BY d.department_id, d.department_name ), project_allocations AS ( SELECT p.project_id, p.project_name, pa.employee_id, pa.allocation_percentage, pa.start_date, pa.end_date, CASE WHEN pa.end_date IS NULL THEN CURRENT_DATE - pa.start_date ELSE pa.end_date - pa.start_date END AS days_on_project, CASE WHEN pa.end_date IS NULL THEN CASE WHEN p.status = 'ACTIVE' THEN 'ONGOING' WHEN p.status = 'PAUSED' THEN 'PAUSED' ELSE 'UNKNOWN' END WHEN pa.end_date < CURRENT_DATE THEN 'COMPLETED' ELSE 'SCHEDULED' END AS allocation_status FROM projects p INNER JOIN project_assignments pa ON p.project_id = pa.project_id WHERE p.budget > 100000 AND ( pa.end_date IS NULL OR pa.end_date >= DATEADD(MONTH, -6, CURRENT_DATE) ) ) SELECT eh.employee_id, eh.full_name, eh.level AS hierarchy_level, eh.path AS reporting_path, ds.department_name, ds.employee_count AS dept_employee_count, ROUND(ds.avg_salary, 2) AS dept_avg_salary, ( SELECT ROUND( (e.salary - ds.avg_salary) / ds.avg_salary * 100, 2 ) FROM employees e WHERE e.employee_id = eh.employee_id ) AS salary_variance_percentage, ( SELECT COUNT(*) FROM employees sub_e WHERE sub_e.manager_id = eh.employee_id AND sub_e.is_active = TRUE ) AS direct_reports_count, JSON_AGG( JSON_BUILD_OBJECT( 'project_id', pa.project_id, 'project_name', pa.project_name, 'allocation', pa.allocation_percentage, 'days', pa.days_on_project, 'status', pa.allocation_status ) ORDER BY pa.allocation_percentage DESC ) FILTER (WHERE pa.project_id IS NOT NULL) AS projects, RANK() OVER ( PARTITION BY eh.department_id ORDER BY eh.level DESC, eh.employee_id ) AS dept_seniority_rank, DENSE_RANK() OVER ( ORDER BY ds.avg_salary DESC ) AS dept_salary_rank, SUM(COALESCE(pa.allocation_percentage, 0)) OVER ( PARTITION BY eh.employee_id ORDER BY pa.start_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW ) AS cumulative_allocation FROM employee_hierarchy eh INNER JOIN department_stats ds ON eh.department_id = ds.department_id LEFT JOIN project_allocations pa ON eh.employee_id = pa.employee_id LEFT JOIN ( SELECT employee_id, STRING_AGG(skill_name, ', ' ORDER BY proficiency_level DESC) AS skills FROM employee_skills es INNER JOIN skills s ON es.skill_id = s.skill_id WHERE proficiency_level >= 3 GROUP BY employee_id ) AS emp_skills ON eh.employee_id = emp_skills.employee_id WHERE eh.level <= 5 AND ds.employee_count > 10 AND ( ds.avg_salary BETWEEN 50000 AND 200000 OR eh.employee_id IN ( SELECT employee_id FROM employee_awards WHERE award_date >= '2023-01-01' ) ) AND NOT EXISTS ( SELECT 1 FROM employee_violations ev WHERE ev.employee_id = eh.employee_id AND ev.severity = 'HIGH' ) GROUP BY eh.employee_id, eh.full_name, eh.level, eh.path, eh.department_id, ds.department_name, ds.employee_count, ds.avg_salary, pa.allocation_percentage, pa.start_date HAVING COUNT(DISTINCT pa.project_id) <= 5 OR SUM(pa.allocation_percentage) <= 120 ORDER BY eh.level ASC, ds.avg_salary DESC, eh.full_name ASC LIMIT 100 OFFSET 0;`;

const COMPLEX_SQL_QUERY_2 = `
-- ====================================================================
-- SQL Minifier Torture Test
-- Purpose: To test the robustness of a SQL minifier with edge cases.
-- Features: Nested CTEs, Window Functions, Lateral Joins, JSONB,
--           XML, Arrays, Regex, Grouping Sets, and tricky comments.
-- ====================================================================

WITH
  -- CTE 1: User behavior analysis with window functions
  user_sessions AS (
    SELECT
      user_id,
      session_id,
      created_at,
      -- Calculate time difference between consecutive sessions for a user
      EXTRACT(EPOCH FROM (created_at - LAG(created_at, 1, created_at) OVER (PARTITION BY user_id ORDER BY created_at))) AS time_since_last_session,
      -- Rank sessions from newest to oldest
      ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as session_rank
    FROM sessions
    WHERE is_active = 'true' -- boolean as string
  ),

  -- CTE 2: Product inventory with complex CASE logic
  product_inventory AS (
    SELECT
      p.product_id,
      p.product_name,
      p.category_id,
      -- Multi-level nested CASE statement
      CASE
        WHEN w.region = 'EU' THEN
          CASE
            WHEN i.quantity < 10 THEN 'VERY LOW'
            WHEN i.quantity BETWEEN 10 AND 50 THEN 'LOW'
            ELSE 'STABLE'
          END
        WHEN w.region IN ('NA', 'APAC') THEN
          CASE
            WHEN i.quantity = 0 THEN 'OUT OF STOCK'
            ELSE 'IN STOCK'
          END
        ELSE 'UNSPECIFIED' /* Default catch-all */
      END AS inventory_status,
      i.quantity
    FROM products p
    JOIN inventory i ON p.product_id = i.product_id
    JOIN warehouses w ON i.warehouse_id = w.id
  ),

  -- CTE 3: Financial calculations with GROUPING SETS
  financial_summary AS (
    SELECT
      c.category_id,
      EXTRACT(YEAR FROM o.order_date) as order_year,
      EXTRACT(QUARTER FROM o.order_date) as order_quarter,
      -- Use GROUPING to identify aggregation level
      GROUPING(c.category_id, EXTRACT(YEAR FROM o.order_date), EXTRACT(QUARTER FROM o.order_date)) as grouping_level,
      SUM(oi.price * oi.quantity) as total_revenue,
      COUNT(DISTINCT o.order_id) as total_orders
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN products p ON oi.product_id = p.product_id
    JOIN categories c ON p.category_id = c.id
    GROUP BY
      GROUPING SETS (
        (c.category_id, EXTRACT(YEAR FROM o.order_date), EXTRACT(QUARTER FROM o.order_date)),
        (c.category_id, EXTRACT(YEAR FROM o.order_date)),
        (c.category_id),
        () -- Grand total
      )
  )

-- Main SELECT statement combining everything
SELECT
  u.id as user_id,
  u.email,
  us.time_since_last_session,
  pi.product_name,
  pi.inventory_status,

  -- Correlated subquery to get the date of the first order for the user
  (SELECT MIN(o.order_date) FROM orders o WHERE o.user_id = u.id) as first_order_date,

  -- Build a JSONB object with user details, including a nested array
  JSONB_BUILD_OBJECT(
    'user_id', u.id,
    'email_domain', SUBSTRING(u.email FROM '@(.*)$'),
    'tags', (SELECT ARRAY_AGG(t.tag_name) FROM user_tags ut JOIN tags t ON ut.tag_id = t.id WHERE ut.user_id = u.id),
    'metadata', u.metadata::jsonb -- Cast text to JSONB
  ) AS user_profile,

  -- Use a LATERAL join to get the top 2 products for each user
  lat.top_products,

  -- XML Generation just for fun
  XMLELEMENT(NAME "UserOrder", XMLATTRIBUTES(u.id as "id"),
    XMLFOREST(pi.product_name as "product", fs.total_revenue as "revenue")
  ) AS order_xml

FROM users u
-- Use the first CTE
JOIN user_sessions us ON u.id = us.user_id AND us.session_rank = 1 -- Only the latest session
-- Use the second CTE
CROSS JOIN product_inventory pi
-- Use the third CTE
LEFT JOIN financial_summary fs ON pi.category_id = fs.category_id
-- Use a LATERAL join
CROSS JOIN LATERAL (
  SELECT JSONB_AGG(p.product_name ORDER BY oi.quantity DESC) as top_products
  FROM orders o
  JOIN order_items oi ON o.order_id = oi.order_id
  JOIN products p ON oi.product_id = p.product_id
  WHERE o.user_id = u.id
  LIMIT 2
) lat

WHERE
  -- A complex WHERE clause
  u.created_at > '2022-01-01'::timestamp
  AND u.email ~* '^[A-Za-z0-9._%+-]+@google.com$' -- Regex for a specific domain
  AND pi.quantity > 0
  AND EXISTS ( -- Check if user has made at least one order
    SELECT 1 FROM orders o WHERE o.user_id = u.id
  )

INTERSECT -- Use a set operator

SELECT * FROM (VALUES
  (9999, 'test@google.com', 0, 'Test Product', 'STABLE', '2023-01-01'::date, '{}'::jsonb, '[]'::jsonb, '<xml/>'::xml)
) AS dummy_row(user_id, email, time_since_last_session, product_name, inventory_status, first_order_date, user_profile, top_products, order_xml)

ORDER BY
  u.email,
  pi.product_name DESC

LIMIT 50 OFFSET 10; -- Add final limit and offset
`;

const MINIFIED_COMPLEX_SQL_QUERY_2 = `WITH user_sessions AS ( SELECT user_id, session_id, created_at, EXTRACT(EPOCH FROM (created_at - LAG(created_at, 1, created_at) OVER (PARTITION BY user_id ORDER BY created_at))) AS time_since_last_session, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as session_rank FROM sessions WHERE is_active = 'true' ), product_inventory AS ( SELECT p.product_id, p.product_name, p.category_id, CASE WHEN w.region = 'EU' THEN CASE WHEN i.quantity < 10 THEN 'VERY LOW' WHEN i.quantity BETWEEN 10 AND 50 THEN 'LOW' ELSE 'STABLE' END WHEN w.region IN ('NA', 'APAC') THEN CASE WHEN i.quantity = 0 THEN 'OUT OF STOCK' ELSE 'IN STOCK' END ELSE 'UNSPECIFIED' END AS inventory_status, i.quantity FROM products p JOIN inventory i ON p.product_id = i.product_id JOIN warehouses w ON i.warehouse_id = w.id ), financial_summary AS ( SELECT c.category_id, EXTRACT(YEAR FROM o.order_date) as order_year, EXTRACT(QUARTER FROM o.order_date) as order_quarter, GROUPING(c.category_id, EXTRACT(YEAR FROM o.order_date), EXTRACT(QUARTER FROM o.order_date)) as grouping_level, SUM(oi.price * oi.quantity) as total_revenue, COUNT(DISTINCT o.order_id) as total_orders FROM orders o JOIN order_items oi ON o.order_id = oi.order_id JOIN products p ON oi.product_id = p.product_id JOIN categories c ON p.category_id = c.id GROUP BY GROUPING SETS ( (c.category_id, EXTRACT(YEAR FROM o.order_date), EXTRACT(QUARTER FROM o.order_date)), (c.category_id, EXTRACT(YEAR FROM o.order_date)), (c.category_id), () ) ) SELECT u.id as user_id, u.email, us.time_since_last_session, pi.product_name, pi.inventory_status, (SELECT MIN(o.order_date) FROM orders o WHERE o.user_id = u.id) as first_order_date, JSONB_BUILD_OBJECT( 'user_id', u.id, 'email_domain', SUBSTRING(u.email FROM '@(.*)$'), 'tags', (SELECT ARRAY_AGG(t.tag_name) FROM user_tags ut JOIN tags t ON ut.tag_id = t.id WHERE ut.user_id = u.id), 'metadata', u.metadata::jsonb ) AS user_profile, lat.top_products, XMLELEMENT(NAME "UserOrder", XMLATTRIBUTES(u.id as "id"), XMLFOREST(pi.product_name as "product", fs.total_revenue as "revenue") ) AS order_xml FROM users u JOIN user_sessions us ON u.id = us.user_id AND us.session_rank = 1 CROSS JOIN product_inventory pi LEFT JOIN financial_summary fs ON pi.category_id = fs.category_id CROSS JOIN LATERAL ( SELECT JSONB_AGG(p.product_name ORDER BY oi.quantity DESC) as top_products FROM orders o JOIN order_items oi ON o.order_id = oi.order_id JOIN products p ON oi.product_id = p.product_id WHERE o.user_id = u.id LIMIT 2 ) lat WHERE u.created_at > '2022-01-01'::timestamp AND u.email ~* '^[A-Za-z0-9._%+-]+@google.com$' AND pi.quantity > 0 AND EXISTS ( SELECT 1 FROM orders o WHERE o.user_id = u.id ) INTERSECT SELECT * FROM (VALUES (9999, 'test@google.com', 0, 'Test Product', 'STABLE', '2023-01-01'::date, '{}'::jsonb, '[]'::jsonb, '<xml/>'::xml) ) AS dummy_row(user_id, email, time_since_last_session, product_name, inventory_status, first_order_date, user_profile, top_products, order_xml) ORDER BY u.email, pi.product_name DESC LIMIT 50 OFFSET 10;`;

describe("sql-minifier.utils", () => {
  describe("minifySQL", () => {
    test("should minify complex SQL query", () => {
      const input = COMPLEX_SQL_QUERY;
      const expected = MINIFIED_COMPLEX_SQL_QUERY;
      expect(minifySQL(input)).toBe(expected);
    });

    test("should minify complex SQL query 2", () => {
      const input = COMPLEX_SQL_QUERY_2;
      const expected = MINIFIED_COMPLEX_SQL_QUERY_2;
      expect(minifySQL(input)).toBe(expected);
    });

    test("should handle basic SQL without comments", () => {
      const input = "SELECT   *   FROM   users   WHERE   id = 1";
      const expected = "SELECT * FROM users WHERE id = 1";
      expect(minifySQL(input)).toBe(expected);
    });

    test("should remove single-line comments", () => {
      const input = `SELECT * FROM users -- this is a comment
WHERE id = 1`;
      const expected = "SELECT * FROM users WHERE id = 1";
      expect(minifySQL(input)).toBe(expected);
    });

    test("should remove multi-line comments", () => {
      const input = `SELECT * /* this is a
multi-line comment */ FROM users WHERE id = 1`;
      const expected = "SELECT * FROM users WHERE id = 1";
      expect(minifySQL(input)).toBe(expected);
    });

    test("should preserve strings with spaces", () => {
      const input = `SELECT 'hello   world' FROM users WHERE name = 'John   Doe'`;
      const expected = `SELECT 'hello   world' FROM users WHERE name = 'John   Doe'`;
      expect(minifySQL(input)).toBe(expected);
    });

    test("should not remove double dashes inside strings", () => {
      const input = `SELECT 'this -- is not a comment' FROM users`;
      const expected = `SELECT 'this -- is not a comment' FROM users`;
      expect(minifySQL(input)).toBe(expected);
    });

    test("should handle single quotes inside double quotes", () => {
      const input = `SELECT "It's a test" FROM users`;
      const expected = `SELECT "It's a test" FROM users`;
      expect(minifySQL(input)).toBe(expected);
    });

    test("should handle double quotes inside single quotes", () => {
      const input = `SELECT 'He said "hello"' FROM users`;
      const expected = `SELECT 'He said "hello"' FROM users`;
      expect(minifySQL(input)).toBe(expected);
    });

    test("should handle escaped quotes in strings", () => {
      const input = `SELECT 'It''s a test' FROM users WHERE name = "John ""Big"" Doe"`;
      const expected = `SELECT 'It''s a test' FROM users WHERE name = "John ""Big"" Doe"`;
      expect(minifySQL(input)).toBe(expected);
    });

    test("should handle complex query with mixed content", () => {
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

    test("should handle comments at end of line correctly", () => {
      const input = `SELECT * FROM users WHERE id = 1 -- comment`;
      const expected = "SELECT * FROM users WHERE id = 1";
      expect(minifySQL(input)).toBe(expected);
    });

    test("should handle comments in middle of line", () => {
      const input = `SELECT * /* comment */ FROM users`;
      const expected = "SELECT * FROM users";
      expect(minifySQL(input)).toBe(expected);
    });

    test("should handle multiple consecutive comments", () => {
      const input = `SELECT * -- comment1
-- comment2
FROM users /* comment3 */ /* comment4 */`;
      const expected = "SELECT * FROM users";
      expect(minifySQL(input)).toBe(expected);
    });

    test("should preserve necessary whitespace around operators", () => {
      const input = `SELECT * FROM users WHERE id=1 AND name<>'test'`;
      const expected = `SELECT * FROM users WHERE id=1 AND name<>'test'`;
      expect(minifySQL(input)).toBe(expected);
    });

    test("should handle empty input", () => {
      expect(minifySQL("")).toBe("");
      expect(minifySQL("   ")).toBe("");
    });

    test("should handle input with only comments", () => {
      const input = `-- just a comment
/* another comment */`;
      expect(minifySQL(input)).toBe("");
    });

    test("should throw error for non-string input", () => {
      expect(() => minifySQL(null as unknown as string)).toThrow(
        "Input must be a string"
      );
      expect(() => minifySQL(undefined as unknown as string)).toThrow(
        "Input must be a string"
      );
      expect(() => minifySQL(123 as unknown as string)).toThrow(
        "Input must be a string"
      );
    });

    test("should handle nested comment-like patterns in strings", () => {
      const input = `SELECT 'Price: $/* not a comment */' FROM products`;
      const expected = `SELECT 'Price: $/* not a comment */' FROM products`;
      expect(minifySQL(input)).toBe(expected);
    });

    test("should handle SQL with line breaks and tabs", () => {
      const input = `SELECT\t*\nFROM\tusers\n\tWHERE\tid = 1`;
      const expected = "SELECT * FROM users WHERE id = 1";
      expect(minifySQL(input)).toBe(expected);
    });

    test("should handle malformed comments gracefully", () => {
      // Unclosed multi-line comment should be treated as comment to end of string
      const input = `SELECT * FROM users /* unclosed comment`;
      const expected = "SELECT * FROM users";
      expect(minifySQL(input)).toBe(expected);
    });

    test("should preserve strings with newlines", () => {
      const input = `SELECT 'line1\nline2' FROM users`;
      const expected = `SELECT 'line1\nline2' FROM users`;
      expect(minifySQL(input)).toBe(expected);
    });

    test("should handle multiple single-line comments on same line", () => {
      const input = `SELECT * FROM users -- comment1 -- comment2`;
      const expected = "SELECT * FROM users";
      expect(minifySQL(input)).toBe(expected);
    });
  });

  describe("validateSQLInput", () => {
    test("should validate correct string input", () => {
      const result = validateSQLInput("SELECT * FROM users");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test("should reject non-string input", () => {
      const result = validateSQLInput(123 as unknown as string);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Input must be a string");
    });

    test("should reject empty input", () => {
      const result = validateSQLInput("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Input cannot be empty");
    });

    test("should reject whitespace-only input", () => {
      const result = validateSQLInput("   ");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Input cannot be empty");
    });

    test("should validate input with comments", () => {
      const result = validateSQLInput("SELECT * FROM users -- comment");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test("should validate input with strings containing special characters", () => {
      const result = validateSQLInput(
        `SELECT 'test -- not comment' FROM users`
      );
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
