import * as React from "react"
import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import TabContext from "@mui/lab/TabContext"
import TabList from "@mui/lab/TabList"
import TabPanel from "@mui/lab/TabPanel"
import Swap from "./Swap"

export default function FarmWrapper() {
  const [value, setValue] = React.useState("1")

  const handleChange = (event, newValue) => {
    setValue(newValue)
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
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} centered>
            <Tab label="Swap" value="1" />
            <Tab label="Add liquidity" value="2" />
            <Tab label="Remove liquidity" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <Swap />
        </TabPanel>
        <TabPanel value="2">Add liquidity</TabPanel>
        <TabPanel value="3">Remove liquidity</TabPanel>
      </TabContext>
    </Box>
  )
}
