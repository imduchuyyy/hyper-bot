import { Groups, Users } from "@hyper-bot/database";
import { isAddress } from "viem";
import { bot } from "@hyper-bot/tlgbot";

const testUserId = 6709422028;
const testGroupId = -1002057302172;

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

  const exitedGroup = await Groups.findOne({ chatId: msg.chat.id });
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
    chatId: msg.chat.id,
    address,
  });
  await group.save();

  bot.sendMessage(msg.chat.id, "Register new group!");
});

bot.onText(/\/help/, async (msg) => {
  bot.sendMessage(msg.chat.id, "Hello, I'm a bot built by @imterryyy!");
});

bot.onText(/\/start/, async (msg: any) => {
  if (!(msg.chat.type === "private")) {
    return;
  }

  const user = await Users.findOne({ userId: msg.from.id });
  if (!user) {
    console.log("msg", msg);
    const newUser = new Users({
      userId: msg.from.id,
      userName: msg.from.username,
    });
    // await newUser.save();
  }

  const message = `
    Your wallets:
  `;

  const opts = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Re-verify',
            url: 'https://google.com'
          }
        ],
        [
          {
            text: 'Add new wallet',
            url: 'https://google.com'
          }
        ]
      ]
    }
  }
  bot.sendMessage(msg.chat.id, message, opts);
});

bot.onText(/\/invite/, async (msg) => {
  const inviteLink = await bot.createChatInviteLink(msg.chat.id, {
    expire_date: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
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
  console.log("msg", msg);
  bot.sendMessage(msg.chat.id, "Hello new member join!");
});

export {
  bot
}