import { BOT_TOKEN } from "@hyper-bot/config";
import TelegramBot from "node-telegram-bot-api";

export const bot = new TelegramBot(BOT_TOKEN)

export const isMemberOfGroup = async (chatId: number, userId: number) => {
  try {
    const member = await bot.getChatMember(chatId, userId);
    if (member.status === "left" || member.status === "kicked") {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}
