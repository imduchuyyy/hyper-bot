import { bot } from "./bot";
import { connectToDatabase } from "@hyper-bot/database";

const main = async () => {
  console.log("Start bot");
  await connectToDatabase()

  bot.startPolling();
};

main();
