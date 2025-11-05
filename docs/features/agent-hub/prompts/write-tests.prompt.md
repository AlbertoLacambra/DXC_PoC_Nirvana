---
description: 'Implement comprehensive unit, integration, and end-to-end test suites following testing best practices with fixtures, mocks, and coverage requirements.'
mode: 'agent'
tools: ['changes', 'edit/editFiles', 'problems', 'usages']
---

# Write Tests

Implement comprehensive test suites for ${selection} (or entire project). Focus on correctness, maintainability, and coverage.

## Test Types

### 1. Unit Tests
**Purpose**: Test individual functions/classes in isolation

**Characteristics**:
- Fast execution (< 10ms per test)
- No external dependencies (filesystem, network, database)
- Predictable, deterministic results
- Test single responsibility

**Example** (JavaScript/Jest):
```javascript
describe('calculateTotal', () => {
  test('sums item prices correctly', () => {
    const items = [
      { price: 10.50, quantity: 2 },
      { price: 5.25, quantity: 3 }
    ];
    
    expect(calculateTotal(items)).toBe(36.75);
  });
  
  test('returns 0 for empty cart', () => {
    expect(calculateTotal([])).toBe(0);
  });
  
  test('handles decimal precision', () => {
    const items = [{ price: 0.1, quantity: 3 }];
    expect(calculateTotal(items)).toBeCloseTo(0.3, 2);
  });
});
```

### 2. Integration Tests
**Purpose**: Test component interactions and external dependencies

**Characteristics**:
- Medium execution time (100ms - 2s per test)
- Test database queries, API calls, file I/O
- Use test databases or mock services
- Verify data flows between components

**Example** (Node.js + PostgreSQL):
```javascript
describe('UserRepository', () => {
  let db;
  
  beforeAll(async () => {
    db = await setupTestDatabase();
  });
  
  afterEach(async () => {
    await db.query('TRUNCATE users CASCADE');
  });
  
  afterAll(async () => {
    await db.close();
  });
  
  test('creates user with hashed password', async () => {
    const repo = new UserRepository(db);
    const user = await repo.create({
      email: 'test@example.com',
      password: 'plaintext123'
    });
    
    expect(user.id).toBeDefined();
    expect(user.password).not.toBe('plaintext123');
    expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt hash
  });
  
  test('enforces unique email constraint', async () => {
    const repo = new UserRepository(db);
    await repo.create({ email: 'test@example.com', password: 'pass' });
    
    await expect(
      repo.create({ email: 'test@example.com', password: 'pass' })
    ).rejects.toThrow('Email already exists');
  });
});
```

### 3. End-to-End (E2E) Tests
**Purpose**: Test complete user workflows

**Characteristics**:
- Slow execution (5s - 30s per test)
- Full stack: UI, API, database
- Real browser or API client
- Cover critical user journeys

**Example** (Playwright):
```javascript
test('user can sign up and log in', async ({ page }) => {
  // Sign up
  await page.goto('https://app.example.com/signup');
  await page.fill('[name="email"]', 'newuser@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button:has-text("Sign Up")');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Welcome');
  
  // Log out
  await page.click('[aria-label="User menu"]');
  await page.click('text=Log Out');
  
  // Log in
  await page.goto('https://app.example.com/login');
  await page.fill('[name="email"]', 'newuser@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button:has-text("Log In")');
  
  await expect(page).toHaveURL('/dashboard');
});
```

## Testing Best Practices

### Test Structure (AAA Pattern)
```javascript
test('descriptive test name', () => {
  // Arrange: Set up test data and preconditions
  const input = { /* test data */ };
  const expected = { /* expected result */ };
  
  // Act: Execute the code under test
  const result = functionUnderTest(input);
  
  // Assert: Verify the outcome
  expect(result).toEqual(expected);
});
```

### Test Naming
**Good**:
- `test('throws error when email is invalid')`
- `test('calculates discount for premium members')`
- `test('returns 404 when user not found')`

**Bad**:
- `test('test1')` (not descriptive)
- `test('it works')` (too vague)
- `test('user')` (missing action/outcome)

### Edge Cases to Test
- **Boundary Values**: Empty, zero, max, min, negative
- **Invalid Inputs**: null, undefined, wrong types, malformed data
- **Error Conditions**: Network failures, timeouts, permissions
- **Concurrent Access**: Race conditions, locks, transactions
- **Large Datasets**: Performance, memory limits, pagination

### Mocking & Stubbing

**When to Mock**:
- External APIs (unpredictable, rate-limited, costly)
- Filesystem operations (slow, side effects)
- Database in unit tests (isolation, speed)
- Time-dependent code (dates, timers)

**Example** (Jest):
```javascript
// Mock external API
jest.mock('./weatherAPI');
const weatherAPI = require('./weatherAPI');

test('displays weather forecast', async () => {
  weatherAPI.getForecast.mockResolvedValue({
    temperature: 72,
    condition: 'Sunny'
  });
  
  const forecast = await getWeatherDisplay('San Francisco');
  
  expect(forecast).toBe('San Francisco: 72°F, Sunny');
  expect(weatherAPI.getForecast).toHaveBeenCalledWith('San Francisco');
});
```

### Test Fixtures & Factories

**Fixtures** (static test data):
```javascript
// fixtures/users.json
{
  "adminUser": {
    "id": "usr_admin",
    "email": "admin@example.com",
    "role": "admin"
  },
  "regularUser": {
    "id": "usr_001",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Factories** (dynamic test data):
```javascript
function createUser(overrides = {}) {
  return {
    id: `usr_${Date.now()}`,
    email: `user_${Math.random()}@example.com`,
    role: 'user',
    createdAt: new Date(),
    ...overrides
  };
}

test('deletes user', async () => {
  const user = createUser({ role: 'admin' });
  // Use user in test...
});
```

## Test Coverage

### Coverage Targets
- **Statements**: 80%+ (all code paths executed)
- **Branches**: 75%+ (all if/else paths tested)
- **Functions**: 90%+ (all functions called)
- **Lines**: 80%+ (all code lines executed)

### What to Prioritize
1. **Critical Path**: Core business logic, payment processing
2. **Complex Logic**: Algorithms, calculations, transformations
3. **Edge Cases**: Error handling, boundary conditions
4. **Bug-Prone Areas**: Code with high churn or frequent bugs
5. **Public APIs**: Exported functions, REST endpoints

### What to Skip
- Simple getters/setters
- Framework boilerplate
- Third-party library code
- Auto-generated code

## Test Organization

### File Structure
```
src/
  services/
    userService.ts
    userService.test.ts
  utils/
    validation.ts
    validation.test.ts
tests/
  integration/
    api/
      users.test.ts
    database/
      migrations.test.ts
  e2e/
    auth.spec.ts
    checkout.spec.ts
  fixtures/
    users.json
    products.json
  helpers/
    testDatabase.ts
    mockServices.ts
```

### Test Suites
```javascript
describe('UserService', () => {
  describe('create', () => {
    test('creates user with valid data');
    test('validates email format');
    test('hashes password');
    test('throws error for duplicate email');
  });
  
  describe('authenticate', () => {
    test('returns user for valid credentials');
    test('returns null for invalid password');
    test('returns null for non-existent user');
  });
});
```

## Common Patterns

### Testing Async Code
```javascript
// Promises
test('fetches user data', async () => {
  const user = await fetchUser(123);
  expect(user.name).toBe('John Doe');
});

// Callbacks
test('calls callback with result', (done) => {
  fetchUser(123, (err, user) => {
    expect(err).toBeNull();
    expect(user.name).toBe('John Doe');
    done();
  });
});
```

### Testing Errors
```javascript
test('throws error for invalid input', () => {
  expect(() => {
    parseDate('invalid-date');
  }).toThrow('Invalid date format');
});

test('rejects promise for network error', async () => {
  await expect(
    fetchData('https://invalid.url')
  ).rejects.toThrow('Network error');
});
```

### Testing Timers
```javascript
jest.useFakeTimers();

test('executes callback after delay', () => {
  const callback = jest.fn();
  scheduleTask(callback, 5000);
  
  expect(callback).not.toHaveBeenCalled();
  
  jest.advanceTimersByTime(5000);
  
  expect(callback).toHaveBeenCalledTimes(1);
});
```

### Snapshot Testing
```javascript
test('renders component correctly', () => {
  const tree = renderer.create(<UserProfile user={mockUser} />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

## Framework-Specific Examples

### Jest (JavaScript/TypeScript)
```javascript
describe('Calculator', () => {
  test('adds numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
  
  test.each([
    [1, 1, 2],
    [2, 3, 5],
    [10, -5, 5]
  ])('add(%i, %i) returns %i', (a, b, expected) => {
    expect(add(a, b)).toBe(expected);
  });
});
```

### pytest (Python)
```python
import pytest

def test_add():
    assert add(2, 3) == 5

@pytest.mark.parametrize("a,b,expected", [
    (1, 1, 2),
    (2, 3, 5),
    (10, -5, 5)
])
def test_add_parametrized(a, b, expected):
    assert add(a, b) == expected

@pytest.fixture
def user():
    return User(email='test@example.com')

def test_user_creation(user):
    assert user.email == 'test@example.com'
```

### JUnit (Java)
```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {
    @Test
    void testAdd() {
        assertEquals(5, Calculator.add(2, 3));
    }
    
    @Test
    void testDivideByZero() {
        assertThrows(ArithmeticException.class, () -> {
            Calculator.divide(10, 0);
        });
    }
}
```

## Test Checklist

- [ ] All new code has tests
- [ ] Tests follow AAA pattern
- [ ] Test names clearly describe scenario
- [ ] Edge cases covered (null, empty, boundary values)
- [ ] Error paths tested
- [ ] Mocks used appropriately (no unnecessary external calls)
- [ ] Tests are isolated (no shared state)
- [ ] Tests are deterministic (no flaky tests)
- [ ] Fast execution (< 10s for unit tests, < 2min for full suite)
- [ ] Coverage meets project standards (typically 80%+)

Focus on writing tests that catch real bugs and give confidence in refactoring. Avoid testing implementation details.

---

**Source**: [Write Tests - awesome-copilot](https://github.com/github/awesome-copilot/blob/main/prompts/write-tests.prompt.md)
