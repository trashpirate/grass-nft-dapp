import Link from "next/link";

type Props = {};

export default function Footer({ }: Props) {
    return (
        <footer className="text-center py-4 px-8 w-full flex-shrink-0 bg-secondary/10 mt-8">
            <div className="text-sm text-secondary mx-auto flex flex-row justify-center ">
                <p className="opacity-60">
                    Powered by
                </p>&nbsp;<Link className="font-bold hover:opacity-100 opacity-60 transition duriation-500" href="https://t.me/EARNServices">EARN Services</Link>
            </div>


        </footer>);
}