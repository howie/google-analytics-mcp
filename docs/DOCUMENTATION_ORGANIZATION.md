# Documentation Organization - Lessons from coaching_transcript_tool

**Source**: `~/Workspace/github/coaching_transcript_tool/`
**Purpose**: Document organizational patterns for Claude Code projects
**Date**: 2025-10-08

---

## Key Insight: Two-Tier Documentation System

The coaching_transcript_tool project uses a **two-tier documentation approach**:

1. **CLAUDE.md** (Root Level) - Quick reference and navigation hub
2. **docs/** (Detailed Documentation) - Comprehensive deep-dive content

---

## 1. CLAUDE.md - The Navigation Hub

### Purpose
Acts as the **primary entry point** for Claude Code when working with the repository.

### Structure (314 lines)

**Section Breakdown**:
```
1. Project Overview (15 lines)
   - Core purpose
   - Technology stack

2. Quick Start (18 lines)
   - Installation commands
   - Development server commands
   - Linting and testing

3. Work Modes & Subagents (40 lines)
   - Available agents (invokable)
   - Workflow patterns (manual)

4. Project Structure Overview (30 lines)
   - Directory tree
   - Critical architectural rules

5. Development Standards (90 lines)
   - TDD methodology
   - Code quality
   - Linting and formatting (Ruff)
   - CI/CD integration

6. API Testing Requirements (20 lines)
   - Mandatory authentication testing
   - Test mode verification

7. Key References (30 lines)
   - Essential documentation links
   - Technical implementation guides
   - Project documentation

8. Important Notes (15 lines)
   - GDPR compliance
   - Security notes
   - File organization

9. Task Management (5 lines)
   - TodoWrite tool usage
```

### Key Characteristics

**✅ What CLAUDE.md Does Well**:
1. **Brief but complete** - All essential info in 314 lines
2. **Link-heavy** - Uses `@docs/` references extensively (15+ links)
3. **Commands-first** - Shows actual commands, not just descriptions
4. **Critical rules highlighted** - Uses 🚫, 🔥, 🚨 emojis for emphasis
5. **Quick reference format** - Easy to scan and find information
6. **Navigation hub** - Points to detailed docs, doesn't duplicate them

**❌ What to Avoid**:
- Don't duplicate content from detailed docs
- Don't make it too long (keep under 400 lines)
- Don't put implementation details here

---

## 2. docs/ Directory Structure

### Overall Organization

```
docs/
├── [root level docs]        # High-level project docs
│   ├── project-status.md
│   ├── roadmap.md
│   ├── architecture-decisions.md
│   └── database-erd.md
│
├── architecture/            # System architecture details
│   ├── system-patterns.md
│   ├── tech-stack.md
│   ├── stt.md
│   └── ci-cd-pipeline.md
│
├── claude/                  # 🎯 CLAUDE CODE SPECIFIC DOCS
│   ├── [standards]
│   ├── context/
│   ├── deployment/
│   └── subagent/
│
├── deployment/              # Deployment guides
│   ├── cloudflare-pages-setup.md
│   ├── google-oauth-setup.md
│   └── render-mcp-setup.md
│
├── features/                # 🚧 ACTIVE FEATURE WORK
│   ├── onboarding-improvement/
│   ├── ai_coach/
│   └── usage_analytic/
│
├── features_done/           # ✅ COMPLETED FEATURES
│   ├── refactor-architecture/
│   ├── payment/
│   └── claude-code-subagent.md
│
├── issues/                  # Problem tracking
│   ├── fixed/
│   └── github-actions-terraform-failures.md
│
├── lessons-learned/         # Post-mortems and insights
│   ├── oauth-middleware-csp-fix.md
│   └── ecpay-subscription-integration.md
│
├── spec/                    # Product specifications
│   └── pricing-model.md
│
└── testing/                 # Testing strategies
    └── frontend-api-proxy-tests.md
```

---

## 3. docs/claude/ - Claude Code Specific Documentation

### Purpose
**All documentation specifically for Claude Code's use** when working on the project.

### Structure (23 files + 3 subdirectories)

**Core Standards**:
```
claude/
├── architecture.md                      # Clean Architecture details
├── development-standards.md             # TDD, code style, DI
├── api-standards.md                     # API testing requirements
├── engineering-standards.md             # General engineering practices
├── testing.md                          # Frontend/backend testing
├── python-style.md                     # Python-specific guidelines
└── tdd-methodology.md                  # TDD workflow
```

**Quick References**:
```
claude/
├── quick-reference.md                   # Commands, config
├── configuration.md                    # Environment variables
└── task-breakdown.md                   # Task decomposition
```

**Technical Guides**:
```
claude/
├── clean-architecture-patterns.md       # Migration patterns
├── i18n.md                             # Internationalization
├── session-id-mapping.md               # Critical ID distinctions
└── enum-migration-best-practices.md    # PostgreSQL enum handling
```

**Project Management**:
```
claude/
├── CHANGELOG.md                        # Version history
└── project-structure.md                # Codebase layout
```

**Subdirectories**:
```
claude/
├── context/                            # Project context
│   ├── active-work.md                 # Current tasks
│   ├── project-overview.md            # High-level overview
│   └── product-strategy.md            # Business strategy
│
├── deployment/                         # Deployment guides
│   ├── render-deployment.md
│   ├── production-celery-deployment.md
│   └── redis-celery-development.md
│
└── subagent/                          # Agent specifications
    ├── README.md                      # Agent guide
    ├── active/                        # Working agents
    └── planned/                       # Future agents
```

---

## 4. Features Documentation Pattern

### Active Features (docs/features/)

**Structure per feature**:
```
features/onboarding-improvement/
├── README.md                          # Main feature spec
├── GA4_SETUP_GUIDE.md                 # Setup instructions
├── GA4_QUICK_START.md                 # Quick guide
├── GA4_API_SETUP.md                   # API automation
├── IMPLEMENTATION.md                  # Implementation status
├── LEARNINGS_FROM_OFFICIAL.md         # Research notes
└── TECHNICAL.md                       # Technical details
```

**Key Pattern**: One directory per feature with:
- README.md as main entry point
- Supporting docs for different aspects
- Implementation tracking
- Research and learnings

### Completed Features (docs/features_done/)

**Purpose**: Archive successful feature documentation for reference

**Benefits**:
1. Keeps features/ directory clean
2. Preserves implementation knowledge
3. Serves as examples for new features
4. Documents what worked/didn't work

---

## 5. Documentation Principles from coaching_transcript_tool

### Principle 1: Navigation Over Duplication

**CLAUDE.md says**:
```markdown
📚 **Detailed Architecture Guide**: See `@docs/claude/architecture.md`
```

Instead of duplicating content, it **links** to detailed docs.

### Principle 2: Commands Over Explanations

**Bad**:
```markdown
To run tests, you need to execute the test command.
```

**Good**:
```markdown
make test          # Backend tests (unit + db integration)
make test-server   # API/E2E tests (requires API server)
```

### Principle 3: Visual Hierarchy

Use emojis and formatting to create scannable content:
- 🚫 **CRITICAL ARCHITECTURAL RULES**
- 🔥 **MANDATORY Authentication Testing**
- 🚨 **CRITICAL Development Workflow**
- ✅ **Available Agents**
- 📋 **Workflow Patterns**

### Principle 4: Context Separation

**docs/claude/** contains:
- How Claude Code should work with the project
- Development standards and patterns
- Technical implementation guides

**docs/features/** contains:
- What features are being built
- Implementation status
- Feature-specific technical details

### Principle 5: Archive Completed Work

Move completed features to `docs/features_done/` to:
- Keep active docs focused
- Preserve knowledge
- Provide examples
- Document lessons learned

---

## 6. Recommended Organization for google-analytics-mcp

### Proposed Structure

```
google-analytics-mcp/
├── CLAUDE.md                          # 🎯 NEW: Navigation hub
├── README.md                          # User-facing documentation
├── QUICK_START.md                     # ✅ EXISTS: Quick setup
├── TEST_RESULTS.md                    # ✅ EXISTS: Test report
├── CLAUDE_CODE_INTEGRATION.md         # ✅ EXISTS: Manual testing
│
├── docs/
│   ├── claude/                        # 🎯 NEW: Claude-specific docs
│   │   ├── quick-reference.md        # Commands and config
│   │   ├── development-standards.md  # Code style, testing
│   │   ├── architecture.md           # MCP server architecture
│   │   ├── testing.md                # Testing strategy
│   │   └── context/                  # Project context
│   │       ├── project-overview.md
│   │       └── active-work.md
│   │
│   └── features/                      # ✅ EXISTS: Feature docs
│       ├── README.md                  # Main feature planning
│       ├── IMPLEMENTATION.md          # ✅ EXISTS: Status tracking
│       ├── GA4_SETUP_GUIDE.md         # ✅ EXISTS
│       ├── QUICK_START.md             # ✅ EXISTS
│       └── TECHNICAL.md               # ✅ EXISTS
│
├── src/                               # ✅ EXISTS
├── tests/                             # ✅ EXISTS
└── dist/                              # ✅ EXISTS
```

### Migration Plan

**Phase 1: Create CLAUDE.md** ⏳
- [ ] Create root-level CLAUDE.md
- [ ] Include project overview
- [ ] Add quick start commands
- [ ] Link to detailed docs
- [ ] Add development standards summary
- [ ] Include key references

**Phase 2: Organize docs/claude/** ⏳
- [ ] Create docs/claude/ directory
- [ ] Move/create development-standards.md
- [ ] Move/create architecture.md
- [ ] Move/create testing.md
- [ ] Create quick-reference.md
- [ ] Create context/ subdirectory

**Phase 3: Reorganize Feature Docs** ⏳
- [ ] Keep docs/features/ as-is (already well-organized)
- [ ] Add cross-references in CLAUDE.md
- [ ] Update IMPLEMENTATION.md with latest status

---

## 7. Key Takeaways

### For CLAUDE.md

1. **Keep it under 400 lines** - It's a navigation hub, not a manual
2. **Link generously** - Use `@docs/path/to/file.md` pattern
3. **Commands first** - Show actual bash commands with comments
4. **Visual hierarchy** - Use emojis, headers, code blocks
5. **Critical rules** - Highlight with 🚫, 🔥, 🚨
6. **Quick reference format** - Easy scanning and finding

### For docs/ Structure

1. **docs/claude/** - All Claude Code-specific documentation
2. **docs/features/** - Active feature work
3. **docs/features_done/** - Completed features archive
4. **docs/architecture/** - System design details
5. **docs/deployment/** - Deployment guides
6. **docs/lessons-learned/** - Post-mortems and insights

### For Feature Documentation

1. **One directory per feature** in docs/features/
2. **README.md** as main entry point
3. **IMPLEMENTATION.md** for status tracking
4. **Supporting docs** for different aspects
5. **Move to features_done/** when complete

---

## 8. Comparison: What We Have vs. What We Need

### Current State (google-analytics-mcp)

✅ **Good**:
- docs/features/ with detailed feature docs
- TEST_RESULTS.md for test documentation
- CLAUDE_CODE_INTEGRATION.md for manual testing
- QUICK_START.md for quick setup

⚠️ **Missing**:
- CLAUDE.md navigation hub
- docs/claude/ for Claude-specific docs
- Structured development standards docs
- Quick reference guide
- Context documentation

### Recommended Next Steps

1. **Immediate** (This session):
   - Create CLAUDE.md navigation hub
   - Reorganize docs with docs/claude/

2. **Short-term** (Next week):
   - Create development-standards.md
   - Create architecture.md
   - Create testing.md
   - Create quick-reference.md

3. **Medium-term** (Next month):
   - Add context/ subdirectory
   - Document lessons learned
   - Create deployment guides
   - Archive Phase 1 to features_done/

---

## Appendix: File Size Reference

From coaching_transcript_tool:

**CLAUDE.md**: 314 lines (12KB)
- Concise, scannable, link-heavy

**docs/claude/architecture.md**: ~500 lines
- Detailed Clean Architecture guide

**docs/claude/development-standards.md**: ~600 lines
- Comprehensive development guide

**docs/features/[feature]/README.md**: 200-500 lines
- Feature specifications and planning

**Takeaway**: Keep CLAUDE.md brief, put details in docs/

---

**Created**: 2025-10-08
**Purpose**: Guide documentation organization for google-analytics-mcp
**Based on**: coaching_transcript_tool project structure
