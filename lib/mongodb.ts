import { MongoClient } from "mongodb"


const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>
let databaseName = "ppThreatsDb"
let collections = ["messagesDelivered", "messagesBlocked", "clicksBlocked", "clicksPermitted"]

if (!uri) {
  // During build time or if env variables are missing, create a rejected promise
  // that will only throw an error if actually awaited at runtime.
  clientPromise = Promise.reject(
    new Error("MONGODB_URI environment variable is missing. Please set it in your environment.")
  )
  // Catch the rejection immediately to avoid UnhandledPromiseRejection warning during build
  clientPromise.catch(() => {})
} else {
  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

export default clientPromise
export { databaseName, collections }
