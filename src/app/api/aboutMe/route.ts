import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * GET /api/aboutMe
 *
 * Retrieves the personal information content from the ABOUT ME.txt file
 * This content is used to provide context about the portfolio owner
 *
 * Returns:
 * {
 *   ok: boolean,
 *   aboutMe?: string,
 *   error?: string
 * }
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "ABOUT ME.txt");

    console.debug("[aboutMe route] Reading file from:", filePath);

    try {
      await fs.promises.access(filePath, fs.constants.R_OK);
    } catch (err) {
      return NextResponse.json(
        {
          ok: false,
          error: `About me file not found or not accessible: ${
            err instanceof Error ? err.message : String(err)
          }`,
        },
        { status: 404 }
      );
    }

    const content = await fs.promises.readFile(filePath, { encoding: "utf8" });
    if (!content || content.trim().length === 0) {
      console.warn("[aboutMe route] File is empty");
      return NextResponse.json(
        {
          ok: false,
          error: "About me file is empty",
        },
        { status: 500 }
      );
    }

    console.debug("[aboutMe route] Successfully read file:", {
      contentLength: content.length,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, aboutMe: content });
  } catch (err) {
    console.error("[aboutMe route] Error reading ABOUT ME.txt:", {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to read about me file",
      },
      { status: 500 }
    );
  }
}
