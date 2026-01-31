import { Link } from "react-router-dom";
import { useAppWallet } from "../hooks/useAppWallet.js";
import { Send, Shield } from "lucide-react";

export default function TransferPage() {
  const { isConnected } = useAppWallet();

  if (isConnected) {
    return (
      <div className="flex min-h-screen w-full items-start justify-center py-20 px-4 md:px-10 bg-light-white pb-24">
        <div className="max-w-md w-full flex flex-col gap-6 rounded-3xl bg-white p-8 shadow-lg border border-gray-200">
          <h1 className="font-aleo text-xl font-bold text-center">Transfer</h1>
          <p className="text-neutral-600 text-center text-sm">
            Use Aleo to send private transfers. Go to Send to transfer ALEO.
          </p>
          <Link
            to="/aleo"
            className="flex items-center gap-3 p-4 rounded-xl bg-primary text-white hover:opacity-90 transition-opacity font-medium justify-center"
          >
            <Send className="size-5" />
            Open Send (Aleo)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center py-20 px-4 md:px-10 bg-light-white pb-24">
      <div className="max-w-md w-full flex flex-col gap-6 rounded-3xl bg-white p-8 shadow-lg border border-gray-200">
        <h1 className="font-aleo text-xl font-bold text-center">Transfer</h1>
        <p className="text-neutral-600 text-center text-sm">
          Connect your Leo Wallet (Aleo) to send private transfers.
        </p>
        <Link
          to="/aleo"
          className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
        >
          <Shield className="size-5 text-primary" />
          <span className="font-medium">Aleo — Send & Transfer</span>
        </Link>
      </div>
    </div>
  );
}
