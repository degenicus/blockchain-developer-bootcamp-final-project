const { expect } = require("chai")
const { ethers } = require("hardhat")
const { Contract } = require("ethers")
const ERC20ABI = require("../abi/ERC20.json")
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/")

const getUSDCBalance = async (address) => {
  const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
  const contract = new Contract(usdcAddress, ERC20ABI, provider)
  const balance = await contract.balanceOf(address)
  return balance.toString()
}

describe("AstrumFarm", () => {
  it("Should return amounts in for swapping eth to USDC", async () => {
    const Farm = await ethers.getContractFactory("AstrumFarm")
    const farm = await Farm.deploy()
    await farm.deployed()

    const amountsIn = await farm.getAmountsInETHToUSDC(100)
    expect(amountsIn).to.be.an("array")
    expect(amountsIn.length).equals(2)
  })
  it("Should swap ETH for USDC", async () => {
    const Farm = await ethers.getContractFactory("AstrumFarm")
    const farm = await Farm.deploy()
    await farm.deployed()
    const usdcAmount = 100
    const amountsIn = await farm.getAmountsInETHToUSDC(usdcAmount)
    const blockNr = await ethers.provider.getBlockNumber()
    const block = await ethers.provider.getBlock(blockNr)
    const delay = 1000
    const deadline = block.timestamp + delay
    const usdcBalanceBefore = await getUSDCBalance(farm.address)
    expect(Number(usdcBalanceBefore)).equals(0)
    await farm.swapETHForExactTokens(amountsIn[1], deadline, { value: amountsIn[0] })
    const usdcBalanceAfter = await getUSDCBalance(farm.address)
    expect(Number(usdcBalanceAfter)).equals(usdcAmount)
  })
})
