async function main() {
  const [deployer] = await ethers.getSigners()

  console.log("Deploying contracts with the account:", deployer.address)

  console.log("Account balance:", (await deployer.getBalance()).toString())

  const Farm = await ethers.getContractFactory("AstrumFarm")
  const usdc = "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b"
  const farm = await Farm.deploy(usdc)

  console.log("Farm address:", farm.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
