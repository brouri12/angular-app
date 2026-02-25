# Keycloak Configuration - Quick Steps

## Current Status
✅ Keycloak installed and running on port 9090
✅ Admin credentials: admin/admin
✅ Realm created: wordly-realm
✅ Client created: wordly-client
✅ Client secret retrieved: 0pwSKWbwfSrT1GcmUY81NYnKoPu4sCl0

## Step 1: Create Roles in Keycloak

1. Open Keycloak Admin Console: http://localhost:9090
2. Login with: admin/admin
3. Make sure you're in the **wordly-realm** (check top-left dropdown)
4. Click **"Realm roles"** in the left menu
5. Click **"Create role"** button (top right)
6. Create these 3 roles:

### Role 1: ADMIN
- Role name: `ADMIN`
- Click "Save"

### Role 2: TEACHER
- Click "Create role" again
- Role name: `TEACHER`
- Click "Save"

### Role 3: STUDENT
- Click "Create role" again
- Role name: `STUDENT`
- Click "Save"

## Step 2: Verify Client Configuration

1. Click **"Clients"** in the left menu
2. Click on **"wordly-client"**
3. Verify these settings:

### General Settings tab:
- Client ID: `wordly-client`
- Client authentication: **ON**

### Settings tab:
- Valid redirect URIs:
  - `http://localhost:4200/*`
  - `http://localhost:4201/*`
  - `http://localhost:8085/*`
- Valid post logout redirect URIs: `+`
- Web origins: `*`

### Credentials tab:
- Client secret: `0pwSKWbwfSrT1GcmUY81NYnKoPu4sCl0`

## Step 3: Start User Service

1. Open IntelliJ IDEA
2. Navigate to: `UserService/src/main/java/tn/esprit/user/UserApplication.java`
3. Right-click on the file
4. Select **"Run 'UserApplication.main()'"**
5. Wait for the service to start (check console for "Started UserApplication")

## Step 4: Test Swagger UI

Open your browser and go to:
```
http://localhost:8085/swagger-ui.html
```

You should see the Swagger documentation without any 401 error.

## Step 5: Test User Registration

### Using Swagger UI:
1. Go to http://localhost:8085/swagger-ui.html
2. Find **"auth-controller"** section
3. Click on **POST /api/auth/register**
4. Click **"Try it out"**
5. Use this JSON:

```json
{
  "username": "student1",
  "email": "student1@wordly.com",
  "password": "password123",
  "role": "STUDENT",
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+216 12345678",
  "date_naissance": "2000-01-15",
  "niveau_actuel": "Débutant",
  "statut_etudiant": "Inscrit"
}
```

6. Click **"Execute"**
7. You should get a 201 response with the created user

### Using PowerShell:
```powershell
$body = @{
    username = "student1"
    email = "student1@wordly.com"
    password = "password123"
    role = "STUDENT"
    nom = "Dupont"
    prenom = "Jean"
    telephone = "+216 12345678"
    date_naissance = "2000-01-15"
    niveau_actuel = "Débutant"
    statut_etudiant = "Inscrit"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8085/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

## Step 6: Get Token from Keycloak

### Using PowerShell:
```powershell
$body = @{
    grant_type = "password"
    client_id = "wordly-client"
    client_secret = "0pwSKWbwfSrT1GcmUY81NYnKoPu4sCl0"
    username = "student1"
    password = "password123"
}

$response = Invoke-RestMethod -Uri "http://localhost:9090/realms/wordly-realm/protocol/openid-connect/token" -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"

# Display the access token
$response.access_token

# Save token to variable for next step
$token = $response.access_token
```

## Step 7: Test Protected Endpoint

### Using PowerShell (with token from Step 6):
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8085/api/users" -Method Get -Headers $headers
```

### Using Swagger UI:
1. Copy the access_token from Step 6
2. In Swagger UI, click the **"Authorize"** button (top right)
3. Paste the token in the "Value" field
4. Click "Authorize"
5. Click "Close"
6. Now you can test protected endpoints like GET /api/users

## Troubleshooting

### Error: "Connection refused" on port 8085
- Make sure User Service is running in IntelliJ
- Check the console for any startup errors

### Error: "Connection refused" on port 9090
- Make sure Keycloak is running
- Check with: `http://localhost:9090`

### Error: "Connection refused" on port 3307
- Make sure MySQL is running
- Start XAMPP or your MySQL service

### Error: 401 Unauthorized when getting token
- Verify the user was created successfully in Step 5
- Check that the username and password are correct
- Verify the client secret matches in Keycloak and application.properties

### Error: "Invalid client credentials"
- Go to Keycloak → Clients → wordly-client → Credentials tab
- Copy the client secret
- Update in `UserService/src/main/resources/application.properties`
- Restart User Service

## Next Steps After Testing

Once everything works:
1. Create more test users (teacher, admin)
2. Integrate authentication in Angular frontend
3. Integrate authentication in back-office
4. Add role-based access control
5. Add user profile management

## Quick Reference

| Service | URL | Credentials |
|---------|-----|-------------|
| Keycloak Admin | http://localhost:9090 | admin/admin |
| User Service | http://localhost:8085 | - |
| Swagger UI | http://localhost:8085/swagger-ui.html | - |
| MySQL | localhost:3307 | root/(empty) |
| Eureka | http://localhost:8761 | - |

## Test Users to Create

### Student
```json
{
  "username": "student1",
  "email": "student1@wordly.com",
  "password": "password123",
  "role": "STUDENT",
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+216 12345678",
  "date_naissance": "2000-01-15",
  "niveau_actuel": "Débutant",
  "statut_etudiant": "Inscrit"
}
```

### Teacher
```json
{
  "username": "teacher1",
  "email": "teacher1@wordly.com",
  "password": "password123",
  "role": "TEACHER",
  "nom": "Martin",
  "prenom": "Sophie",
  "telephone": "+216 87654321",
  "specialite": "Anglais",
  "experience": 5,
  "disponibilite": "Lundi, Mercredi, Vendredi"
}
```

### Admin
```json
{
  "username": "admin1",
  "email": "admin1@wordly.com",
  "password": "password123",
  "role": "ADMIN",
  "nom": "Bernard",
  "prenom": "Pierre",
  "telephone": "+216 11223344",
  "poste": "Directeur"
}
```
