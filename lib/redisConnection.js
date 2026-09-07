// lib/redisConnection.js
import { Redis } from "ioredis";

// process.env.REDIS_URL

export const redisConnection = new Redis("redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// maxRetriesPerRequest: null is an ioredis configuration option that controls
// how many times Redis should retry a command when the Redis connection is temporarily unavailable.

// maxRetriesPerRequest: null
// means: Don't put a limit on retries for an individual Redis request.
// Keep retrying until the connection becomes available.
