import cron from 'node-cron';
import { User } from '../models/User.js';
import { syncGitHubData } from '../services/githubSync.js';
import { config } from '../config/env.js';

/**
 * Scheduled job to keep developer portfolios up-to-date
 * Runs every 6 hours by default (or every hour in development)
 */
export const startSyncJob = () => {
  // Cron expression: At minute 0 every 6th hour (e.g. 0 */6 * * *)
  const cronSchedule = config.env === 'production' ? '0 */6 * * *' : '0 * * * *';

  cron.schedule(cronSchedule, async () => {
    console.log('[CronSync] Running scheduled GitHub background re-sync...');
    try {
      const threshold = new Date(Date.now() - config.syncIntervalHours * 60 * 60 * 1000);
      
      // Find active users needing sync
      const usersToSync = await User.find({
        $or: [
          { lastSyncedAt: { $lt: threshold } },
          { lastSyncedAt: null },
        ],
      }).limit(20);

      console.log(`[CronSync] Found ${usersToSync.length} users to refresh.`);

      for (const user of usersToSync) {
        try {
          await syncGitHubData(user, false);
          // Pause slightly between users to avoid slamming rate limits
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (err) {
          console.warn(`[CronSync] Skipping user @${user.username}: ${err.message}`);
        }
      }

      console.log('[CronSync] Scheduled re-sync round completed.');
    } catch (err) {
      console.error('[CronSync] Error during scheduled sync:', err.message);
    }
  });

  console.log(`⏱️  Background sync job scheduled (${cronSchedule})`);
};
