# Claude Code Integration Guide

**Purpose**: Manual validation of GA4 Admin MCP Server with Claude Code
**Prerequisites**: Completed automated testing (see TEST_RESULTS.md)
**Status**: Ready for manual testing

---

## Setup Instructions

### Step 1: Configure Claude Code

Edit your Claude Code settings file:

**macOS/Linux**: `~/.claude/settings.json`
**Windows**: `%APPDATA%\.claude\settings.json`

Add this configuration:

```json
{
  "mcpServers": {
    "ga4-admin": {
      "command": "node",
      "args": [
        "/Users/howie/Workspace/github/google-analytics-mcp/dist/index.js"
      ],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/your/service-account-key.json"
      }
    }
  }
}
```

**Important**: Replace `/path/to/your/service-account-key.json` with your actual service account key path.

### Step 2: Prepare Service Account (if not done)

If you don't have a service account yet:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **IAM & Admin** → **Service Accounts**
3. Create a new service account:
   - Name: `ga4-admin-mcp`
   - Role: Not needed at GCP level
4. Create and download JSON key
5. Save to `~/.config/gcp/ga4-admin-key.json`
6. In GA4, go to **Admin** → **Property Access Management**
7. Add service account email with **Editor** role

### Step 3: Restart Claude Code

Close and reopen Claude Code to load the new MCP server.

---

## Verification Checklist

### ✅ Basic Connectivity

Run these commands in Claude Code:

**1. List available MCP servers:**
```
List all available MCP servers
```
Expected: Should see `ga4-admin` in the list

**2. List tools:**
```
Show me all tools available from the ga4-admin MCP server
```
Expected output:
- create_custom_dimension
- create_conversion_event
- list_custom_dimensions
- list_conversion_events

---

## Test Scenarios

### Test 1: List Custom Dimensions ✅

**Command:**
```
Using the ga4-admin MCP server, list all custom dimensions for GA4 property 123456789
```

**Replace**: `123456789` with your actual GA4 property ID

**Expected Behavior:**
- Server responds with list of dimensions
- Shows count and dimension details
- No errors

**Success Criteria:**
- ✅ Response received
- ✅ Valid JSON structure
- ✅ Count matches GA4 console

---

### Test 2: Create Custom Dimension ✅

**Command:**
```
Using the ga4-admin MCP server, create a custom dimension:
- Property ID: 123456789
- Parameter name: test_dimension
- Display name: Test Dimension
- Description: This is a test dimension
- Scope: EVENT
```

**Expected Behavior:**
- Dimension created successfully
- Returns dimension details with resource name
- Visible in GA4 console immediately

**Success Criteria:**
- ✅ Success message received
- ✅ Dimension appears in GA4 Admin → Custom Definitions
- ✅ All properties match (name, scope, description)

**Cleanup:**
Note: Custom dimensions cannot be deleted via API, only archived manually in GA4 UI.

---

### Test 3: Create Conversion Event ✅

**Command:**
```
Using the ga4-admin MCP server, mark "test_conversion_event" as a conversion in GA4 property 123456789
```

**Expected Behavior:**
- Event marked as conversion
- Returns event details
- Appears in GA4 conversions list

**Success Criteria:**
- ✅ Success message received
- ✅ Event appears in GA4 Admin → Events (marked as conversion)
- ✅ Can be toggled off in GA4 UI

**Cleanup:**
You can delete the conversion event in GA4 UI or via API.

---

### Test 4: List Conversion Events ✅

**Command:**
```
List all conversion events for GA4 property 123456789
```

**Expected Behavior:**
- Returns list of all conversion events
- Includes both custom and default events
- Shows event names and metadata

**Success Criteria:**
- ✅ Response received
- ✅ Count matches GA4 console
- ✅ Includes recently created test event

---

### Test 5: Error Handling - Invalid Property ID ❌

**Command:**
```
List custom dimensions for GA4 property 999999999
```

**Expected Behavior:**
- Returns error message
- Error is user-friendly
- Doesn't crash the server

**Success Criteria:**
- ✅ Error response received
- ✅ Error message indicates "Property not found" or similar
- ✅ Server continues to respond to subsequent requests

---

### Test 6: Error Handling - Duplicate Dimension ❌

**Command:**
```
Create a custom dimension with parameter name "test_dimension" again in property 123456789
```

**Expected Behavior:**
- Returns error about duplicate
- Suggests checking existing dimensions
- Doesn't crash

**Success Criteria:**
- ✅ Error response received
- ✅ Error indicates dimension already exists
- ✅ Server remains responsive

---

### Test 7: Natural Language Interaction 🤖

**Command:**
```
I need to set up GA4 tracking for my onboarding flow.
Can you create custom dimensions for:
1. signup_method (for tracking email vs Google signup)
2. user_tier (for tracking free vs paid users)

Use property ID 123456789
```

**Expected Behavior:**
- Claude understands the request
- Creates both dimensions with appropriate parameter names
- Uses EVENT scope by default
- Provides summary of what was created

**Success Criteria:**
- ✅ Both dimensions created
- ✅ Parameter names follow GA4 conventions
- ✅ Natural language processing works correctly
- ✅ Summary is clear and helpful

---

### Test 8: Batch Operations 📦

**Command:**
```
For GA4 property 123456789, please:
1. List all current custom dimensions
2. Create a new dimension called "test_step" for tracking funnel steps
3. Mark events "signup_complete" and "onboarding_complete" as conversions
4. List all conversion events to confirm
```

**Expected Behavior:**
- Executes all 4 operations in sequence
- Provides clear output for each step
- Handles any errors gracefully
- Confirms final state

**Success Criteria:**
- ✅ All operations complete
- ✅ Clear progress indication
- ✅ Final state matches expectations
- ✅ No operations lost or duplicated

---

## Troubleshooting

### Issue: MCP server not found

**Symptoms**: Claude Code doesn't see the ga4-admin server

**Solutions**:
1. Check settings.json syntax is valid JSON
2. Verify path to dist/index.js is correct (absolute path)
3. Ensure dist/index.js exists (`npm run build`)
4. Restart Claude Code completely
5. Check Claude Code logs for errors

### Issue: Permission denied errors

**Symptoms**: API calls fail with 403 errors

**Solutions**:
1. Verify GOOGLE_APPLICATION_CREDENTIALS path is correct
2. Check service account JSON key exists
3. Confirm service account has Editor role in GA4 property
4. Test credentials with gcloud:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
   gcloud auth application-default print-access-token
   ```

### Issue: Property not found

**Symptoms**: 404 errors when accessing property

**Solutions**:
1. Verify property ID is correct (numeric ID, not G-XXXXXXXXX)
2. Check property ID in GA4 Admin → Property Settings
3. Confirm service account has access to this specific property
4. Try with a different property to isolate the issue

### Issue: Server crashes or hangs

**Symptoms**: MCP server stops responding

**Solutions**:
1. Check for syntax errors in recent code changes
2. View server logs (if available)
3. Restart Claude Code
4. Test server standalone:
   ```bash
   node dist/index.js
   ```
5. Check for resource limits (memory, file handles)

---

## Success Metrics

After completing manual testing, verify:

- [ ] All 4 tools work correctly
- [ ] Error handling is appropriate
- [ ] Natural language interaction works
- [ ] Batch operations succeed
- [ ] Performance is acceptable (<5s per operation)
- [ ] Server remains stable across multiple requests
- [ ] User experience is intuitive

---

## Next Steps

After successful validation:

1. ✅ Update TEST_RESULTS.md with manual test results
2. ✅ Document any issues found
3. ✅ Update IMPLEMENTATION.md status to "Phase 1 Complete"
4. ✅ Plan Phase 2 features based on user feedback
5. ✅ Consider publishing to npm
6. ✅ Share with team for broader testing

---

## Appendix: Example GA4 Property IDs

**Format Examples:**
- ✅ Correct: `123456789` (numeric only)
- ✅ Correct: `properties/123456789` (full resource name)
- ❌ Wrong: `G-123456789` (measurement ID, not property ID)

**How to find your Property ID:**
1. Go to GA4 Admin
2. Click Property Settings
3. Look for "Property ID" (numeric value)

---

**Last Updated**: 2025-10-08
**Status**: Ready for manual testing
**Prerequisites**: All automated tests passed ✅
