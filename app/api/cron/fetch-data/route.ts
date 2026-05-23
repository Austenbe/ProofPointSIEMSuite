import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
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

    return NextResponse.json({
      success: true,
      message: "Data fetched successfully",
      response: data,
      timestamp: new Date().toISOString(),
    })

    // Connect to MongoDB and store the data
    const client = await clientPromise
    const db = client.db("api_data")
    const collection = db.collection("fetched_data")

    // Insert the fetched data with a timestamp
    const result = await collection.insertOne({
      data,
      fetchedAt: new Date(),
      apiUrl: API_URL,
    })

    return NextResponse.json({
      success: true,
      message: "Data fetched and stored successfully",
      insertedId: result.insertedId,
      timestamp: new Date().toISOString(),
    })
  }

  catch (error) {
    console.error("Error in cron job:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}
