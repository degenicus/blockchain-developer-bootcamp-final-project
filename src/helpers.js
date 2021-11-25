import { ethers } from "ethers"
const ERC20ABI = require("./abi/ERC20.json")
const AstrumFarmABI = require("./abi/AstrumFarm.json")

export const getUSDCBalance = async () => {
  const usdcContract = getUSDCContract()
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const userAddress = await signer.getAddress()
  let usdcBalance = await usdcContract.balanceOf(userAddress)
  return usdcBalance
}

export const getETHBalance = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const userAddress = await signer.getAddress()
  const balance = await provider.getBalance(userAddress)
  return balance
}

export const getFarmContract = () => {
  const farmAddress = "0x2dD44Ad3A8fa197183CA578E87A2B89A41507F1D"
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const farmContract = new ethers.Contract(farmAddress, AstrumFarmABI, signer)
  return farmContract
}

export const getUSDCContract = () => {
  const tokenAddress = "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b"
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, signer)
  return tokenContract
}

export const onSuccess = (toastMessage, state, setState) => {
  setState({
    ...state,
    isToastOpen: true,
    toastSeverity: "success",
    toastMessage,
  })
}

export const onError = (toastMessage, state, setState) => {
  setState({
    ...state,
    isToastOpen: true,
    toastSeverity: "error",
    toastMessage,
  })
}
