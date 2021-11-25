import React, { useEffect, useState } from "react"
import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import TabContext from "@mui/lab/TabContext"
import TabList from "@mui/lab/TabList"
import TabPanel from "@mui/lab/TabPanel"
import Swap from "./Swap"
import AddLiquidity from "./AddLiquidity"
import RemoveLiquidity from "./RemoveLiquidity"
import { getUSDCBalance, getETHBalance } from "../helpers"
import { ethers } from "ethers"
import { getFarmContract } from "../helpers"

export default function FarmWrapper() {
  const [state, setState] = useState({
    tab: "1",
    usdcAmount: null,
    ethAmount: null,
    ethToUSDCRatio: null,
  })

  const handleChange = (event, newValue) => {
    setState({ ...state, tab: newValue })
  }

  const updateETHAndUSDC = async () => {
    const usdcBalance = await getUSDCBalance()
    const ethBalance = await getETHBalance()
    setState({
      ...state,
      usdcAmount: Number(usdcBalance),
      ethAmount: ethBalance,
    })
  }

  useEffect(() => {
    if (state.usdcAmount == null) {
      async function fetchUSDCData() {
        const balance = await getUSDCBalance()
        setState({ ...state, usdcAmount: Number(balance) })
      }
      fetchUSDCData()
    }
    if (state.ethAmount == null) {
      async function fetchETHData() {
        const balance = await getETHBalance()
        const formattedBalance = ethers.utils.formatEther(balance)
        setState({ ...state, ethAmount: balance })
      }
      fetchETHData()
    }
    if (state.ethToUSDCRatio == null) {
      async function fetchRatioData() {
        const usdcAmount = 1
        const farmContract = getFarmContract()
        const amountsIn = await farmContract.getAmountsInETHToUSDC(usdcAmount)
        setState({ ...state, ethToUSDCRatio: Number(amountsIn[0]) })
      }
      fetchRatioData()
    }
  })

  const setUSDCAmount = async () => {
    const newBalance = await getUSDCBalance()
    setState({ ...state, usdcAmount: Number(newBalance) })
  }

  return (
    <Box
      sx={{
        typography: "body1",
        bgcolor: "#80d8ff",
      }}
    >
      <TabContext value={state.tab}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} centered>
            <Tab label="Swap" value="1" />
            <Tab label="Add liquidity" value="2" />
            <Tab label="Remove liquidity" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <Swap usdcAmount={state.usdcAmount} setUSDCAmount={setUSDCAmount} />
        </TabPanel>
        <TabPanel value="2">
          <AddLiquidity
            usdcAmount={state.usdcAmount}
            ethAmount={state.ethAmount}
            setUSDCAmount={setUSDCAmount}
            ethToUSDCRatio={state.ethToUSDCRatio}
            updateETHAndUSDC={updateETHAndUSDC}
          />
        </TabPanel>
        <TabPanel value="3">
          <RemoveLiquidity
            usdcAmount={state.usdcAmount}
            ethAmount={state.ethAmount}
            updateETHAndUSDC={updateETHAndUSDC}
          />
        </TabPanel>
      </TabContext>
    </Box>
  )
}
