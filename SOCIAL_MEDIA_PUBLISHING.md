# Social Media Publishing Feature

## Overview

This document describes the social media publishing feature that allows users to publish content directly to Instagram, Facebook, and X (Twitter) from HypeCat AI.

## Architecture

### Frontend Components

#### `SocialMediaPublisher.tsx`
- Handles OAuth authorization flow
- Checks authorization status for each platform
- Publishes content to the selected platform
- Shows authorization modals and status indicators

### Backend API Routes

#### `/api/social-auth/status`
- **Method**: GET
- **Query Params**: `platform` (instagram|facebook|x)
- **Response**: 
  ```json
  {
    "isAuthorized": boolean,
    "accountName": string,
    "accountId": string
  }
  ```
- **Description**: Checks if the user has authorized the platform

#### `/api/social-auth/authorize`
- **Method**: GET
- **Query Params**: `platform` (instagram|facebook|x)
- **Response**: Redirects to OAuth provider or shows demo page
- **Description**: Initiates the OAuth authorization flow

#### `/api/social-auth/callback/[platform]`
- **Method**: GET
- **Query Params**: `code`, `state` (from OAuth provider)
- **Response**: HTML page with success/error message
- **Description**: Handles OAuth callback and stores access token

#### `/api/social-auth/revoke`
- **Method**: POST
- **Query Params**: `platform` (instagram|facebook|x)
- **Response**: 
  ```json
  {
    "success": boolean
  }
  ```
- **Description**: Revokes authorization for a platform

#### `/api/social-publish`
- **Method**: POST
- **Body**: 
  ```json
  {
    "platform": "instagram|facebook|x",
    "content": "string",
    "accountId": "string (optional)"
  }
  ```
- **Response**: 
  ```json
  {
    "success": boolean,
    "postId": "string",
    "url": "string (optional)",
    "message": "string"
  }
  ```
- **Description**: Publishes content to the selected platform

## Demo Mode

When OAuth credentials are not configured, the application runs in **demo mode**:

1. The authorize endpoint shows a demo page with a "Simulate Authorization" button
2. Clicking the button simulates successful authorization
3. Demo tokens are stored in cookies (prefixed with `demo_`)
4. The publish endpoint simulates posting and returns mock success responses

### Demo Mode Benefits
- Test the full user flow without OAuth setup
- Develop and test UI without API credentials
- Easy onboarding for developers

## Production Setup

### Instagram

1. Create a Facebook App at https://developers.facebook.com
2. Add Instagram Basic Display or Instagram Graph API
3. Configure OAuth redirect URI: `{NEXT_PUBLIC_URL}/api/social-auth/callback/instagram`
4. Set environment variables:
   ```
   INSTAGRAM_CLIENT_ID=your_app_id
   INSTAGRAM_CLIENT_SECRET=your_app_secret
   ```

**Note**: Instagram requires:
- Business account linked to a Facebook Page
- App review for publishing permissions
- Media URLs (images/videos) for posts

### Facebook

1. Create a Facebook App at https://developers.facebook.com
2. Add Facebook Login product
3. Configure OAuth redirect URI: `{NEXT_PUBLIC_URL}/api/social-auth/callback/facebook`
4. Set environment variables:
   ```
   FACEBOOK_APP_ID=your_app_id
   FACEBOOK_APP_SECRET=your_app_secret
   ```

**Required Permissions**:
- `pages_manage_posts` - Publish posts to Pages
- `pages_read_engagement` - Read Page data

### X (Twitter)

1. Create an App at https://developer.twitter.com
2. Enable OAuth 2.0
3. Configure OAuth redirect URI: `{NEXT_PUBLIC_URL}/api/social-auth/callback/x`
4. Set environment variables:
   ```
   TWITTER_CLIENT_ID=your_client_id
   TWITTER_CLIENT_SECRET=your_client_secret
   ```

**Required Scopes**:
- `tweet.read` - Read tweets
- `tweet.write` - Create tweets
- `users.read` - Read user profile

## Storage

### Current Implementation (Demo/Development)
- Access tokens stored in HTTP-only cookies
- Cookie names: `{platform}_auth`
- Data structure:
  ```json
  {
    "accessToken": "string",
    "accountName": "string",
    "accountId": "string",
    "expiresAt": number
  }
  ```

### Production Recommendations
1. **Use a database** to store tokens securely:
   - User ID
   - Platform
   - Access Token (encrypted)
   - Refresh Token (encrypted)
   - Token expiry time
   - Account info

2. **Implement token refresh**:
   - Check token expiry before API calls
   - Automatically refresh expired tokens
   - Handle refresh token expiry

3. **Security best practices**:
   - Encrypt tokens at rest
   - Use secure, HTTP-only cookies for session
   - Implement CSRF protection
   - Rate limit API endpoints
   - Log all publishing actions

## User Flow

1. **Initial State**: User sees platform buttons (Instagram/Facebook/X)
2. **Select Platform**: User clicks a platform button
3. **Generate Content**: AI generates platform-specific content
4. **Authorization Check**: 
   - If not authorized: Show "Connect Account" link
   - If authorized: Show "Connected as {account}" status
5. **Publish**:
   - Click "Publish to {Platform}" button
   - If not authorized: Show authorization modal
   - If authorized: Publish content to platform
6. **Success**: Content is published and saved to calendar

## Error Handling

### Token Expired
```json
{
  "error": "Authorization expired. Please reconnect your account.",
  "status": 401
}
```
**Action**: Prompt user to re-authorize

### API Rate Limit
```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "status": 429
}
```
**Action**: Show user-friendly message with retry time

### Platform API Error
```json
{
  "error": "Failed to publish content",
  "details": "Platform-specific error message",
  "status": 500
}
```
**Action**: Log error and show user-friendly message

## Testing

### Demo Mode Testing
1. Don't set OAuth environment variables
2. Click "Publish to {Platform}"
3. Click "Authorize" in modal
4. Click "Simulate Authorization" in demo page
5. Verify success message and content is saved

### Production Testing
1. Set up OAuth credentials for one platform
2. Complete real authorization flow
3. Publish test content
4. Verify post appears on the platform
5. Test error scenarios (invalid token, API errors)

## Future Enhancements

1. **Multi-account support**: Allow connecting multiple accounts per platform
2. **Scheduled publishing**: Queue posts for future publication
3. **Analytics**: Track post performance and engagement
4. **Media upload**: Support image/video uploads with posts
5. **Draft management**: Save drafts before publishing
6. **Publishing history**: View past published content
7. **Bulk publishing**: Publish to multiple platforms at once
8. **Content templates**: Save and reuse content templates

## Troubleshooting

### "Not authorized" even after authorization
- Check cookie storage
- Verify OAuth redirect URIs match exactly
- Check browser console for errors

### Authorization popup blocked
- Browser may block popup windows
- Show message to allow popups for this site
- Alternative: Use redirect flow instead of popup

### Token refresh not working
- Implement proper token refresh logic
- Check if refresh token is stored
- Verify refresh token hasn't expired

### Content not appearing on platform
- Check API response for errors
- Verify account permissions
- Check platform-specific requirements (e.g., Instagram needs media URLs)
