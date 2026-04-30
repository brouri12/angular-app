# GitHub Webhook Setup for Jenkins

This guide will help you set up automatic builds in Jenkins when you push code to GitHub.

## 🎯 What is a Webhook?

A webhook allows GitHub to automatically notify Jenkins when you push code, so Jenkins can start a build immediately without manual intervention.

## 📋 Prerequisites

- Jenkins running and accessible
- GitHub repository
- Jenkins job configured

## 🚀 Setup Steps

### **Step 1: Install GitHub Plugin in Jenkins**

1. Open Jenkins: http://localhost:8080
2. Go to: **Manage Jenkins** → **Plugins** → **Available plugins**
3. Search for: **GitHub Integration Plugin**
4. Check the box and click: **Install without restart**
5. Wait for installation to complete

### **Step 2: Configure Jenkins Job for Webhook**

1. Go to your Jenkins pipeline job
2. Click: **Configure**
3. Scroll to: **Build Triggers** section
4. Check: **GitHub hook trigger for GITScm polling**
5. Click: **Save**

### **Step 3: Get Jenkins Webhook URL**

Your Jenkins webhook URL will be:

```
http://localhost:8080/github-webhook/
```

**⚠️ Important:** If Jenkins is running on your local machine (localhost), GitHub won't be able to reach it. You need to expose Jenkins to the internet.

## 🌐 Expose Jenkins to Internet (Choose One Method)

### **Method 1: Using ngrok (Easiest for Testing)**

#### A. Install ngrok

1. Download from: https://ngrok.com/download
2. Extract and run:

```powershell
# Navigate to ngrok folder
cd C:\path\to\ngrok

# Expose Jenkins port
.\ngrok http 8080
```

#### B. Get Public URL

ngrok will show you a public URL like:
```
https://abc123.ngrok.io -> http://localhost:8080
```

#### C. Use This URL for Webhook

Your webhook URL becomes:
```
https://abc123.ngrok.io/github-webhook/
```

**Note:** Keep ngrok running while you want webhooks to work.

---

### **Method 2: Using Cloudflare Tunnel (Free, Permanent)**

#### A. Install Cloudflare Tunnel

```powershell
# Download cloudflared
# Visit: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

# Run tunnel
cloudflared tunnel --url http://localhost:8080
```

#### B. Get Public URL

Cloudflare will give you a URL like:
```
https://xyz.trycloudflare.com
```

#### C. Use This URL for Webhook

```
https://xyz.trycloudflare.com/github-webhook/
```

---

### **Method 3: Deploy Jenkins to Cloud (Production)**

For production, deploy Jenkins to:
- AWS EC2
- Azure VM
- Google Cloud
- DigitalOcean

Then use the public IP or domain.

---

## 🔗 Configure GitHub Webhook

### **Step 1: Go to GitHub Repository**

1. Open: https://github.com/brouri12/angular-app
2. Click: **Settings** (repository settings, not account)
3. Click: **Webhooks** (left sidebar)
4. Click: **Add webhook**

### **Step 2: Configure Webhook**

Fill in the form:

**Payload URL:**
```
https://your-ngrok-url.ngrok.io/github-webhook/
```
(Replace with your actual ngrok/cloudflare URL)

**Content type:**
```
application/json
```

**Secret:** (Optional)
```
Leave empty or add a secret token
```

**Which events would you like to trigger this webhook?**
```
☑ Just the push event
```

**Active:**
```
☑ Active
```

Click: **Add webhook**

### **Step 3: Test the Webhook**

1. GitHub will send a test ping
2. Check if you see a green checkmark ✓
3. If you see a red X, click on it to see the error

---

## ✅ Verify Setup

### **Test 1: Manual Test**

1. In GitHub webhook settings, click on your webhook
2. Scroll down to "Recent Deliveries"
3. Click "Redeliver" on the test ping
4. Should see: Response 200 OK

### **Test 2: Push Code**

```powershell
# Make a small change
cd "C:\Users\marwe\Desktop\Nouveau dossier"

# Create a test file
echo "test" > test.txt

# Commit and push
git add test.txt
git commit -m "Test webhook"
git push origin feature/complete-devops-setup
```

**Expected Result:**
- Jenkins should automatically start a build
- Check Jenkins dashboard to see the build running

---

## 🐛 Troubleshooting

### **Webhook Shows Red X**

**Problem:** GitHub can't reach Jenkins

**Solutions:**
1. Check if ngrok/cloudflare tunnel is running
2. Verify the URL is correct
3. Check Jenkins is accessible at the public URL
4. Check firewall settings

### **Webhook Delivers but Jenkins Doesn't Build**

**Problem:** Jenkins not configured correctly

**Solutions:**
1. Verify "GitHub hook trigger" is enabled in job
2. Check Jenkins logs: Manage Jenkins → System Log
3. Verify GitHub plugin is installed
4. Check repository URL matches in Jenkins job

### **ngrok URL Changes**

**Problem:** ngrok gives a new URL each time

**Solutions:**
1. Use ngrok paid plan for permanent URL
2. Use Cloudflare Tunnel (free, more stable)
3. Deploy Jenkins to cloud with static IP

---

## 🔐 Security Best Practices

### **1. Use Webhook Secret**

In GitHub webhook settings:
1. Add a secret token
2. In Jenkins, configure the same secret
3. This ensures only GitHub can trigger builds

### **2. Use HTTPS**

- ngrok provides HTTPS by default
- Cloudflare Tunnel provides HTTPS
- For cloud deployment, use SSL certificate

### **3. Restrict IP Access**

If using cloud Jenkins:
1. Configure firewall to allow only GitHub IPs
2. GitHub webhook IPs: https://api.github.com/meta

---

## 📊 Alternative: Polling (No Webhook Needed)

If you can't expose Jenkins to internet, use polling:

### **Configure Polling in Jenkins:**

1. Go to your pipeline job
2. Click: **Configure**
3. Scroll to: **Build Triggers**
4. Check: **Poll SCM**
5. Schedule: `H/5 * * * *` (check every 5 minutes)
6. Click: **Save**

**Pros:**
- No need to expose Jenkins
- Works on localhost

**Cons:**
- Not instant (5 minute delay)
- More resource intensive

---

## 🎯 Recommended Setup for You

Since you're running Jenkins locally on Windows:

### **For Development/Testing:**

```powershell
# 1. Install ngrok
# Download from: https://ngrok.com/download

# 2. Run ngrok
.\ngrok http 8080

# 3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)

# 4. Add webhook in GitHub:
#    URL: https://abc123.ngrok.io/github-webhook/
#    Content type: application/json
#    Events: Just the push event

# 5. Enable webhook trigger in Jenkins job
#    Configure → Build Triggers → GitHub hook trigger

# 6. Test by pushing code
git push origin feature/complete-devops-setup
```

### **For Production:**

Deploy Jenkins to cloud (AWS, Azure, etc.) with a permanent URL.

---

## ✅ Success Checklist

- [ ] GitHub Integration Plugin installed in Jenkins
- [ ] Jenkins job has "GitHub hook trigger" enabled
- [ ] Jenkins exposed to internet (ngrok/cloudflare/cloud)
- [ ] Webhook added in GitHub repository
- [ ] Webhook shows green checkmark in GitHub
- [ ] Test push triggers automatic build

---

## 📚 Additional Resources

- **ngrok Documentation:** https://ngrok.com/docs
- **Cloudflare Tunnel:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **GitHub Webhooks:** https://docs.github.com/en/webhooks
- **Jenkins GitHub Plugin:** https://plugins.jenkins.io/github/

---

## 🎉 You're Done!

Once configured, every time you push code to GitHub, Jenkins will automatically:
1. Detect the push via webhook
2. Start a new build
3. Build, test, and deploy your code

No more manual "Build Now" clicks! 🚀
