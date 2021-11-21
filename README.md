# blockchain-developer-bootcamp-final-project
An Ethereum based project for the Consensys Academy bootcamp final project

This project will be focused on yield farming using LP tokens and pools.
A simple farm will be created where a user can deposit an LP token from
a decentralized exchange like Uniswap or Sushiswap.
The farm will allow the user to deposit, withdraw and to see the balance of the LP
token and possibly any reward token.


Optional features could be:

-Autocompounding (selling of reward token and buyback of LP token + reinvesting at a scheduled interval)

-Display of estimated daily, weekly, yearly yield

-A custom farm token with emission as a boosted reward

-Zap feature that takes one token, for example ETH, swaps into equal halves required for LP token and conversion to LP token all in one step for the user

-Extra farm info like TVL, your share of farm etc


Example user flow:

-User has already gotten the correct LP token

-A button allows approval of the use of LP token by contract - confirm with metamask

-A number input takes the number of LP tokens to be deposited

-Deposit button will deposit the selected number of LP tokens to contract - confirm with metamask

-User can see the balance of LP tokens in the farm

-A withdraw button allows user to withdraw - confirm with metamask


Inspiration:

-https://www.reaper.farm/

-https://app.beefy.finance/#/fantom

-https://spookyswap.finance/farms

-https://app.spiritswap.finance/#/farms

-https://solfarm.io/vaults

-https://terra.spec.finance/vaults

-https://www.tarot.to/

# blockchain-developer-bootcamp-final-project
An Ethereum based project for the Consensys Academy bootcamp final project

This project will be focused on yield farming using LP tokens and pools.
A simple farm will be created where a user can deposit an LP token from
a decentralized exchange like Uniswap or Sushiswap.
The farm will allow the user to deposit, withdraw and to see the balance of the LP
token and possibly any reward token.


Optional features could be:

-Autocompounding (selling of reward token and buyback of LP token + reinvesting at a scheduled interval)

-Display of estimated daily, weekly, yearly yield

-A custom farm token with emission as a boosted reward

-Zap feature that takes one token, for example ETH, swaps into equal halves required for LP token and conversion to LP token all in one step for the user

-Extra farm info like TVL, your share of farm etc


Example user flow:

-User has already gotten the correct LP token

-A button allows approval of the use of LP token by contract - confirm with metamask

-A number input takes the number of LP tokens to be deposited

-Deposit button will deposit the selected number of LP tokens to contract - confirm with metamask

-User can see the balance of LP tokens in the farm

-A withdraw button allows user to withdraw - confirm with metamask


 Inspiration:

-https://www.reaper.farm/

-https://app.beefy.finance/#/fantom

-https://spookyswap.finance/farms

-https://app.spiritswap.finance/#/farms

-https://solfarm.io/vaults

-https://terra.spec.finance/vaults

-https://www.tarot.to/


npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/QfYjE5ap0ywfvBU66pqT73xz_6keJG4j --fork-block-number 13596490

npx hardhat test --network localhost