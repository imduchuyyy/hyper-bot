import TelegramBot from "node-telegram-bot-api"

const bot = new TelegramBot(process.env.BOT_TOKEN || "")

const testUserId = 6709422028;

const main = async () => {
  console.log("Start bot")
  bot.onText(/\/start/, async (msg) => {
    console.log("msg", msg)
    bot.sendMessage(msg.chat.id, "Hello, I'm a bot!")
  })

  bot.onText(/\/invite/, async (msg) => {
    const inviteLink = await bot.createChatInviteLink(msg.chat.id, {
      expire_date: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      creates_join_request: true,
    })
    await bot.sendMessage(testUserId, `Invite link: ${inviteLink.invite_link}`)
  })

  bot.onText(/\/remove/, async (msg) => {
    await bot.unbanChatMember(msg.chat.id, testUserId, {
      only_if_banned: false,
    })
  })

  bot.on("chat_join_request", async (msg) => {
    console.log("msg", msg)
    bot.sendMessage(msg.chat.id, "Hello new member join!")
  })

  bot.startPolling()
}

main()