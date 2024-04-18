# Huskier

A simple wrapper for [Husky](https://typicode.github.io/husky) to make it easier to use.

## Installation

```bash
npm install @mongez/huskier --save-dev
```

Using Yarn

```bash
yarn add @mongez/huskier --dev
```

## Usage

You don't need to install husky, it is already installed with this package, so your start is from here, run the following command to initialize husky and add `pre-commit` hook:

```bash
npx huskier-init
```

This will create a `.husky` and adds `pre-commit` file with `npx huskier` command, it will also create a `huskier` key in your `package.json` file, this should be list of commands to run before commit, for example:

```json
{
  "huskier": {
    "pre-commit": []
  }
}
```

You can run whatever command you want, for example using it with prettier and eslint, or any other command you want.

```json
{
  "huskier": {
    "pre-commit": ["prettier --write .", "eslint . --fix"]
  }
}
```

Huskier will also give you some details about executed commands, for example how much time it took to run each command.

ny failed command will will stop executing the rest of the commands, and will show you the error message.

At the end of commands execution, huskier will show you a summary of total executed commands, total time it took to run all commands, and number of success and failed commands.

## Parallel Execution

If you want to execute all commands in parallel, you can use `parallel` option to be `true` in `huskier` key in your `package.json` file.

```json
{
  "huskier": {
    "parallel": true,
    "pre-commit": ["prettier --write .", "eslint . --fix"]
  }
}
```

> parallel option is set to `true` by default.

## Execute series of commands

When `parallel` option is enabled, you could execute multiple commands in `sequence` by grouping them in a nested array.

```json
{
  "huskier": {
    "parallel": true,
    "pre-commit": [["prettier --write .", "eslint . --fix"], "jest"]
  }
}
```

This will execute jest and prettier in same time, once prettier is finished, eslint will start.

> This option works even if `parallel` is set to `false`.

## Existing commands

Any command fails, it will stop the execution of the rest of the commands, and will show you the error message with exit code `1`.

## Committing

Now whenever you commit, husky will run these commands before committing.

## License

This package is released under the [MIT license](https://en.wikipedia.org/wiki/MIT_License).
