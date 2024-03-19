"use client";

import { useEffect, useState } from "react";
import { Connect } from "@stacks/connect-react";
import { userSession } from "../components/ConnectWallet";
import { StacksDevnet } from "@stacks/network";
import {
  callReadOnlyFunction, standardPrincipalCV, ClarityType, AnchorMode,
  PostConditionMode, contractPrincipalCV, uintCV, intCV
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import Navbar from "@/components/Navbar";
const contractAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
import { Button, Label, TextInput } from 'flowbite-react';
import { DevNetDeployer, TestnetDeployer } from "@/util";


const tokenAddress = contractPrincipalCV(DevNetDeployer, "ptoken")


export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [liquidityAmount, setLiquidityAmount] = useState(0)
  const [amountToMint, setAmountToMint] = useState(0)
  const [receiverAddress, setReceiverAddress] = useState(null);
  const [paymentAddress, setPaymentAddress] = useState(null);
  const [sharesToWithdraw, setSharesToWithdraw] = useState(0)
  const [openPositionObject, setOpenPositionObject] = useState({
    positionSize: 0,
    collateral: 0,
    positionType: 0
  })
  const [liquidateAddress, setLiquidateAddress] = useState(null);




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

  const withdrawLiquidity = () => {
    let amount = sharesToWithdraw * 1000_000;
    amount = uintCV(amount);
    openContractCall({
      network: new StacksDevnet(),
      anchorMode: AnchorMode.Any, // which type of block the tx should be mined in
      contractAddress: contractAddress,
      contractName: 'vault',
      functionName: 'withdrawLiquidity',
      functionArgs: [amount, standardPrincipalCV(paymentAddress), tokenAddress],

      postConditionMode: PostConditionMode.Allow, // 
      postConditions: [], // for an example using post-conditions, see next example

      onFinish: data => {
        // WHEN user confirms pop-up
        setSharesToWithdraw(0);
        setPaymentAddress(null)
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

  const openPosition = () => {
    let collacteral = +openPositionObject.collateral;
    let positionSize = +openPositionObject.positionSize;
    let positionType = +openPositionObject.positionType
    if (collacteral == 0 || positionSize == 0 || positionType == 0) return;
    collacteral = collacteral * 1000_000;
    collacteral = intCV(collacteral);
    positionSize = positionSize * 1000_000;
    positionSize = intCV(positionSize);
    positionType = intCV(positionType)
    openContractCall({
      network: new StacksDevnet(),
      anchorMode: AnchorMode.Any, // which type of block the tx should be mined in
      contractAddress: contractAddress,
      contractName: 'perpsprotocol',
      functionName: 'openPosition',
      functionArgs: [positionSize, collacteral, positionType],

      postConditionMode: PostConditionMode.Allow, // 
      postConditions: [], // for an example using post-conditions, see next example

      onFinish: data => {
        // WHEN user confirms pop-up
        setOpenPositionObject({
          positionSize: 0,
          positionType: 0,
          collateral: 0
        })
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

  const liquidatePosition = () => {
    if (!liquidateAddress) return;
    openContractCall({
      network: new StacksDevnet(),
      anchorMode: AnchorMode.Any, // which type of block the tx should be mined in
      contractAddress: contractAddress,
      contractName: 'perpsprotocol',
      functionName: 'liquidatePosition',
      functionArgs: [standardPrincipalCV(liquidateAddress)],

      postConditionMode: PostConditionMode.Allow, // 
      postConditions: [], // for an example using post-conditions, see next example

      onFinish: data => {
        // WHEN user confirms pop-up
       setLiquidateAddress(null)
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


            <div className="mt-6 mb-6">
              <p className="text-lg">Withdraw Liquidity from Vault</p>

              <form className="flex max-w-md flex-col gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="shares" value="Shares to Withdraw" />
                  </div>
                  <TextInput
                    onChange={(e) => setSharesToWithdraw(+e.target.value)}
                    id="shares"
                    type="number"
                    placeholder=""
                    required
                    value={sharesToWithdraw} />

                  <div className="mb-2 block">
                    <Label htmlFor="paymentAddress" value="Payment Address" />
                  </div>
                  <TextInput
                    onChange={(e) => setPaymentAddress(e.target.value)}
                    id="paymentAddress"
                    type="text"
                    placeholder="standard principal address"
                    required
                    value={paymentAddress} />
                </div>

                <Button type="button" onClick={withdrawLiquidity}>Withdraw Liquidity</Button>
              </form>
            </div>
          </div>

          <div className="flex-grow">
            <div className="mt-6 mb-6">
              <p className="text-lg">Open BTC Short/Long Position</p>

              <form className="flex max-w-md flex-col gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="positionSize" value="Position Size" />
                  </div>
                  <TextInput
                    onChange={(e) => setOpenPositionObject({ ...openPositionObject, positionSize: e.target.value })}
                    id="positionSize"
                    type="number"
                    placeholder="0"
                    required
                    value={openPositionObject.positionSize} />

                  <div className="mb-2 block">
                    <Label htmlFor="collacteral" value="Deposisted Collateral" />
                  </div>
                  <TextInput
                    onChange={(e) => setOpenPositionObject({ ...openPositionObject, collateral: e.target.value })}
                    id="collacteral"
                    type="number"
                    placeholder="0"
                    required
                    value={openPositionObject.collateral} />

                  <div className="mb-2 block">
                    <Label htmlFor="positionType" value="Position Type" />
                  </div>

                  <select
                    onChange={(e) => setOpenPositionObject({ ...openPositionObject, positionType: e.target.value })}>
                    <option value="0">Select Position</option>
                    <option value="2">Long Position</option>
                    <option value="1">Short Position</option>
                  </select>
                </div>

                <Button type="button" onClick={openPosition}>Open Position</Button>
              </form>
            </div>


            <div className="mt-6 mb-6">
              <p className="text-lg">Liquidate Position</p>

              <form className="flex max-w-md flex-col gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="liquidate" value="Principal Address" />
                  </div>
                  <TextInput
                    onChange={(e) => setLiquidateAddress(e.target.value)}
                    id="liquidate"
                    type="text"
                    placeholder="account to liquidate"
                    required
                    value={liquidateAddress} />

                </div>

                <Button type="button" onClick={liquidatePosition}>Liquidate Position</Button>
              </form>
            </div>



          </div>

        </div>










      </main>
    </Connect>
  );
}

