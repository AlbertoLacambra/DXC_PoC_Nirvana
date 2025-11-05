---
description: 'Instructions for writing Go code following idiomatic Go practices and community standards'
applyTo: '**/*.go, **/go.mod, **/go.sum'
---

# Go Development Instructions

Follow idiomatic Go practices and community standards when writing Go code. These instructions are based on Effective Go, Go Code Review Comments, and Google's Go Style Guide.

## General Instructions

- Write simple, clear, and idiomatic Go code
- Favor clarity and simplicity over cleverness
- Follow the principle of least surprise
- Keep the happy path left-aligned (minimize indentation)
- Return early to reduce nesting
- Prefer early return over if-else chains
- Make the zero value useful
- Write self-documenting code with clear, descriptive names
- Document exported types, functions, methods, and packages
- Use Go modules for dependency management
- Leverage the Go standard library instead of reinventing the wheel
- Write comments in English by default
- Avoid using emoji in code and comments

## Naming Conventions

### Packages

- Use lowercase, single-word package names
- Avoid underscores, hyphens, or mixedCaps
- Choose names that describe what the package provides, not what it contains
- Avoid generic names like `util`, `common`, or `base`
- Package names should be singular, not plural

### Package Declaration Rules (CRITICAL)

- **NEVER duplicate `package` declarations** - each Go file must have exactly ONE `package` line
- When editing an existing `.go` file, PRESERVE the existing `package` declaration
- When creating a new `.go` file, check what package name other files in the same directory use
- Write exactly one `package <name>` line at the very top of the file

### Variables and Functions

- Use mixedCaps or MixedCaps (camelCase) rather than underscores
- Keep names short but descriptive
- Use single-letter variables only for very short scopes
- Exported names start with a capital letter
- Unexported names start with a lowercase letter
- Avoid stuttering (e.g., avoid `http.HTTPServer`, prefer `http.Server`)

### Interfaces

- Name interfaces with -er suffix when possible (e.g., `Reader`, `Writer`, `Formatter`)
- Single-method interfaces should be named after the method
- Keep interfaces small and focused

### Constants

- Use MixedCaps for exported constants
- Use mixedCaps for unexported constants
- Group related constants using `const` blocks
- Consider using typed constants for better type safety

## Code Style and Formatting

### Formatting

- Always use `gofmt` to format code
- Use `goimports` to manage imports automatically
- Keep line length reasonable
- Add blank lines to separate logical groups of code

### Comments

- Strive for self-documenting code; prefer clear naming over comments
- Write comments only when necessary to explain complex logic or non-obvious behavior
- Write comments in complete sentences in English
- Start sentences with the name of the thing being described
- Package comments should start with "Package [name]"
- Document why, not what, unless the what is complex

### Error Handling

- Check errors immediately after the function call
- Don't ignore errors using `_` unless you have a good reason
- Wrap errors with context using `fmt.Errorf` with `%w` verb
- Create custom error types when you need to check for specific errors
- Place error returns as the last return value
- Name error variables `err`
- Keep error messages lowercase and don't end with punctuation

## Type Safety and Language Features

### Type Definitions

- Define types to add meaning and type safety
- Use struct tags for JSON, XML, database mappings
- Prefer explicit type conversions
- Use type assertions carefully and check the second return value
- Prefer generics over unconstrained types; use `any` instead of `interface{}` (Go 1.18+)

### Pointers vs Values

- Use pointer receivers for large structs or when you need to modify the receiver
- Use value receivers for small structs and when immutability is desired
- Be consistent within a type's method set
- Consider the zero value when choosing pointer vs value receivers

### Interfaces and Composition

- Accept interfaces, return concrete types
- Keep interfaces small (1-3 methods is ideal)
- Use embedding for composition
- Define interfaces close to where they're used
- Don't export interfaces unless necessary

## Concurrency

### Goroutines

- Be cautious about creating goroutines in libraries
- Always know how a goroutine will exit
- Use `sync.WaitGroup` or channels to wait for goroutines
- Avoid goroutine leaks by ensuring cleanup

### Channels

- Use channels to communicate between goroutines
- Don't communicate by sharing memory; share memory by communicating
- Close channels from the sender side, not the receiver
- Use `select` for non-blocking operations

### Synchronization

- Use `sync.Mutex` for protecting shared state
- Keep critical sections small
- Use `sync.RWMutex` when you have many readers
- Use `sync.Once` for one-time initialization

## Testing

### Test Organization

- Keep tests in the same package (white-box testing)
- Use `_test` package suffix for black-box testing
- Name test files with `_test.go` suffix
- Place test files next to the code they test

### Writing Tests

- Use table-driven tests for multiple test cases
- Name tests descriptively using `Test_functionName_scenario`
- Use subtests with `t.Run` for better organization
- Test both success and error cases

## Common Pitfalls to Avoid

- Not checking errors
- Ignoring race conditions
- Creating goroutine leaks
- Not using defer for cleanup
- Modifying maps concurrently
- Not understanding nil interfaces vs nil pointers
- Forgetting to close resources
- Creating duplicate `package` declarations

<!-- Source: https://github.com/github/awesome-copilot (MIT License) -->
