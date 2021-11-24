async function main() {
  const [deployer] = await ethers.getSigners()

  console.log("Deploying contracts with the account:", deployer.address)

  console.log("Account balance:", (await deployer.getBalance()).toString())

  const Token = await ethers.getContractFactory("AstrumToken")
  const token = await Token.deploy()
  const Farm = await ethers.getContractFactory("AstrumFarm")
  const farm = await Farm.deploy(token.address)

  console.log("Token address:", token.address)
  console.log("Farm address:", farm.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
