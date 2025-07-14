import { NextResponse } from "next/server"

export async function GET() {
  // Try to get the environment variables
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
  const AIRTABLE_LOG_TABLE_NAME = process.env.AIRTABLE_LOG_TABLE_NAME

  // Get all environment variables that start with AIRTABLE
  const airtableEnvs = Object.keys(process.env).filter((key) => key.startsWith("AIRTABLE"))

  // Get some system info
  const nodeEnv = process.env.NODE_ENV
  const vercelEnv = process.env.VERCEL_ENV

  return NextResponse.json({
    environmentVariables: {
      hasApiKey: !!AIRTABLE_API_KEY,
      hasBaseId: !!AIRTABLE_BASE_ID,
      hasTableName: !!AIRTABLE_LOG_TABLE_NAME,
      apiKeyLength: AIRTABLE_API_KEY?.length || 0,
      baseIdValue: AIRTABLE_BASE_ID || "undefined",
      tableNameValue: AIRTABLE_LOG_TABLE_NAME || "undefined",
    },
    systemInfo: {
      nodeEnv,
      vercelEnv,
      platform: process.platform,
      cwd: process.cwd(),
    },
    airtableEnvKeys: airtableEnvs,
    allEnvKeysCount: Object.keys(process.env).length,
    sampleEnvKeys: Object.keys(process.env).slice(0, 10),
  })
}
