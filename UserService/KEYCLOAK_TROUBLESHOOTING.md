# Keycloak Troubleshooting Guide

## Error: HTTP 400 Bad Request from Keycloak

This error means the User Service is trying to create a user in Keycloak, but Keycloak is rejecting the request.

### Step 1: Test Keycloak Connection

After restarting the User Service, test this endpoint:

```http
GET http://localhost:8085/api/auth/test-keycloak
```

This will tell you if the User Service can connect to Keycloak.

**Expected Response (Success):**
```json
{
  "status": "Connected to Keycloak",
  "realms_count": 2,
  "realms": ["master", "wordly-realm"]
}
```

**If you get an error**, it means:
- Keycloak is not running on port 9090
- The admin credentials are wrong
- The Keycloak URL is incorrect

---

### Step 2: Verify Keycloak Configuration

#### 2.1 Check if Keycloak is running
Open in browser: http://localhost:9090

You should see the Keycloak welcome page.

#### 2.2 Login to Keycloak Admin Console
- URL: http://localhost:9090
- Username: `admin`
- Password: `admin`

#### 2.3 Verify the Realm exists
- Click on the realm dropdown (top left)
- You should see "wordly-realm"
- If not, create it following KEYCLOAK_REALM_SETUP_STEPS.md

#### 2.4 Verify the Client exists
- Go to "Clients" in the left menu
- You should see "wordly-client"
- Click on it

#### 2.5 Verify Client Authentication is ON
- In the "wordly-client" settings
- Scroll down to "Capability config"
- **Client authentication** must be **ON** ✅
- If it's OFF, turn it ON and click "Save"

#### 2.6 Get the Client Secret
- Go to "Clients" → "wordly-client"
- Click on the "Credentials" tab (should appear after Client authentication is ON)
- Copy the "Client secret"
- Update it in `application.properties`:
  ```properties
  keycloak.credentials.secret=YOUR_ACTUAL_SECRET
  ```

#### 2.7 Verify the Roles exist
- Go to "Realm roles" in the left menu
- You should see: ADMIN, TEACHER, STUDENT
- If not, create them following KEYCLOAK_REALM_SETUP_STEPS.md

---

### Step 3: Common Issues and Solutions

#### Issue 1: "realm not found"
**Solution:** Create the realm "wordly-realm" in Keycloak

#### Issue 2: "client not found"
**Solution:** Create the client "wordly-client" in Keycloak

#### Issue 3: "invalid credentials"
**Solution:** 
- Verify admin username/password in application.properties
- Default is admin/admin
- If you changed it during Keycloak setup, update application.properties

#### Issue 4: "role not found"
**Solution:** Create the roles (ADMIN, TEACHER, STUDENT) in Keycloak

#### Issue 5: "Client authentication is required"
**Solution:** 
- Go to Clients → wordly-client → Settings
- Scroll to "Capability config"
- Turn ON "Client authentication"
- Click "Save"
- Go to "Credentials" tab and copy the secret

#### Issue 6: Email validation error
**Solution:** Use a valid email format like "admin@wordly.com" not "string"

---

### Step 4: Test with Valid Data

Once everything is configured, test with this valid JSON:

```json
{
  "username": "admin",
  "email": "admin@wordly.com",
  "password": "admin123",
  "role": "ADMIN",
  "nom": "Admin",
  "prenom": "System",
  "telephone": "+216 12345678",
  "poste": "Directeur"
}
```

**Important:**
- Use a valid email format (not "string")
- Use a username that doesn't exist yet
- Password should be at least 6 characters

---

### Step 5: Check Logs

If you still get errors, check the User Service logs in IntelliJ console.

Look for:
- Connection errors to Keycloak
- Authentication errors
- Validation errors
- Detailed error messages from Keycloak

---

### Step 6: Manual Test in Keycloak

Try creating a user manually in Keycloak to verify it works:

1. Go to Keycloak Admin Console
2. Select "wordly-realm"
3. Go to "Users" in the left menu
4. Click "Add user"
5. Fill in:
   - Username: testuser
   - Email: test@wordly.com
   - Email verified: ON
6. Click "Create"
7. Go to "Credentials" tab
8. Click "Set password"
9. Password: test123
10. Temporary: OFF
11. Click "Save"

If this works, then Keycloak is configured correctly and the issue is with the User Service configuration.

---

### Quick Checklist

Before testing registration, verify:

- [ ] Keycloak is running on http://localhost:9090
- [ ] You can login to Keycloak admin console (admin/admin)
- [ ] Realm "wordly-realm" exists
- [ ] Client "wordly-client" exists
- [ ] Client authentication is ON
- [ ] Client secret is copied to application.properties
- [ ] Roles (ADMIN, TEACHER, STUDENT) exist
- [ ] MySQL is running on port 3307
- [ ] User Service is running on port 8085
- [ ] Test endpoint /api/auth/test-keycloak returns success

---

## Next Steps

Once all checks pass:

1. Restart User Service
2. Test `/api/auth/test-keycloak` - should return success
3. Test `/api/auth/register` with valid data
4. Check if user is created in both MySQL and Keycloak
5. Get a token from Keycloak
6. Test protected endpoints with the token
