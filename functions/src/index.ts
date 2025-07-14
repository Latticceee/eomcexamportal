import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import next from "next";

logger.info("Initializing Next.js server...", {structuredData: true});

const isDev = process.env.NODE_ENV !== "production";

// Initialize the Next.js app instance
const nextApp = next({
  dev: isDev,
  conf: {distDir: ".next"},
});

const nextjsHandle = nextApp.getRequestHandler();

// Export the cloud function, which we have named 'server'
export const server = onRequest((request, response) => {
  return nextApp.prepare().then(() => {
    logger.info("Handling request", {path: request.path});
    return nextjsHandle(request, response);
  });
});