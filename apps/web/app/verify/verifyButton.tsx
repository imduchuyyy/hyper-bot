"use client";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { Address, checksumAddress, Hex } from "viem";
import { useAccount, useSignMessage } from "wagmi";

interface Props {
  submitSignature: (address: Address, signature: Hex) => Promise<boolean>;
  messageToSign: string;
}

const VerifyButton = ({ submitSignature, messageToSign }: Props) => {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { signMessageAsync } = useSignMessage();
  const verify = async () => {
    if (!isConnected || !address) {
      console.log("Connect");
      return;
    }

    const signature = await signMessageAsync({
      message: messageToSign,
    });

    submitSignature(checksumAddress(address), signature);
    window.close();
  };

  return (
    <div className="flex justify-center">
      {!isConnected ? (
        <button
          onClick={openConnectModal}
          className="w-full px-4 py-2 font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-md"
        >
          Connect Wallet
        </button>
      ) : (
        <button
          onClick={verify}
          className="w-full px-4 py-2 font-semibold text-white bg-green-500 hover:bg-green-600 rounded-md"
        >
          Sign Message
        </button>
      )}
    </div>
  );
};

export default VerifyButton;
