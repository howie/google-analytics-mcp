# Open Source Cleanup Report

**Date**: 2025-10-08
**Status**: Ready for cleanup - action items identified

---

## Executive Summary

The project is in good shape for open source release with minimal cleanup required. Main issues:
- **Proprietary branding** (Coachly references) in 11+ files
- **Hardcoded local paths** (/Users/howie) in documentation
- **tmp/** directory needs removal
- **.claude/** directory already in .gitignore (good)

**Good news**: No secrets, credentials, or sensitive data found in codebase.

---

## ✅ Security Audit Results

### No Issues Found
- ✅ No hardcoded API keys or secrets
- ✅ No credential files (.json, .key, .pem, .env) committed
- ✅ .gitignore properly configured (covers logs, node_modules, coverage, dist, .env, .claude/)
- ✅ All sensitive files excluded from npm package (package.json files field)

### Architecture Notes
- Authentication uses environment variable: `GOOGLE_APPLICATION_CREDENTIALS`
- All credentials loaded at runtime from external files
- No test credentials or mock secrets in codebase

**Security Status**: ✅ **PASS** - Safe for public release

---

## 🔧 Required Cleanup Actions

### 1. Remove Proprietary Branding (11 files)

**Coachly references found in**:
- `package.json` - Line 37: `"author": "Coachly Team"`
- `package.json` - Line 2: `"name": "@coachly/ga4-admin-mcp"`
- `LICENSE` - Line 3: `Copyright (c) 2025 Coachly Team`
- `CLAUDE.md` - Line 300: `**Maintained by**: Coachly Team`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `docs/open-source/publishing-checklist.md`
- `docs/features/IMPLEMENTATION.md`
- `docs/features/README.md`
- `docs/features/LEARNINGS_FROM_OFFICIAL.md`
- `docs/features/GA4_SETUP_GUIDE.md`

**Recommended replacements**:
```
"Coachly Team" → "GA4 Admin MCP Contributors" or your org name
"@coachly/ga4-admin-mcp" → "@yourorg/ga4-admin-mcp" or "ga4-admin-mcp"
```

### 2. Remove Hardcoded Local Paths (8+ occurrences)

**Files with /Users/howie paths**:
- `docs/claude/quick-reference.md` (2 occurrences)
- `docs/claude/testing.md` (1 occurrence)
- `docs/features/QUICK_START.md` (2 occurrences)
- `package.json` (repository URLs - OK, these are correct)
- `tmp/MANUAL_TEST_EXECUTION.md` (3 occurrences)
- `CLAUDE.md` (1 occurrence)

**Action**: Replace with generic placeholders:
```
/Users/howie/Workspace/github/google-analytics-mcp → /path/to/google-analytics-mcp
/Users/howie/.config/gcp/ga4-admin-key.json → /path/to/service-account-key.json
```

### 3. Remove tmp/ Directory

**Location**: `/Users/howie/Workspace/github/google-analytics-mcp/tmp/`

**Contents**:
- `MANUAL_TEST_EXECUTION.md` (contains hardcoded paths)

**Action**:
```bash
rm -rf tmp/
echo "tmp/" >> .gitignore  # Already in .gitignore as "# Temporary folders"
```

### 4. Verify .claude/ Directory Handling

**Current status**:
- ✅ Already in .gitignore (line 145: `# AI\n.claude/`)
- ✅ Not tracked by git (should be ignored)

**Action**: Run `git rm -r --cached .claude/` if it was previously tracked

### 5. Update Documentation References

**Old coaching_transcript_tool path** found in:
- `docs/features/QUICK_START.md`: `/Users/howie/Workspace/github/coaching_transcript_tool/mcp-servers/ga4-admin/dist/index.js`

**Action**: Replace with correct repo path or generic placeholder

---

## 📝 Recommended Changes

### package.json
```json
{
  "name": "ga4-admin-mcp",  // Remove @coachly scope if going standalone
  "author": "GA4 Admin MCP Contributors",  // Generic
  "repository": {
    "type": "git",
    "url": "git+https://github.com/yourorg/google-analytics-mcp.git"  // Update org
  },
  "bugs": {
    "url": "https://github.com/yourorg/google-analytics-mcp/issues"  // Update org
  },
  "homepage": "https://github.com/yourorg/google-analytics-mcp#readme"  // Update org
}
```

### LICENSE
```
Copyright (c) 2025 GA4 Admin MCP Contributors
```

### CLAUDE.md
Add section at top:
```markdown
## For Open Source Contributors

This file is primarily for Claude Code integration but also serves as developer documentation.

**Replace these placeholders before using**:
- `/path/to/google-analytics-mcp` with your local installation path
- `/path/to/service-account-key.json` with your credential file location
```

---

## 🎯 Quick Cleanup Script

```bash
# 1. Remove tmp directory
rm -rf tmp/

# 2. Remove .claude if tracked (it shouldn't be)
git rm -r --cached .claude/ 2>/dev/null || echo ".claude/ not tracked (good!)"

# 3. Verify .gitignore
grep -q ".claude/" .gitignore || echo ".claude/" >> .gitignore
grep -q "tmp/" .gitignore || echo "tmp/" >> .gitignore

# 4. Check for any uncommitted changes
git status

# 5. Run quality checks
npm run typecheck
npm run lint
npm test
npm run build

# 6. Verify no secrets
git secrets --scan-history 2>/dev/null || echo "git-secrets not installed (optional)"
```

---

## 📋 Manual Review Checklist

Before publishing:

- [ ] Search and replace all "Coachly" references
- [ ] Search and replace all "/Users/howie" paths with placeholders
- [ ] Update package.json author, repository URLs
- [ ] Update LICENSE copyright holder
- [ ] Remove tmp/ directory
- [ ] Verify .claude/ is ignored
- [ ] Test installation from clean directory: `npm pack && npm install -g ./ga4-admin-mcp-*.tgz`
- [ ] Review README.md for any private info
- [ ] Review CONTRIBUTING.md for any private info
- [ ] Check docs/ for any private info
- [ ] Run `git log --all --full-history -- *credentials*` to verify no secrets in history
- [ ] Run `npm run typecheck && npm run lint && npm test && npm run build`

---

## 🔍 Files Requiring Manual Review

### High Priority
1. `package.json` - Update org/author
2. `LICENSE` - Update copyright holder
3. `CLAUDE.md` - Remove private paths, update maintainer
4. `docs/features/QUICK_START.md` - Remove old repo path

### Medium Priority
5. `docs/claude/quick-reference.md` - Generic paths
6. `docs/claude/testing.md` - Generic paths
7. `CHANGELOG.md` - Review for private info
8. `CONTRIBUTING.md` - Review for private info

### Low Priority (Coachly references)
9. `docs/features/IMPLEMENTATION.md`
10. `docs/features/README.md`
11. `docs/features/LEARNINGS_FROM_OFFICIAL.md`
12. `docs/features/GA4_SETUP_GUIDE.md`
13. `docs/open-source/publishing-checklist.md`

---

## 🚀 Post-Cleanup Steps

Once cleanup is complete:

1. **Commit changes**:
   ```bash
   git add .
   git commit -m "chore: Prepare project for open source release

   - Remove proprietary branding
   - Replace hardcoded paths with placeholders
   - Remove tmp/ directory
   - Update package.json metadata

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

2. **Create release branch** (optional):
   ```bash
   git checkout -b release/v0.1.0
   git push -u origin release/v0.1.0
   ```

3. **Run full test suite**:
   ```bash
   npm run typecheck
   npm run lint
   npm run format:check
   npm test
   npm run test:coverage
   npm run build
   ```

4. **Test fresh installation**:
   ```bash
   npm pack
   npm install -g ./ga4-admin-mcp-*.tgz
   ga4-admin-mcp --version  # Should print version
   npm uninstall -g ga4-admin-mcp
   ```

5. **Security scan** (if tools available):
   ```bash
   npm audit
   npm audit fix
   ```

6. **Ready for GitHub push**

---

## 📊 Cleanup Impact Summary

| Category | Files Affected | Effort | Risk |
|----------|---------------|---------|------|
| Branding | 11 files | 30 min | Low |
| Hardcoded paths | 8 files | 20 min | Low |
| tmp/ removal | 1 directory | 2 min | None |
| .claude/ handling | Already done | 0 min | None |
| Security | 0 files | 0 min | None |
| **Total** | **~15 files** | **~1 hour** | **Low** |

---

## ✅ Current State Assessment

**Overall Grade**: A- (Ready with minor cleanup)

**Strengths**:
- ✅ Clean security posture
- ✅ Proper .gitignore
- ✅ Good documentation structure
- ✅ Active development (recent commits)
- ✅ Tests and CI ready

**Weaknesses**:
- ⚠️ Proprietary branding needs removal
- ⚠️ Some hardcoded local paths in docs
- ⚠️ tmp/ directory should be removed

**Recommendation**: 1 hour of cleanup work and you're ready to publish!

---

**Report generated**: 2025-10-08
**Next review**: After cleanup actions completed
