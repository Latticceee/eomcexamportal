import { NextResponse } from "next/server"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_LOG_TABLE_NAME = process.env.AIRTABLE_LOG_TABLE_NAME

export async function GET() {
  try {
    console.log("Testing Airtable connection...")
    console.log("API Key present:", !!AIRTABLE_API_KEY)
    console.log("Base ID:", AIRTABLE_BASE_ID)
    console.log("Table Name:", AIRTABLE_LOG_TABLE_NAME)

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_LOG_TABLE_NAME) {
      return NextResponse.json({
        error: "Missing environment variables",
        hasApiKey: !!AIRTABLE_API_KEY,
        hasBaseId: !!AIRTABLE_BASE_ID,
        hasTableName: !!AIRTABLE_LOG_TABLE_NAME,
      })
    }

    // Test creating a record with the correct field names
    const testUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_LOG_TABLE_NAME}`
    const testData = {
      fields: {
        Name: "Test User",
        Email: "test@example.com",
        Timestamps: new Date().toISOString(),
      },
    }

    console.log("Test data:", testData)

    const testResponse = await fetch(testUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    })

    console.log("Test response status:", testResponse.status)

    if (testResponse.ok) {
      const testResult = await testResponse.json()
      return NextResponse.json({
        success: true,
        message: "Airtable connection working perfectly!",
        testRecord: testResult,
        fieldNames: ["Name", "Email", "Timestamps"],
      })
    } else {
      const errorText = await testResponse.text()
      console.error("Test record creation failed:", errorText)
      return NextResponse.json({
        error: "Test record creation failed",
        status: testResponse.status,
        details: errorText,
        fieldNames: ["Name", "Email", "Timestamps"],
      })
    }
  } catch (error) {
    console.error("Test error:", error)
    return NextResponse.json({
      error: "Test failed",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
