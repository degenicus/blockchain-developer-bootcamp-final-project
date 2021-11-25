require("@nomiclabs/hardhat-waffle")
require("dotenv").config()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.6.10",
  paths: {
    artifacts: "./src/artifacts",
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/QfYjE5ap0ywfvBU66pqT73xz_6keJG4j`,
        blockNumber: 13596490,
      },
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/QfYjE5ap0ywfvBU66pqT73xz_6keJG4j`,
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
  },
}
