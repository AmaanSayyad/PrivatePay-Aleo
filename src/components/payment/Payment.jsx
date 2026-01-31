import { Button, Input, Spinner } from "@nextui-org/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useLoaderData, useParams } from "react-router-dom";
import { useAppWallet } from "../../hooks/useAppWallet.js";
import { getPaymentLinkByAlias, getUserByUsername, recordPayment } from "../../lib/supabase.js";
import { executeAleoOperation, OPERATION_TYPES, TREASURY_ADDRESS } from "../../lib/aleo/aleoTransactionHelper.js";
import SuccessDialog from "../dialogs/SuccessDialog.jsx";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";

export default function Payment() {
  const loaderData = useLoaderData();
  const { alias_url } = useParams();
  const { account, isConnected, requestTransaction, transactionStatus, publicKey } = useAppWallet();

  const alias = loaderData ? loaderData.subdomain : alias_url;

  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [paymentLinkData, setPaymentLinkData] = useState(null);
  const [recipientData, setRecipientData] = useState(null);
  const [amount, setAmount] = useState("");
  const [openSuccess, setOpenSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPaymentLink() {
      if (!alias) {
        setError("No payment link alias provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const paymentLink = await getPaymentLinkByAlias(alias);

        if (paymentLink) {
          setPaymentLinkData(paymentLink);
          const recipient = await getUserByUsername(paymentLink.username);
          setRecipientData(recipient);
        } else {
          const recipient = await getUserByUsername(alias);
          if (recipient) {
            setRecipientData(recipient);
          } else {
            setError("Payment link not found. Please check the URL and try again.");
          }
        }
      } catch (err) {
        console.error("Error fetching payment link:", err);
        setError("Failed to load payment link. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPaymentLink();
  }, [alias]);

  const handleSendPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!isConnected || !account) {
      toast.error("Please connect your Leo Wallet (Aleo) first");
      return;
    }

    const recipientUsername = paymentLinkData?.username || alias;

    if (!recipientUsername) {
      toast.error("Recipient not found");
      return;
    }

    // All payments go to the single treasury; recipient's balance is credited in-app and they withdraw from treasury
    setIsSending(true);
    try {
      const result = await executeAleoOperation(
        requestTransaction,
        publicKey?.toString(),
        OPERATION_TYPES.TRANSFER,
        { recipient: TREASURY_ADDRESS, amount: parseFloat(amount), type: "Payment" },
        transactionStatus
      );

      if (!result.success) {
        throw new Error(result.error || "Transaction failed");
      }

      await recordPayment(
        account,
        recipientUsername,
        parseFloat(amount),
        result.txHash
      );

      window.dispatchEvent(new Event("balance-updated"));
      window.dispatchEvent(new Event("transactions-updated"));

      const shortHash = result.txHash
          ? `${result.txHash.slice(0, 6)}...${result.txHash.slice(-4)}`
          : result.txHash ?? "";

      toast.success(
        (t) => (
          <div
            onClick={() => {
              if (result.explorerLink) window.open(result.explorerLink, "_blank");
              toast.dismiss(t.id);
            }}
            className="cursor-pointer hover:underline"
          >
            Payment sent to {alias}.privatepay.me! TX: {shortHash} (click to view)
          </div>
        ),
        { duration: 8000 }
      );

      const successDataObj = {
        type: "PRIVATE_TRANSFER",
        amount: parseFloat(amount),
        chain: { name: "Aleo", id: "aleo" },
        token: {
          nativeToken: {
            symbol: "ALEO",
            logo: "/aleo-logos/SVG/primary-logo-light.svg",
          },
        },
        destinationAddress: `${alias}.privatepay.me`,
        txHashes: [result.txHash],
      };
      setSuccessData(successDataObj);
      setOpenSuccess(true);
      setAmount("");
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err.message || "Failed to send payment");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <SuccessDialog
        open={openSuccess}
        setOpen={setOpenSuccess}
        botButtonHandler={() => setOpenSuccess(false)}
        botButtonTitle="Done"
        successData={successData}
      />

      <div className="flex flex-col w-full max-w-md h-full max-h-screen items-center justify-center gap-5">
        <div className="w-28 h-10 flex items-center justify-center">
          <img
            src="/assets/squidl-only.svg"
            alt="Squidl"
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="w-full h-full flex items-center justify-center">
          {isLoading && (
            <div className="my-10 flex flex-col items-center">
              <Spinner color="primary" size="lg" />
              <div className="mt-5 animate-pulse text-gray-600">Loading payment link...</div>
            </div>
          )}

          {!isLoading && error && (
            <div className="text-center max-w-[20rem] bg-red-50 border border-red-200 rounded-2xl p-6">
              <p className="text-red-800 font-medium">{error}</p>
              <p className="text-red-600 text-sm mt-2">Please check the link and try again.</p>
            </div>
          )}

          {!isLoading && !error && (paymentLinkData || recipientData) && (
            <div className="bg-white rounded-[32px] py-9 px-10 md:px-20 flex flex-col items-center justify-center w-full border border-gray-200 shadow-lg">
              <h1 className="font-aleo font-medium text-xl mb-2 text-center">
                Send to{" "}
                <span className="font-semibold text-primary">{alias}</span>
              </h1>

              <p className="text-sm text-gray-500 mb-6">
                {alias}.privatepay.me
                {paymentLinkData?.username && paymentLinkData.username !== alias && (
                  <span className="text-xs text-gray-400 ml-2">
                    ({paymentLinkData.username})
                  </span>
                )}
              </p>

              {!isConnected ? (
                <div className="w-full flex flex-col gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <p className="text-sm text-blue-800 text-center">
                      Connect your Leo Wallet (Aleo) to send a payment
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <WalletMultiButton className="!bg-primary !text-white !font-bold !py-5 !px-6 !h-16 !rounded-[32px]" />
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-800 font-medium">Wallet Connected</p>
                        <p className="text-xs text-green-600 mt-1">
                          {account?.slice(0, 10)}...{account?.slice(-8)}
                        </p>
                      </div>
                      <svg className="text-green-600 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <Input
                    label="Amount (ALEO)"
                    type="number"
                    placeholder="0.1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    description="Enter the amount you want to send"
                    classNames={{ input: "text-lg", inputWrapper: "h-14" }}
                    min="0"
                    step="0.001"
                  />

                  <Button
                    onClick={handleSendPayment}
                    isLoading={isSending}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className="bg-primary text-white font-bold py-5 px-6 h-16 w-full rounded-[32px]"
                    size="lg"
                  >
                    {isSending ? "Sending..." : `Send ${amount || "0"} ALEO`}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-2">
                    Funds go to the treasury. The recipient is credited in-app and can withdraw their amount from the app.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
