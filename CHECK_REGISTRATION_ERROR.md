# 🔍 Registration Error - 500 Internal Server Error

## The Problem

Registration is failing with a 500 error. This means there's an error in the backend (UserService).

---

## ✅ Quick Fix Steps

### Step 1: Check UserService Logs

In IntelliJ, look at the UserService console (bottom panel) for error messages. Look for:
- Red error text
- Stack traces
- Exception messages

Common errors:
- Database connection issues
- Keycloak connection issues
- Missing fields
- Validation errors

### Step 2: Check if Services are Running

```powershell
# Check UserService
curl http://localhost:8085/api/users/hello

# Check Keycloak
curl http://localhost:9090

# Check MySQL
# Should be running on port 3307
```

### Step 3: Check Database

Make sure the `users` table exists:
```sql
USE user_db;
SHOW TABLES;
DESCRIBE users;
```

---

## 🐛 Common Causes

### 1. Keycloak Not Running

**Symptom**: Error mentions "Connection refused" or "Keycloak"

**Solution**:
```powershell
.\START_KEYCLOAK.ps1
```

### 2. Database Issue

**Symptom**: Error mentions "SQL" or "database"

**Solution**:
- Make sure MySQL is running
- Check database exists: `user_db`
- Check table exists: `users`

### 3. Missing Required Fields

**Symptom**: Error mentions "null" or "required"

**Solution**: Check that all required fields are being sent from frontend

### 4. Keycloak User Already Exists

**Symptom**: Error mentions "User exists" or "409"

**Solution**: Try with a different email/username

---

## 📋 What to Check in UserService Logs

Look for these patterns:

### Database Error:
```
java.sql.SQLException
Could not open connection
```
→ MySQL not running or wrong credentials

### Keycloak Error:
```
javax.ws.rs.ProcessingException
Connection refused
```
→ Keycloak not running

### Validation Error:
```
ConstraintViolationException
Validation failed
```
→ Missing or invalid data

### Duplicate User:
```
UserAlreadyExistsException
User exists with same username
```
→ User already registered

---

## 🔧 Debug Registration

### Test Registration Manually

```powershell
# Test registration endpoint
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "Test123!"
    nom = "Test"
    prenom = "User"
    role = "STUDENT"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8888/user-service/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing
```

This will show you the exact error message.

---

## 🎯 Most Likely Issues

### Issue 1: Keycloak Not Running (90% of cases)

**Check**:
```powershell
curl http://localhost:9090
```

**Fix**:
```powershell
cd C:\keycloak-23.0.0
bin\kc.bat start-dev --http-port=9090
```

### Issue 2: UserService Not Restarted

After adding new code (UserSubscription), UserService needs restart.

**Fix**:
1. Stop UserService in IntelliJ
2. Run `UserApplication.java`
3. Wait for "Started UserApplication"

### Issue 3: Database Table Missing

**Check**:
```sql
USE user_db;
SHOW TABLES;
```

**Fix**:
```sql
-- Run the user table creation script
-- (should already exist from initial setup)
```

---

## 📝 Steps to Resolve

1. **Check IntelliJ Console** for UserService errors
2. **Copy the error message** (the red text)
3. **Check if Keycloak is running**:
   ```powershell
   curl http://localhost:9090
   ```
4. **Restart UserService** if needed
5. **Try registration again**

---

## 🆘 If Still Not Working

### Get Detailed Error

1. Open IntelliJ
2. Find UserService console (bottom panel)
3. Look for the latest error (red text)
4. Copy the full stack trace
5. The error will tell you exactly what's wrong

### Common Error Messages

**"Connection refused"**
→ Keycloak not running

**"Table 'user_db.users' doesn't exist"**
→ Database not set up

**"User exists with same username"**
→ Try different username/email

**"Cannot invoke ... because ... is null"**
→ Missing required field

---

## ✅ Quick Checklist

- [ ] Keycloak is running (port 9090)
- [ ] MySQL is running (port 3307)
- [ ] UserService is running (port 8085)
- [ ] API Gateway is running (port 8888)
- [ ] Database `user_db` exists
- [ ] Table `users` exists
- [ ] UserService shows no errors in console
- [ ] Using unique email/username

---

## 🚀 Quick Test

After fixing, test with:

1. Go to http://localhost:4200
2. Click "Sign Up"
3. Fill in the form:
   - Username: `testuser123`
   - Email: `test123@example.com`
   - Password: `Test123!`
   - First Name: `Test`
   - Last Name: `User`
4. Click "Sign Up"
5. Should see success message ✅

---

## 💡 Pro Tip

Enable debug logging in `application.properties`:
```properties
logging.level.tn.esprit.user=DEBUG
logging.level.org.springframework.web=DEBUG
```

This will show more detailed error messages in the console.
