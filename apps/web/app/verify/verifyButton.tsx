"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Address, Hex } from "viem";
import { useAccount, useSignMessage } from "wagmi";

interface Props {
  submitSignature: (address: Address, signature: Hex) => Promise<boolean>;
  messageToSign: string;
}

const VerifyButton = ({ submitSignature, messageToSign }: Props) => {
  const { isConnected, address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const verify = async () => {
    if (!isConnected || !address) {
      console.log("Connect");
      return;
    }

    const signature = await signMessageAsync({
      message: messageToSign,
    })
    
    submitSignature(address, signature);
    window.close()
  };

  return (
    <div>
      {isConnected ? (
        <button onClick={verify}>Verify</button>
      ) : (
        <ConnectButton />
      )}
    </div>
  );
};

export default VerifyButton;
