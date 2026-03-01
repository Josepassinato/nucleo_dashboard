# Production Setup Guide

## Environment Variables for Production

All environment variables are automatically injected by Manus. Verify they are configured in the Management UI → Settings → Secrets.

### Required Variables

#### Authentication & OAuth
- `VITE_APP_ID` - Manus OAuth Application ID
- `VITE_OAUTH_PORTAL_URL` - Manus login portal URL (frontend)
- `OAUTH_SERVER_URL` - Manus OAuth backend base URL
- `JWT_SECRET` - Session cookie signing secret

#### Database
- `DATABASE_URL` - MySQL/TiDB connection string (format: `mysql://user:password@host:port/database`)

#### Owner Information
- `OWNER_NAME` - Dashboard owner's name
- `OWNER_OPEN_ID` - Owner's Manus OAuth ID

#### Stripe Integration
- `STRIPE_SECRET_KEY` - Stripe secret API key (test or live)
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

#### Built-in Manus APIs
- `BUILT_IN_FORGE_API_URL` - Manus API URL (for LLM, storage, notifications, etc)
- `BUILT_IN_FORGE_API_KEY` - Bearer token for server-side API access
- `VITE_FRONTEND_FORGE_API_KEY` - Bearer token for frontend API access
- `VITE_FRONTEND_FORGE_API_URL` - Manus API URL for frontend

#### Analytics
- `VITE_ANALYTICS_ENDPOINT` - Analytics endpoint URL
- `VITE_ANALYTICS_WEBSITE_ID` - Website ID for analytics

#### App Configuration
- `VITE_APP_TITLE` - Dashboard title (displayed in header)
- `VITE_APP_LOGO` - Logo URL (displayed in header)

## Pre-Deployment Checklist

### 1. Database
- [ ] Database migrations applied (`pnpm db:push`)
- [ ] All tables created (agents, actions, metrics, etc)
- [ ] Backup strategy configured

### 2. Authentication
- [ ] OAuth credentials configured
- [ ] JWT_SECRET set to a strong random value
- [ ] Session cookie settings verified

### 3. Stripe Integration (if using payments)
- [ ] Stripe keys configured (test or live)
- [ ] Webhook endpoint registered at `/api/stripe/webhook`
- [ ] Webhook secret configured
- [ ] Test payment flow verified

### 4. API Integration
- [ ] Manus API keys configured
- [ ] LLM integration tested
- [ ] Storage integration tested (if using file uploads)

### 5. Frontend Configuration
- [ ] App title and logo set
- [ ] Analytics configured (if using)
- [ ] Environment variables exposed to frontend

### 6. Security
- [ ] All secrets are strong and unique
- [ ] Database credentials are secure
- [ ] API keys are rotated regularly
- [ ] HTTPS enabled on all endpoints
- [ ] CORS configured correctly

### 7. Monitoring & Logging
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Logs are being collected

### 8. Testing
- [ ] All tests passing (`pnpm test`)
- [ ] Manual testing of main flows completed
- [ ] Authentication flow tested
- [ ] Dashboard metrics verified
- [ ] Agent operations tested

## Deployment Steps

### Option 1: Deploy to Manus (Recommended)
1. Create a checkpoint: `webdev_save_checkpoint`
2. Click "Publish" button in Management UI
3. Configure custom domain (optional)

### Option 2: Deploy to Vercel/Railway
1. Push code to GitHub: `git push origin main`
2. Connect repository to Vercel/Railway
3. Configure environment variables in deployment platform
4. Deploy

### Option 3: Deploy to Custom Server
1. Build the project: `pnpm build`
2. Set environment variables on server
3. Run migrations: `pnpm db:push`
4. Start server: `node dist/index.js`

## Post-Deployment Verification

- [ ] Application loads without errors
- [ ] Authentication works (login/logout)
- [ ] Dashboard displays correct metrics
- [ ] Agents can be created and listed
- [ ] Actions are tracked correctly
- [ ] Stripe payments work (if configured)
- [ ] WebSocket connections work (for real-time updates)
- [ ] Logs are being collected

## Troubleshooting

### Database Connection Issues
```bash
# Verify DATABASE_URL format
echo $DATABASE_URL

# Test connection
pnpm db:push
```

### OAuth Issues
- Verify `VITE_APP_ID` is correct
- Check `OAUTH_SERVER_URL` is accessible
- Ensure redirect URL matches OAuth configuration

### Stripe Issues
- Verify webhook endpoint is accessible
- Check webhook secret matches Stripe dashboard
- Test with Stripe test card: 4242 4242 4242 4242

### Performance Issues
- Check database query performance
- Enable caching for frequently accessed data
- Monitor WebSocket connections
- Review error logs for bottlenecks

## Maintenance

### Regular Tasks
- Monitor error rates and logs
- Review performance metrics
- Update dependencies monthly
- Rotate secrets regularly
- Test backup/restore procedures

### Scaling Considerations
- Database: Add read replicas for high traffic
- Cache: Implement Redis for frequently accessed data
- CDN: Use CDN for static assets
- WebSocket: Consider load balancing for real-time features

## Support

For issues or questions:
1. Check logs in Management UI → Dashboard
2. Review error messages in browser console
3. Contact Manus support at https://help.manus.im
