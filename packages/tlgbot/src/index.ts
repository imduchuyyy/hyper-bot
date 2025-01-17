import { isHolder } from "@hyper-bot/blockchain";
import { BOT_TOKEN } from "@hyper-bot/config";
import { Groups } from "@hyper-bot/database";
import TelegramBot, { type ParseMode } from "node-telegram-bot-api";
import { type Hex } from "viem";

export const bot = new TelegramBot(BOT_TOKEN);

export const isMemberOfGroup = async (groupId: number, userId: number) => {
  try {
    const member = await bot.getChatMember(groupId, userId);
    if (member.status === "left" || member.status === "kicked") {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const sendInviteLink = async (groupId: number, groupTitle: string | undefined, userId: number) => {
  const inviteLink = await bot.createChatInviteLink(groupId, {
    creates_join_request: true,
  });

  const message = `Welcome to <b>${groupTitle}</b> group!`;
  const opts = {
    parse_mode: "HTML" as ParseMode,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Click to join group",
            url: inviteLink.invite_link,
          },
        ],
      ],
    },
  };
  await bot.sendMessage(userId, message, opts);
}


export const findAndInviteEligibleGroups = async (userId: string, address: Hex) => {
  // @ts-ignore
  const groups = await Groups.find({}).lean();
  for (const group of groups) {
    const holder = await isHolder(group.address, address);
    if (holder) {
      // @ts-ignore
      const joined = Joined.findOne({
        groupId: group.groupId,
        userId: userId,
      });
      if (joined) {
        continue;
      }
      const inviteLink = await bot.createChatInviteLink(group.groupId, {
        creates_join_request: true,
      });

      const groupInfo = await bot.getChat(group.groupId);
      await bot.sendMessage(
        userId,
        `You are eligible to join ${groupInfo.title} group. Click the link to join: ${inviteLink.invite_link}`
      );
    }
  }
};
