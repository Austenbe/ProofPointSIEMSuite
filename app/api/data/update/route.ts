import { NextResponse } from "next/server"
import clientPromise, { databaseName, collections } from "@/lib/mongodb"
import { stringify } from "querystring"

// Configure the cron job to run every hour
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Example API URL - replace with your actual API endpoint
const API_URL = "https://us-siem.proofpointessentials.com/v2/siem/all?sinceSeconds=3600&customerData=true"

export async function GET(request: Request) {
  // Verify cron secret in production to prevent unauthorized access
  const authHeader = request.headers.get("authorization")
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Fetch data from the external API
    const response = await fetch(API_URL, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${process.env.ProofPoint_SIEM}`
      },
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    let responseCount = 0

    // Define the collections to store different types of data

    // Connect to MongoDB and store the data
    const client = await clientPromise
    const db = client.db(databaseName)

    // Upsert records into the respective collections based on GUID
    for (const collectionName of collections) {
      const collection = db.collection(collectionName)
      if (data[collectionName]) {
        for (const record of data[collectionName]) {
          const ur = await collection.updateOne(
            {"GUID": record.GUID},
            { $set: record },
            { upsert: true }
          )
          responseCount+=ur.upsertedCount
        }
      }
    }

    // Update the last successful fetch timestamp
    const metadataCollection = db.collection("metadata")
    await metadataCollection.updateOne(
      { _id: "syncStatus" },
      { $set: { lastUpdated: new Date() } },
      { upsert: true }
    )

    return NextResponse.json({
      success: true,
      message: `Data Updated. ${responseCount} events added`
    })
  }

  catch (error) {
    console.error("Error in data fetch job:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}
