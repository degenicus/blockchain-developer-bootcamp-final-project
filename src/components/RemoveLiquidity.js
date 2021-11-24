import React, { useEffect, useState } from "react"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import { ethers } from "ethers"
import { getFarmContract } from "../helpers"

export default function RemoveLiquidity({ usdcAmount, ethAmount, updateETHAndUSDC }) {
  const [state, setState] = useState({
    balanceLP: null,
    amountLPToRemove: 0,
  })

  const updateBalanceLP = async () => {
    const farm = getFarmContract()
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const userAddress = await signer.getAddress()
    const balanceLP = Number(await farm.balances(userAddress))
    setState({ ...state, balanceLP })
  }

  useEffect(() => {
    if (state.balanceLP == null) {
      updateBalanceLP()
    }
  })

  const amountChanged = (event) => {
    const newAmount = event.target.value
    const toRemove = state.amountLPToRemove
    if (newAmount !== toRemove && newAmount <= state.balanceLP && newAmount >= 0) {
      setState({ ...state, amountLPToRemove: newAmount })
    }
  }

  const removeLiquidity = async () => {
    const toRemove = state.amountLPToRemove
    const oneMinute = 60 * 1000
    const deadline = Date.now() + oneMinute
    const farm = getFarmContract()
    const tx = await farm.removeLiquidityETH(toRemove, 0, 0, deadline)
    const receipt = await tx.wait()
    if (receipt.status) {
      updateETHAndUSDC()
      updateBalanceLP()
    }
  }

  const formatEther = (eth) => ethers.utils.formatEther(eth)

  return (
    <div>
      <Stack spacing={2} direction="row">
        <div style={{ lineHeight: 3.2 }}>USDC in wallet: {usdcAmount}</div>
        <div style={{ lineHeight: 3.2 }}>ETH in wallet: {formatEther(ethAmount)}</div>
        <div style={{ lineHeight: 3.2 }}>Amount of LP: {state.balanceLP}</div>
      </Stack>
      <Stack spacing={2} direction="row">
        <div style={{ lineHeight: 3.2 }}>Amount of LP to remove:</div>
        <TextField
          id="outlined-basic"
          label="LP to remove"
          variant="outlined"
          type="number"
          value={state.amountLPToRemove}
          onChange={amountChanged}
        />
        <Button
          variant="outlined"
          onClick={removeLiquidity}
          disabled={state.balanceLP === 0}
        >
          Remove liquidity
        </Button>
      </Stack>
    </div>
  )
}
