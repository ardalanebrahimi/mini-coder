# Backend Analytics Implementation Guide

## Overview

This document describes the implementation of secure backend analytics for MiniCoder. The system collects privacy-safe events from the frontend and stores them in a PostgreSQL database for analysis and business insights.

## Architecture

### Frontend (AnalyticsService)

- **Event Collection**: Captures user interactions and app events
- **Privacy Protection**: Uses anonymized user IDs, no PII collection
- **Offline Support**: Buffers events locally when offline
- **Batch Sync**: Sends events to backend in batches for efficiency
- **Dashboard Control**: Restricts analytics dashboard to dev/admin users only

### Backend (Express + PostgreSQL)

- **Event Reception**: Receives and validates analytics events via REST API
- **Data Storage**: Stores events in PostgreSQL with proper indexing
- **Admin Access**: Provides analytics queries for authorized users only
- **Data Privacy**: Hashes IP addresses, limits data retention

## Database Schema

### analytics_events Table

```sql
CREATE TABLE analytics_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255), -- Anonymized user ID
    language VARCHAR(10) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    details JSONB NOT NULL DEFAULT '{}',
    user_agent TEXT,
    ip_address VARCHAR(255), -- Hashed for privacy
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes for Performance

- `idx_analytics_events_event_type` - Query by event type
- `idx_analytics_events_session_id` - Query by session
- `idx_analytics_events_user_id` - Query by user
- `idx_analytics_events_timestamp` - Time-based queries
- `idx_analytics_events_type_timestamp` - Common compound queries

## API Endpoints

### Public Endpoints

#### POST /api/analytics/events

Receives analytics events from frontend applications.

**Request Body:**

```json
{
  "events": [
    {
      "eventType": "app_created",
      "sessionId": "session_1234567890_abc123",
      "userId": "user_a1b2c3", // Anonymized
      "language": "en",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "details": {
        "appCreated": {
          "prompt": "Create a calculator",
          "language": "en",
          "success": true
        }
      }
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Received and stored 1 analytics events",
  "eventsProcessed": 1
}
```

#### GET /api/analytics/health

Health check for analytics service.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

### Admin Endpoints (Authentication Required)

#### GET /api/analytics/stats

Get analytics statistics for admin dashboard.

**Response:**

```json
{
  "totalEvents": 15420,
  "todayEvents": 342,
  "weekEvents": 1834,
  "uniqueSessionsThisWeek": 284,
  "eventsByType": {
    "app_created": 1230,
    "app_modified": 456,
    "voice_input_used": 234
  },
  "languageDistribution": {
    "en": 8234,
    "es": 1234,
    "fr": 567
  },
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### GET /api/analytics/events

Get paginated analytics events for admin analysis.

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (max: 100, default: 50)
- `eventType` (string): Filter by event type
- `sessionId` (string): Filter by session ID
- `startDate` (ISO string): Filter by start date
- `endDate` (ISO string): Filter by end date

**Response:**

```json
{
  "events": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalCount": 15420,
    "totalPages": 309,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### DELETE /api/analytics/events

Clear old analytics events (data retention).

**Query Parameters:**

- `daysToKeep` (number): Keep events from last N days (default: 90)

## Frontend Integration

### Basic Event Logging

```typescript
// In your Angular service/component
constructor(private analytics: AnalyticsService) {}

// Log app creation
this.analytics.logAppCreated(
  "Create a calculator",
  "en",
  true
);

// Log voice input
this.analytics.logVoiceInput(
  "en",
  5.2,
  true
);

// Log custom event
this.analytics.logEvent(AnalyticsEventType.CUSTOM_EVENT, {
  customData: { key: "value" }
});
```

### Dashboard Access Control

The analytics dashboard is automatically disabled in production. In development:

- Press `Ctrl+Shift+A` to open dashboard
- Dashboard shows connection status and pending sync count
- Export/clear functionality available for testing

### Offline Support

Events are automatically buffered when offline and synced when connection is restored:

```typescript
// Events are queued locally
this.analytics.logEvent(AnalyticsEventType.APP_CREATED, data);

// Automatically synced when online
window.addEventListener("online", () => {
  // Service automatically retries pending events
});
```

## Data Privacy & Compliance

### Privacy Features

- **No PII Collection**: Only anonymized user IDs stored
- **IP Hashing**: Client IP addresses are SHA-256 hashed
- **Data Minimization**: Only necessary event data collected
- **User Control**: Users can clear their analytics data
- **Session-based**: No cross-session user tracking

### COPPA/GDPR Compliance

- Anonymous data collection by default
- No personal information in events
- Data retention policies configurable
- User consent respected
- Right to deletion supported

### Data Anonymization

```typescript
// Frontend automatically anonymizes user data
export function createAnonymizedUserId(userEmail: string): string {
  let hash = 0;
  for (let i = 0; i < userEmail.length; i++) {
    const char = userEmail.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `user_${Math.abs(hash).toString(36)}`;
}
```

## Deployment Setup

### 1. Database Migration

```bash
# Run the analytics migration
cd backend
./setup-analytics.bat  # Windows
# or
./setup-analytics.sh   # Linux/Mac
```

### 2. Environment Variables

```bash
# Backend .env
DATABASE_URL=postgresql://user:password@localhost:5432/minicoder
ANALYTICS_SALT=your_random_salt_for_ip_hashing
NODE_ENV=production
```

### 3. Frontend Configuration

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: "https://your-api-domain.com",
  // Analytics dashboard will be automatically disabled
};
```

## Analytics Queries for Business Insights

### User Engagement Analysis

```sql
-- Most popular app creation prompts
SELECT
  details->>'appCreated'->>'prompt' as prompt,
  COUNT(*) as frequency
FROM analytics_events
WHERE event_type = 'app_created'
  AND details->>'appCreated'->>'success' = 'true'
  AND timestamp > NOW() - INTERVAL '30 days'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 20;
```

### Language Preferences

```sql
-- Usage by language over time
SELECT
  DATE_TRUNC('day', timestamp) as date,
  language,
  COUNT(*) as events
FROM analytics_events
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY 1, 2
ORDER BY 1 DESC, 3 DESC;
```

### Feature Usage

```sql
-- Voice input adoption
SELECT
  DATE_TRUNC('day', timestamp) as date,
  COUNT(*) as voice_sessions,
  AVG((details->>'voiceInputUsed'->>'duration')::float) as avg_duration,
  SUM(CASE WHEN details->>'voiceInputUsed'->>'success' = 'true' THEN 1 ELSE 0 END) as successful_sessions
FROM analytics_events
WHERE event_type = 'voice_input_used'
  AND timestamp > NOW() - INTERVAL '30 days'
GROUP BY 1
ORDER BY 1 DESC;
```

### Error Analysis

```sql
-- Common error patterns
SELECT
  event_type,
  details->>'appError'->>'context' as error_context,
  COUNT(*) as frequency
FROM analytics_events
WHERE event_type LIKE '%error%'
  AND timestamp > NOW() - INTERVAL '7 days'
GROUP BY 1, 2
ORDER BY 3 DESC;
```

### Session Analysis

```sql
-- Average session duration and events per session
SELECT
  AVG(session_duration) as avg_duration_minutes,
  AVG(event_count) as avg_events_per_session
FROM (
  SELECT
    session_id,
    EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp)))/60 as session_duration,
    COUNT(*) as event_count
  FROM analytics_events
  WHERE timestamp > NOW() - INTERVAL '7 days'
  GROUP BY session_id
  HAVING COUNT(*) > 1
) session_stats;
```

## Monitoring & Maintenance

### Health Checks

- Monitor `/api/analytics/health` endpoint
- Track database connection status
- Alert on failed event submissions

### Performance Monitoring

- Monitor database query performance
- Track event processing latency
- Set up indexes based on common query patterns

### Data Retention

- Implement automated cleanup of old events
- Consider archiving vs deletion for compliance
- Monitor storage usage growth

### Security

- Regularly rotate analytics salt
- Monitor for unusual data patterns
- Implement rate limiting on event submission

## Future Enhancements

### Real-time Analytics

- Implement WebSocket connections for live data
- Add real-time user activity monitoring
- Create live dashboards for admins

### Advanced Analytics

- Add user journey tracking
- Implement funnel analysis
- Create cohort analysis tools

### Machine Learning Integration

- Analyze user behavior patterns
- Predict feature usage trends
- Implement anomaly detection

### Data Export

- Add support for CSV/Excel exports
- Implement scheduled reports
- Create analytics API for third-party tools

## Support & Troubleshooting

### Common Issues

**Events not syncing to backend:**

1. Check network connectivity
2. Verify backend API URL in environment config
3. Check browser console for CORS errors
4. Verify backend analytics service is running

**Dashboard not appearing:**

1. Ensure `enableDashboard` is true in development
2. Check keyboard shortcut (Ctrl+Shift+A)
3. Verify AnalyticsService is properly injected

**Database errors:**

1. Verify PostgreSQL connection
2. Check if analytics table exists
3. Verify database permissions
4. Check for proper indexes

### Debug Mode

Enable debug mode in development:

```typescript
private config: AnalyticsConfig = {
  debugMode: true, // Shows console logs
  // ... other config
};
```

This will show detailed console logs for event processing and backend sync operations.
