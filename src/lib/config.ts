import { http, createConfig } from "@wagmi/core";
import { getDefaultConfig } from "connectkit";
import { cookieStorage, createStorage } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

export function isTestnet() {
  return process.env.NEXT_PUBLIC_ENABLE_TESTNET == "true";
}

export const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [isTestnet() ? baseSepolia : base],
    transports: {
      // RPC URL for each chain
      [isTestnet() ? baseSepolia.id : base.id]: http(
        `${process.env.NEXT_PUBLIC_RPC_URL}`
      ),
    },
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    appName: process.env.NEXT_PUBLIC_PROJECT_NAME as string,
    walletConnectProjectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,

    // Optional App Info
    appDescription: process.env.NEXT_PUBLIC_PROJECT_DESCRIPTION,
    appUrl: "https://liquid.buyholdearn.com", // your app's url
    appIcon: "https://liquid.buyholdearn.com/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);
