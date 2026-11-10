// lib/redisConnection.js


// // process.env.REDIS_URL

// export const redisConnection = new Redis("redis://localhost:6379", {
//   maxRetriesPerRequest: null,
// });

// maxRetriesPerRequest: null is an ioredis configuration option that controls
// how many times Redis should retry a command when the Redis connection is temporarily unavailable.

// maxRetriesPerRequest: null
// means: Don't put a limit on retries for an individual Redis request.
// Keep retrying until the connection becomes available.

// redis-cli --tls -u redis://default:gQAAAAAAAY6xAAIgcDI2Yjg3NDI5ZDkxMGU0Zjg2YjM4MGJlMTJlN2FmOTE3ZQ@first-swan-102065.upstash.io:6379

// lib/redisConnection.js

// import { Redis } from "ioredis";
//=======================================


// console.log(
//   process.env.REDIS_HOST,
//   process.env.REDIS_PORT,
//   process.env.REDIS_PASSWORD,
//   "REDIS PARAMETERS",
// );
// export const redisConnection = {
//   host: process.env.REDIS_HOST,
//   port: Number(process.env.REDIS_PORT),
//   password: process.env.REDIS_PASSWORD,
//   tls: {},
// };
//=============================================

// import { Redis } from "ioredis";
// import "dotenv/config";
// export const redisConnection = new Redis({
//   host: "first-swan-102065.upstash.io",
//   port: process.env.REDIS_PORT || 6379,
//   password: process.env.REDIS_PASSWORD,
//   tls: {},            // required for Upstash
//   family: 6,          // try this if you get ETIMEDOUT/ENOTFOUND; Upstash can need IPv6 on some setups
//   connectTimeout: 10000,
//   maxRetriesPerRequest: null,
// });



import { Redis } from "ioredis";
import "dotenv/config";

export const redisConnection = new Redis({
  host: process.env.REDIS_HOST?.trim(),
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD?.trim(),

  tls: {},

  connectTimeout: 15000,
  maxRetriesPerRequest: null,

  retryStrategy(times) {
    return Math.min(times * 500, 5000);
  },
});

redisConnection.on("connect", () => {
  console.log("Redis TCP connection established");
});

redisConnection.on("ready", () => {
  console.log("Redis is ready");
});

redisConnection.on("error", (err) => {
  console.error("Redis connection error:", err.code, err.message);
});

redisConnection.on("close", () => {
  console.log("Redis connection closed");
});

redisConnection.on("reconnecting", (delay) => {
  console.log(`Redis reconnecting in ${delay}ms`);
});