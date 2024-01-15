import './App.css'
import { useState, useEffect } from 'react'
import { formatBalance, formatChainAsNum, getCalldata, checkNftAccess, tokenApprove } from './utils'
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers, parseEther } from "ethers";

const App = () => {
  const [hasProvider, setHasProvider] = useState<boolean | null>(null)
  const initialState = { accounts: [], balance: "", chainId: "" }
  const [wallet, setWallet] = useState(initialState)


  const contractTargetAddress1 = "0xe4edb277e41dc89ab076a1f049f4a3efa700bce8" //orbit bridge
  const contractTargetAddress2 = "0x2626664c2603336e57b271c5c0b26f421741e481" // uni
  const contractTargetAddress3 = "0xa238dd80c259a72e81d7e4664a9801593f98d1c5" // aave
  const contractNft = "0x85709818a3E5C570fAb0654d69a3ad52826900a3"
  const USDbC = "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA"

  const [isConnecting, setIsConnecting] = useState(false)  /* New */
  const [error, setError] = useState(false)                /* New */
  const [errorMessage, setErrorMessage] = useState("")     /* New */

  useEffect(() => {
    const refreshAccounts = (accounts: any) => {
      if (accounts.length > 0) {
        updateWallet(accounts)
      } else {
        // if length 0, user is disconnected
        setWallet(initialState)
      }
    }

    const refreshChain = (chainId: any) => {
      setWallet((wallet) => ({ ...wallet, chainId }))
    }

    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true })
      setHasProvider(Boolean(provider))

      if (provider) {
        const accounts = await window.ethereum.request(
          { method: 'eth_accounts' }
        )
        refreshAccounts(accounts)
        window.ethereum.on('accountsChanged', refreshAccounts)
        window.ethereum.on("chainChanged", refreshChain)
      }
    }

    getProvider()

    return () => {
      window.ethereum?.removeListener('accountsChanged', refreshAccounts)
      window.ethereum?.removeListener("chainChanged", refreshChain)
    }
  }, [])

  const updateWallet = async (accounts: any) => {
    const balance = formatBalance(await window.ethereum!.request({
      method: "eth_getBalance",
      params: [accounts[0], "latest"],
    }))
    const chainId = await window.ethereum!.request({
      method: "eth_chainId",
    })
    setWallet({ accounts, balance, chainId })
  }

  const handleConnect = async () => {                   /* Updated */
    setIsConnecting(true)                               /* New */
    await window.ethereum.request({                     /* Updated */
      method: "eth_requestAccounts",
    })
    .then((accounts:[]) => {                            /* New */
      setError(false)                                   /* New */
      updateWallet(accounts)                            /* New */
    })                                                  /* New */
    .catch((err:any) => {                               /* New */
      setError(true)                                    /* New */
      setErrorMessage(err.message)                      /* New */
    })                                                  /* New */
    setIsConnecting(false)                              /* New */
  }

  const handleBuyNft = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = (await provider.getSigner());
    let transaction = {
      to: contractNft,
      data: await getCalldata(0) as string,
    };
    await signer.sendTransaction(transaction)
  }

  const handleTask1 = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = (await provider.getSigner());
    let transaction = {
      to: contractTargetAddress1,
      value: parseEther("0.0001"),
    };
    await signer.sendTransaction(transaction)
  }

  const handleTask2 = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = (await provider.getSigner());
    let transaction = {
      to: contractTargetAddress2,
      data: await getCalldata(2) as string,
    };
    await signer.sendTransaction(transaction)
  }

  const approveAave = async () => {
    const amountToApprove = BigInt("1000000")
    await tokenApprove(USDbC, amountToApprove, contractTargetAddress3)
  }

  const approveUni = async () => {
    const amountToApprove = BigInt("1000000")
    await tokenApprove(USDbC, amountToApprove, contractTargetAddress2)
  }

  const handleTask3 = async () => {
    if (!(await checkNftAccess(0))) {
      console.log("Don't have an access, pls buy access");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = (await provider.getSigner());
    let aave : any = await getCalldata(3)
    await aave.connect(signer).supply(USDbC, 1000000, signer.address, 0)
    // let transaction = {
    //   to: contractTargetAddress3,
    //   data: await getCalldata(3),
    //   gasLimit: 30000000,
    // };
    // await signer.sendTransaction(transaction)
  }

  const disableConnect = Boolean(wallet) && isConnecting

  return (
    <div className="App">
      <div>Injected Provider {hasProvider ? 'DOES' : 'DOES NOT'} Exist</div>

      {window.ethereum?.isMetaMask && wallet.accounts.length < 1 &&
                /* Updated */
        <button disabled={disableConnect} onClick={handleConnect}>Connect MetaMask</button>
      }

      {wallet.accounts.length > 0 &&
        <>
          <h1>Wallet info</h1>
          <div>Wallet Accounts: {wallet.accounts[0]}</div>
          <div>Numeric ChainId: {formatChainAsNum(wallet.chainId)}</div>
        </>
      }
  {
        <>
        <h1>Tasks</h1>
        <h3>Bridge on orbiter</h3>
        <button onClick={handleTask1}>Execute</button>
        <h3>Simple uniswap swap</h3>
        <button onClick={approveUni}>Approve USDbC to Uni</button>
        <button onClick={handleTask2}>Execute</button>
        <h3>Buy our NFT to continue steps</h3>
        <button onClick={handleBuyNft}>Buy NFT</button>
        <h3>Aave supply</h3>
        <button onClick={approveAave}>Approve USDbC to AAve</button>
        <button onClick={handleTask3}>Execute</button>
        </>
      }
      { error && (                                        /* New code block */
          <div onClick={() => setError(false)}>
            <strong>Error:</strong> {errorMessage}
          </div>
        )
      }
    </div>
  )
}

export default App