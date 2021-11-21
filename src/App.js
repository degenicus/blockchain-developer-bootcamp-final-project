import "./App.css"
import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import { MetamaskInfo } from "./components/MetamaskInfo"

const ROPSTEN_ID = 3

function App() {
  const [state, setState] = useState({
    isMetaMaskDetected: false,
  })

  useEffect(() => {
    checkMetamask()
  })

  const checkMetamask = async () => {
    if (!state.isMetaMaskDetected) {
      try {
        await window.ethereum.enable()
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const network = await provider.getNetwork()
        if (signer && network && network.chainId === ROPSTEN_ID) {
          setState({ ...state, isMetaMaskDetected: true })
        }
      } catch (error) {}
    }
  }

  return (
    <div className="App">
      {!state.isMetaMaskDetected ? <MetamaskInfo /> : <div>Found metamask</div>}
    </div>
  )
}

export default App
