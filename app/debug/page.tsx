"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const [envTest, setEnvTest] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testEnvironment = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/env-test")
      const data = await response.json()
      setEnvTest(data)
    } catch (error) {
      let errorMessage = "Unknown error"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }
      setEnvTest({ error: errorMessage })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Environment Variables Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testEnvironment} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Testing..." : "Test Environment Variables"}
            </Button>

            {envTest && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <pre className="text-green-400 text-sm overflow-auto">{JSON.stringify(envTest, null, 2)}</pre>
              </div>
            )}

            <div className="bg-yellow-900/20 border border-yellow-600/50 p-4 rounded-lg">
              <h3 className="text-yellow-300 font-semibold mb-2">Troubleshooting Steps:</h3>
              <ol className="text-yellow-200 text-sm space-y-2 list-decimal list-inside">
                <li>Make sure `.env.local` file is in the root directory (same level as package.json)</li>
                <li>Restart your development server completely (Ctrl+C then npm run dev)</li>
                <li>Check that there are no spaces around the = sign in .env.local</li>
                <li>Make sure the file is named exactly `.env.local` (not .env.txt or .env)</li>
                <li>Try refreshing this page after restarting the server</li>
              </ol>
            </div>

            <div className="bg-blue-900/20 border border-blue-600/50 p-4 rounded-lg">
              <h3 className="text-blue-300 font-semibold mb-2">Expected .env.local content:</h3>
              <pre className="text-blue-200 text-sm bg-blue-950/50 p-2 rounded">
                {`AIRTABLE_API_KEY=patxYEMySpVMJSTaS.7929ba3553c7fc7fa11657dac9bb652934a8a076c19a9a586f23df8942e77037
AIRTABLE_BASE_ID=appPLHy5FS2oXJhKt
AIRTABLE_LOG_TABLE_NAME=Logs`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
