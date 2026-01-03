import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ABOUT_ME_PATH = path.join(process.cwd(), "public", "ABOUT ME.txt");

export async function GET() {
  try {
    try {
      await fs.promises.access(ABOUT_ME_PATH, fs.constants.R_OK);
    } catch {
      return NextResponse.json(
        { ok: false, error: "About me file not found or not accessible" },
        { status: 404 }
      );
    }

    const content = await fs.promises.readFile(ABOUT_ME_PATH, {
      encoding: "utf8",
    });

    if (!content?.trim()) {
      return NextResponse.json(
        { ok: false, error: "About me file is empty" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, aboutMe: content });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to read about me file" },
      { status: 500 }
    );
  }
}
