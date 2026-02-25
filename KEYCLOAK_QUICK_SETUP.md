# Keycloak Quick Setup Guide

## Step 1: Access Keycloak
1. Open http://localhost:9090 in your browser
2. Create admin account (first time):
   - Username: `admin`
   - Password: `admin` (or your choice)

## Step 2: Create Realm
1. Click on the dropdown at top left (says "master")
2. Click "Create Realm"
3. Realm name: `wordly-realm`
4. Click "Create"

## Step 3: Create Client
1. In the left menu, click "Clients"
2. Click "Create client"
3. Fill in:
   - Client ID: `wordly-client`
   - Client authentication: ON
   - Click "Next"
4. Enable these:
   - Standard flow: ON
   - Direct access grants: ON
   - Service accounts roles: ON
   - Click "Next"
5. Valid redirect URIs: `*`
6. Web origins: `*`
7. Click "Save"

## Step 4: Get Client Secret
1. Go to "Clients" → "wordly-client"
2. Click "Credentials" tab
3. Copy the "Client secret" value
4. Update in your code if different from: `fFWjOZlxqLgrswbI9sfeiDj1xQbyw1DG`

## Step 5: Create Roles
1. In left menu, click "Realm roles"
2. Click "Create role"
3. Create these roles:
   - Role name: `TEACHER` → Save
   - Role name: `STUDENT` → Save

## Step 6: Test Registration
Now you can test user registration from your Angular app!

## URLs
- Keycloak Admin: http://localhost:9090
- Frontend: http://localhost:4200
- Back-office: http://localhost:4201
- User Service: http://localhost:8085
- API Gateway: http://localhost:8888
