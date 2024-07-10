"use client";
import React, { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { nftABI } from "@/assets/nftABI";
import { config, isTestnet } from "@/lib/config";
import CopyToClipboard from "./copyToClipboard";
import Link from "next/link";
import Image from "next/image";
import { CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/solid";

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;
const COLLECTION_NAME = process.env.NEXT_PUBLIC_PROJECT_NAME;


export default function CollectionInfo() {
    const [totalSupplyString, setTotalSupplyString] = useState<string | null>(null);
    const [nftsRemainingString, setNftsRemainingString] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);

    useEffect(() => {
        // Use setTimeout to update the message after 2000 milliseconds (2 seconds)
        const timeoutId = setTimeout(() => {
            setCopied(false);
        }, 2000);

        // Cleanup function to clear the timeout if the component unmounts
        return () => clearTimeout(timeoutId);
    }, [copied]); // Empty dependency array ensures the effect runs only once

    const copylink = async (e: any) => {
        try {
            navigator.clipboard.writeText(`${TOKEN_CONTRACT}`);
            setCopied(true);
            console.log("copied: " + `${TOKEN_CONTRACT}`);
        } catch (e) {
            console.log(e);
        }
    };

    // define nft contract config
    const nftContract = {
        address: NFT_CONTRACT,
        abi: nftABI,
        config
    };

    // read total supply
    const {
        data: totalSupply,
        isLoading: totalSupplyLoading,
        isSuccess: totalSupplySuccess
    } = useReadContract({
        ...nftContract,
        functionName: "totalSupply",
    });

    // read max Supply
    const {
        data: maxSupply,
        isLoading: maxSupplyLoading,
        isSuccess: maxSupplySuccess
    } = useReadContract({
        ...nftContract,
        functionName: "getMaxSupply",
    });


    useEffect(() => {

        function getNftsRemainingString(supply: number, maxSupply: number) {
            let text: string = "---";
            if (totalSupplyLoading || maxSupplyLoading) {
                text = "Loading...";
            } else if ((totalSupplySuccess && totalSupply != undefined) && (maxSupplySuccess && maxSupply != undefined)) {
                text = `${(maxSupply - supply).toLocaleString()}`;
            } else {
                text = "---";
            }
            return text;
        }

        function getTotalSupplyString(supply: number) {
            let text: string = "---";
            if (totalSupplyLoading) {
                text = "Loading...";
            } else if (totalSupplySuccess && supply != undefined) {
                text = `${(supply).toLocaleString()}`;
            } else {
                text = "---";
            }
            return text;
        }

        if (totalSupply !== undefined && maxSupply !== undefined) {
            setTotalSupplyString(getTotalSupplyString(Number(totalSupply)));
            setNftsRemainingString(getNftsRemainingString(Number(totalSupply), Number(maxSupply)))
        }
    }, [maxSupply, totalSupply, totalSupplySuccess, totalSupplyLoading, maxSupplyLoading, maxSupplySuccess])





    return (
        <div className="h-fit mx-auto w-full rounded-md my-2 text-titleColor max-w-md flex flex-col justify-between mb-8 lg:mb-0 mt-auto">
            <div className="flex flex-row gap-5 align-middle justify-start">
                <h2 className="mb-4 border-b-2 border-primary pb-2 text-lg uppercase text-textColor font-heading">
                    {COLLECTION_NAME}
                </h2>

            </div>
            <div className='gap-2 w-full align-middle leading-4 mb-2 flex flex-row'>
                <div className='ml-0 my-auto w-fit text-secondary opacity-60 text-base'>CA: </div>
                <CopyToClipboard
                    text={NFT_CONTRACT}
                    copyText={NFT_CONTRACT}
                    textColor='text-secondary'
                    textSize='text-base'
                    iconSize='text-[10px]'
                />
                <Link className="opacity-80 hover:opacity-100 my-auto w-fit" href={`https://${isTestnet() ? "sepolia." : ""}basescan.org/address/${NFT_CONTRACT}`} target="_blank">
                    <Image
                        src="/basescan.svg"
                        width={122}
                        height={122}
                        style={{ width: "15px", height: "auto" }}
                        alt="etherscan"
                    />
                </Link>
            </div>
            <div className="min-h-24 w-full text-secondary my-4">
                <div>Touch Grassy NFTs provide revenue share from the GRASS ecosystem to holders.</div>
            </div>
            <div className=" text-base">
                <div className="grid grid-cols-2 justify-between w-full text-secondary my-4">
                    <h3 className="uppercase">Minting Fee: </h3>
                    <div className="flex flex-row justify-end gap-2">
                        <p className="text-right">200K GRASS</p>
                        <div onClick={copylink} className="cursor-pointer text-[10px] w-4 my-auto opacity-60 hover:opacity-100">
                            {copied ? <CheckIcon /> : <ClipboardDocumentIcon />}
                        </div>
                        <Link className="opacity-80 hover:opacity-100 my-auto w-fit" href={`https://${isTestnet() ? "sepolia." : ""}basescan.org/address/${TOKEN_CONTRACT}`} target="_blank">
                            <Image
                                src="/basescan.svg"
                                width={122}
                                height={122}
                                style={{ width: "15px", height: "auto" }}
                                alt="etherscan"
                            />
                        </Link>
                    </div>

                </div>
                <div className="grid grid-cols-2 w-full  text-secondary">
                    <h3>NFTs minted: </h3>
                    <p className="text-right">{totalSupplyString}</p>
                </div>
                <div className="grid grid-cols-2 w-full text-secondary">
                    <h3>NFTs remaining: </h3>
                    <p className="text-right">{nftsRemainingString}</p>
                </div>
            </div>



        </div>
    );
}