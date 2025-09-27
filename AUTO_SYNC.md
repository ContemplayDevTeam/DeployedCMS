# 🔄 Auto-Sync Git Hooks

## ✅ **Hooks Installed:**

### **pre-commit**
- Automatically pulls latest changes before each commit
- Prevents commit conflicts
- Stashes your changes, pulls, then reapplies

### **post-merge**
- Runs after pulling/merging
- Auto-installs dependencies if package.json changed
- Notifies about config file changes

### **pre-push**
- Syncs with remote before pushing
- Prevents push conflicts
- Uses rebase to maintain clean history

## 🚀 **How It Works:**

```bash
# Just work normally - hooks handle everything!

git add .
git commit -m "my changes"   # ← Automatically pulls first
git push                     # ← Automatically syncs first
```

## 🎯 **Benefits:**
- **Zero manual syncing** - happens automatically
- **No conflicts** - always synced before operations
- **Clean history** - uses rebase instead of merge commits
- **Smart updates** - auto-installs deps when needed

## 🔧 **For Multiple Claudes:**
Each Claude just works normally:
1. Make changes
2. Commit (auto-pulls latest)
3. Push (auto-syncs)
4. Others automatically get updates on their next commit

**You're all set! 🎉**// Auto-sync test by Claude 1
