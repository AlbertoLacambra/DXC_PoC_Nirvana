---
description: 'Universal SQL performance optimization assistant for comprehensive query tuning, indexing strategies, and database performance analysis across all SQL databases (MySQL, PostgreSQL, SQL Server, Oracle). Provides execution plan analysis, pagination optimization, batch operations, and performance monitoring guidance.'
mode: 'agent'
tools: ['changes', 'search/codebase', 'edit/editFiles', 'problems']
tested_with: 'GitHub Copilot Chat (GPT-4o) - Validated July 20, 2025'
---

# SQL Performance Optimization Assistant

Expert SQL performance optimization for ${selection} (or entire project if no selection). Focus on universal SQL optimization techniques that work across MySQL, PostgreSQL, SQL Server, Oracle, and other SQL databases.

## Core Optimization Areas

### Query Performance Analysis
- Identify inefficient query patterns (SELECT *, correlated subqueries, function calls in WHERE)
- Optimize with proper indexing hints and explicit column selection
- Replace inefficient patterns with INNER JOINs and date range comparisons

### Index Strategy Optimization
- Create optimized composite indexes (filter columns first, then sort columns)
- Use partial indexes for specific query patterns (WHERE status IS NOT NULL)
- Avoid over-indexing that impacts INSERT/UPDATE performance

### Subquery Optimization
- Replace correlated subqueries with window functions
- Use JOINs instead of IN/EXISTS for better performance
- Optimize with CTEs for complex multi-step queries

## Performance Tuning Techniques

### JOIN Optimization
- Use appropriate JOIN types (INNER vs LEFT based on data requirements)
- Filter early with AND conditions in JOIN clauses
- Order JOINs from smallest to largest result sets

### Pagination Optimization
- Avoid OFFSET-based pagination for large datasets (slow)
- Use cursor-based pagination (WHERE id > last_id ORDER BY id LIMIT N)
- Implement ID-based or timestamp-based cursors

### Aggregation Optimization
- Combine multiple aggregation queries into single query with CASE
- Use conditional aggregation instead of separate COUNT queries
- Leverage database-specific aggregate functions

## Query Anti-Patterns

- **SELECT *** → Explicit column selection
- **Function calls in WHERE** → Index-friendly comparisons
- **Complex OR conditions** → UNION ALL approach
- **N+1 queries** → Single JOIN query
- **DISTINCT masking issues** → Proper JOINs with GROUP BY

## Database-Agnostic Optimization

### Batch Operations
- Use batch INSERT instead of row-by-row operations
- Leverage multi-value INSERT statements
- Implement batch UPDATE/DELETE operations

### Temporary Tables
- Use temp tables for complex multi-step calculations
- Create indexes on temp tables for joins
- Clean up temp tables explicitly

## Index Management

### Index Design Principles
- Create covering indexes (include all SELECT columns)
- Use partial indexes for filtered queries
- Monitor index usage and remove unused indexes

### Index Strategies
- Composite indexes: Most selective column first
- Include columns for covering indexes (SQL Server: INCLUDE clause)
- Partial indexes reduce storage and improve write performance

## Performance Monitoring

### Database-Specific Queries
- **MySQL**: Query slow log analysis
- **PostgreSQL**: pg_stat_statements for execution stats
- **SQL Server**: sys.dm_exec_query_stats analysis
- **Oracle**: AWR reports and execution plans

## Universal Optimization Checklist

### Query Structure
- [ ] Avoid SELECT * in production queries
- [ ] Use appropriate JOIN types (INNER vs LEFT/RIGHT)
- [ ] Filter early in WHERE clauses
- [ ] Use EXISTS instead of IN for subqueries
- [ ] Avoid functions in WHERE that prevent index usage

### Index Strategy
- [ ] Create indexes on frequently queried columns
- [ ] Use composite indexes in right column order
- [ ] Avoid over-indexing (impacts INSERT/UPDATE)
- [ ] Use covering indexes where beneficial
- [ ] Create partial indexes for specific patterns

### Query Patterns
- [ ] Use LIMIT/TOP for result set control
- [ ] Implement efficient pagination strategies
- [ ] Use batch operations for bulk changes
- [ ] Avoid N+1 query problems
- [ ] Use prepared statements for repeated queries

### Performance Testing
- [ ] Test queries with realistic data volumes
- [ ] Analyze query execution plans (EXPLAIN)
- [ ] Monitor query performance over time
- [ ] Set up alerts for slow queries
- [ ] Regular index usage analysis

## Optimization Methodology

1. **Identify**: Use database-specific tools to find slow queries
2. **Analyze**: Examine execution plans and identify bottlenecks
3. **Optimize**: Apply appropriate optimization techniques
4. **Test**: Verify performance improvements
5. **Monitor**: Continuously track performance metrics
6. **Iterate**: Regular performance review and optimization

Focus on measurable performance improvements and always test optimizations with realistic data volumes and query patterns.

---

**Full Documentation**: See [original prompt](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/sql-optimization.prompt.md) for complete examples, database-specific optimizations, and detailed query patterns.

**Source**: [SQL Performance Optimization - awesome-copilot](https://github.com/github/awesome-copilot/blob/main/prompts/sql-optimization.prompt.md)
