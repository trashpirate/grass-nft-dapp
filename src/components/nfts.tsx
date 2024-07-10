import Link from "next/link";
import { useEffect, useState } from "react";
import { Alchemy, Network, NftOrdering } from "alchemy-sdk";
import { useAccount, useReadContract } from "wagmi";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, MusicalNoteIcon, VideoCameraIcon, LinkIcon } from "@heroicons/react/24/solid";
import { nftABI } from "@/assets/nftABI";
import { config, isTestnet } from "@/lib/config";

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`;
const DEFAULT_NFT_TITLE_STYLE = "absolute bottom-0 left-1/2 text-center -translate-x-1/2 w-full bg-green-500 p-1";

const alchemyConfig = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    network: isTestnet() ? Network.BASE_SEPOLIA : Network.BASE_MAINNET,
};
const alchemy = new Alchemy(alchemyConfig);



type NFTMeta = {
    id: number;
    image: string;
    title: string;
    trait: string;
};

function getUrl(ipfsLink: string | undefined): string {
    if (ipfsLink === undefined) {
        return "";
    }
    const suburl = ipfsLink.replace("://", "/");
    return `https://dweb.link/${suburl}`;
}

export default function Nfts() {

    const [nftsOwned, setNftsOwned] = useState<NFTMeta[] | null>(null);
    const [currentIdx, setCurrentIdx] = useState<number>(0);

    // get account address
    const { address, isConnected } = useAccount({});

    // define token contract config
    const nftContract = {
        address: NFT_CONTRACT,
        abi: nftABI,
        config
    };


    // read nft balance
    const {
        data: nftBalance,
    } = useReadContract({
        ...nftContract,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
        query: {
            enabled: isConnected && address != null,
        },
    });

    useEffect(() => {
        async function getNFTs() {
            let imageArray: NFTMeta[] = [];
            if (isConnected && nftBalance !== undefined) {
                const nfts = await alchemy.nft.getNftsForOwner(address as `0x${string}`, { contractAddresses: [NFT_CONTRACT] });
                let nftList = nfts.ownedNfts;
                let totalNFTS = nfts.totalCount;
                console.log(nfts)
                for (let i = 0; i < Number(nftBalance); i++) {
                    const index = totalNFTS - i - 1;
                    const metadata = nftList[index].raw.metadata;
                    console.log(metadata.attributes[0].value)

                    let nft: NFTMeta = {
                        id: Number(nftList[index].tokenId),
                        image: getUrl(metadata.image),
                        title: metadata.name as string,
                        trait: metadata.attributes[0].value as string
                    };
                    imageArray.push(nft);
                }
            }
            return imageArray;
        }

        if (nftBalance !== undefined && nftBalance > 0) {
            getNFTs().then((nfts) => { setNftsOwned(nfts) });
        }
        else {
            setNftsOwned(null);
        }

    }, [nftBalance]);


    function forward() {

        if (nftsOwned !== null && nftBalance !== undefined && currentIdx < Number(nftBalance) - 1) {
            setCurrentIdx(currentIdx + 1);

        }
        else {
            setCurrentIdx(0);
        }

    }

    function backward() {
        // console.log(currentIdx)
        if (nftsOwned !== null && currentIdx > 0) {
            setCurrentIdx(currentIdx - 1);
        }
        else if (nftBalance !== undefined) {
            setCurrentIdx(Number(nftBalance) - 1);
        }

    }


    function getTitleColor() {

        if (nftsOwned !== null) {
            switch (nftsOwned[currentIdx].trait) {
                case 'GREEN':
                    return 'bg-green-700';
                case 'BLUE':
                    return 'bg-blue-700';
                case 'YELLOW':
                    return 'bg-yellow-500';
                case 'RED':
                    return 'bg-red-500';
                case 'PURPLE':
                    return 'bg-purple-500';
                default:
                    return 'bg-green-500';

            }
        }

    }


    return (
        <>
            {nftsOwned != null && nftsOwned.length > 0 &&
                <div className="text-white mb-4 mt-4 md:mt-auto flex flex-row justify-center gap-5">

                    <button className="opacity-70 hover:opacity-100 ease-in-out duration-500" onClick={forward}>
                        <ChevronLeftIcon className="size-6 text-secondary" />
                    </button>


                    <div className="h-fit w-fit rounded-lg overflow-hidden relative">
                        <Link href={`https://${isTestnet() ? "testnets." : ""}opensea.io/assets/${isTestnet() ? "base-sepolia" : "base"}/${NFT_CONTRACT}/${nftsOwned[currentIdx].id}`} target="_blank">
                            <Image
                                className='h-auto mx-auto mb-4 w-full max-w-48 object-cover overlfow-hidden'
                                src={nftsOwned[currentIdx].image}
                                width={1024}
                                height={1024}
                                alt="Grassy NFT"
                                priority
                            >

                            </Image>
                            <div className={`absolute top-2 left-2 ${getTitleColor()} text-white rounded-full text-[12px] w-8 h-8 flex justify-center align-middle`}>
                                <div className="text-center m-auto">
                                    {`#${nftsOwned[currentIdx].id}`}
                                </div>
                            </div>

                            <div className={`absolute bottom-0 left-1/2 text-center -translate-x-1/2 w-full ${getTitleColor()} p-1`}>{`${nftsOwned[currentIdx].title}`}</div>

                        </Link>
                    </div>


                    <button className="opacity-70 hover:opacity-100 ease-in-out duration-500" onClick={backward}>
                        <ChevronRightIcon className="size-6 text-secondary" />
                    </button>
                </div >}
        </>
    );
}

function classNames(arg0: string, arg1: { 'bg-blue-500': any; 'bg-gray-500': boolean; }) {
    throw new Error("Function not implemented.");
}
