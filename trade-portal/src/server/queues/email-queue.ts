import 'server-only';

import { Queue } from 'bullmq';
import { queueRedis } from './connection';

export type EmailJobPayload = {
  to: string;
  subject: string;
  html: string;
};

export const emailQueue = new Queue<EmailJobPayload>('portal-email', {
  connection: queueRedis,
  defaultJobOptions: {
    attempts: 3,
    removeOnComplete: 50,
    removeOnFail: 50,
  },
});

export async function enqueueEmail(payload: EmailJobPayload) {
  return emailQueue.add('send', payload);
}
