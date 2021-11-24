import React, { useEffect, useState } from "react"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import { getFarmContract } from "../helpers"

export default function Swap({ astrumAmount, setAstrumAmount }) {
  const [state, setState] = useState({
    swapAstrumAmount: 0,
  })

  const amountChanged = (event) => {
    const newAmount = event.target.value
    if (newAmount !== state.swapAstrumAmount) {
      setState({ ...state, swapAstrumAmount: newAmount })
    }
  }

  const swapToAstrum = async () => {
    const amount = Number(state.swapAstrumAmount)
    const farmContract = getFarmContract()
    const amountsIn = await farmContract.getAmountsInETHToAstrum(amount)
    const oneMinute = 60 * 1000
    const deadline = Date.now() + oneMinute
    const tx = await farmContract.swapETHForExactTokens(amount, deadline, {
      value: amountsIn[0],
    })
    const receipt = await tx.wait()
    if (receipt.status) {
      setAstrumAmount()
    }
  }
  return (
    <div>
      <Stack spacing={2} direction="row">
        <div style={{ lineHeight: 3.2 }}>Astrum in wallet: {astrumAmount}</div>
      </Stack>
      <Stack spacing={2} direction="row">
        <div style={{ lineHeight: 3.2 }}>Astrum amount to swap to:</div>
        <TextField
          id="outlined-basic"
          label="Astrum"
          variant="outlined"
          type="number"
          value={state.swapAstrumAmount}
          onChange={amountChanged}
        />
        <Button variant="outlined" onClick={swapToAstrum}>
          Swap
        </Button>
      </Stack>
    </div>
  )
}
