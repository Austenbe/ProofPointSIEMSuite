import { NextResponse } from "next/server"
import clientPromise, { databaseName, collections } from "@/lib/mongodb"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(databaseName)
    const collection = db.collection("messagesDelivered")

    // Get the latest 50 records, sorted by most recent first
    const records = await collection
      .find({})
      .limit(50)
      .toArray()

    const metadataCollection = db.collection("metadata")
    const metadata = await metadataCollection.findOne({ _id: "syncStatus" })
    const lastUpdated = metadata?.lastUpdated || null

    return NextResponse.json({
      success: true,
      count: records.length,
      records,
      lastUpdated,
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
