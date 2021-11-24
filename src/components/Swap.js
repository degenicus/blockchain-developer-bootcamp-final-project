import React, { useState } from "react"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import { getFarmContract } from "../helpers"

export default function Swap({ usdcAmount, setUSDCAmount }) {
  const [state, setState] = useState({
    swapUSDCAmount: 0,
  })

  const amountChanged = (event) => {
    const newAmount = event.target.value
    if (newAmount !== state.swapUSDCAmount) {
      setState({ ...state, swapUSDCAmount: newAmount })
    }
  }

  const swapToUSDC = async () => {
    const amount = Number(state.swapUSDCAmount)
    const farmContract = getFarmContract()
    const amountsIn = await farmContract.getAmountsInETHToUSDC(amount)
    const oneMinute = 60 * 1000
    const deadline = Date.now() + oneMinute
    const tx = await farmContract.swapETHForExactTokens(amount, deadline, {
      value: amountsIn[0],
    })
    const receipt = await tx.wait()
    if (receipt.status) {
      setUSDCAmount()
    }
  }
  return (
    <div>
      <Stack spacing={2} direction="row">
        <div style={{ lineHeight: 3.2 }}>USDC in wallet: {usdcAmount}</div>
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
