# Lynet CLI

> A command-line interface for Lynet.

<a href="https://www.npmjs.com/package/@lynet/cli">
  <img src="https://badgen.net/npm/v/@lynet/cli" alt="Published on npm">
</a>
<a href="https://www.lynet.dev">
  <img src="https://badgen.net/badge/powered%20by/Lynet/purple" alt="Powered by Lynet">
</a>

## Table of Contents

- [Documentation](#documentation)
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Examples](#examples)
- [License](#license)

## Documentation

👉 Read the [Lynet CLI Documentation](https://docs.lynet.dev)

## Installation

1. Sign up and create a new project
Generate a unique project token for your app by signing in to [Lynet](https://lynet.dev) and creating a project.

2. Install the Lynet CLI globally:
    ```bash
    npm install -g @lynet/cli
    ```
    
    Or as a development dependency in your project:
    
    ```bash
    npm install --save-dev @lynet/cli
    ```

## Usage

After installation, use the `lynet` command in your terminal.

### Options

- `-t, --token <token>`: Set the Lynet project token (defaults to `LYNET_TOKEN` environment variable).
- `-u, --lynet-url <url>`: Set the Lynet base URL (defaults to `https://app.lynet.dev` or `LYNET_URL` environment variable).

### Commands

#### `push-build`

Push a build to Lynet. 

##### Usage

```bash
lynet push-build [options] [...files]
```

##### Options

- `-c, --config <file>`: Use configuration from `<file>`.
- `--allow-inline-config`: Allow inline configuration comments.
- `--cwd <path>`: Specify the current working directory.
- `--no-eslintrc`: Disable use of configuration from `.eslintrc.*` files.
- `--cache`: Only check changed files.
- `--cache-location <path>`: Path to the cache file or directory.
- `--cache-strategy <metadata|content>`: Cache strategy to use.

##### Arguments

- `[...files]`: Files or directories to lint (defaults to the current directory if omitted).

## Environment Variables

- `LYNET_TOKEN`: Your Lynet project token.
- `LYNET_URL`: The base URL for the Lynet service (default: `https://app.lynet.dev`).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
