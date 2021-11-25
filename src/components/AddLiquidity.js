import React, { useEffect, useState } from "react"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import { ethers } from "ethers"
import { getUSDCContract, getFarmContract, onSuccess, onError } from "../helpers"
import Toast from "./Toast"

export default function AddLiquidity({
  usdcAmount,
  ethAmount,
  ethToUSDCRatio,
  updateETHAndUSDC,
}) {
  const formatEther = (eth) => ethers.utils.formatEther(eth)

  const [state, setState] = useState({
    usdcToAdd: 1,
    ethToAdd: formatEther(ethToUSDCRatio),
    hasApproved: null,
    isToastOpen: false,
    toastSeverity: "success",
    toastMessage: "Swapped successfully!",
  })

  useEffect(() => {
    if (state.hasApproved == null) {
      async function fetchHasApproved() {
        const farm = getFarmContract()
        const usdc = getUSDCContract()
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const userAddress = await signer.getAddress()
        const allowance = await usdc.allowance(userAddress, farm.address)
        const hasApproved = Number(allowance) !== 0
        setState({ ...state, hasApproved })
      }
      fetchHasApproved()
    }
  })

  const setToastOpen = (isOpen) => {
    if (isOpen !== state.isToastOpen) {
      setState({ ...state, isToastOpen: isOpen })
    }
  }

  const amountChanged = (event) => {
    const newAmount = event.target.value
    if (newAmount !== state.usdcToAdd && newAmount <= usdcAmount && newAmount >= 0) {
      const eth = newAmount * ethToUSDCRatio
      setState({ ...state, usdcToAdd: Number(newAmount), ethToAdd: formatEther(eth) })
    }
  }

  const approve = async () => {
    try {
      const farm = getFarmContract()
      const usdc = getUSDCContract()
      const tx = await usdc.approve(farm.address, ethers.constants.MaxInt256)
      const receipt = await tx.wait()
      if (receipt.status) {
        setState({ ...state, hasApproved: true })
        onSuccess("Approve successful!", state, setState)
      }
    } catch (error) {
      onError("Approve failed!", state, setState)
    }
  }

  const addLiquidity = async () => {
    try {
      const usdcOut = state.usdcToAdd
      const allowedSlippage = 0.95
      const farm = getFarmContract()
      const amountsIn = await farm.getAmountsInETHToUSDC(usdcOut)
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const bNum = await provider.getBlockNumber()
      const block = await provider.getBlock(bNum)
      const tx = await farm.addLiquidityETH(
        usdcOut,
        Math.round(usdcOut * allowedSlippage),
        1,
        block.timestamp + 50,
        {
          value: amountsIn[0],
        }
      )
      const receipt = await tx.wait()
      if (receipt.status) {
        updateETHAndUSDC()
        onSuccess("Add liquidity succeeded!", state, setState)
      }
    } catch (error) {
      onError("Add liquidity failed! Try a different amount.", state, setState)
    }
  }

  return (
    <div>
      <Stack spacing={2} direction="row">
        <div style={{ lineHeight: 3.2 }}>USDC in wallet: {usdcAmount}</div>
        <div style={{ lineHeight: 3.2 }}>ETH in wallet: {formatEther(ethAmount)}</div>
      </Stack>
      <Stack spacing={2} direction="row">
        <div style={{ lineHeight: 3.2 }}>USDC amount:</div>
        <TextField
          id="outlined-basic"
          label="USDC"
          variant="outlined"
          type="number"
          value={state.usdcToAdd}
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
        <Button variant="outlined" onClick={approve} disabled={state.hasApproved}>
          Approve
        </Button>
        <Button variant="outlined" onClick={addLiquidity} disabled={!state.hasApproved}>
          Add liquidity
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
