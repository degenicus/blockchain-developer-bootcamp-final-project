import React, { useEffect, useState } from "react"
import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import TabContext from "@mui/lab/TabContext"
import TabList from "@mui/lab/TabList"
import TabPanel from "@mui/lab/TabPanel"
import Swap from "./Swap"
import AddLiquidity from "./AddLiquidity"
import { getAstrumBalance } from "../helpers"
import { ethers } from "ethers"
import { getFarmContract } from "../helpers"

export default function FarmWrapper() {
  const [state, setState] = useState({
    tab: "1",
    astrumAmount: null,
    ethAmount: null,
    ethToAstrumRatio: null,
  })

  const handleChange = (event, newValue) => {
    setState({ ...state, tab: newValue })
  }

  useEffect(() => {
    if (state.astrumAmount == null) {
      async function fetchAstrumData() {
        const balance = await getAstrumBalance()
        setState({ ...state, astrumAmount: Number(balance) })
      }
      fetchAstrumData()
    }
    if (state.ethAmount == null) {
      async function fetchETHData() {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const userAddress = await signer.getAddress()
        const balance = await provider.getBalance(userAddress)
        const formattedBalance = ethers.utils.formatEther(balance)
        console.log(typeof formattedBalance)
        setState({ ...state, ethAmount: formattedBalance })
      }
      fetchETHData()
    }
    if (state.ethToAstrumRatio == null) {
      async function fetchRatioData() {
        const astrumAmount = 1
        const farmContract = getFarmContract()
        const amountsIn = await farmContract.getAmountsInETHToAstrum(astrumAmount)
        const formatted = ethers.utils.formatEther(amountsIn[0])
        setState({ ...state, ethToAstrumRatio: Number(formatted) })
      }
      fetchRatioData()
    }
  })

  const setAstrumAmount = async () => {
    const newBalance = await getAstrumBalance()
    setState({ ...state, astrumAmount: Number(newBalance) })
  }

  return (
    <Box
      sx={{
        width: "50%",
        typography: "body1",
        top: "30%",
        left: "28%",
        position: "absolute",
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
          <Swap astrumAmount={state.astrumAmount} setAstrumAmount={setAstrumAmount} />
        </TabPanel>
        <TabPanel value="2">
          <AddLiquidity
            astrumAmount={state.astrumAmount}
            ethAmount={state.ethAmount}
            setAstrumAmount={setAstrumAmount}
            ethToAstrumRatio={0.00001}
          />
        </TabPanel>
        <TabPanel value="3">Remove liquidity</TabPanel>
      </TabContext>
    </Box>
  )
}
