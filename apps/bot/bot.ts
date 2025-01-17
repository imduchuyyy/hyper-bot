import { Groups, Users, Requests, Joined } from "@hyper-bot/database";
import { createPublicClient, erc721Abi, http, isAddress, isHash } from "viem";
import { bot, sendInviteLink } from "@hyper-bot/tlgbot";
import { viction } from "viem/chains";
import { isHolder } from "@hyper-bot/blockchain";
import type { ParseMode } from "node-telegram-bot-api";

const testUserId = 6709422028;
const testGroupId = -1002057302172;

const client = createPublicClient({
  chain: viction,
  transport: http(),
});

const generateRandomString = (length: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

bot.onText(/\/register (.+)/, async (msg: any) => {
  if (!(msg.chat.type === "supergroup")) {
    return;
  }

  const admins = await bot.getChatAdministrators(msg.chat.id);
  if (!admins.find((admin) => admin.user.id === msg.from.id)) {
    bot.sendMessage(msg.chat.id, "You are not admin!");
    return;
  }
  const chat = await bot.getChat(msg.chat.id);

  if (
    !chat.permissions?.can_invite_users ||
    !chat.permissions?.can_send_messages
  ) {
    bot.sendMessage(msg.chat.id, "Please enable permission for bot!");
    return;
  }

  const exitedGroup = await Groups.findOne({ groupId: msg.chat.id });
  if (exitedGroup) {
    bot.sendMessage(msg.chat.id, "Group already registered!");
    return;
  }

  const address = msg.text.split(" ")[1];
  if (!isAddress(address)) {
    bot.sendMessage(msg.chat.id, "Invalid collection address!");
    return;
  }
  const group = new Groups({
    groupId: msg.chat.id,
    address,
  });
  await group.save();

  bot.sendMessage(msg.chat.id, "Register new group!");
});

bot.onText(/\/start (.+)/, async (msg: any) => {
  if (msg.text.split(" ").length > 1) {
    const groupId = msg.text.split(" ")[1];
    const group = await Groups.findOne({ groupId: groupId });
    const groupInfo = await bot.getChat(groupId);
    if (!group) {
      bot.sendMessage(msg.chat.id, "Group not registered!");
      return;
    }

    const user = await Users.findOne({ userId: msg.from.id });
    if (!user) {
      const newUser = new Users({
        userId: msg.from.id,
        userName: msg.from.username,
        addresses: [],
      });

      await newUser.save();
    } else {
      for (const address of user.addresses) {
        if (await isHolder(group.address, address)) {
          await sendInviteLink(groupId, groupInfo.title, msg.from.id);
          return;
        }
      }
    }
    const message = `
    Click the link below to verify your wallet:`;
    const opts = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Verify your wallet",
              url: `https://hyper-bot.vercel.app/verify?groupId=${groupId}&userId=${msg.from.id}`,
            },
          ],
        ],
      },
    };

    bot.sendMessage(msg.from.id, message, opts);
  }
});

bot.on("callback_query", async (msg: any) => {
  if (msg.data == "add_wallet") {
    console.log(msg);
    console.log("Add new wallet");
    const requestId = generateRandomString(10);
    const newRequest = new Requests({
      userId: msg.from.id,
      requestId,
    });

    await newRequest.save();

    const message = `
    Click the link below to verify your wallet:
    `;

    const opts = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Verify your wallet",
              url: "https://hyper-bot.vercel.app/verify?requestId=" + requestId,
            },
          ],
        ],
      },
    };

    bot.sendMessage(msg.from.id, message, opts);
  }
});

bot.onText(/\/help/, async (msg) => {
  bot.sendMessage(msg.chat.id, "Hello, I'm a bot built by @imterryyy!");
});

bot.onText(/\/invite_link/, async (msg) => {
  const me = await bot.getMe();
  const inviteLink = `https://t.me/${me.username}?start=${msg.chat.id}`;
  bot.sendMessage(msg.chat.id, `Invite link: ${inviteLink}`);
});

bot.onText(/\/invite/, async (msg) => {
  const inviteLink = await bot.createChatInviteLink(msg.chat.id, {
    creates_join_request: true,
  });
  await bot.sendMessage(testUserId, `Invite link: ${inviteLink.invite_link}`);
});

bot.onText(/\/remove/, async (msg) => {
  await bot.unbanChatMember(msg.chat.id, testUserId, {
    only_if_banned: false,
  });
});

bot.on("chat_join_request", async (msg) => {
  const userInfo = await Users.findOne({ userId: msg.from.id });
  const groupInfo = await Groups.findOne({ groupId: msg.chat.id });

  for (const address of userInfo.addresses) {
    const balance = await client.readContract({
      address: groupInfo.address,
      abi: erc721Abi,
      functionName: "balanceOf",
      args: [address],
    });

    if (balance !== 0n) {
      const joined = new Joined({
        groupId: msg.chat.id,
        userId: msg.from.id,
      });
      await joined.save();
      await bot.approveChatJoinRequest(msg.chat.id, msg.from.id);
    }
  }
});

export { bot };
