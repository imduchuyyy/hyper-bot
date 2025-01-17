import { client, isHolder } from "@hyper-bot/blockchain";
import { connectToDatabase, Groups, Users } from "@hyper-bot/database";
import { bot } from "@hyper-bot/tlgbot";
import { getAddress, parseAbiItem } from "viem";

const toEthereumAddress = (input: string): string => {
  // Ensure the input is a string and starts with '0x'
  if (typeof input !== "string" || !input.startsWith("0x")) {
    throw new Error(
      "Invalid input: Must be a hexadecimal string starting with '0x'."
    );
  }

  // Extract the last 40 characters (Ethereum address)
  const ethereumAddress = "0x" + input.slice(-40);

  return ethereumAddress;
};

const onTransfer = async (logs: any) => {
  for (const log of logs) {
    console.log(
      getAddress(toEthereumAddress(log.topics[1])),
      getAddress(toEthereumAddress(log.topics[2]))
    );
    const group = await Groups.findOne({ address: log.address });
    if (!group) {
      continue;
    }

    const effectedAddresses = [
      getAddress(toEthereumAddress(log.topics[1])),
      getAddress(toEthereumAddress(log.topics[2])),
    ];

    const users = await Users.find({
      addresses: { $in: effectedAddresses },
    }).lean();

    for (const user of users) {
      let holder = false;
      for (const address of user.addresses) {
        if (await isHolder(group.address, address)) {
          holder = true;
          break;
        }
      }

      if (!holder) {
        const groupInfo = await bot.getChat(group.groupId);
        const me = await bot.getMe();
        await bot.unbanChatMember(group.groupId, user.userId, {
          only_if_banned: false,
        });

        const message = `You have been removed from <b>${groupInfo.title}</> because you are not a holder of the collection. If you think this is a mistake, please rejoin the group using this link below.`;

        const opts = {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Rejoin",
                  url: `https://t.me/${me.username}?start=${group.groupId}`,
                },
              ],
            ],
          },
        };

        await bot.sendMessage(user.userId, message, opts as any);
      }
    }
  }
};

const main = async () => {
  await connectToDatabase();
  const unwatch = client.watchEvent({
    event: parseAbiItem(
      "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
    ),
    onLogs: onTransfer,
  });
  console.log("Running guard");
};

main();
