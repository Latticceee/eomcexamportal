"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, FileText, User, BookOpen, Send, Eye, Shield } from "lucide-react"

interface UserData {
  name: string
  email: string
}

export default function ExamPortal() {
  const [userData, setUserData] = useState<UserData>({ name: "", email: "" })
  const [isUserDataSubmitted, setIsUserDataSubmitted] = useState(false)
  const [examStarted, setExamStarted] = useState(false)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [hasRealFormData, setHasRealFormData] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")

  // Generate sessionId only on the client to avoid hydration errors
  useEffect(() => {
    if (!sessionId) {
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    }
  }, [sessionId])

  // Use ReturnType<typeof setInterval> for browser compatibility
  const formCheckRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Polling logic to check for form submission
  useEffect(() => {
    if (examStarted && !hasRealFormData) {
      console.log("Starting to poll for form submission using /api/check-submission...");
      formCheckRef.current = setInterval(async () => {
        try {
          const response = await fetch(`/api/check-submission?sessionId=${sessionId}`);
          const data = await response.json();

          if (data.found) {
            console.log("✅ Submission found! Stopping polling.");
            setHasRealFormData(true);
            if (formCheckRef.current) {
              clearInterval(formCheckRef.current);
            }
          } else {
            console.log("... still waiting for submission.");
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 10000);
    }
    return () => {
      if (formCheckRef.current) clearInterval(formCheckRef.current);
    };
  }, [examStarted, hasRealFormData, sessionId]);


  // Tab switching detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && examStarted) {
        setTabSwitchCount((prev: number) => prev + 1)
        setShowWarning(true)
        setTimeout(() => setShowWarning(false), 5000)
        sendTabSwitchLog(new Date().toISOString())
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [examStarted, sessionId])

  // Sends the log when a tab switch occurs
  const sendTabSwitchLog = async (timestamp: string): Promise<void> => {
    try {
      await fetch("/api/log-tab-switch-working", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timestamp, sessionId }),
      });
    } catch (error) {
      console.error("Error sending tab switch log:", error);
    }
  }

  const handleUserDataSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (userData.name && userData.email) {
      setIsUserDataSubmitted(true)
      setExamStarted(true)
    }
  }

  // --- JSX for rendering the page ---

  if (!isUserDataSubmitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <header className="relative z-10 border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">Egyptian  Math Competition</h1>
              <p className="text-gray-400">Exam Portal</p>
            </div>
          </div>
        </header>
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
          <div className="w-full max-w-md">
            <Card className="bg-black/40 border-gray-800/50 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-white mb-4">Student Login</CardTitle>
                <p className="text-gray-400">Please enter your details to begin the exam.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleUserDataSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300 font-medium">Full Name</Label>
                    <Input id="name" type="text" value={userData.name} onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))} required placeholder="Enter your full name" className="bg-black/20 border-gray-700/50 text-white placeholder-gray-500 focus:border-gray-600 focus:ring-gray-600"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300 font-medium">Email Address</Label>
                    <Input id="email" type="email" value={userData.email} onChange={(e) => setUserData((prev) => ({ ...prev, email: e.target.value }))} required placeholder="Enter your email address" className="bg-black/20 border-gray-700/50 text-white placeholder-gray-500 focus:border-gray-600 focus:ring-gray-600"/>
                  </div>
                  <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200 font-semibold py-3 text-lg">Access Examination</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <header className="relative z-10 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">EOMC Exam Portal</h1>
              <p className="text-sm text-gray-400">Egyptian  Math Competition</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{userData.name}</span>
              </div>
              {tabSwitchCount > 0 && (
                <div className="flex items-center space-x-2 bg-red-950/50 border border-red-800/50 px-3 py-2 rounded-lg">
                  <Eye className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-medium text-red-300">Violations: {tabSwitchCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {showWarning && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-4">
          <Alert className="border-red-800/50 bg-red-950/50">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">
              <strong>Warning:</strong> Leaving the exam page has been detected and recorded. Further violations may result in disqualification.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-4">
        <Alert className="border-blue-800/50 bg-blue-950/50">
          <Shield className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            <strong>Proctoring System Active:</strong> Please focus on the exam. All activity is monitored. Ensure you submit the form with your correct details to finalize your attempt.
          </AlertDescription>
        </Alert>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-black/40 border-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-white"><FileText className="h-5 w-5" /><span>Examination Questions</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[700px] rounded-lg overflow-hidden border border-gray-800/50">
                {/* The PDF is now served locally from the public folder for better performance. */}
                <iframe src="/Final_Round_Exam.pdf" className="w-full h-full bg-white" allow="autoplay" title="Exam Questions"/>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-white"><Send className="h-5 w-5" /><span>Submit Your Answers</span></CardTitle>
              <p className="text-sm text-gray-400 mt-2">
                Complete the form below with the <strong className="text-white">same data you registered with</strong>. This will finalize your exam submission.
              </p>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[700px] rounded-lg overflow-hidden border border-gray-800/50">
                  <iframe className="airtable-embed w-full h-full" src="https://airtable.com/embed/appPLHy5FS2oXJhKt/pagUoOCii6OPMWPZd/form" frameBorder="0" width="100%" height="700" style={{ background: "white" }} title="Answer Submission Form"/>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
