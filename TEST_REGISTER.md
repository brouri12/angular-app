# Test Registration Issue

## Problem
Registration returns 500 Internal Server Error

## Test with curl

```bash
curl -X POST http://localhost:8888/user-service/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser123\",
    \"email\": \"testuser123@example.com\",
    \"password\": \"password123\",
    \"role\": \"STUDENT\",
    \"nom\": \"Test\",
    \"prenom\": \"User\",
    \"telephone\": \"1234567890\",
    \"statut_etudiant\": \"Inscrit\"
  }"
```

## Check UserService logs
Look at the IntelliJ console where UserService is running to see the actual error message.

## Common Issues
1. Keycloak not running or not accessible
2. Keycloak realm/client not configured
3. User already exists in Keycloak
4. Database connection issue
5. Validation error on required fields

## Next Steps
1. Check UserService console logs for the actual error
2. Verify Keycloak is accessible at http://localhost:9090
3. Check if realm "wordly-realm" exists
4. Check if client "wordly-client" exists with correct secret
