# Test avec le vrai token

$token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIydHFUNVJ2SGNZMFBuSWc4WUM0RlhUNUhlazkyRTBrYjBpRDdyOFJRc3drIn0.eyJleHAiOjE3NzE4NDI3MjIsImlhdCI6MTc3MTgzOTEyMiwianRpIjoiODQxMTg3OGEtYjkzZi00M2IyLWIxZDEtZWEwYmU4MWEzYzYzIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo5MDkwL3JlYWxtcy93b3JkbHktcmVhbG0iLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiMDc1Nzc2ODYtZmU4Ny00OWNhLWJjN2QtZGExYmFkNjQ2NzA0IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoid29yZGx5LWNsaWVudCIsInNlc3Npb25fc3RhdGUiOiJiY2ZkYjAwOS1hOGFkLTRiNjUtYWYzYy1iNDk4YmI3YTcyMDAiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIlNUVURFTlQiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIiwiZGVmYXVsdC1yb2xlcy13b3JkbHktcmVhbG0iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6InByb2ZpbGUgZW1haWwiLCJzaWQiOiJiY2ZkYjAwOS1hOGFkLTRiNjUtYWYzYy1iNDk4YmI3YTcyMDAiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6InN0dWRlbnQxYWF6IiwiZW1haWwiOiJzdHVkZW50MXNzc0B0ZXN0LmNvbSJ9.YmCN1CvKDtJ5mXRaqUmJ5rHG6-9AtkEvwRauvotb33eZYFb-njYctLBZbKF5YT0SppQrFhzYYtRfXWoRfh876e7N7aCfKsQhyn8LyM51xIkc6cptYW4J_9D_zEAganeDFh5eiAEKN7lyngzmbLWFJa48XcxLC5I2mBPORvSQktz7ZYJjtK4mUl0egclbq2Xck0XqN3hYSxAyPIMJtEhvMnWq0HbHW32EpIRcF4Su3mItrpWXBACkKEhEwsJSDDdT4BrDXcKG7TlIDWW6UpttZEqyOi8utIk3phws8kszYP3MH-Ru_uEl3HsPzDG7ZGTKE33rIpFnXdKLIhD7YgacXA"

Write-Host "Test 1: UserService direct avec token" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "http://localhost:8085/api/auth/me" -Method GET -Headers $headers
    Write-Host "OK - Reponse:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "ERREUR:" -ForegroundColor Red
    Write-Host "Status:" $_.Exception.Response.StatusCode.value__ -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Test 2: Via Gateway avec token" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "http://localhost:8888/user-service/api/auth/me" -Method GET -Headers $headers
    Write-Host "OK - Reponse:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "ERREUR:" -ForegroundColor Red
    Write-Host "Status:" $_.Exception.Response.StatusCode.value__ -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
