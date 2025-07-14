import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Environment Variable Setup Instructions",
    instructions: [
      "1. Go to your Vercel dashboard (vercel.com)",
      "2. Select your project",
      "3. Go to Settings > Environment Variables",
      "4. Add these three variables:",
      "   - AIRTABLE_API_KEY = patxYEMySpVMJSTaS.7929ba3553c7fc7fa11657dac9bb652934a8a076c19a9a586f23df8942e77037",
      "   - AIRTABLE_BASE_ID = appPLHy5FS2oXJhKt",
      "   - AIRTABLE_LOG_TABLE_NAME = Logs",
      "5. Make sure to select 'Production', 'Preview', and 'Development' for each variable",
      "6. Redeploy your application or trigger a new deployment",
    ],
    currentStatus: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      hasAirtableVars: {
        apiKey: !!process.env.AIRTABLE_API_KEY,
        baseId: !!process.env.AIRTABLE_BASE_ID,
        tableName: !!process.env.AIRTABLE_LOG_TABLE_NAME,
      },
    },
    vercelDashboardUrl: "https://vercel.com/dashboard",
  })
}
