import { bot } from "@hyper-bot/tlgbot";

export async function GET(params: any) {
  console.log("Handle get", params?.nextUrl?.searchParams.get('userId'));
  const userId = params?.nextUrl?.searchParams.get('userId');

  const userInfo = await bot.getUserProfilePhotos(userId);
  if (userInfo.photos?.[0]?.[0]?.file_id) {
    const avatar = await bot.getFile(userInfo.photos?.[0]?.[0]?.file_id);
    console.log(avatar)
  }

  return Response.json({ hello: "world" });
}

export async function POST() {
  console.log("Handle post");
  return Response.json({ hello: "world" });
}