# Signals

There are three reactive primitives in regard to signals:

- writable signals, modify value directly
- computed signals, values derived from other signals
- effects, functions that are activated when something changes, also on initial values. Effects always runs once! One should not update any signals in effects, this may lead to infinit loops. Tested did work ok! (?)

# Testing

Install test dependencies

```bash
npm install --save-dev jasmine-core karma karma-jasmine karma-chrome-launcher
```

Run tests

```bash
ng test
```

Run test in headless mode (CI/CD)

```bash
ng test --watch=false --browsers=ChromeHeadless
```

Run tests with code coverage

```bash
ng test --code-coverage

# After running test view coverage report:
coverage/index.html
```

Run only a specific test file

```bash
ng test --include='**/cards.service.spec.ts'
```
