import { NextResponse } from "next/server";

export async function POST(request: Request) {
  void request;
  return NextResponse.json({ error: "This receiver has moved to DashCareer’s secured payment service." }, { status: 410 });
}
