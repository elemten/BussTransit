'use client'
import {  Button, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import ConnectWallet, { thirdWebClient, wallets } from "@/components/ConnectWallet";
import Link from "next/link";

import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { PixelifySans } from "./layout";
import { defineChain } from "thirdweb";
export const elysiumChain = defineChain({
  id: 1338,
  name: "Elysium Testnet",
  rpc: "https://rpc.atlantischain.network/",
  nativeCurrency: {
    name: "LAVA",
    symbol: "LAVA",
    decimals: 18,
  },
});
export default function Header() {
    return (
    <div className="flex flex-col w-full gap-2 justify-center mt-4">
        <div className=" logo w-full text-center ">
          <Link className={` text-primary font-bold text-4xl ${PixelifySans.className}`  }  href={'/'}>Smart Bus Transit</Link>
        </div>
        <div className=" flex flex-row w-full gap-5 justify-center items-center align-middle">
         
          <ConnectButton
            client={thirdWebClient}
            chain={elysiumChain}
            autoConnect
            wallets={wallets}
            theme={'dark'}
            detailsButton={{
              className:" !bg-primary !h-12 !text-md hover:!bg-primary  !font-semibold  !rounded-md",
            }}
            connectButton={
              {
                label: 'Connect Wallet',
                className: ' !text-primary !bg-transparent !h-12 !text-md hover:!bg-transparent hover:!text-primary !font-semibold  !rounded-md',
              }
            }
            />
        </div>
    </div>
    )
}