import { NextResponse } from "next/server"
import clientPromise, { databaseName } from "@/lib/mongodb"
import { ProofpointMessageEvent } from "@/types"


export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? parseInt(limitParam, 10) : 10
    
    // By default, let's look at messagesBlocked as the primary indicator of targeting.
    // Allow overriding via query param.
    const collectionName = searchParams.get("collection") || "messagesBlocked"

    const client = await clientPromise
    const db = client.db(databaseName)
    const collection = db.collection<ProofpointMessageEvent>(collectionName)

    // Build the match stage for the date range
    const matchStage: any = {}
    if (startDate || endDate) {
      matchStage.messageTime = {}
      
      // We'll pass the raw strings. If your database stores messageTime as ISODate objects,
      // you will need to wrap these in new Date(startDate). 
      // Assuming they are stored as ISO strings based on standard log ingests.
      if (startDate) matchStage.messageTime.$gte = startDate
      if (endDate) matchStage.messageTime.$lte = endDate
    }

    const pipeline: any[] = []
    
    // Only add the match stage if we have date filters
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage })
    }

    // Aggregate by customerName
    pipeline.push(
      {
        $group: {
          _id: "$customerName",
          threatCount: { $sum: 1 }
        }
      },
      {
        $sort: { threatCount: -1 } // Sort descending by count
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 0, // Hide the raw _id field
          customerName: "$_id", // Map _id back to customerName
          threatCount: 1
        }
      }
    )

    const records = await collection.aggregate(pipeline).toArray()

    return NextResponse.json({
      success: true,
      collectionUsed: collectionName,
      dateRange: { startDate, endDate },
      records
    })
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}
