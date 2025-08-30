# Administrator Security Configuration

## Overview
The settings page is now protected with a secure password authentication system that only allows authorized administrators to access critical system settings.

## Security Features

### 🔐 Password Protection
- **Default Password**: `admin123` (MUST BE CHANGED IN PRODUCTION)
- **Maximum Login Attempts**: 3 attempts before temporary lockout
- **Lockout Duration**: 30 seconds after 3 failed attempts
- **Session Duration**: 1 hour of authenticated access
- **Automatic Logout**: Session expires after 1 hour of inactivity

### 🛡️ Security Measures
- Password input is masked by default
- Show/hide password toggle available
- Loading states during authentication
- Secure session management
- Automatic redirect on authentication failure

## How to Change the Administrator Password

### 1. Edit the Configuration File
Open `lib/auth-config.ts` and change the `ADMIN_PASSWORD` value:

```typescript
export const AUTH_CONFIG = {
  // Administrator password - CHANGE THIS IN PRODUCTION!
  ADMIN_PASSWORD: 'your-new-secure-password-here',
  // ... other settings
}
```

### 2. Security Recommendations
- Use a strong password with at least 12 characters
- Include uppercase, lowercase, numbers, and special characters
- Avoid common words or patterns
- Consider using a password manager to generate secure passwords

### 3. Additional Security Settings
You can also modify other security parameters in `lib/auth-config.ts`:

```typescript
export const AUTH_CONFIG = {
  ADMIN_PASSWORD: 'your-secure-password',
  
  // Security settings
  MAX_LOGIN_ATTEMPTS: 3,           // Number of failed attempts before lockout
  LOCKOUT_DURATION: 30000,         // Lockout duration in milliseconds (30 seconds)
  
  // Session settings
  SESSION_KEY: 'settings_authenticated',
  SESSION_DURATION: 3600000,       // Session duration in milliseconds (1 hour)
}
```

## Production Security Considerations

### ⚠️ Important Security Notes
1. **NEVER commit the actual password to version control**
2. **Use environment variables for production passwords**
3. **Implement proper server-side authentication in production**
4. **Consider implementing 2FA for additional security**
5. **Regular password rotation is recommended**

### 🔧 Environment Variable Setup (Recommended)
For production, consider using environment variables:

1. Create a `.env.local` file:
```env
ADMIN_PASSWORD=your-secure-production-password
```

2. Update `lib/auth-config.ts`:
```typescript
export const AUTH_CONFIG = {
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  // ... other settings
}
```

3. Add `.env.local` to `.gitignore`:
```gitignore
.env.local
.env.production
```

## Access Control

### Who Can Access Settings?
- **Administrators**: Full access with password authentication
- **Fleet Managers**: No direct access (redirected to incidents page)
- **Drivers**: No access (redirected to incidents page)

### Session Management
- Sessions are stored in browser sessionStorage
- Sessions automatically expire after 1 hour
- Users can manually logout using the logout button
- Failed authentication attempts are tracked and limited

## Troubleshooting

### Common Issues
1. **"Too many failed attempts"**: Wait 30 seconds before trying again
2. **Session expired**: Re-enter the password to continue
3. **Password not working**: Verify the password in `lib/auth-config.ts`

### Reset Authentication
If you need to reset the authentication state:
1. Clear browser sessionStorage
2. Or use the logout button in the settings page
3. Re-enter the administrator password

## Security Best Practices

### ✅ Do's
- Change the default password immediately
- Use strong, unique passwords
- Regularly rotate passwords
- Monitor access logs
- Implement proper backup procedures

### ❌ Don'ts
- Don't share passwords
- Don't use the same password for multiple accounts
- Don't store passwords in plain text in production
- Don't commit passwords to version control
- Don't use easily guessable passwords

## Support
For security-related issues or questions, contact your system administrator or development team.

