---
description: 'Guidelines for building Java base applications'
applyTo: '**/*.java'
---

# Java Development

## General Instructions

- Address code smells proactively during development rather than accumulating technical debt
- Focus on readability, maintainability, and performance when refactoring identified issues
- Use IDE / Code editor reported warnings and suggestions to catch common patterns early in development
- First, prompt the user if they want to integrate static analysis tools (SonarQube, PMD, Checkstyle) into their project setup

## Best Practices

### Modern Java Features

- **Records**: For classes primarily intended to store data (e.g., DTOs, immutable data structures), Java Records should be used instead of traditional classes
- **Pattern Matching**: Utilize pattern matching for `instanceof` and `switch` expressions to simplify conditional logic and type casting
- **Type Inference**: Use `var` for local variable declarations to improve readability, but only when the type is explicitly clear from the right-hand side
- **Immutability**: Favor immutable objects. Make classes and fields `final` where possible. Use `List.of()`/`Map.of()` for fixed data. Use `Stream.toList()` for immutable lists
- **Streams and Lambdas**: Use the Streams API and lambda expressions for collection processing. Employ method references (e.g., `stream.map(Foo::toBar)`)
- **Null Handling**: Avoid returning or accepting `null`. Use `Optional<T>` for possibly-absent values and `Objects` utility methods like `equals()` and `requireNonNull()`

### Naming Conventions

Follow Google's Java style guide:
- `UpperCamelCase` for class and interface names
- `lowerCamelCase` for method and variable names
- `UPPER_SNAKE_CASE` for constants
- `lowercase` for package names
- Use nouns for classes (`UserService`) and verbs for methods (`getUserById`)
- Avoid abbreviations and Hungarian notation

### Common Bug Patterns

- **Resource management**: Always close resources (files, sockets, streams). Use try-with-resources where possible
- **Equality checks**: Compare object equality with `.equals()` or `Objects.equals(...)` rather than `==` for non-primitives
- **Redundant casts**: Remove unnecessary casts; prefer correct generic typing
- **Reachable conditions**: Avoid conditional expressions that are always true or false

### Common Code Smells

- **Parameter count**: Keep method parameter lists short. Consider grouping into a value object or using the builder pattern
- **Method size**: Keep methods focused and small. Extract helper methods to improve readability and testability
- **Cognitive complexity**: Reduce nested conditionals and heavy branching by extracting methods or using polymorphism
- **Duplicated literals**: Extract repeated strings and numbers into named constants or enums
- **Dead code**: Remove unused variables and assignments
- **Magic numbers**: Replace numeric literals with named constants (e.g., MAX_RETRIES)

## Build and Verification

- After adding or modifying code, verify the project continues to build successfully
- If the project uses Maven, run `mvn clean install`
- If the project uses Gradle, run `./gradlew build` (or `gradlew.bat build` on Windows)
- Ensure all tests pass as part of the build

<!-- Source: https://github.com/github/awesome-copilot (MIT License) -->
