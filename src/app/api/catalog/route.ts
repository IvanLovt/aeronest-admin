import { NextResponse } from "next/server";
import { getPool } from "@/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let query = "SELECT * FROM catalog ORDER BY created_at DESC";
    const params: string[] = [];

    if (category && category !== "all") {
      query = "SELECT * FROM catalog WHERE category = $1 ORDER BY created_at DESC";
      params.push(category);
    }

    const pool = getPool();
    const result = await pool.query(query, params);

    return NextResponse.json(
      {
        success: true,
        data: result.rows,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching catalog:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch catalog items",
        ...(error instanceof Error && { message: error.message }),
      },
      { status: 500 }
    );
  }
}

