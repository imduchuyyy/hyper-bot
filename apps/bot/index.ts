import TelegramBot, { type MessageType } from "node-telegram-bot-api"

const bot = new TelegramBot(process.env.BOT_TOKEN || "")
const testUserId = 6709422028;
const testGroupId = -1002057302172

const main = async () => {
  console.log("Start bot")

  bot.onText(/\/register (.+)/, async (msg: any) => {
    console.log("msg", msg)
    const admins = await bot.getChatAdministrators(msg.chat.id)
    if (!admins.find((admin) => admin.user.id === msg.from.id)) {
      bot.sendMessage(msg.chat.id, "You are not admin!")
      return
    }
    const chat = await bot.getChat(msg.chat.id)

    if (!chat.permissions?.can_invite_users || !chat.permissions?.can_send_messages) {
      bot.sendMessage(msg.chat.id, "Please enable permission for bot!")
      return
    }

    bot.sendMessage(msg.chat.id, "Register new group!")
  })

  bot.onText(/\/help/, async (msg) => {
    bot.sendMessage(msg.chat.id, "Hello, I'm a bot built by @imterryyy!")
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

  const chat = await bot.getChat(testGroupId)
  console.log(chat)

  bot.startPolling()
}

main()