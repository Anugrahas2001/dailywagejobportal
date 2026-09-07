import { Queue } from "bullmq";
import { redisConnection } from "@/lib/redisConnection";

export const matchQueue = new Queue("matchQueue", {
  connection: redisConnection, //Use this Redis connection for this queue.
  //These are the default settings for every job added to this queue.
  //   Instead of specifying these options every time you add a job, you define them once here.
  defaultJobOptions: {
    attempts: 3, //A job can be executed up to 3 times if it fails.
    backoff: { type: "exponential", delay: 5000 }, //backoff determines how long BullMQ waits before retrying a failed job.
    //     type: "exponential"
    // This means the waiting time increases after every failure.
    // Conceptually, the retries look like: 5sec,10sec,15sec
    // Exponential backoff = wait longer between each retry.
    // removeOnComplete: 1000, //It means BullMQ will keep approximately the latest 1000 completed jobs and remove older completed jobs.
    // removeOnFail: 5000, //BullMQ keeps approximately the latest 5,000 failed jobs and removes older failed jobs.
    removeOnComplete: true,
    removeOnFail: true,
  },
});

// removeOnComplete: true,
//   removeOnFail: true,
