import { type NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// This creates a new Redis client using Upstash REST API (best for serverless)
const redis = Redis.fromEnv();

export async function POST(request: NextRequest) {
  try {
    const { timestamp, sessionId } = await request.json();

    if (!sessionId || !timestamp) {
      return NextResponse.json({ error: "Missing session ID or timestamp" }, { status: 400 });
    }

    const key = `logs:${sessionId}`;
    const newLog = { timestamp };

    // Pushes the new log onto a list in your Redis database

    await redis.rpush(key, JSON.stringify(newLog));
    const pendingCount = await redis.llen(key);

    console.log(`Stored pending log in Redis for session: ${sessionId}. Total pending: ${pendingCount}`);

    return NextResponse.json({
      success: true,
      pending: true,
      pendingCount: pendingCount,
    });

  } catch (error) {
    console.error("Error storing pending log in Redis:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
