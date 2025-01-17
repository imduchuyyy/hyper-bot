import { connectToDatabase, Groups, Users } from "@hyper-bot/database";
import VerifyButton from "./verifyButton";
import { Address, Hex, verifyMessage } from "viem";
import { bot, sendInviteLink } from "@hyper-bot/tlgbot";
import { isHolder } from "@hyper-bot/blockchain";

const VerifyPage = async ({ searchParams }: any) => {
  const userId = (await searchParams).userId;
  const groupId = (await searchParams).groupId;
  await connectToDatabase();

  // @ts-ignore
  const group = await Groups.findOne({
    groupId: groupId,
  }).lean();

  // @ts-ignore
  const user = await Users.findOne({
    userId: userId,
  }).lean();

  if (!group || !user) {
    return <div>Invalid link</div>;
  }
  const groupInfo = await bot.getChat(group.groupId);

  const messageToSign = `Sign this message to verify your identity: ${userId} and join group: ${groupId}`;

  const submitSignature = async (
    address: Address,
    signature: Hex
  ): Promise<boolean> => {
    "use server";
    const isValidSignature = await verifyMessage({
      address,
      message: messageToSign,
      signature,
    });

    if (isValidSignature) {
      if (user.addresses.includes(address)) {
        return true;
      }

      // @ts-ignore
      user.addresses.push(address);
      await Users.updateOne({ userId: userId }, user);
      if (await isHolder(group.address, address)) {
        await sendInviteLink(group.groupId, groupInfo.title, userId);
      }
    }

    return isValidSignature;
  };

  return (
    <div>
      <div>Verify</div>
      <div>User: {user.userName}</div>
      <div>Group: {groupInfo.title}</div>
      <VerifyButton
        submitSignature={submitSignature}
        messageToSign={messageToSign}
      />
    </div>
  );
};

export default VerifyPage;
