# GA4 Admin MCP Server - Complete Setup Tutorial

**Complete guide to setting up and using the GA4 Admin MCP Server with Claude Code**

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Create Google Cloud Service Account](#step-1-create-google-cloud-service-account)
4. [Step 2: Grant GA4 Property Access](#step-2-grant-ga4-property-access)
5. [Step 3: Install the MCP Server](#step-3-install-the-mcp-server)
6. [Step 4: Configure Claude Code](#step-4-configure-claude-code)
7. [Step 5: Test the Setup](#step-5-test-the-setup)
8. [Usage Examples](#usage-examples)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Overview

This MCP server automates Google Analytics 4 (GA4) configuration through natural language commands in Claude Code. Instead of manually clicking through the GA4 interface, you can create custom dimensions, conversion events, and manage your GA4 properties using simple conversational requests.

**What you'll accomplish:**
- Create a Google Cloud service account with GA4 API access
- Grant the service account Editor permissions on your GA4 property
- Install and configure the MCP server
- Use Claude Code to manage GA4 configuration

**Time required:** 15-20 minutes

---

## Prerequisites

Before starting, ensure you have:

- ✅ **GA4 Property**: Access to a Google Analytics 4 property with Admin or Editor permissions
- ✅ **Google Cloud Account**: A Google Cloud Platform account (free tier works fine)
- ✅ **Claude Code**: Claude Code installed on your machine
- ✅ **Node.js**: Version 18 or higher (`node --version`)
- ✅ **npm**: Comes with Node.js (`npm --version`)

### Check Your Node.js Version

```bash
node --version
# Should show v18.x.x or higher
```

If you need to install Node.js, visit: https://nodejs.org/

---

## Step 1: Create Google Cloud Service Account

A service account is like a special user account that applications can use to access Google services programmatically.

### 1.1 Open Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Select an existing project OR create a new one:
   - Click the project dropdown at the top
   - Click **"New Project"**
   - Name it something like `"GA4 Admin Automation"`
   - Click **"Create"**

### 1.2 Enable Analytics Admin API

1. In the search bar at the top, type **"Analytics Admin API"**
2. Click on **"Google Analytics Admin API"**
3. Click **"Enable"**
4. Wait for the API to be enabled (takes a few seconds)

### 1.3 Create Service Account

1. In the search bar, type **"Service Accounts"**
2. Click **"Service Accounts"** (under IAM & Admin)
3. Click **"+ Create Service Account"** at the top
4. Fill in the details:
   - **Service account name**: `ga4-admin-mcp`
   - **Service account ID**: Will auto-fill as `ga4-admin-mcp@...`
   - **Description**: `Service account for GA4 Admin MCP Server`
5. Click **"Create and Continue"**
6. **Skip** the optional permissions (we'll grant GA4 permissions separately)
7. Click **"Done"**

### 1.4 Create and Download JSON Key

1. Find your new service account in the list
2. Click on the service account name (or the three dots → **"Manage keys"**)
3. Click **"Keys"** tab
4. Click **"Add Key"** → **"Create new key"**
5. Select **"JSON"** format
6. Click **"Create"**
7. A JSON file will download automatically - **SAVE THIS FILE SECURELY**

### 1.5 Store the Key File

Create a secure location for your credentials:

```bash
# Create a config directory (if it doesn't exist)
mkdir -p ~/.config/gcp

# Move the downloaded key file
mv ~/Downloads/ga4-admin-mcp-*.json ~/.config/gcp/ga4-admin-key.json

# Set restrictive permissions
chmod 600 ~/.config/gcp/ga4-admin-key.json
```

**⚠️ Security Warning:**
- **NEVER** commit this JSON file to git
- **NEVER** share this file publicly
- Store it outside your project directory
- Use restrictive file permissions (600)

### 1.6 Copy Service Account Email

You'll need the service account email in the next step:

1. In the Google Cloud Console, go to **"Service Accounts"**
2. Find your `ga4-admin-mcp` service account
3. Copy the email address (looks like: `ga4-admin-mcp@your-project.iam.gserviceaccount.com`)

**Keep this email handy - you'll need it in Step 2!**

---

## Step 2: Grant GA4 Property Access

Now you need to give your service account permission to manage your GA4 property.

### 2.1 Open Google Analytics

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your GA4 property

### 2.2 Navigate to Property Access Management

1. Click the **"Admin"** gear icon (bottom left)
2. In the **"Property"** column, click **"Property Access Management"**

### 2.3 Add Service Account

1. Click the **"+"** button (top right)
2. Click **"Add users"**
3. Paste your service account email (from Step 1.6):
   ```
   ga4-admin-mcp@your-project.iam.gserviceaccount.com
   ```
4. Select role: **"Editor"**
   - ✅ This allows creating custom dimensions and conversion events
   - ❌ Don't use "Viewer" (read-only won't work)
5. Uncheck **"Notify new users by email"** (service accounts don't need emails)
6. Click **"Add"**

### 2.4 Verify Access

1. Refresh the page
2. You should see your service account in the user list with **"Editor"** role
3. Note your **Property ID** (at the top: looks like `123456789` or find it under **Admin > Property Settings**)

---

## Step 3: Install the MCP Server

### 3.1 Clone the Repository

```bash
# Clone the repository
git clone https://github.com/howie/google-analytics-mcp.git

# Navigate to the project directory
cd google-analytics-mcp
```

**Alternative: Install from npm** (if published):
```bash
npm install -g ga4-admin-mcp
```

### 3.2 Install Dependencies

```bash
npm install
```

This will install:
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `googleapis` - Google API client
- `google-auth-library` - Authentication

### 3.3 Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### 3.4 Verify the Build

```bash
# Check that the built files exist
ls -la dist/
# Should see: index.js, index.js.map, index.d.ts

# Test running the server (it will wait for input)
node dist/index.js
# Press Ctrl+C to exit
```

---

## Step 4: Configure Claude Code

### 4.1 Find Your Configuration File

Claude Code configuration is stored at:
- **macOS/Linux**: `~/.claude/settings.json`
- **Windows**: `%USERPROFILE%\.claude\settings.json`

### 4.2 Edit Configuration

Open the file in your editor:

```bash
# macOS/Linux
code ~/.claude/settings.json
# or
nano ~/.claude/settings.json

# Windows
notepad %USERPROFILE%\.claude\settings.json
```

### 4.3 Add MCP Server Configuration

Add this to your `settings.json`:

```json
{
  "mcpServers": {
    "ga4-admin": {
      "command": "node",
      "args": [
        "/path/to/google-analytics-mcp/dist/index.js"
      ],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/.config/gcp/ga4-admin-key.json"
      }
    }
  }
}
```

**⚠️ Important: Replace the paths!**

1. **Replace `/path/to/google-analytics-mcp/dist/index.js`** with your actual path:
   ```bash
   # Find your path
   pwd
   # Copy the output and append /dist/index.js
   ```

   Example: `/Users/yourname/projects/google-analytics-mcp/dist/index.js`

2. **Replace `/path/to/.config/gcp/ga4-admin-key.json`** with your actual path:
   ```bash
   # Find your key path
   echo ~/.config/gcp/ga4-admin-key.json
   # Copy the output
   ```

   Example: `/Users/yourname/.config/gcp/ga4-admin-key.json`

### 4.4 Full Configuration Example

Here's a complete example:

```json
{
  "mcpServers": {
    "ga4-admin": {
      "command": "node",
      "args": [
        "/Users/john/projects/google-analytics-mcp/dist/index.js"
      ],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/Users/john/.config/gcp/ga4-admin-key.json"
      }
    }
  }
}
```

### 4.5 Restart Claude Code

After editing the configuration:
1. **Quit** Claude Code completely
2. **Restart** Claude Code
3. The MCP server will be loaded automatically

---

## Step 5: Test the Setup

### 5.1 Check MCP Server Status

In Claude Code, type:

```
What MCP servers are available?
```

You should see `ga4-admin` in the list with 4 tools:
- `create_custom_dimension`
- `create_conversion_event`
- `list_custom_dimensions`
- `list_conversion_events`

### 5.2 Test List Custom Dimensions

Try listing your existing custom dimensions:

```
Using ga4-admin MCP, list all custom dimensions for property 123456789
```

Replace `123456789` with your actual Property ID.

**Expected result:**
- If you have dimensions: A list of your custom dimensions
- If you have none: An empty list
- If there's an error: Check the troubleshooting section below

### 5.3 Test Create Custom Dimension

Try creating a test dimension:

```
Using ga4-admin MCP, create a custom dimension in property 123456789:
- Parameter name: test_dimension
- Display name: Test Dimension
- Description: Test dimension created via MCP
- Scope: EVENT
```

**Expected result:**
- Success message with the created dimension details
- The dimension should appear in GA4 Admin → Custom Definitions

### 5.4 Verify in GA4 UI

1. Go to [Google Analytics](https://analytics.google.com/)
2. Navigate to **Admin** → **Custom Definitions** → **Custom Dimensions**
3. You should see your "Test Dimension" in the list

**🎉 If you see it, your setup is complete!**

---

## Usage Examples

### Example 1: Create Multiple Custom Dimensions

```
Using ga4-admin MCP, create these custom dimensions in property 123456789:

1. signup_method
   - Display name: Signup Method
   - Description: How the user signed up (email/google/facebook)
   - Scope: EVENT

2. user_tier
   - Display name: User Tier
   - Description: User subscription level (free/premium/enterprise)
   - Scope: USER

3. product_category
   - Display name: Product Category
   - Description: Category of product viewed/purchased
   - Scope: ITEM
```

### Example 2: Mark Events as Conversions

```
Using ga4-admin MCP for property 123456789, mark these events as conversions:
- signup_complete
- purchase
- trial_started
```

### Example 3: List All Conversion Events

```
Using ga4-admin MCP, list all conversion events for property 123456789
```

### Example 4: Batch Setup for New Property

```
I'm setting up a new GA4 property (123456789). Please help me:

1. First, list all existing custom dimensions
2. Create these dimensions if they don't exist:
   - session_quality (Session Quality Score, EVENT scope)
   - traffic_source_detail (Detailed Traffic Source, EVENT scope)
   - content_group (Content Grouping, EVENT scope)
3. Mark these events as conversions:
   - contact_form_submit
   - download_pdf
   - video_watched
4. Finally, list all conversion events to confirm
```

### Example 5: Using Measurement ID (G-XXXXXXXXX)

You can use measurement IDs instead of numeric property IDs:

```
Using ga4-admin MCP, create a custom dimension in property G-ABC123DEF:
- Parameter name: feature_flag
- Display name: Feature Flag
- Description: Active feature flags for this user
- Scope: USER
```

The MCP server will automatically look up the property ID from the measurement ID.

---

## Troubleshooting

### Error: "Login Required" or "Authentication Error"

**Cause**: Service account credentials not found or invalid

**Solutions:**
1. Verify the path to your JSON key file:
   ```bash
   ls -la ~/.config/gcp/ga4-admin-key.json
   ```
2. Check that the path in `~/.claude/settings.json` is absolute (not relative)
3. Ensure the JSON file is valid:
   ```bash
   cat ~/.config/gcp/ga4-admin-key.json | jq .
   ```
4. Restart Claude Code after fixing the path

### Error: "Permission Denied" or "Insufficient Permissions"

**Cause**: Service account doesn't have Editor role on the GA4 property

**Solutions:**
1. Go to GA4 **Admin** → **Property Access Management**
2. Find your service account email
3. Verify it has **Editor** role (not Viewer)
4. If missing, add it again following Step 2

### Error: "Property Not Found"

**Cause**: Incorrect property ID or measurement ID

**Solutions:**
1. Verify your Property ID:
   - Go to GA4 **Admin** → **Property Settings**
   - Copy the Property ID (numeric) or Measurement ID (G-XXXXXXXXX)
2. Make sure you're using the correct format:
   - Numeric: `123456789`
   - Measurement ID: `G-ABC123DEF`
   - Full resource name: `properties/123456789`

### Error: "MCP Server Not Found"

**Cause**: Configuration error or Claude Code needs restart

**Solutions:**
1. Verify `~/.claude/settings.json` is valid JSON:
   ```bash
   cat ~/.claude/settings.json | jq .
   ```
2. Check the path to `dist/index.js` exists:
   ```bash
   ls -la /path/to/google-analytics-mcp/dist/index.js
   ```
3. Restart Claude Code completely (quit and reopen)

### Error: "Custom Dimension Already Exists"

**Cause**: You're trying to create a dimension with a parameter name that already exists

**Solutions:**
1. List existing dimensions first:
   ```
   List all custom dimensions for property 123456789
   ```
2. Use a different parameter name
3. **Note**: GA4 doesn't allow deleting custom dimensions (you can only archive them in the UI)

### Building or Installation Errors

**Node version too old:**
```bash
# Check version
node --version

# Should be >= 18.0.0
# Install newer version from nodejs.org
```

**TypeScript compilation errors:**
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

**Permission errors during npm install:**
```bash
# Don't use sudo! Fix npm permissions instead:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

---

## Best Practices

### Security

1. **Never commit credentials**
   ```bash
   # Your .gitignore should include:
   *.json  # Service account keys
   .env
   .env.*
   ```

2. **Use restrictive file permissions**
   ```bash
   chmod 600 ~/.config/gcp/ga4-admin-key.json
   ```

3. **Rotate credentials regularly**
   - Create new service account keys every 90 days
   - Delete old keys from Google Cloud Console

4. **Limit service account scope**
   - Only grant Editor role on properties you need to manage
   - Use separate service accounts for different environments (dev/staging/prod)

### GA4 Property Management

1. **Test in a development property first**
   - Create a test GA4 property for experimenting
   - Once comfortable, apply changes to production

2. **List before creating**
   - Always list existing dimensions/events first
   - Avoid creating duplicates (GA4 doesn't allow deletion)

3. **Use descriptive names**
   ```
   ✅ Good: signup_method, user_tier, product_category
   ❌ Bad: dim1, test, x
   ```

4. **Document your dimensions**
   - Include clear descriptions when creating
   - Keep a spreadsheet of your custom dimensions and their purposes

### Naming Conventions

**Parameter names** (technical):
- Lowercase letters, numbers, underscores only
- Start with a letter
- Max 40 characters
- Examples: `signup_method`, `user_tier`, `session_quality`

**Display names** (user-facing):
- Can include spaces and capitals
- Should be human-readable
- Examples: "Signup Method", "User Tier", "Session Quality"

### Scope Selection

Choose the right scope for your dimension:

- **EVENT**: Data specific to an event occurrence
  - Example: `signup_method`, `page_category`, `error_type`

- **USER**: Data about the user that persists across sessions
  - Example: `user_tier`, `first_signup_source`, `account_type`

- **ITEM**: Data about products (for e-commerce)
  - Example: `product_color`, `product_size`, `brand`

---

## Next Steps

### Learn More

- **MCP Protocol**: https://modelcontextprotocol.io/docs
- **GA4 Admin API**: https://developers.google.com/analytics/devguides/config/admin/v1
- **Custom Dimensions Guide**: https://support.google.com/analytics/answer/10075209

### Advanced Usage

1. **Create custom slash commands** in Claude Code for common operations
2. **Script bulk operations** for migrating multiple properties
3. **Integrate with CI/CD** for automated GA4 setup in new environments

### Contributing

Found a bug or want to contribute?
- GitHub Issues: https://github.com/howie/google-analytics-mcp/issues
- Pull Requests: See CONTRIBUTING.md

---

## Summary Checklist

- [ ] Created Google Cloud project and enabled Analytics Admin API
- [ ] Created service account and downloaded JSON key
- [ ] Stored JSON key securely with proper permissions
- [ ] Granted service account Editor role in GA4 Property Access Management
- [ ] Cloned repository and ran `npm install && npm run build`
- [ ] Updated `~/.claude/settings.json` with correct paths
- [ ] Restarted Claude Code
- [ ] Tested listing custom dimensions
- [ ] Created a test custom dimension
- [ ] Verified creation in GA4 UI

**🎉 Congratulations! You're ready to automate your GA4 configuration with Claude Code!**

---

**Last Updated**: 2025-10-08
**Version**: 1.0
**Need Help?** Open an issue on GitHub or check the troubleshooting section above.
