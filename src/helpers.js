import { ethers } from "ethers"
const ERC20ABI = require("./abi/ERC20.json")
const AstrumFarmABI = require("./abi/AstrumFarm.json")

export const getAstrumBalance = async () => {
  const astrumContract = getAstrumContract()
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const userAddress = await signer.getAddress()
  let astrumBalance = await astrumContract.balanceOf(userAddress)
  // astrumBalance = ethers.utils.formatUnits(astrumBalance, 6)
  return astrumBalance
}

export const getFarmContract = () => {
  const farmAddress = "0xe97370ba5D59c5555f883255cCb25c48A055b2AA"
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const farmContract = new ethers.Contract(farmAddress, AstrumFarmABI, signer)
  return farmContract
}

export const getAstrumContract = () => {
  const tokenAddress = "0xC6a69068e7FD28b533ac0cA115b4F0d2656efa87"
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  console.log(ERC20ABI)
  const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, signer)
  return tokenContract
}
