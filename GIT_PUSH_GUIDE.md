# 📤 Push Code to GitHub - Branch: marwen

## Quick Method (Automated)

Run this script:
```powershell
.\PUSH_TO_GITHUB.ps1
```

The script will:
1. Check if Git is installed
2. Initialize repository if needed
3. Add remote if needed
4. Create/switch to `marwen` branch
5. Add all files
6. Commit changes
7. Push to GitHub

---

## Manual Method (Step by Step)

### Step 1: Check Git Installation

```powershell
git --version
```

If not installed, download from: https://git-scm.com/download/win

### Step 2: Configure Git (First Time Only)

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3: Initialize Repository (If Needed)

```powershell
# Check if already initialized
git status

# If not, initialize
git init
```

### Step 4: Add Remote

```powershell
# Add remote (if not already added)
git remote add origin https://github.com/brouri12/angular-app.git

# Or update existing remote
git remote set-url origin https://github.com/brouri12/angular-app.git

# Verify
git remote -v
```

### Step 5: Create/Switch to Branch

```powershell
# Create and switch to marwen branch
git checkout -b marwen

# Or if branch exists, just switch
git checkout marwen
```

### Step 6: Add Files

```powershell
# Add all files
git add .

# Or add specific files
git add frontend/
git add UserService/
git add back-office/

# Check what will be committed
git status
```

### Step 7: Commit Changes

```powershell
git commit -m "Add subscription management and payment system"
```

### Step 8: Push to GitHub

```powershell
# Push to marwen branch
git push -u origin marwen
```

---

## 🔐 Authentication

### Option 1: GitHub Desktop (Easiest)

1. Download GitHub Desktop: https://desktop.github.com/
2. Login with your GitHub account
3. Clone the repository
4. Make changes
5. Commit and push from the app

### Option 2: Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (full control)
4. Copy the token
5. When pushing, use token as password:
   ```
   Username: your-github-username
   Password: [paste-token-here]
   ```

### Option 3: SSH Key

1. Generate SSH key:
   ```powershell
   ssh-keygen -t ed25519 -C "your.email@example.com"
   ```
2. Add to GitHub: https://github.com/settings/keys
3. Use SSH URL:
   ```powershell
   git remote set-url origin git@github.com:brouri12/angular-app.git
   ```

---

## 📋 Common Commands

### Check Status
```powershell
git status
```

### View Branches
```powershell
git branch -a
```

### View Commit History
```powershell
git log --oneline
```

### Undo Last Commit (Keep Changes)
```powershell
git reset --soft HEAD~1
```

### Discard All Changes
```powershell
git reset --hard HEAD
```

### Pull Latest Changes
```powershell
git pull origin marwen
```

### View Remote URL
```powershell
git remote -v
```

---

## 🐛 Troubleshooting

### Error: "fatal: not a git repository"

**Solution:**
```powershell
git init
```

### Error: "remote origin already exists"

**Solution:**
```powershell
git remote set-url origin https://github.com/brouri12/angular-app.git
```

### Error: "failed to push some refs"

**Cause:** Remote has changes you don't have locally

**Solution:**
```powershell
# Pull first, then push
git pull origin marwen --rebase
git push origin marwen
```

### Error: "Authentication failed"

**Solution:**
1. Use Personal Access Token (see Authentication section)
2. Or use GitHub Desktop
3. Or configure SSH key

### Error: "Permission denied"

**Cause:** You don't have write access to the repository

**Solution:**
- Ask repository owner to add you as collaborator
- Or fork the repository and push to your fork

---

## 📁 What Gets Pushed

### Included:
- ✅ All source code
- ✅ Configuration files
- ✅ Documentation (*.md files)
- ✅ Scripts (*.ps1, *.sh)
- ✅ SQL files

### Excluded (via .gitignore):
- ❌ node_modules/
- ❌ target/
- ❌ .angular/
- ❌ dist/
- ❌ *.log files
- ❌ IDE settings (.idea/, .vscode/)

---

## 🎯 Recommended Workflow

### Daily Work:

1. **Start of day:**
   ```powershell
   git pull origin marwen
   ```

2. **Make changes** (code, test, etc.)

3. **Check what changed:**
   ```powershell
   git status
   git diff
   ```

4. **Commit frequently:**
   ```powershell
   git add .
   git commit -m "Descriptive message"
   ```

5. **End of day:**
   ```powershell
   git push origin marwen
   ```

### Before Major Changes:

```powershell
# Create a feature branch
git checkout -b feature/new-feature

# Make changes
# ...

# Commit
git add .
git commit -m "Add new feature"

# Push feature branch
git push origin feature/new-feature

# Later, merge to marwen
git checkout marwen
git merge feature/new-feature
git push origin marwen
```

---

## 📝 Good Commit Messages

### Format:
```
Type: Brief description

Detailed explanation (optional)
```

### Examples:
```
feat: Add subscription management dashboard
fix: Resolve CORS issue with Keycloak
docs: Update README with setup instructions
refactor: Improve payment service structure
style: Format code according to standards
test: Add unit tests for user service
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

---

## 🚀 Quick Push (One Command)

```powershell
git add . && git commit -m "Update code" && git push origin marwen
```

---

## ✅ Verification

After pushing, verify at:
```
https://github.com/brouri12/angular-app/tree/marwen
```

You should see:
- ✅ Your latest commit
- ✅ All your files
- ✅ Correct branch name (marwen)
- ✅ Updated timestamp

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Git status:**
   ```powershell
   git status
   ```

2. **Check remote:**
   ```powershell
   git remote -v
   ```

3. **Check branch:**
   ```powershell
   git branch
   ```

4. **View last commits:**
   ```powershell
   git log --oneline -5
   ```

5. **Use the automated script:**
   ```powershell
   .\PUSH_TO_GITHUB.ps1
   ```

---

## 🎉 Success!

Once pushed successfully, your code will be available at:
```
https://github.com/brouri12/angular-app/tree/marwen
```

You can share this link with your team!
