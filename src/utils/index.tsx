import { ethers } from "ethers";
import { abiNft } from "./ABIs/NftAbi.json";
import { abiUni } from "./ABIs/UniswapAbi.json";
import {abiAave} from "./ABIs/AaveAbi.json"
import { BigNumberish } from "ethers";
import { Contract } from "ethers";

const NFTAddress = "0x85709818a3E5C570fAb0654d69a3ad52826900a3"
const USDbCAddress = "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca"
const WETHAddress = "0x4200000000000000000000000000000000000006"
const fee = 500


export const formatBalance = (rawBalance: string) => {
  const balance = (parseInt(rawBalance) / 1000000000000000000).toFixed(2);
  return balance;
};

export const formatChainAsNum = (chainIdHex: string) => {
  const chainIdNum = parseInt(chainIdHex);
  return chainIdNum;
};

export const checkNftAccess = async (id: number) : Promise<boolean>=> {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const tokenContract = new (ethers as any).Contract(NFTAddress, abiNft, provider);
  const signer = (await provider.getSigner());
  if(await tokenContract.connect(signer).balanceOf(signer.address, 0)){
    console.log("ACESS TRUE")

    return true;
  }
  return false;
};

export const tokenApprove = async (tokenAddr: string, amount: BigNumberish, to: string) => {
  const abiERC20 = ["function approve(address,uint256) external"]
  const provider = new ethers.BrowserProvider(window.ethereum)
  const tokenContract = new (ethers as any).Contract(tokenAddr, abiERC20, provider);
  const signer = (await provider.getSigner());
  await tokenContract.connect(signer).approve(to, amount);
};



export const getCalldata = async (taskNumber: number) : Promise<Contract | string | undefined> => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = (await provider.getSigner());
    let ifaceNft = new ethers.Interface(abiNft);
    let ifaceUni = new ethers.Interface(abiUni);
    let simpleAbiAave = ["function supply(address,uint256,address,uint16) external"]
    let aave =  new ethers.Contract("0xa238dd80c259a72e81d7e4664a9801593f98d1c5",simpleAbiAave,provider)
    
    // await aave.connect(signer).supply(USDbCAddress, 1000000, signer.address, 0)

  switch (taskNumber) {
    case 0:
      return ifaceNft.encodeFunctionData("buy", [])
    case 2:
      const params1 = {
        tokenIn: USDbCAddress,
        tokenOut: WETHAddress,
        fee: fee,
        recipient: signer.address,
        amountIn: 1000000,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
        }
        return ifaceUni.encodeFunctionData("exactInputSingle", [params1]);
      // const exavtInputSingleData = ethers.AbiCoder.defaultAbiCoder().encode(["address", "address", "uint24", "address", "uint256", "uint256", "uint160"],
      // [USDbCAddress, WETHAddress, fee, signer.address, 1000000, 0, 0])
      //   return ifaceUni.encodeFunctionData("exactInputSingle", [exavtInputSingleData]);
    case 3:
        return aave;
  }
  
};
