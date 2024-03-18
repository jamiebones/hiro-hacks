"use client";

import { useEffect, useState } from "react";
import { userSession } from "../components/ConnectWallet";
import { StacksDevnet } from "@stacks/network";
import {
  callReadOnlyFunction, standardPrincipalCV
} from '@stacks/transactions';

const contractAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";



const TokenComponent = () => {
    const [isClient, setIsClient] = useState(false);
    const [userTokenAmount, setUserTokenAmount] = useState(0)
    const readTokenBalance = async () => {
      const userTestnetAddress = userSession.loadUserData().profile.stxAddress.testnet;
      try {
        const contractName = 'ptoken';
        const functionName = 'get-balance';
        const network = new StacksDevnet();
        const senderAddress = userTestnetAddress;
        const options = {
          contractAddress,
          contractName,
          functionName,
          functionArgs: [standardPrincipalCV(userTestnetAddress)],
          network,
          senderAddress,
        };
        const result = await callReadOnlyFunction(options);
        const { value: { value } } = result
        const tokenAmount = +value.toString() / 1_000_000
        setUserTokenAmount(tokenAmount)
        console.log("result => ", tokenAmount + "PT")
      } catch (error) {
        console.log("error => ", error);
      }
    };

    useEffect(() => {
        readTokenBalance();
      }, [])
    
      useEffect(() => {
        setIsClient(true);
      }, []);

    if (!isClient) return null;

    return (
        <div>
            Token balance: {userTokenAmount} PT
        </div>
    )
  

}



export default TokenComponent