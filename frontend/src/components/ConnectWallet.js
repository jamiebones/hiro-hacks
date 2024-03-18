"use client";

import React, { useEffect, useState } from "react";
import { AppConfig, showConnect, UserSession } from "@stacks/connect";

const appConfig = new AppConfig(["store_write", "publish_data"]);

export const userSession = new UserSession({ appConfig });

const trimAddress = (address) => {
  if (address) {
    const start = address.substr(0, 6);
    const middle = ".....";
    const end = address.substr(address.length - 6, address.length)
    return `${start}${middle}${end}`
  }
  return null;
}

function authenticate() {
  showConnect({
    appDetails: {
      name: "Token Gated Demo",
      icon: window.location.origin + "/logo512.png",
    },
    redirectTo: "/",
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}

function disconnect() {
  userSession.signUserOut("/");
}

const ConnectWallet = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (mounted && userSession.isUserSignedIn()) {
    return (
      <div className="Container">
        <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded" onClick={disconnect}>
          Disconnect Wallet {trimAddress(userSession.loadUserData().profile.stxAddress.testnet)}
        </button>

        {/* <p>testnet: {userSession.loadUserData().profile.stxAddress.testnet}</p> */}
      </div>
    );
  }

  return (
    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" onClick={authenticate}>
      Connect Wallet
    </button>
  );
};

export default ConnectWallet;
