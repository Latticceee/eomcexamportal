import { type NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// This creates a new Redis client using Upstash REST API (best for serverless)
const redis = Redis.fromEnv();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  try {
    // --- Step 1: Check Airtable for the form submission ---
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const SUBMISSIONS_TABLE_NAME = "Submissions";

    const filterFormula = encodeURIComponent(`{SessionID} = '${sessionId}'`);
    const airtableCheckUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SUBMISSIONS_TABLE_NAME}?filterByFormula=${filterFormula}`;

    const airtableResponse = await fetch(airtableCheckUrl, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!airtableResponse.ok) {
      throw new Error(`Airtable API error: ${await airtableResponse.text()}`);
    }

    const airtableData = await airtableResponse.json();

    // --- Step 2: If a submission is found, process the logs ---
    if (airtableData.records && airtableData.records.length > 0) {
      const record = airtableData.records[0].fields;
      const fullName = `${record['First Name'] || ''} ${record['Last Name'] || ''}`.trim();
      const email = record.Email;

      console.log(`Submission found for ${sessionId}. User: ${fullName}`);

      // --- Step 3: Retrieve pending logs from Redis ---
      const logsKey = `logs:${sessionId}`;
      // lrange(key, 0, -1) gets all items from the list
      const pendingLogsStr: string[] = await redis.lrange(logsKey, 0, -1);
      
      if (pendingLogsStr && pendingLogsStr.length > 0) {
        const pendingLogs = pendingLogsStr.map(log => {
          if (typeof log === "string") {
            try {
              return JSON.parse(log);
            } catch {
              // If not valid JSON, skip or wrap as object
              return { raw: log };
            }
          }
          // Already an object
          return log;
        });
        console.log(`Processing ${pendingLogs.length} pending logs from Redis...`);
        
        const LOGS_TABLE_NAME = "Logs";
        const airtableLogUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${LOGS_TABLE_NAME}`;

        const logPromises = pendingLogs.map(log => {
          const logData = { Name: fullName, Email: email, Timestamp: log.timestamp };
          return fetch(airtableLogUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fields: logData }),
          });
        });

        await Promise.all(logPromises);
        
        // --- Step 4: Cleanup - Delete the logs from Redis ---
        await redis.del(logsKey);
        console.log(`✅ Processed and deleted logs for ${sessionId}.`);
      }

      return NextResponse.json({ success: true, found: true });
    } else {
      return NextResponse.json({ success: true, found: false });
    }

  } catch (error) {
    console.error("Error in check-submission route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
