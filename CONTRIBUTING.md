# Contributing to Wobbla

Thank you for your interest in contributing to Wobbla! This document provides guidelines and information for contributors.

## Code Style

This project follows the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with some customizations for Node.js development.

### Linting and Formatting

We use ESLint and Prettier to maintain consistent code style:

- **ESLint**: Enforces code quality rules and catches potential bugs
- **Prettier**: Handles code formatting automatically

### Running Linters

```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Check code formatting
npm run format:check

# Format code automatically
npm run format
```

### Pre-commit Hooks

This project uses [Husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged) to automatically lint and format code before commits.

When you commit code:

1. `lint-staged` runs ESLint and Prettier on staged files
2. Tests are run to ensure nothing is broken
3. If either step fails, the commit is aborted

This ensures all committed code meets our quality standards.

### Key Style Guidelines

- **Indentation**: 2 spaces (configured in Prettier)
- **Quotes**: Single quotes for strings
- **Semicolons**: Always required
- **Line Length**: Maximum 120 characters
- **Trailing Commas**: ES5-style (objects, arrays)

### Custom ESLint Rules

We've customized some rules for Node.js development:

- `no-console`: Off (console.log is allowed in Node.js)
- `global-require`: Off (require() inside functions is allowed)
- `import/extensions`: .js extensions required for local files
- `no-plusplus`: Allowed in for loop afterthoughts (i++)
- `no-unused-vars`: Variables starting with \_ are allowed (e.g., \_req)

### Editor Configuration

For consistent formatting across different editors, we provide an `.editorconfig` file:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

Save this as `.editorconfig` in your project root and install the EditorConfig plugin for your editor.

## Testing

All code changes should include tests. We use Jest for testing.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Requirements

- All tests must pass before commits are accepted
- Maintain 100% test coverage where possible
- Write clear, descriptive test names
- Test both success and error cases

## Pull Request Process

1. Fork the repository
2. Create a feature branch from `main` or `master`
3. Make your changes following the code style guidelines
4. Ensure all tests pass and linting is clean
5. Commit your changes (pre-commit hooks will run automatically)
6. Push to your fork and submit a pull request

### Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Ensure CI checks pass
- Keep PRs focused on a single feature or fix
- Update documentation as needed

## Continuous Integration

We use GitHub Actions for CI/CD:

- Linting (ESLint)
- Formatting checks (Prettier)
- Tests on multiple Node.js versions (18.x, 20.x, 22.x)
- Security audits
- Package integrity checks

All checks must pass before a PR can be merged.

## Questions?

If you have questions about contributing, please open an issue for discussion.
