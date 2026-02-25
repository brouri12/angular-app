# Test Keycloak Login

## Issue
Getting 401 Unauthorized when trying to login. User exists in database but Keycloak rejects the credentials.

## Possible Causes
1. **Wrong client secret** - The secret in code doesn't match Keycloak
2. **Client not configured for Direct Access Grants**
3. **Password doesn't match** - User password in Keycloak is different

## Steps to Fix

### 1. Verify Client Secret
1. Go to http://localhost:9090
2. Login as admin
3. Select realm: `wordly-realm`
4. Go to Clients → `wordly-client`
5. Click "Credentials" tab
6. Copy the "Client secret"
7. Update in both files:
   - `back-office/src/app/services/auth.service.ts` (line ~88)
   - `frontend/angular-app/src/app/services/auth.service.ts` (line ~88)
   
   Replace: `client_secret', 'fFWjOZlxqLgrswbI9sfeiDj1xQbyw1DG'`

### 2. Enable Direct Access Grants
1. In Keycloak, go to Clients → `wordly-client`
2. Click "Settings" tab
3. Scroll down to "Capability config"
4. Make sure these are ENABLED:
   - ✅ Client authentication: ON
   - ✅ Direct access grants: ON
   - ✅ Standard flow: ON
5. Click "Save"

### 3. Test with Postman/cURL
Test the Keycloak token endpoint directly:

```bash
curl -X POST http://localhost:9090/realms/wordly-realm/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=YOUR_USERNAME" \
  -d "password=YOUR_PASSWORD" \
  -d "grant_type=password" \
  -d "client_id=wordly-client" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

Replace:
- `YOUR_USERNAME` with the username from database (not email!)
- `YOUR_PASSWORD` with the password you used during registration
- `YOUR_CLIENT_SECRET` with the secret from Keycloak

### 4. Check User in Keycloak
1. In Keycloak, go to Users
2. Search for your user
3. If user doesn't exist, the registration didn't create it in Keycloak
4. If user exists, click on it → Credentials tab
5. You can reset the password here if needed

## Common Issues

### Issue: User not in Keycloak
If the user exists in MySQL but not in Keycloak, the KeycloakService failed during registration.

**Solution**: Check UserService logs for Keycloak connection errors.

### Issue: Wrong Password
The password stored in Keycloak might be different from what you're entering.

**Solution**: 
1. Go to Keycloak → Users → Your User → Credentials
2. Click "Reset password"
3. Enter a new password
4. Uncheck "Temporary"
5. Click "Save"

### Issue: Client Secret Mismatch
The most common issue!

**Solution**: Get the correct secret from Keycloak and update both auth services.

## Quick Fix
If nothing works, try this:

1. Delete the user from Keycloak (Users → Delete)
2. Delete the user from MySQL database
3. Register again with a simple password like "123456"
4. Try logging in immediately after registration
