# Schedl3 - pseudonymous scheduling system

This is the frontend repo containing the NextJS app and smart contracts. Find the main project repo here: https://github.com/schedl3/schedl-backend

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, and Typescript.

## Requirements

Before you begin, you need to install the following tools:

- [Node (v18 LTS)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

1. Yarn

```
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys CHED to the local network. The contract is located in `packages/hardhat/contracts`. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `https://localhost:3130` (note: SSL).

## Deploying your Smart Contracts to a Live Network

```
yarn deploy --network lineaTestnet
```

Additionally you will need to add your Infura API key. Rename `.env.example` to `.env` and fill the required keys.

```
INFURA_API_KEY="",
DEPLOYER_PRIVATE_KEY=""
```

## Deploying your NextJS App

Run scripts:
- build
- export

The output directory path should be configured in the environment variable in the backend.

### Disabling commit checks

We run `pre-commit` [git hook](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) which lints the staged files and don't let you commit if there is an linting error.

To disable this, go to `.husky/pre-commit` file and comment out `yarn lint-staged --verbose`

```diff
- yarn lint-staged --verbose
+ # yarn lint-staged --verbose
```

### Disabling Github Workflow

We have github workflow setup checkout `.github/workflows/lint.yaml` which runs types and lint error checks every time code is **pushed** to `main` branch or **pull request** is made to `main` branch

To disable it, **delete `.github` directory**
