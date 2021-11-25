# Final project - Astrum Farm

## Deployed version url:

http://m-brantheim.github.io/AstrumFarm

## How to run this project locally:

### Prerequisites

- Node.js Active LTS or later is recommended, so >= v16
- Yarn

### Contracts

- Run `yarn install` in project root to install Hardhat, Ethers, React, Chai, Waffle etc
- Run a mainnet fork in order to test using the mainnet deployed versions of Uniswap + USDC
- `npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/QfYjE5ap0ywfvBU66pqT73xz_6keJG4j --fork-block-number 13596490` <- This forks mainnet using my          alchemy API key, Alchemy support archive nodes which is needed for forking mainnet.
- `npx hardhat test --network localhost` <- This tests using the localhost mainnet fork blockchain

### Frontend

- `yarn install`
- `yarn start`
- Open `http://localhost:3000` The app will check which network you are on and display a warning if you are not connected to the site on Rinkeby. If you switch       network then refresh the app manually as it does not detect changes.

## Screencast link

Link to come.

## Public Ethereum wallet for certification:

`0x8cA0c27a7a868A4069967709B5592995A69aE006`

## Project description

A simple farm using Uniswap V2. In the farm app the user can swap ETH -> USDC, provide liquidity for the ETH-USDC pair and also remove that liquidity when added.
The app in it's current state does not offer any advantage compared to directly using Uniswap, however it serves as the foundation to build more advanced functionality such as added yield from custom farm token emission or possible yield optimization features such as switching LPs based on estimated returns.

## Simple workflow

1. In swap tab enter USDC amount and press swap, ETH will be deducted and USDC added to your wallet
2. In the add liquidity tab press approve button to allow spending of USDC
3. In the add liquidity tab enter USDC amount to provide LP, the ETH amount will be calculated, press Add Liquidity button and confirm. LP token will be held by the contract but the UI will update and display LP amount.
4. In the remove liquidity tab enter LP amount to remove and press Remove Liquidity button and the corresponding amount will be removed and USDC+ETH added back to wallet.

## Directory structure

- `src`: React frontend.
- `public`: Regular web app folder for ex favicon, index.html etc
- `scripts`: Holds the deploy script
- `contracts`: Smart contracts that are deployed on the Rinkeby testnet.
- `library`: Smart contract libraries from OpenZeppelin like ERC20, SafeMath, Address. They could perhaps have been stored in node_modules but I had some bug so it    only worked if I included the contracts directly here. I take no credit for this code.
- `abi`: Holds the ERC20.abi Used for the USDC contract
- `test`: Contains the chai Smart Contract tests

## Environment variables (not needed for running project locally)

```
PRIVATE_KEY = "Your private key here"
```
This variable must be on the process.env variable. I use a .env file which is added to Gitignore to keep the key private.

## TODO features

-Display of estimated daily, weekly, yearly yield
-A custom farm token with emission as a boosted reward
-Zap feature that takes one token, for example ETH, swaps into equal halves required for LP token and conversion to LP token all in one step for the user
-Extra farm info like TVL, your share of farm etc


## Inspiration

-https://www.reaper.farm/
-https://app.beefy.finance/#/fantom
-https://spookyswap.finance/farms
-https://app.spiritswap.finance/#/farms
-https://solfarm.io/vaults
-https://terra.spec.finance/vaults
-https://www.tarot.to/
