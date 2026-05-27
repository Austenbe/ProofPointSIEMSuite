import { NextResponse } from "next/server"
import clientPromise, { databaseName, collections } from "@/lib/mongodb"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limitParam = searchParams.get("limit")
    
    // Default to 50 records if no limit is provided, max 1000 to prevent crashing
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 1000) : 50
    
    // Default to messagesBlocked if no valid collection is provided
    const collectionParam = searchParams.get("collection")
    const targetCollection = collectionParam && collections.includes(collectionParam) 
      ? collectionParam 
      : "messagesBlocked"

    const client = await clientPromise
    const db = client.db(databaseName)
    const collection = db.collection(targetCollection)

    // Build the query
    const query: any = {}
    
    // Proofpoint logs use different time fields depending on the log type:
    // Messages use 'messageTime', Clicks use 'timeLogged'
    const timeField = targetCollection.startsWith("clicks") ? "timeLogged" : "messageTime"

    if (startDate || endDate) {
      query[timeField] = {}
      if (startDate) query[timeField].$gte = startDate
      if (endDate) query[timeField].$lte = endDate
    }

    // Fetch the records
    const records = await collection
      .find(query)
      .sort({ [timeField]: -1 }) // Sort by most recent first
      .limit(limit)
      .toArray()

    return NextResponse.json({
      success: true,
      collectionUsed: targetCollection,
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
        limit
      },
      count: records.length,
      records
    })
  } catch (error) {
    console.error("Error fetching recent events:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}
