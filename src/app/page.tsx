
"use client";
import AccountInfo from '@/components/accountInfo';
import CollectionInfo from '@/components/collectionInfo';
import Footer from '@/components/footer';
import MintInfo from '@/components/mintInfo';
import Navbar from '@/components/navbar';
import Nfts from '@/components/nfts';
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-bgColor justify-stretch">
      <div className="mx-auto w-full flex flex-col lg:w-7/8 2xl:w-3/4 h-full mt-8 px-8 sm:px-12 items-stretch flex-flexMain">
        <Navbar></Navbar>

        <div>
          <Image
            className='h-auto mx-auto mt-4 lg:w-[45%]'
            src='/title.png'
            width={2553}
            height={960}
            alt="collection title"
            priority
          >
          </Image>
          <div className='text-secondary mx-auto text-center my-8 max-w-4xl'>{process.env.NEXT_PUBLIC_PROJECT_DESCRIPTION}</div>
        </div>
        <div>

        </div>
        <div className="w-full gap-8 md:gap-12 2xl:gap-20 flex flex-row flex-wrap-reverse lg:flex-nowrap justify-between h-full ">
          <CollectionInfo></CollectionInfo>
          <MintInfo></MintInfo>
          <div className="flex flex-col w-full justify-end order-first lg:order-none gap-4">
            <Nfts></Nfts>
            <AccountInfo></AccountInfo>
          </div>

        </div>
      </div>
      <Footer></Footer>
    </main>
  );
}
