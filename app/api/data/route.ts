import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("api_data")
    const collection = db.collection("fetched_data")

    // Get the latest 50 records, sorted by most recent first
    const records = await collection
      .find({})
      .sort({ fetchedAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({
      success: true,
      count: records.length,
      records,
    })
  } catch (error) {
    console.error("Error fetching data:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}
