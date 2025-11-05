---
description: 'Comprehensive debugging guide with systematic troubleshooting strategies, diagnostic tools, common error patterns, and debugging techniques across multiple programming languages.'
mode: 'agent'
tools: ['problems', 'runCommands/terminalLastCommand', 'search/codebase', 'usages']
---

# Debug Like a Pro

Systematic debugging guide for identifying and fixing bugs efficiently. Focus on methodical investigation, not trial-and-error.

## Debugging Methodology

### 1. Reproduce the Bug
- **Identify Trigger**: Exact steps to reproduce
- **Environment**: OS, versions, configuration
- **Frequency**: Always, intermittent, race condition?
- **Isolation**: Minimum reproduction case

**Questions to Ask**:
- What changed recently? (Code, dependencies, environment)
- Does it happen in production, staging, or local only?
- Can you create a failing test case?
- Is there a pattern? (Time of day, specific users, data volume)

### 2. Gather Information
- **Error Messages**: Full stack traces, error codes
- **Logs**: Application logs, server logs, database logs
- **State**: Variable values, database state, network requests
- **Timeline**: When did it start? What events preceded it?

**Logging Best Practices**:
```javascript
// Bad: Vague logging
console.log('Error');

// Good: Contextual logging
console.error('Failed to fetch user', {
  userId,
  endpoint: '/api/users',
  statusCode: response.status,
  error: error.message,
  timestamp: new Date().toISOString()
});
```

### 3. Form Hypothesis
- **Root Cause Theory**: Why is this happening?
- **Prediction**: If theory is correct, what else should be true?
- **Test**: How can you validate or disprove the hypothesis?

**Example**:
- **Symptom**: API returns 500 error
- **Hypothesis**: Database connection pool exhausted
- **Prediction**: Database logs show max connections reached
- **Test**: Check connection count, increase pool size temporarily

### 4. Test Hypothesis
- **Isolate Variables**: Change one thing at a time
- **Binary Search**: Divide and conquer (comment out half the code)
- **Add Instrumentation**: Temporary logs, debugger breakpoints
- **Validate**: Did the fix solve the problem? Did it introduce new issues?

### 5. Fix and Verify
- **Minimal Change**: Smallest fix that solves the problem
- **Add Test**: Prevent regression
- **Document**: Comment why the bug occurred
- **Deploy**: Verify in production

## Debugging Tools

### Console/Print Debugging
**When**: Quick checks, unfamiliar codebases, logging infrastructure exists

```python
# Strategic logging
def process_payment(amount, user_id):
    print(f"[DEBUG] process_payment: amount={amount}, user_id={user_id}")
    
    balance = get_user_balance(user_id)
    print(f"[DEBUG] User balance: {balance}")
    
    if amount > balance:
        print(f"[DEBUG] Insufficient funds: {amount} > {balance}")
        raise InsufficientFundsError()
    
    # Process payment...
    print(f"[DEBUG] Payment processed successfully")
```

### Interactive Debugger
**When**: Complex control flow, async code, need to inspect state

**Python (pdb)**:
```python
import pdb

def calculate_total(items):
    total = 0
    for item in items:
        pdb.set_trace()  # Breakpoint here
        total += item['price'] * item['quantity']
    return total

# Commands:
# n (next): Execute next line
# s (step): Step into function
# c (continue): Continue to next breakpoint
# p variable: Print variable value
# l: List source code
# q: Quit debugger
```

**Node.js (built-in)**:
```javascript
// Run: node inspect app.js
debugger;  // Breakpoint

// Or use Chrome DevTools:
// Run: node --inspect-brk app.js
// Open: chrome://inspect
```

**Browser DevTools**:
```javascript
// Set breakpoint in Sources tab
// Or add to code:
debugger;

// Console commands:
// Step over (F10), Step into (F11), Step out (Shift+F11)
// Watch expressions, Call stack, Scope variables
```

### Network Debugging
**Tools**:
- **Browser DevTools Network Tab**: Request/response inspection
- **Postman/Insomnia**: API testing
- **curl**: Command-line HTTP client
- **Wireshark**: Packet-level analysis

**Example**:
```bash
# Test API endpoint
curl -v https://api.example.com/users/123 \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json"

# Output shows:
# > Request headers
# < Response headers
# Response body
```

### Database Debugging
**PostgreSQL**:
```sql
-- Enable query logging
ALTER DATABASE mydb SET log_statement = 'all';

-- Explain query plan
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id)
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.name;

-- Check locks
SELECT * FROM pg_locks WHERE NOT granted;

-- Active queries
SELECT pid, query, state, query_start
FROM pg_stat_activity
WHERE state != 'idle';
```

**MySQL**:
```sql
-- Slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Explain query
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';

-- Show processlist
SHOW FULL PROCESSLIST;
```

### Performance Profiling
**JavaScript (Chrome DevTools)**:
1. Open DevTools > Performance tab
2. Click Record
3. Perform slow operation
4. Stop recording
5. Analyze flame graph (find long-running functions)

**Python (cProfile)**:
```python
import cProfile
import pstats

cProfile.run('slow_function()', 'profile_stats')

# Analyze results
stats = pstats.Stats('profile_stats')
stats.sort_stats('cumulative')
stats.print_stats(10)  # Top 10 slowest functions
```

### Memory Debugging
**Node.js (Heap Snapshot)**:
```javascript
// In Chrome DevTools:
// 1. Take heap snapshot before operation
// 2. Perform operation
// 3. Take another snapshot
// 4. Compare snapshots to find leaks

// Or use CLI:
node --expose-gc --inspect app.js
```

**Python (memory_profiler)**:
```python
from memory_profiler import profile

@profile
def memory_intensive_function():
    data = [i for i in range(1000000)]
    # ...

# Run: python -m memory_profiler script.py
```

## Common Bug Patterns

### Off-by-One Errors
```python
# Bug: Missing last element
for i in range(len(items) - 1):  # Wrong!
    process(items[i])

# Fix
for i in range(len(items)):
    process(items[i])

# Or better
for item in items:
    process(item)
```

### Race Conditions
```javascript
// Bug: Race condition
let balance = await getBalance(userId);
balance -= amount;
await setBalance(userId, balance);
// Problem: Another request could modify balance between read and write

// Fix: Atomic update
await db.query(
  'UPDATE accounts SET balance = balance - $1 WHERE user_id = $2',
  [amount, userId]
);
```

### Null/Undefined Issues
```javascript
// Bug: Unsafe property access
const userName = user.profile.name;  // Crashes if user.profile is null

// Fix: Optional chaining
const userName = user?.profile?.name ?? 'Anonymous';
```

### Type Coercion Bugs
```javascript
// Bug: String concatenation instead of addition
const total = "10" + 5;  // "105"

// Fix: Explicit conversion
const total = Number("10") + 5;  // 15

// Or use TypeScript for compile-time checks
```

### Floating Point Precision
```javascript
// Bug: Precision error
0.1 + 0.2 === 0.3  // false! (0.30000000000000004)

// Fix: Use integer arithmetic or library
const total = Math.round((0.1 + 0.2) * 100) / 100;

// Or use decimal library
import Decimal from 'decimal.js';
new Decimal(0.1).plus(0.2).equals(0.3);  // true
```

### Async/Await Errors
```javascript
// Bug: Missing await
async function fetchUsers() {
  const users = getUsersFromDB();  // Returns Promise, not users!
  return users.map(u => u.name);   // Crashes
}

// Fix: Add await
async function fetchUsers() {
  const users = await getUsersFromDB();
  return users.map(u => u.name);
}
```

### Resource Leaks
```python
# Bug: File not closed on exception
file = open('data.txt')
data = file.read()
process(data)
file.close()  # Never reached if process() throws

# Fix: Use context manager
with open('data.txt') as file:
    data = file.read()
    process(data)
# Automatically closed even on exception
```

## Error Message Decoding

### Stack Traces
```
Error: Cannot read property 'name' of undefined
    at getUserName (users.js:15:20)
    at processRequest (api.js:42:15)
    at async Server.handler (server.js:28:5)
```

**Reading Strategy**:
1. **Error Type**: `TypeError` (property access on undefined)
2. **Message**: `Cannot read property 'name' of undefined`
3. **Origin**: `users.js:15:20` (line 15, column 20)
4. **Call Chain**: processRequest → getUserName (trace upward for context)

### HTTP Status Codes
- **400 Bad Request**: Invalid input, validate request body
- **401 Unauthorized**: Missing/invalid authentication
- **403 Forbidden**: Valid auth but insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: State conflict (duplicate email, stale version)
- **500 Internal Server Error**: Server-side crash, check logs
- **503 Service Unavailable**: Overloaded or maintenance

### Database Errors
- **Unique constraint violation**: Duplicate key (check indexes)
- **Foreign key constraint**: Referenced record doesn't exist
- **Deadlock detected**: Transaction conflict (retry with backoff)
- **Connection timeout**: Pool exhausted or network issue

## Debugging Checklist

### Before You Start
- [ ] Can you reproduce the bug reliably?
- [ ] Do you have the full error message and stack trace?
- [ ] What changed recently (code, config, data)?
- [ ] Does it work in a different environment?

### Investigation
- [ ] Read error message carefully (full stack trace)
- [ ] Check logs (application, database, server)
- [ ] Verify assumptions (data types, null checks, API contracts)
- [ ] Isolate the problem (binary search, minimal reproduction)
- [ ] Form hypothesis (root cause theory)

### Testing
- [ ] Add temporary logging at key points
- [ ] Use debugger to inspect state
- [ ] Create failing test case
- [ ] Test hypothesis (change one variable)
- [ ] Verify fix solves problem without side effects

### After Fix
- [ ] Add regression test
- [ ] Remove debug logging
- [ ] Document the bug (comment or commit message)
- [ ] Verify in staging/production
- [ ] Share learnings with team

## Advanced Techniques

### Binary Search Debugging
```bash
# Find which commit introduced bug
git bisect start
git bisect bad HEAD
git bisect good v1.2.0

# Test each commit git suggests
# Mark as good/bad until culprit found
git bisect good  # or git bisect bad
```

### Rubber Duck Debugging
Explain the problem out loud to a rubber duck (or colleague):
1. **What should happen**: Expected behavior
2. **What actually happens**: Observed behavior
3. **Walk through code**: Line by line explanation
4. Often you'll spot the bug while explaining

### Time-Travel Debugging
**Tools**: rr (Linux), WinDbg (Windows)

Record execution, then replay:
```bash
rr record ./my-program
rr replay  # Step backward through execution
```

## Debugging Mindset

### Do
- ✅ Read error messages completely
- ✅ Form hypotheses before changing code
- ✅ Change one thing at a time
- ✅ Document what you've tried
- ✅ Take breaks (fresh perspective helps)
- ✅ Ask for help (explain problem clearly)

### Don't
- ❌ Randomly change code hoping it works
- ❌ Ignore error messages
- ❌ Skip reading documentation
- ❌ Make multiple changes simultaneously
- ❌ Give up too quickly (or persist too long without help)

Remember: Every bug is an opportunity to learn. Understand *why* it happened, not just *how* to fix it.

---

**Source**: [Debug Like a Pro - awesome-copilot](https://github.com/github/awesome-copilot/blob/main/prompts/debug-like-a-pro.prompt.md)
