import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { timestamp, name, email } = await request.json()

    // Manually set the values for testing
    const AIRTABLE_API_KEY = "patxYEMySpVMJSTaS.7929ba3553c7fc7fa11657dac9bb652934a8a076c19a9a586f23df8942e77037"
    const AIRTABLE_BASE_ID = "appPLHy5FS2oXJhKt"
    const AIRTABLE_LOG_TABLE_NAME = "Logs"

    console.log("=== Manual Test with Correct Field Names ===")
    console.log("Using hardcoded API key:", AIRTABLE_API_KEY.substring(0, 10) + "...")
    console.log("Using hardcoded Base ID:", AIRTABLE_BASE_ID)
    console.log("Using hardcoded Table Name:", AIRTABLE_LOG_TABLE_NAME)

    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_LOG_TABLE_NAME}`

    // Use the correct field name: Timestamp (singular)
    const recordData = {
      Name: name,
      Email: email,
      Timestamp: timestamp, // Changed from "Timestamps" to "Timestamp"
    }

    console.log("Sending to Airtable with correct field names:", recordData)

    const response = await fetch(airtableUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: recordData }),
    })

    console.log("Airtable response status:", response.status)

    if (response.ok) {
      const data = await response.json()
      console.log("Successfully logged with correct field names:", data)
      return NextResponse.json({
        success: true,
        data,
        method: "hardcoded",
        workingFieldNames: Object.keys(recordData),
        message: "Success with correct field names!",
      })
    } else {
      const errorData = await response.text()
      console.error("Airtable API error:", errorData)
      return NextResponse.json(
        {
          error: "Failed to log with correct field names",
          details: errorData,
          airtableUrl,
          recordData,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error in manual test:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
