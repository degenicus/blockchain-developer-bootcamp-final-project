import React, { useEffect, useState } from "react"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import { ethers } from "ethers"
import { getAstrumBalance, getAstrumContract, getFarmContract } from "../helpers"

export default function AddLiquidity({ astrumAmount, ethAmount, ethToAstrumRatio }) {
  const [state, setState] = useState({
    astrumToAdd: 1,
    ethToAdd: ethToAstrumRatio,
  })

  const amountChanged = (event) => {
    const newAmount = event.target.value
    if (newAmount !== state.astrumToAdd) {
      const eth = newAmount * ethToAstrumRatio
      setState({ ...state, astrumToAdd: newAmount, ethToAdd: eth })
    }
  }

  const addLiquidity = async () => {
    const farm = getFarmContract()
    const astrum = getAstrumContract()
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const userAddress = await signer.getAddress()

    const allowance = await astrum.allowance(userAddress, farm.address)
    if (Number(allowance) === 0) {
      await astrum.approve(farm.address, ethers.constants.MaxInt256)
    }
    const astrumOut = 500000
    const allowedSlippage = 0.95
    const ethAmount = 5000000000
    const oneMinute = 60 * 1000
    const deadline = Date.now() + oneMinute
    await farm.addLiquidityETH(
      astrumOut,
      Math.round(astrumOut * allowedSlippage),
      Math.round(ethAmount * allowedSlippage),
      deadline,
      {
        value: ethAmount,
      }
    )
    // function addLiquidityETH(uint256 amountTokenDesired,uint256 amountTokenMin, uint256 amountETHMin,
    // uint256 deadline) external payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity)
    // const balanceAfter = await farm.balances(userAddress)
    // console.log(balanceAfter)
  }

  return (
    <div>
      <Stack spacing={2} direction="row">
        <div style={{ lineHeight: 3.2 }}>Astrum in wallet: {astrumAmount}</div>
        <div style={{ lineHeight: 3.2 }}>ETH in wallet: {ethAmount}</div>
      </Stack>
      <Stack spacing={2} direction="row">
        <div style={{ lineHeight: 3.2 }}>Astrum amount:</div>
        <TextField
          id="outlined-basic"
          label="Astrum"
          variant="outlined"
          type="number"
          value={state.astrumToAdd}
          onChange={amountChanged}
        />
        <div style={{ lineHeight: 3.2 }}>ETH amount:</div>
        <TextField
          id="outlined-basic"
          label="ETH"
          variant="outlined"
          type="number"
          value={state.ethToAdd}
          disabled={true}
        />
        <Button variant="outlined" onClick={addLiquidity}>
          Add liquidity
        </Button>
      </Stack>
    </div>
  )
}
