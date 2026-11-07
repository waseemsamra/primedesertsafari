import { NextResponse } from "next/server";
import ImageKit from "imagekit";

const ik = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: Request) {
  const { file, fileName } = await req.json();
  const res = await ik.upload({ file, fileName });
  return NextResponse.json({ url: res.url });
}
