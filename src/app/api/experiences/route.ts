import { NextResponse } from "next/server";
import { ExperienceModel } from "@/models/Experience";

export async function GET() {
  try {
    const experiences = await ExperienceModel.findAll();
    return NextResponse.json({ success: true, data: experiences });
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch experiences" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const experience = await ExperienceModel.create(body);
    return NextResponse.json(
      { success: true, data: experience },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating experience:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create experience" },
      { status: 500 }
    );
  }
}
