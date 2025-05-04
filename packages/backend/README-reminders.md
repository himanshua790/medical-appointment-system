# Appointment Reminder System

This module implements appointment reminders using Bull queue.

## Features

- Schedules a reminder 30 minutes after an appointment is created
- Only shows reminders to users who are currently logged in
- Includes all relevant appointment details in the reminder
- Uses Bull queue for reliable job processing

## Setup

1. Install Redis (required for Bull):
   ```
   # For Ubuntu/Debian
   sudo apt-get install redis-server
   
   # For macOS
   brew install redis
   
   # For Windows
   # Download from https://github.com/tporadowski/redis/releases
   ```

2. Add the following to your `.env` file:
   ```
   # Redis configuration for Bull queue
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

3. Make sure the Redis server is running before starting the application.

## How it works

1. When a new appointment is created, a job is scheduled in the Bull queue with a 30-minute delay.
2. The queue processor checks if the user is still logged in when the job is processed.
3. If the user is logged in, the reminder is displayed in the console with all appointment details.
4. If the user is not logged in, no reminder is shown.

## Queue Management

You can monitor and manage the Bull queue using the Bull Board UI by adding the following to your project:

```
npm install @bull-board/express @bull-board/api
```

Then add this to your Express app:

```typescript
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';

// Setup Bull Board
const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [new BullAdapter(reminderQueue)],
  serverAdapter,
});

// Add to your Express app
serverAdapter.setBasePath('/admin/queues');
app.use('/admin/queues', serverAdapter.getRouter());
```

## Testing

To test the reminder system:

1. Create a new appointment
2. The system will automatically schedule a reminder for 30 minutes later
3. When the reminder is due, if you're still logged in, you'll see the reminder in the console 