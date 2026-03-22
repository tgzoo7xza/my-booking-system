import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // ข้อมูลที่คุณให้มา
    const ACCESS_TOKEN = "7E++f8FChqGWZ8Jik2ZHdUugJaMVaFEOWhgwHotjuCGRGrJ58Z5/IXP8CV1nTFIeAbDHbzHuZMCLrtvExgKS3PyfwFKZXqa6QFT/UeVDIGst0LDVDeJvuQnAqfWAULkUjhWSLucH5spJF9S0tuxVgwdB04t89/1O/w1cDnyilFU="; 
    const ADMIN_USER_ID = "U1e473308a6af2359b34d21bde67e83e8"; 

    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: ADMIN_USER_ID,
        messages: [
          {
            type: "text",
            text: message,
          },
        ],
      }),
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      const errorData = await response.json();
      console.error("LINE API Error:", errorData);
      return NextResponse.json({ success: false, error: errorData }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}