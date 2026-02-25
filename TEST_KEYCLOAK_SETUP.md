# Test Keycloak Setup

## Issue
Registration fails with "Internal Server Error" when creating user in Keycloak.

## Root Cause
Either:
1. Realm "wordly-realm" doesn't exist
2. Roles "TEACHER" and "STUDENT" don't exist in the realm
3. Keycloak Admin credentials are wrong

## Test Keycloak Connection

Open browser and go to: http://localhost:9090/api/auth/test-keycloak

This should show:
- Status: Connected to Keycloak
- Realms count: X
- Realms: [list of realms]

If you see "wordly-realm" in the list, the realm exists.

## Fix Steps

### 1. Access Keycloak Admin Console
- Go to: http://localhost:9090
- Login with: admin / admin

### 2. Check if "wordly-realm" exists
- Look in the dropdown at top left
- If it doesn't exist, create it:
  - Click dropdown → "Create Realm"
  - Name: wordly-realm
  - Click "Create"

### 3. Create Roles
- Select "wordly-realm" from dropdown
- Go to "Realm roles" in left menu
- Click "Create role"
- Create role "TEACHER"
- Click "Create role" again
- Create role "STUDENT"

### 4. Verify Client
- Go to "Clients" in left menu
- Find "wordly-client"
- If it doesn't exist, create it:
  - Click "Create client"
  - Client ID: wordly-client
  - Click "Next"
  - Enable "Client authentication"
  - Enable "Direct access grants"
  - Enable "Standard flow"
  - Click "Save"
- Go to "Credentials" tab
- Copy the "Client secret"
- Update it in:
  - `UserService/src/main/resources/application.properties` (line 27)
  - `frontend/angular-app/src/app/services/auth.service.ts` (line 47)
  - `back-office/src/app/services/auth.service.ts` (line 47)

### 5. Test Again
After setting up the realm, roles, and client, restart UserService and try registering again.
