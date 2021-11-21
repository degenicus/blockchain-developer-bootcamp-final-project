import React, { useEffect, useState } from "react"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import { ethers } from "ethers"

export default function Swap() {
  const [state, setState] = useState({
    usdcAmount: null,
    swapUSDCAmount: 0,
  })

  const amountChanged = (event) => {
    const newAmount = event.target.value
    if (newAmount !== state.swapUSDCAmount) {
      setState({ ...state, swapUSDCAmount: newAmount })
    }
  }

  useEffect(() => {
    if (state.usdcAmount == null) {
      async function fetchData() {
        const balance = await getUSDCBalance()
        setState({ ...state, usdcAmount: Number(balance) })
      }
      fetchData()
    }
  })

  const getUSDCBalance = async () => {
    const usdc = {
      address: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
      abi: [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function balanceOf(address _owner) public view returns (uint256 balance)",
        "function transfer(address _to, uint256 _value) public returns (bool success)",
      ],
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const userAddress = await signer.getAddress()
    const usdcContract = new ethers.Contract(usdc.address, usdc.abi, signer)
    let usdcBalance = await usdcContract.balanceOf(userAddress)
    usdcBalance = ethers.utils.formatUnits(usdcBalance, 6)
    return usdcBalance
  }

  const swapToUSDC = async () => {
    const amount = Number(state.swapUSDCAmount) * 1000_000
    const farmAddress = "0xb54dAaC40666533E02eAfe0242b17BA0834660A2"
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    const farmAbi = [
      "function swapETHForExactTokens(uint256 usdcAmount, uint256 deadline) public payable",
      "function getAmountsInETHToUSDC(uint256 usdcAmount) public view returns (uint256[] memory)",
    ]
    const farmContract = new ethers.Contract(farmAddress, farmAbi, signer)
    const amountsIn = await farmContract.getAmountsInETHToUSDC(amount)
    console.log(amount)
    console.log(amountsIn[0])
    const oneMinute = 60 * 1000
    const deadline = Date.now() + oneMinute
    const tx = await farmContract.swapETHForExactTokens(amount, deadline, {
      value: amountsIn[0],
    })
    const receipt = await tx.wait()
    if (receipt.status) {
      const newBalance = await getUSDCBalance()
      setState({ ...state, usdcAmount: Number(newBalance) })
    }
  }
  return (
    <div>
      <Stack spacing={2} direction="row">
        <div style={{ lineHeight: 3.2 }}>USDC in wallet: {state.usdcAmount}</div>
      </Stack>
      <Stack spacing={2} direction="row">
        <div style={{ lineHeight: 3.2 }}>USDC amount to swap to:</div>
        <TextField
          id="outlined-basic"
          label="USDC"
          variant="outlined"
          type="number"
          value={state.swapUSDCAmount}
          onChange={amountChanged}
        />
        <Button variant="outlined" onClick={swapToUSDC}>
          Swap
        </Button>
      </Stack>
    </div>
  )
}
