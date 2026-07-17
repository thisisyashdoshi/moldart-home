import { Worker } from 'bullmq';
import { queueRedis } from '@/server/queues/connection';
import { sendPortalEmail } from '@/server/mail/transporter';

const worker = new Worker(
  'portal-email',
  async (job) => {
    await sendPortalEmail(job.data);
  },
  { connection: queueRedis },
);

worker.on('completed', (job) => {
  console.log(`email job completed: ${job.id}`);
});

worker.on('failed', (job, error) => {
  console.error(`email job failed: ${job?.id}`, error);
});
