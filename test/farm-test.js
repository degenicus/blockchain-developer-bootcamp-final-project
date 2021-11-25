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
          jsonRpcUrl: `https://eth-mainnet.alchemyapi.io/v2/QfYjE5ap0ywfvBU66pqT73xz_6keJG4j`,
          blockNumber: 13596490,
        },
      },
    ],
  })
}

const deployFarm = async () => {
  const Farm = await ethers.getContractFactory("AstrumFarm")
  const farm = await Farm.deploy("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48")
  await farm.deployed()
  return farm
}

describe("AstrumFarm", () => {
  beforeEach(async () => {
    await resetBlockchain()
  })
  /*
  getAmountsInETHToUSDC is needed to determine prices for swapping and adding liquidity
  Since the tests are running from a mainnet fork the exact prices are not known and cannot
  be tested for but it should return an array with two values.
  */
  it("Should return amounts in for swapping eth to USDC", async () => {
    const farm = await deployFarm()

    const amountsIn = await farm.getAmountsInETHToUSDC(100)
    expect(amountsIn).to.be.an("array")
    expect(amountsIn.length).equals(2)
  })
  /*
  Should be able to decide a USDC amount to swap to, swap and then receive the expected USDC amount in the wallet.
  */
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
  /*
  Should be able to decide a USDC amount to add liquidity for, send in USDC+ETH and have
  the smart contract increase the balance of LP tokens for the user. Since it is not known
  how many LP tokens are received it cannot be tested for an exact amount. The expected result
  is that the users balance goes from 0 to a positive number.
  */
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
  /*
  Tests a more complex flow of first swapping to get USDC, then adding liquidity with USDC-ETH and finally
  removing that liquidity and getting USDC + ETH back.
  */
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
    const usdcBalanceAfter = Number(await usdc.balanceOf(owner.address))
    expect(usdcBalanceAfter).to.be.greaterThan(0)
  })
  /*
  This tests that liquidity can be added many times. For a while this was not possible
  because the allowance was increased on each call, causing an overflow. This test covers
  this case and made sure the if(allowance == 0) check had worked to prevent the overflow.
  */
  it("Can provide liquidity multiple times", async () => {
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

    const usdcAmount2 = 250
    const amountsIn2 = await farm.getAmountsInETHToUSDC(usdcAmount2)
    const ethAmount2 = amountsIn2[0]
    await farm.swapETHForExactTokens(amountsIn2[1], deadline, { value: amountsIn2[0] })
    await farm.addLiquidityETH(
      usdcAmount2,
      Math.round(usdcAmount2 * allowedSlippage),
      Math.round(ethAmount * allowedSlippage),
      deadline,
      { value: ethAmount2 }
    )
    const balanceAfter2 = await farm.balances(owner.address)
    expect(Number(balanceAfter2)).to.be.greaterThan(Number(balanceAfter))
  })
})
