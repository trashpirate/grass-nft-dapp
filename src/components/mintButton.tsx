import { tokenABI } from '@/assets/tokenABI';
import { config, isTestnet } from '@/lib/config';
import { Dialog, Transition } from '@headlessui/react'
import { MoonLoader } from 'react-spinners';
import { Fragment, useEffect, useState } from 'react'
import { formatEther, formatUnits } from 'viem';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { getBalance, readContract, switchChain } from 'wagmi/actions';
import Image from 'next/image';
import { ConnectKitButton } from 'connectkit';
import { nftABI } from '@/assets/nftABI';
import { base } from 'viem/chains';

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;

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

function getTokenNumberString(amount: number) {

    let text: string = "---";
    if (amount != null) {

        text = `${amount.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}${String.fromCharCode(8239)} ${process.env.NEXT_PUBLIC_TOKEN_SYMBOL
            }`;
        return text;
    }
}

async function hasTokensApproved(account: `0x${string}` | undefined, quantity: number): Promise<[boolean, boolean, bigint]> {

    // read token fee
    const tokenFee = await readContract(config, {
        ...nftContract,
        functionName: "getTokenFee",
    });

    const totalTokenFee = tokenFee * BigInt(quantity);

    // read allowance
    const balance = await readContract(config, {
        ...tokenContract,
        functionName: "balanceOf",
        args: [account as `0x${string}`]
    });

    const sufficientBalance = balance >= totalTokenFee;

    // read allowance
    const allowance = await readContract(config, {
        ...tokenContract,
        functionName: "allowance",
        args: [account as `0x${string}`, NFT_CONTRACT]
    });

    const approved = allowance >= totalTokenFee;

    return [sufficientBalance, approved, totalTokenFee];
}



type Props = {
    paused: boolean;
};

export default function MintButton({ paused }: Props) {

    // states
    let [isOpen, setIsOpen] = useState(false);
    let [isApproving, setIsApproving] = useState<boolean>(false);
    let [isMinting, setIsMinting] = useState<boolean>(false);
    let [mintCompleted, setMintCompleted] = useState<boolean>(false);
    let [quantity, setQuantity] = useState<number>(1);
    let [tokenFee, setTokenFee] = useState<number>(1);
    let [showError, setShowError] = useState<boolean>(false);
    let [errorMessage, setErrorMessage] = useState<string>("An Error occured.");

    // connected account
    const { address, isConnected, isConnecting, chainId } = useAccount();

    // set up write contract hooks
    const { data: mintHash,
        isPending: mintPending,
        isError: mintError,
        writeContract: callMint } = useWriteContract();

    const { data: approveHash,
        isPending: approvePending,
        isError: approveError,
        writeContract: callApprove } = useWriteContract();

    // approve
    async function approve(tokenFee: bigint) {
        callApprove({
            ...tokenContract,
            functionName: "approve",
            args: [NFT_CONTRACT, tokenFee],
            account: address,
        });
    }

    // mint
    async function mint() {
        // read account balance
        const balance = await getBalance(config, {
            address: address as `0x${string}`,
        })

        // read nft ETH fee
        const ethFee = await readContract(config, {
            ...nftContract,
            functionName: "getEthFee",
        });

        if (balance.value < ethFee) {
            setErrorMessage(`You have insufficient balance. You need ${Number(formatEther(ethFee)).toLocaleString(undefined, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
            })} ETH (minting fee) to mint an NFT.`)
            setShowError(true);
            return;
        }

        callMint({
            ...nftContract,
            functionName: "mint",
            args: [BigInt(quantity)],
            value: ethFee,
            account: address,
        });
    }

    // on button click
    async function onSubmit() {

        const [sufficientBalance, approved, fee] = await hasTokensApproved(address, quantity);

        if (!sufficientBalance) {
            setErrorMessage(`You have insufficient token balance. You need ${getTokenNumberString(Number(formatUnits(fee, 18)))} to mint ${quantity} NFT.`);
            setShowError(true);
            return;
        };

        /** adjust this if no tokens used for minting */
        // setIsMinting(true);
        // mint();

        if (approved) {
            setIsMinting(true);
            mint();
        }
        else {
            setIsApproving(true);
            approve(fee);
        }
    }

    // transaction hooks
    const { isLoading: isConfirmingMint, isSuccess: isConfirmedMint } =
        useWaitForTransactionReceipt({
            confirmations: 3,
            hash: mintHash
        })

    const { isLoading: isConfirmingApprove, isSuccess: isConfirmedApprove } =
        useWaitForTransactionReceipt({
            confirmations: 3,
            hash: approveHash,
        })

    // checking if minting or approving in process
    useEffect(() => {
        if (isConfirmedApprove) {
            setIsApproving(false);
            setIsMinting(true);
            mint();
        }
    }, [isConfirmedApprove]);

    // delay after minting is finished
    useEffect(() => {
        if (isConfirmedMint) {
            setMintCompleted(true);
        }
    }, [isConfirmedMint]);

    // open/close popup
    useEffect(() => {
        if (isApproving || isMinting || showError || mintCompleted) {
            setIsOpen(true);
        }
        else {
            setIsOpen(false);
        }
    }, [isApproving, isMinting, showError, mintCompleted])

    // approve error
    useEffect(() => {
        if (approveError) {
            setIsApproving(false);
        }
    }, [approveError])

    // minting error
    useEffect(() => {
        if (mintError) {
            setIsMinting(false);
        }
    }, [mintError])


    useEffect(() => {
        async function getTokenFee() {
            // read token fee
            const fee = await readContract(config, {
                ...nftContract,
                functionName: "getTokenFee",
            });

            if (fee !== undefined) {
                setTokenFee(Number(formatUnits(fee, 18)) * quantity);
            }
        }
        if (quantity !== undefined) {
            getTokenFee();
        }

    }, [quantity])

    // close pop up
    function closeModal() {
        setShowError(false);
        setIsApproving(false);
        setIsMinting(false);
        setMintCompleted(false);
    }

    // style of minting button
    function getButtonStyle() {
        if (!paused) {
            return "text-black hover:bg-primary hover:text-textColor ease-in-out duration-500";
        }
        else {
            return "text-primary"
        }
    }

    return (
        <>
            <div className="flex flex-row justify-center w-full ">
                <div className='flex flex-row w-fit mx-auto gap-4'>
                    <input
                        className="ml-auto rounded bg-secondary/20 py-1 px-2 text-left text-textColor h-10 w-24 placeholder:italic placeholder:text-secondary/50 placeholder-shown:border-secondary/50 border-secondary/50 border-2"
                        type="number"
                        value={quantity >= 1 ? String(quantity) : ""}
                        max="50"
                        min="1"
                        placeholder="# NFTs"
                        onChange={(e) => {
                            setQuantity(Number(e.target.value));
                        }}
                        disabled={mintPending || approvePending || paused || !isConnected}
                    />

                    <button
                        type="button"
                        disabled={mintPending || approvePending || paused || !isConnected}
                        onClick={onSubmit}
                        className={"w-24 rounded-md bg-secondary text-base font-bold h-10 mr-auto flex justify-center align-middle " + getButtonStyle()}
                    >
                        <div className='my-auto font-heading leading-4 h-fit'>MINT</div>
                    </button>
                </div>

            </div>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25" />
                    </Transition.Child>

                    <div className="fixed  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="flex items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="aspect-square flex flex-col justify-between w-screen max-w-xs transform overflow-hidden rounded-2xl text-white bg-white/20 backdrop-blur p-6 xxs:p-10 text-center align-middle shadow-xl transition-all">
                                    <div className='h-full w-full flex flex-col justify-between'>
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-secondary uppercase"
                                        >
                                            {isMinting && !showError && <div>Minting NFT</div>}
                                            {isApproving && !showError && <div>Approving Tokens</div>}
                                            {showError && <div>Error</div>}
                                        </Dialog.Title>
                                        <div className="mt-2 text-xs sm:text-sm text-white">
                                            {isApproving && approvePending && <p>{`Approve ${getTokenNumberString(tokenFee)} in your wallet to mint ${quantity} NFT(s).`}</p>}
                                            {isApproving && isConfirmingApprove && <p>{`Approving ${getTokenNumberString(tokenFee)}...`}</p>}
                                            {isMinting && mintPending && <div><p>Confirm transaction in your wallet.</p></div>}
                                            {isMinting && isConfirmingMint && <p>Minting your NFT(s)...</p>}
                                            {isMinting && isConfirmedMint && <div><p >Mint Successful!</p></div>}
                                            {showError && <p className='text-secondary'>{errorMessage}</p>}

                                        </div>
                                        <div className='my-4 flex justify-center h-16'>
                                            {(isConfirmingApprove || isConfirmingMint) ? <MoonLoader className='my-auto' color="#FFFFFF" speedMultiplier={0.7} /> :
                                                <Image
                                                    className='h-full w-auto my-auto'
                                                    src='/logo_transparent.png'
                                                    width={50}
                                                    height={50}
                                                    alt="EARN logo"
                                                    priority
                                                >
                                                </Image>}
                                        </div>
                                        <div >
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md bg-white/20 px-4 py-2 text-sm font-medium text-black hover:bg-white/40"
                                                onClick={closeModal}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>


                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition >
        </>
    )
}
