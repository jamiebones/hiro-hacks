"use client";

import { useEffect, useState } from "react";
import { Connect } from "@stacks/connect-react";
import { userSession } from "../components/ConnectWallet";
import { StacksDevnet } from "@stacks/network";
import {
  callReadOnlyFunction, standardPrincipalCV, ClarityType, AnchorMode,
  PostConditionMode, contractPrincipalCV, uintCV
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import Navbar from "@/components/Navbar";
const contractAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
import { Button, Label, TextInput } from 'flowbite-react';



const tokenAddress = contractPrincipalCV(contractAddress, "ptoken")


export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [liquidityAmount, setLiquidityAmount] = useState(0)
  const [amountToMint, setAmountToMint] = useState(0)
  const [receiverAddress, setReceiverAddress] = useState(null);






  const provideLiquidityToVault = () => {
    let amountToProvideAsLiquidity = liquidityAmount * 1000_000;
    amountToProvideAsLiquidity = uintCV(amountToProvideAsLiquidity);
    openContractCall({
      network: new StacksDevnet(),
      anchorMode: AnchorMode.Any, // which type of block the tx should be mined in

      contractAddress: contractAddress,
      contractName: 'vault',
      functionName: 'depositLiquidity',
      functionArgs: [amountToProvideAsLiquidity, tokenAddress],

      postConditionMode: PostConditionMode.Allow, // whether the tx should fail when unexpected assets are transferred
      postConditions: [], // for an example using post-conditions, see next example

      onFinish: data => {
        // WHEN user confirms pop-up
        setLiquidityAmount(0)
        window
          .open(
            `http://localhost:8000/txid/${data.txId}?chain=testnet&api=http://localhost:3999`,
            "_blank"
          )
          .focus();
      },
      onCancel: () => {
        // WHEN user cancels/closes pop-up
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  const mintTokens = () => {
    let amount = amountToMint * 1000_000;
    amount = uintCV(amount);
    openContractCall({
      network: new StacksDevnet(),
      anchorMode: AnchorMode.Any, // which type of block the tx should be mined in
      contractAddress: contractAddress,
      contractName: 'ptoken',
      functionName: 'mint',
      functionArgs: [amount, standardPrincipalCV(receiverAddress)],

      postConditionMode: PostConditionMode.Deny, // whether the tx should fail when unexpected assets are transferred
      postConditions: [], // for an example using post-conditions, see next example

      onFinish: data => {
        // WHEN user confirms pop-up
        setAmountToMint(0)
        window
          .open(
            `http://localhost:8000/txid/${data.txId}?chain=testnet&api=http://localhost:3999`,
            "_blank"
          )
          .focus();
      },
      onCancel: () => {
        // WHEN user cancels/closes pop-up
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  const handleLiquidityChange = (e) => {
    const { value } = e.target;
    setLiquidityAmount(+value)
    
  }


  useEffect(() => {
    setIsClient(true);
    
  }, []);


  if (!isClient) return null;

  return (
    <Connect
      authOptions={{
        appDetails: {
          name: "Stacks Next.js Template",
          icon: window.location.origin + "/logo.png",
        },
        redirectTo: "/",
        onFinish: () => {
          window.location.reload();
        },
        userSession,
      }}
    >
      <main>
        <Navbar />

        <div className="flex">
          <div className="flex-grow">
            <div className="mt-6">

              <p className="text-lg">Mint Token For Deployer</p>

              <form className="flex max-w-md flex-col gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="amountToMint" value="Amount" />
                  </div>
                  <TextInput
                    onChange={(e) => setAmountToMint(+e.target.value)}
                    id="amountToMint"
                    type="number"
                    placeholder=""
                    required
                    value={amountToMint} />

                  <div className="mb-2 block">
                    <Label htmlFor="receiverAddress" value="Receiver Address" />
                  </div>
                  <TextInput
                    onChange={(e) => setReceiverAddress(e.target.value)}
                    id="receiverAddress"
                    type="text"
                    placeholder="standard principal address"
                    required
                    value={receiverAddress} />
                </div>

                <Button type="button" onClick={mintTokens}>Mint Token</Button>
              </form>
            </div>


            <div className="mt-6">

              <p className="text-lg">Provide Liquidity to Perps Protocol</p>

              <form className="flex max-w-md flex-col gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="amount" value="Amount" />
                  </div>
                  <TextInput
                    onChange={handleLiquidityChange}
                    id="amount"
                    type="number"
                    placeholder="00"
                    required
                    value={liquidityAmount} />
                </div>

                <Button type="button" onClick={provideLiquidityToVault}>Provide Liquidity</Button>
              </form>
            </div>




          </div>
          <div className="flex-grow">



          </div>
          <div className="flex-grow">



          </div>
        </div>










      </main>
    </Connect>
  );
}

