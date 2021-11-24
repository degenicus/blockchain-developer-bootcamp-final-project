const { expect } = require("chai")
const { ethers } = require("hardhat")

const getDeadline = async (delay) => {
  const blockNr = await ethers.provider.getBlockNumber()
  const block = await ethers.provider.getBlock(blockNr)
  const deadline = block.timestamp + delay
  return deadline
}

const resetBlockchain = async () => {
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${process.env.API_KEY}`,
          blockNumber: 13596490,
        },
      },
    ],
  })
}

const deployFarm = async (tokenAddress) => {
  const Farm = await ethers.getContractFactory("AstrumFarm")
  const farm = await Farm.deploy(tokenAddress)
  await farm.deployed()
  return farm
}

const deployToken = async () => {
  const Token = await ethers.getContractFactory("AstrumToken")
  const token = await Token.deploy()
  await token.deployed()
  return token
}

const deployContracts = async () => {
  const token = await deployToken()
  const farm = await deployFarm(token.address)
  return {
    token,
    farm,
  }
}

const supplyInitialLiquidity = async (farm, token) => {
  const astrumTokenAmount = 1_000_000
  const delay = 1000
  const deadline = getDeadline(delay)
  await token.approve(farm.address, ethers.constants.MaxInt256)

  const allowedSlippage = 0.95
  const ethAmount = 1000000
  await farm.addLiquidityETH(
    astrumTokenAmount,
    Math.round(astrumTokenAmount * allowedSlippage),
    Math.round(ethAmount * allowedSlippage),
    deadline,
    { value: ethAmount }
  )
}

describe("AstrumFarm", () => {
  beforeEach(async () => {
    await resetBlockchain()
  })
  it("Should return amounts in for swapping eth to AstrumToken", async () => {
    const { farm, token } = await deployContracts()
    await supplyInitialLiquidity(farm, token)
    const amountsIn = await farm.getAmountsInETHToAstrum(100)
    expect(amountsIn).to.be.an("array")
    expect(amountsIn.length).equals(2)
  })
  it("Should swap ETH for AstrumToken", async () => {
    const { farm, token } = await deployContracts()
    await supplyInitialLiquidity(farm, token)
    const astrumAmount = 100
    const amountsIn = await farm.getAmountsInETHToAstrum(astrumAmount)

    const delay = 1000
    const deadline = getDeadline(delay)
    const [owner] = await ethers.getSigners()
    const astrumBalanceBefore = await token.balanceOf(owner.address)
    expect(Number(astrumBalanceBefore)).equals(0)

    await farm.swapETHForExactTokens(amountsIn[1], deadline, { value: amountsIn[0] })
    const astrumBalanceAfter = await token.balanceOf(owner.address)
    expect(Number(astrumBalanceAfter)).equals(astrumAmount)
  })
  it("Can provide liquidity", async () => {
    const { farm, token } = await deployContracts()

    const [owner] = await ethers.getSigners()
    const balanceBefore = await farm.balances(owner.address)
    expect(Number(balanceBefore)).to.equal(0)
    await supplyInitialLiquidity(farm, token)
    const balanceAfter = await farm.balances(owner.address)
    expect(Number(balanceAfter)).to.be.greaterThan(0)
  })
  it("Can remove liquidity", async () => {
    const { farm, token } = await deployContracts()
    await supplyInitialLiquidity(farm, token)
    const astrumAmount = 1_000_00
    const amountsIn = await farm.getAmountsInETHToAstrum(astrumAmount)

    const delay = 1000
    const deadline = getDeadline(delay)
    await token.approve(farm.address, ethers.constants.MaxInt256)

    const [owner] = await ethers.getSigners()

    const allowedSlippage = 0.95
    const ethAmount = amountsIn[0]
    const balance = await farm.balances(owner.address)
    const astrumBalanceBefore = Number(await token.balanceOf(owner.address))
    expect(astrumBalanceBefore).to.equal(0)
    await farm.removeLiquidityETH(
      balance,
      Math.round(astrumAmount * allowedSlippage),
      Math.round(ethAmount * allowedSlippage),
      deadline
    )
    const astrumBalanceAfter = Number(await token.balanceOf(owner.address))
    expect(astrumBalanceAfter).to.be.greaterThan(0)
  })
})
