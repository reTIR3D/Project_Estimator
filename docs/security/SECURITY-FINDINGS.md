# Security Findings - Project Estimator

**Date:** October 2, 2025
**Reviewer:** Ryan
**Severity:** Critical

---

## SECURITY-001: JWT Secret Keys Exposed in Version Control

### What It Is
The `.env` file containing production secrets is committed to git history.

### Files Affected
- `backend/.env` (lines 5, 19, 28, 33-34)

### The Problem
```bash
SECRET_KEY=your-secret-key-here-change-in-production
JWT_SECRET_KEY=your-jwt-secret-change-in-production
SMTP_PASSWORD=your-app-password
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### Why It Matters
Anyone with repository access can:
- Read the JWT_SECRET_KEY
- Create fake authentication tokens for any user
- Impersonate admin accounts without knowing passwords
- Access AWS resources if those credentials are real

**Example Attack:**
```python
import jwt
fake_admin_token = jwt.encode(
    {"sub": "admin@example.com", "exp": 9999999999},
    "your-jwt-secret-change-in-production",  # Leaked secret
    algorithm="HS256"
)
# This token will pass validation - attacker is now admin
```

### How to Fix

1. **Remove from git history:**
```bash
# Use BFG Repo-Cleaner or git filter-branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all
```

2. **Verify .env is in .gitignore** (it is, but file was committed anyway)

3. **Rotate all secrets in production:**
   - Generate new JWT_SECRET_KEY
   - Rotate AWS credentials
   - Change SMTP password
   - Update all deployed environments

4. **Use environment variables:**
   - Production: AWS Secrets Manager or similar
   - Development: Keep .env.example in git (no real secrets)
   - Each developer: Create local .env (never commit)

### Priority
**Critical** - Potential for complete authentication bypass

---

## SECURITY-002: No Token Expiration Handling on Frontend

### What It Is
API client adds JWT tokens to requests but doesn't handle 401 Unauthorized responses when tokens expire.

### Files Affected
- `frontend/src/services/api.ts` (lines 40-46)

### The Problem
```typescript
// Current code only adds token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// ⚠️ NO RESPONSE INTERCEPTOR FOR 401 ERRORS
```

### Why It Matters
When a user's token expires (after 30 minutes):
- API returns 401 Unauthorized
- Frontend shows generic error message
- User doesn't know they need to log in again
- Any unsaved work is lost
- Poor user experience

### How to Fix

Add a response interceptor to handle 401 errors:

```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - clean up and redirect
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      // Optional: Show toast notification
      // toast.error("Your session expired. Please log in again.");
    }
    return Promise.reject(error);
  }
);
```

### Priority
**Critical** - Poor security UX leads to user frustration and data loss

---

## SECURITY-003: Silent JWT Validation Failures

### What It Is
Token validation catches all errors but doesn't log them, making it impossible to detect attack attempts.

### Files Affected
- `backend/app/core/auth.py` (lines 9-27)

### The Problem
```python
def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None  # ⚠️ All errors silently swallowed
```

**Issues:**
- No logging of failed token attempts
- Can't differentiate between expired tokens (normal) vs tampered tokens (attack)
- No audit trail for security events
- Can't detect brute-force token attacks

### Why It Matters
Without logging, you can't:
- Detect when someone is trying fake tokens
- Debug authentication issues
- Meet compliance requirements (SOC 2, HIPAA, etc.)
- Identify compromised accounts

### How to Fix

```python
from jose import jwt, JWTError, ExpiredSignatureError
import logging

logger = logging.getLogger(__name__)

def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )

        # Explicit expiration check
        if 'exp' not in payload:
            logger.warning(
                "Token missing expiration claim - possible security issue",
                extra={"token_preview": token[:20]}
            )
            return None

        return payload

    except ExpiredSignatureError:
        logger.info("Token expired (normal user session timeout)")
        return None

    except JWTError as e:
        logger.error(
            f"Token validation failed - possible attack attempt: {e}",
            extra={"error_type": type(e).__name__}
        )
        return None
```

### Priority
**Critical** - No audit trail for authentication events

---

## Additional Security Recommendations

### No Rate Limiting
- Configuration exists in `backend/app/config.py` but not implemented
- Authentication endpoints vulnerable to brute force
- Recommendation: Implement using `slowapi` or similar

### No HTTPS Enforcement
- Production deployment should force HTTPS
- Recommendation: Add HTTPS redirect middleware

### No Password Complexity Requirements
- Currently accepts any password
- Recommendation: Add minimum length, complexity rules

### No Account Lockout
- No protection against credential stuffing
- Recommendation: Lock account after N failed login attempts

### Missing CSRF Protection
- SameSite cookies not configured
- Recommendation: Add CSRF tokens for state-changing operations
