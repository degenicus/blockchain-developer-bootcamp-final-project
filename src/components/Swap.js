import React, { useState } from "react"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import { getFarmContract, onSuccess, onError } from "../helpers"
import Toast from "./Toast"

export default function Swap({ usdcAmount, setUSDCAmount }) {
  const [state, setState] = useState({
    swapUSDCAmount: 0,
    isToastOpen: false,
    toastSeverity: "success",
    toastMessage: "Swapped successfully!",
  })

  const setToastOpen = (isOpen) => {
    if (isOpen !== state.isToastOpen) {
      setState({ ...state, isToastOpen: isOpen })
    }
  }

  const amountChanged = (event) => {
    const newAmount = event.target.value
    if (newAmount !== state.swapUSDCAmount && newAmount >= 0) {
      setState({ ...state, swapUSDCAmount: newAmount })
    }
  }

  const swapToUSDC = async () => {
    try {
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
        onSuccess("Swapped successfully!", state, setState)
      }
    } catch (error) {
      onError("Something went wrong, try swapping a different amount!", state, setState)
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
      <Toast
        alertSeverity={state.toastSeverity}
        alertMessage={state.toastMessage}
        open={state.isToastOpen}
        setOpen={setToastOpen}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </div>
  )
}
