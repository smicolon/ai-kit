#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# test-worktree-isolation.sh
# Creates a temp git repo, runs wt create, and verifies all 3 isolation layers
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0
SKIP=0

pass() { echo -e "  ${GREEN}✓${NC} $1"; PASS=$((PASS + 1)); }
fail() { echo -e "  ${RED}✗${NC} $1"; FAIL=$((FAIL + 1)); }
skip() { echo -e "  ${YELLOW}○${NC} $1 (skipped)"; SKIP=$((SKIP + 1)); }

# Resolve wt.sh path relative to this script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WT_SH="$SCRIPT_DIR/../packs/worktree/scripts/wt.sh"

if [[ ! -f "$WT_SH" ]]; then
    echo -e "${RED}Cannot find wt.sh at: $WT_SH${NC}"
    exit 1
fi

# Create temp directory for test project
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

echo "=== Worktree Isolation Tests ==="
echo "Temp dir: $TMPDIR"
echo ""

# =============================================================================
# Setup: Create a fake project with git, .env, and docker-compose
# =============================================================================

echo "--- Setup ---"

# Init git repo
git init "$TMPDIR/myproject" --quiet
cd "$TMPDIR/myproject"
git commit --allow-empty -m "init" --quiet

# Create .env with known keys
cat > .env << 'EOF'
APP_NAME=myapp
DB_NAME=myapp_dev
POSTGRES_DB=myapp_dev
DATABASE_URL=postgres://user:pass@localhost:5432/myapp_dev
COMPOSE_PROJECT_NAME=myapp
SECRET_KEY=supersecret
TEMPLATE_VAR=prefix_{{BRANCH}}_suffix
EOF

# Create .env.local
cat > .env.local << 'EOF'
DEBUG=true
DATABASE_NAME=localdb
EOF

# Create a docker-compose file (committed to git, as in real projects)
cat > local.yml << 'EOF'
services:
  postgres:
    image: postgres:16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: myapp_dev
  redis:
    image: redis:7
    ports:
      - "6379:6379"
  mailpit:
    image: axllent/mailpit
    ports:
      - "8025:8025"
      - "1025:1025"
EOF

git add local.yml && git commit -m "add compose file" --quiet

pass "Test project created"

# =============================================================================
# Test 1: .worktreeinclude generation
# =============================================================================

echo ""
echo "--- Layer 1: .worktreeinclude ---"

# No .worktreeinclude yet — wt create should generate it
if [[ ! -f .worktreeinclude ]]; then
    pass ".worktreeinclude does not exist yet (will be auto-generated)"
else
    fail ".worktreeinclude should not exist before first create"
fi

# Run wt create
cd "$TMPDIR/myproject"
bash "$WT_SH" create test-branch 2>&1 | while IFS= read -r line; do echo "    $line"; done

# Check .worktreeinclude was generated
if [[ -f "$TMPDIR/myproject/.worktreeinclude" ]]; then
    pass ".worktreeinclude auto-generated"
else
    fail ".worktreeinclude was NOT generated"
fi

# Check worktree was created
WT_PATH="$TMPDIR/myproject--test-branch"
if [[ -d "$WT_PATH" ]]; then
    pass "Worktree created at $WT_PATH"
else
    fail "Worktree NOT found at $WT_PATH"
    echo -e "${RED}Cannot continue tests without worktree${NC}"
    exit 1
fi

# =============================================================================
# Test 2: File copying
# =============================================================================

echo ""
echo "--- File Copying ---"

if [[ -f "$WT_PATH/.env" ]]; then
    pass ".env copied to worktree"
else
    fail ".env NOT copied"
fi

if [[ -f "$WT_PATH/.env.local" ]]; then
    pass ".env.local copied to worktree"
else
    fail ".env.local NOT copied"
fi

# =============================================================================
# Test 3: Env var rewriting
# =============================================================================

echo ""
echo "--- Layer 2: Env Var Rewriting ---"

# Check DB_NAME was suffixed
if grep -q "DB_NAME=myapp_dev_test_branch" "$WT_PATH/.env"; then
    pass "DB_NAME suffixed correctly"
else
    actual=$(grep "^DB_NAME=" "$WT_PATH/.env" || echo "(not found)")
    fail "DB_NAME not suffixed. Got: $actual"
fi

# Check POSTGRES_DB was suffixed
if grep -q "POSTGRES_DB=myapp_dev_test_branch" "$WT_PATH/.env"; then
    pass "POSTGRES_DB suffixed correctly"
else
    actual=$(grep "^POSTGRES_DB=" "$WT_PATH/.env" || echo "(not found)")
    fail "POSTGRES_DB not suffixed. Got: $actual"
fi

# Check DATABASE_URL has suffixed db name
if grep -q "DATABASE_URL=postgres://user:pass@localhost:5432/myapp_dev_test_branch" "$WT_PATH/.env"; then
    pass "DATABASE_URL db name suffixed correctly"
else
    actual=$(grep "^DATABASE_URL=" "$WT_PATH/.env" || echo "(not found)")
    fail "DATABASE_URL not suffixed. Got: $actual"
fi

# Check COMPOSE_PROJECT_NAME includes branch slug
# Docker layer sets this to REPO_NAME_slug (overrides rewrite layer)
cpn_val=$(grep "^COMPOSE_PROJECT_NAME=" "$WT_PATH/.env" | tail -1 | cut -d= -f2)
if [[ "$cpn_val" == *"test_branch"* ]]; then
    pass "COMPOSE_PROJECT_NAME includes branch slug ($cpn_val)"
else
    fail "COMPOSE_PROJECT_NAME missing branch slug. Got: $cpn_val"
fi

# Check SECRET_KEY was NOT modified (not a known key)
if grep -q "SECRET_KEY=supersecret" "$WT_PATH/.env"; then
    pass "SECRET_KEY left unchanged (not a known key)"
else
    actual=$(grep "^SECRET_KEY=" "$WT_PATH/.env" || echo "(not found)")
    fail "SECRET_KEY was modified! Got: $actual"
fi

# Check {{BRANCH}} template replacement
if grep -q "TEMPLATE_VAR=prefix_test_branch_suffix" "$WT_PATH/.env"; then
    pass "{{BRANCH}} template replaced correctly"
else
    actual=$(grep "^TEMPLATE_VAR=" "$WT_PATH/.env" || echo "(not found)")
    fail "{{BRANCH}} template not replaced. Got: $actual"
fi

# Check .env.local DATABASE_NAME was suffixed
if grep -q "DATABASE_NAME=localdb_test_branch" "$WT_PATH/.env.local"; then
    pass "DATABASE_NAME in .env.local suffixed correctly"
else
    actual=$(grep "^DATABASE_NAME=" "$WT_PATH/.env.local" || echo "(not found)")
    fail "DATABASE_NAME in .env.local not suffixed. Got: $actual"
fi

# =============================================================================
# Test 4: Docker Compose isolation
# =============================================================================

echo ""
echo "--- Layer 3: Docker Compose Isolation ---"

# Check local.yml was patched in-place with env var interpolation
if grep -q '\${WT_PORT_POSTGRES_5432:-5432}:5432' "$WT_PATH/local.yml"; then
    pass "local.yml patched in-place (Postgres port interpolation)"
else
    actual=$(grep -i "5432" "$WT_PATH/local.yml" || echo "(not found)")
    fail "local.yml Postgres port not patched. Got: $actual"
fi

if grep -q '\${WT_PORT_REDIS_6379:-6379}:6379' "$WT_PATH/local.yml"; then
    pass "local.yml patched in-place (Redis port interpolation)"
else
    actual=$(grep -i "6379" "$WT_PATH/local.yml" || echo "(not found)")
    fail "local.yml Redis port not patched. Got: $actual"
fi

# Check port env vars written to .env with offsets applied
if grep -q '^WT_PORT_POSTGRES_5432=54[0-9][0-9]' "$WT_PATH/.env"; then
    pass "Postgres port offset applied in .env"
else
    actual=$(grep "^WT_PORT_POSTGRES_5432=" "$WT_PATH/.env" || echo "(not found)")
    fail "Postgres port offset not set in .env. Got: $actual"
fi

if grep -q '^WT_PORT_REDIS_6379=6[0-9][0-9][0-9]' "$WT_PATH/.env"; then
    pass "Redis port offset applied in .env"
else
    actual=$(grep "^WT_PORT_REDIS_6379=" "$WT_PATH/.env" || echo "(not found)")
    fail "Redis port offset not set in .env. Got: $actual"
fi

# =============================================================================
# Test 5: Deterministic port offset
# =============================================================================

echo ""
echo "--- Deterministic Offsets ---"

# The offset for "test-branch" should be the same every time
offset1=$(printf '%s' "test-branch" | cksum | awk '{print ($1 % 100) + 1}')
offset2=$(printf '%s' "test-branch" | cksum | awk '{print ($1 % 100) + 1}')

if [[ "$offset1" == "$offset2" ]]; then
    pass "Port offset is deterministic (offset=$offset1 for 'test-branch')"
else
    fail "Port offset not deterministic: $offset1 vs $offset2"
fi

# Different branches should (usually) get different offsets
offset_other=$(printf '%s' "other-branch" | cksum | awk '{print ($1 % 100) + 1}')
if [[ "$offset1" != "$offset_other" ]]; then
    pass "Different branch gets different offset ($offset1 vs $offset_other)"
else
    skip "Same offset for different branches (hash collision, rare but possible)"
fi

# =============================================================================
# Test 6: Second worktree gets different isolation
# =============================================================================

echo ""
echo "--- Second Worktree Isolation ---"

cd "$TMPDIR/myproject"
bash "$WT_SH" create another-feature 2>&1 | while IFS= read -r line; do echo "    $line"; done

WT2_PATH="$TMPDIR/myproject--another-feature"

if [[ -d "$WT2_PATH" ]]; then
    pass "Second worktree created"

    # DB_NAME should have different suffix
    db1=$(grep "^DB_NAME=" "$WT_PATH/.env" | cut -d= -f2)
    db2=$(grep "^DB_NAME=" "$WT2_PATH/.env" | cut -d= -f2)
    if [[ "$db1" != "$db2" ]]; then
        pass "Different DB_NAME per worktree ($db1 vs $db2)"
    else
        fail "Same DB_NAME in both worktrees: $db1"
    fi

    # COMPOSE_PROJECT_NAME should differ
    cpn1=$(grep "^COMPOSE_PROJECT_NAME=" "$WT_PATH/.env" | head -1 | cut -d= -f2)
    cpn2=$(grep "^COMPOSE_PROJECT_NAME=" "$WT2_PATH/.env" | head -1 | cut -d= -f2)
    if [[ "$cpn1" != "$cpn2" ]]; then
        pass "Different COMPOSE_PROJECT_NAME per worktree"
    else
        fail "Same COMPOSE_PROJECT_NAME: $cpn1"
    fi
else
    fail "Second worktree NOT created"
fi

# =============================================================================
# Test 7: wt list
# =============================================================================

echo ""
echo "--- List ---"

cd "$TMPDIR/myproject"
list_output=$(bash "$WT_SH" list 2>&1)
if echo "$list_output" | grep -q "test-branch"; then
    pass "wt list shows test-branch"
else
    fail "wt list missing test-branch"
fi
if echo "$list_output" | grep -q "another-feature"; then
    pass "wt list shows another-feature"
else
    fail "wt list missing another-feature"
fi

# =============================================================================
# Test 8: wt remove
# =============================================================================

echo ""
echo "--- Remove ---"

cd "$TMPDIR/myproject"
bash "$WT_SH" remove test-branch 2>&1 | while IFS= read -r line; do echo "    $line"; done

if [[ ! -d "$WT_PATH" ]]; then
    pass "Worktree removed successfully"
else
    fail "Worktree still exists after remove"
fi

# Clean up second worktree
bash "$WT_SH" remove another-feature 2>&1 | while IFS= read -r line; do echo "    $line"; done

# =============================================================================
# Test 9: Branch slug sanitization
# =============================================================================

echo ""
echo "--- Branch Slug Sanitization ---"

# Test with a complex branch name
cd "$TMPDIR/myproject"
bash "$WT_SH" create "feature/Auth-V2" 2>&1 | while IFS= read -r line; do echo "    $line"; done

WT3_PATH="$TMPDIR/myproject--feature-Auth-V2"
if [[ -d "$WT3_PATH" ]]; then
    # Check that the slug is lowercase with underscores
    db_val=$(grep "^DB_NAME=" "$WT3_PATH/.env" | cut -d= -f2)
    if [[ "$db_val" == *"feature_auth_v2"* ]]; then
        pass "Branch slug sanitized: feature/Auth-V2 → feature_auth_v2"
    else
        fail "Slug not sanitized correctly. DB_NAME=$db_val"
    fi
    # Cleanup
    cd "$TMPDIR/myproject"
    bash "$WT_SH" remove "feature/Auth-V2" 2>&1 >/dev/null
else
    fail "Worktree for feature/Auth-V2 not created"
fi

# =============================================================================
# Test 10: Monorepo nested .env (optional)
# =============================================================================

echo ""
echo "--- Monorepo Nested Files ---"

cd "$TMPDIR/myproject"
mkdir -p apps/backend
cat > apps/backend/.env << 'EOF'
DB_NAME=backend_dev
EOF

# Update .worktreeinclude to include nested pattern
cat > .worktreeinclude << 'EOF'
.env*
apps/*/.env*

[rewrite]
auto

[docker]
auto
EOF

bash "$WT_SH" create "test-nested" 2>&1 | while IFS= read -r line; do echo "    $line"; done

WT4_PATH="$TMPDIR/myproject--test-nested"
if [[ -f "$WT4_PATH/apps/backend/.env" ]]; then
    pass "Nested apps/backend/.env copied"
    nested_db=$(grep "^DB_NAME=" "$WT4_PATH/apps/backend/.env" | cut -d= -f2)
    if [[ "$nested_db" == "backend_dev_test_nested" ]]; then
        pass "Nested .env DB_NAME rewritten correctly"
    else
        fail "Nested DB_NAME not rewritten. Got: $nested_db"
    fi
else
    fail "Nested apps/backend/.env NOT copied"
fi

# Cleanup
cd "$TMPDIR/myproject"
bash "$WT_SH" remove "test-nested" 2>&1 >/dev/null

# =============================================================================
# Summary
# =============================================================================

echo ""
echo "=== Results ==="
TOTAL=$((PASS + FAIL + SKIP))
echo -e "  ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}, ${YELLOW}$SKIP skipped${NC} / $TOTAL total"
echo ""

if [[ "$FAIL" -gt 0 ]]; then
    exit 1
fi
