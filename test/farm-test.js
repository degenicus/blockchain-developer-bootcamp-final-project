const { expect } = require("chai")
const { ethers } = require("hardhat")
const { Contract } = require("ethers")
const ERC20ABI = require("../abi/ERC20.json")
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/")
const signer = provider.getSigner()

const getUSDCBalance = async (address) => {
  const usdc = getUSDCContract()
  const balance = await usdc.balanceOf(address)
  return balance.toString()
}

const getUSDCContract = () => {
  const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
  const usdc = new Contract(usdcAddress, ERC20ABI, signer)
  return usdc
}

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

const deployFarm = async () => {
  const Farm = await ethers.getContractFactory("AstrumFarm")
  const farm = await Farm.deploy()
  await farm.deployed()
  return farm
}

describe("AstrumFarm", () => {
  beforeEach(async () => {
    await resetBlockchain()
  })
  it("Should return amounts in for swapping eth to USDC", async () => {
    const farm = await deployFarm()

    const amountsIn = await farm.getAmountsInETHToUSDC(100)
    expect(amountsIn).to.be.an("array")
    expect(amountsIn.length).equals(2)
  })
  it("Should swap ETH for USDC", async () => {
    const farm = await deployFarm()

    const usdcAmount = 100
    const amountsIn = await farm.getAmountsInETHToUSDC(usdcAmount)

    const delay = 1000
    const deadline = getDeadline(delay)
    const [owner] = await ethers.getSigners()
    const usdcBalanceBefore = await getUSDCBalance(owner.address)
    expect(Number(usdcBalanceBefore)).equals(0)

    await farm.swapETHForExactTokens(amountsIn[1], deadline, { value: amountsIn[0] })
    const usdcBalanceAfter = await getUSDCBalance(owner.address)
    expect(Number(usdcBalanceAfter)).equals(usdcAmount)
  })
  it("Can provide liquidity", async () => {
    const farm = await deployFarm()

    const usdcAmount = 100
    const amountsIn = await farm.getAmountsInETHToUSDC(usdcAmount)

    const delay = 1000
    const deadline = getDeadline(delay)
    await farm.swapETHForExactTokens(amountsIn[1], deadline, { value: amountsIn[0] })

    const usdc = getUSDCContract()
    await usdc.approve(farm.address, ethers.constants.MaxInt256)

    const [owner] = await ethers.getSigners()
    const balanceBefore = await farm.balances(owner.address)
    expect(Number(balanceBefore)).to.equal(0)

    const allowedSlippage = 0.95
    const ethAmount = amountsIn[0]
    await farm.addLiquidityETH(
      usdcAmount,
      Math.round(usdcAmount * allowedSlippage),
      Math.round(ethAmount * allowedSlippage),
      deadline,
      { value: ethAmount }
    )
    const balanceAfter = await farm.balances(owner.address)
    expect(Number(balanceAfter)).to.be.greaterThan(0)
  })
  it("Can remove liquidity", async () => {
    const farm = await deployFarm()

    const usdcAmount = 100
    const amountsIn = await farm.getAmountsInETHToUSDC(usdcAmount)

    const delay = 1000
    const deadline = getDeadline(delay)
    await farm.swapETHForExactTokens(amountsIn[1], deadline, { value: amountsIn[0] })

    const usdc = getUSDCContract()
    await usdc.approve(farm.address, ethers.constants.MaxInt256)

    const [owner] = await ethers.getSigners()

    const allowedSlippage = 0.95
    const ethAmount = amountsIn[0]
    await farm.addLiquidityETH(
      usdcAmount,
      Math.round(usdcAmount * allowedSlippage),
      Math.round(ethAmount * allowedSlippage),
      deadline,
      { value: ethAmount }
    )
    const balanceAfter = await farm.balances(owner.address)
    const usdcBalanceBefore = Number(await usdc.balanceOf(owner.address))
    expect(usdcBalanceBefore).to.equal(0)
    await farm.removeLiquidityETH(
      balanceAfter,
      Math.round(usdcAmount * allowedSlippage),
      Math.round(ethAmount * allowedSlippage),
      deadline
    )
    const usdcBalanceAfter =  Number(await usdc.balanceOf(owner.address))
    expect(usdcBalanceAfter).to.be.greaterThan(0)
  })
})
