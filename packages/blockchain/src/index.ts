import { createPublicClient, erc721Abi, http, type Hex } from "viem";
import { viction } from "viem/chains";

export const client = createPublicClient({
  chain: viction,
  transport: http(),
});

export const isHolder = async (collectionAddress: Hex, userAddress: Hex): Promise<boolean> => {
  const balance = await client.readContract({
    address: collectionAddress,
    abi: erc721Abi,
    functionName: "balanceOf",
    args: [userAddress],
  });

  return balance !== 0n;
}