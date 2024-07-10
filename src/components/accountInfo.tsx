
'use client'
import React, { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { tokenABI } from "@/assets/tokenABI";
import { formatUnits } from "viem";
import { nftABI } from "@/assets/nftABI";
import { ConnectKitButton } from "connectkit";
import { config } from "@/lib/config";
import { base } from "viem/chains";

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;


export default function AccountInfo() {
    const [tokenBalanceString, setTokenBalanceString] = useState<string | null>(null);
    const [nftBalanceString, setNftBalanceString] = useState<string | null>(null);

    // get account address
    const { address, isDisconnected, isConnected } = useAccount({});

    // define token contract config
    const tokenContract = {
        address: TOKEN_CONTRACT,
        abi: tokenABI,
        config
    };

    // define token contract config
    const nftContract = {
        address: NFT_CONTRACT,
        abi: nftABI,
        config
    };

    // check token balance
    const { data: tokenBalance, isLoading: tokenLoading, isSuccess: tokenSuccess } = useReadContract({
        ...tokenContract,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
        query: {
            enabled: isConnected && address != null,
        },
    });

    // read nft balance
    const {
        data: nftBalance,
        isLoading: nftLoading,
        isSuccess: nftSuccess
    } = useReadContract({
        ...nftContract,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
        query: {
            enabled: isConnected && address != null,
        },
    });

    // set token balance
    useEffect(() => {
        function getTokenBalanceString(balance: number) {

            let text: string = "---";
            if (tokenLoading) {
                text = "Loading...";
            } else if (tokenSuccess && balance != null) {

                text = `${balance.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                })}${String.fromCharCode(8239)} ${process.env.NEXT_PUBLIC_TOKEN_SYMBOL
                    }`;
            } else {
                text = "---";
            }
            return text;
        }

        if (tokenBalance !== undefined) {

            setTokenBalanceString(
                getTokenBalanceString(Number(
                    formatUnits(tokenBalance, 18),
                ))
            );
        }



    }, [tokenBalance, tokenLoading, tokenSuccess])



    // set NFT balance
    useEffect(() => {
        function getNftBalanceString(balance: number) {
            let text: string = "---";
            if (nftLoading) {
                text = "Loading...";
            } else if (nftSuccess && balance != null) {
                text = `${balance}`;
            } else {
                text = "---";
            }
            return text;
        }

        if (nftBalance !== undefined) {
            setNftBalanceString(getNftBalanceString(Number(nftBalance)));
        }
    }, [nftBalance, nftLoading, nftSuccess])



    return (
        <div className="h-fit mx-auto w-full rounded-md text-titleColor max-w-md ">

            <h2 className="mb-4 border-b-2 border-primary pb-2 text-lg uppercase  text-textColor font-heading">
                ACCOUNT INFO
            </h2>
            <div className="mb-4 text-sm">
                <ConnectKitButton showAvatar={false} showBalance={true} />
            </div>

            <div className="flex justify-between text-secondary text-sm">
                <h3>Balance: </h3>
                <p>{tokenBalanceString}</p>
            </div>
            <div className="flex justify-between text-secondary text-sm">
                <h3>NFTs: </h3>
                <p>{nftBalanceString}</p>
            </div>

        </div>
    );
}