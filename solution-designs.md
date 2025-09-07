# Solution Designs

This document tracks comprehensive technical solutions for Lingora platform features and bug fixes.

---

## SD-011: Password Reset/Change Functionality

**Date:** September 7, 2025  
**Priority:** High  
**Category:** Authentication & Security  
**Phase:** Phase 2, Task 2  

### Problem Statement

Implement secure password reset and change functionality for Lingora providers to recover access to their accounts and update passwords from the dashboard.

### Current System Analysis

**Existing Foundation:**
- ✅ Database schema supports password reset (users table has `password_reset_token` and `password_reset_expires` columns)
- ✅ EmailService.php has `sendPasswordReset($email, $token)` method implemented
- ✅ Backend API has placeholder endpoints (`forgot-password`, `reset-password`, `change-password`) 
- ✅ User model has complete password reset logic (`generatePasswordResetToken`, `resetPassword`, `updatePassword`)
- ✅ Rate limiting infrastructure exists (5 requests/hour for auth endpoints)
- ✅ Frontend has login page with "Forgot Password" link (`/forgot-password` route)
- ❌ Frontend pages for password reset flow missing
- ❌ Email integration not connected to auth endpoints
- ❌ Frontend password change component missing

### Technical Design

#### 1. Database Schema (Already Exists)
```sql
-- users table already has:
password_reset_token VARCHAR(255),
password_reset_expires TIMESTAMP NULL,
INDEX idx_password_reset_token (password_reset_token)
```

#### 2. Token Generation Strategy
**Decision: Cryptographically secure random tokens (current implementation)**
- Use `bin2hex(random_bytes(32))` for 64-character hex tokens
- 1-hour expiration (3600 seconds) - existing implementation
- Single-use tokens (cleared after reset)

**Rationale:**
- More secure than JWT for password reset (can't be decoded)
- Simple implementation with existing PHP functions
- No additional dependencies required

#### 3. API Endpoint Structure

**Endpoints (Already Implemented in Backend):**
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Complete password reset
- `PUT /api/auth/change-password` - Change password (authenticated)

**Missing Integration: Email Service Connection**

#### 4. Security Measures

**Rate Limiting (Existing):**
- 10 auth requests per hour per IP (configured in config.php)
- Uses existing rate limiting in messages table and config

**Token Security:**
- 1-hour expiration (existing implementation)
- Single-use tokens (existing implementation)
- Cryptographically secure generation (existing implementation)

**Additional Security:**
- Email validation before token generation
- Password strength validation (minimum 8 characters)
- Clear existing sessions on successful password reset

#### 5. Frontend Implementation Plan

**Required Components:**
1. **ForgotPasswordPage.tsx** - Email input form
2. **ResetPasswordPage.tsx** - New password form with token validation
3. **PasswordChangeForm.tsx** - Dashboard component for password change
4. **AuthService updates** - Add password reset methods

**Routing Updates:**
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset completion (with token parameter)

#### 6. Email Integration

**Template (Already Exists):**
- `password_reset` template in EmailService.php
- Reset link format: `{app_url}/reset-password?token={token}`

**Integration Points:**
- Connect `forgot-password` endpoint to EmailService
- Configure proper app URL in email config

### Implementation Plan

#### Phase 1: Backend Email Integration
1. **Update forgot-password endpoint** to send emails
2. **Test email delivery** with existing EmailService
3. **Verify token generation and validation**

#### Phase 2: Frontend Password Reset Flow
1. **Create ForgotPasswordPage.tsx**
   - Email input form
   - Success/error messaging
   - Integration with existing auth styling
   
2. **Create ResetPasswordPage.tsx**
   - Token validation on page load
   - Password input with confirmation
   - Password strength validation
   - Success redirect to login

3. **Add routing** in App.tsx for new pages

#### Phase 3: Dashboard Password Change
1. **Create PasswordChangeForm.tsx**
   - Current password validation
   - New password input with confirmation
   - Integration with dashboard layout

2. **Add to dashboard navigation**

#### Phase 4: AuthService Integration
1. **Add methods:**
   - `forgotPassword(email: string)`
   - `resetPassword(token: string, password: string)`
   - `changePassword(currentPassword: string, newPassword: string)`

2. **Update error handling** for password-specific errors

### Security Considerations

**Token Management:**
- Tokens expire after 1 hour
- Only one token per user (new request invalidates previous)
- Tokens cleared after successful reset

**Rate Limiting:**
- Prevent brute force attacks on reset endpoints
- Existing IP-based rate limiting sufficient

**Password Policies:**
- Minimum 8 characters (existing validation)
- Consider adding complexity requirements in future

**Email Security:**
- Reset links contain no sensitive information
- Tokens are meaningless without database access

### Testing Strategy

**Unit Tests:**
- Token generation uniqueness and expiration
- Email sending functionality
- Password validation logic

**Integration Tests:**
- Complete password reset flow
- Rate limiting enforcement
- Email template rendering

**Security Tests:**
- Token expiration handling
- Invalid token rejection
- Rate limit bypass attempts

### Success Criteria

1. **Functional Requirements:**
   - ✅ Users can request password reset via email (COMPLETED)
   - ✅ Secure token-based reset process (COMPLETED)
   - ✅ Dashboard password change functionality (COMPLETED)
   - ✅ Proper error handling and user feedback (COMPLETED)

2. **Security Requirements:**
   - ✅ Rate limiting prevents abuse (COMPLETED)
   - ✅ Tokens expire appropriately (COMPLETED)
   - ✅ Password strength validation (COMPLETED)
   - ✅ Secure token generation (COMPLETED)

3. **User Experience:**
   - ✅ Clear instructions and feedback (COMPLETED)
   - ✅ Consistent styling with existing pages (COMPLETED)
   - ✅ Mobile-responsive design (COMPLETED)
   - ✅ Multi-language support (COMPLETED)

### COMPLETION STATUS: 100% COMPLETE ✅

**Implementation Completed:** September 7, 2025  
**All components successfully implemented and tested:**
- Backend email integration with secure token system
- Complete password reset workflow (forgot → email → reset → login)
- Dashboard password change interface with current password validation
- Email templates integrated with EmailService.php
- Frontend pages with proper error handling and user feedback
- All APIs tested and verified working

**Key Achievements:**
- Secure 1-hour token expiry system implemented
- EmailService.php template system operational
- JWT authentication properly integrated
- All security measures implemented (rate limiting, token validation, password policies)
- Complete user workflow from request to successful password change

### Risk Assessment

**Low Risk:**
- Backend logic already implemented and tested
- Email service already functional
- Database schema already in place

**Medium Risk:**
- Email delivery reliability (using PHP mail() in development)
- Frontend state management for multi-step flow

**Mitigation Strategies:**
- Comprehensive error handling for email failures
- Clear user feedback for each step
- Fallback contact information if email fails

### File Structure

**Backend (No changes required to core logic):**
- `backend/api/auth/index.php` - Add email integration
- `backend/models/User.php` - Already complete
- `backend/services/EmailService.php` - Already complete

**Frontend (New files required):**
- `frontend/src/pages/ForgotPasswordPage.tsx`
- `frontend/src/pages/ResetPasswordPage.tsx`
- `frontend/src/components/dashboard/PasswordChangeForm.tsx`
- `frontend/src/services/authService.ts` - Update with new methods

### Dependencies

**Existing:**
- EmailService.php (✅ Ready)
- User model (✅ Complete)
- Rate limiting infrastructure (✅ Implemented)
- Frontend auth context (✅ Ready)

**None Required:**
- No new packages or external services needed

---

*End of SD-011*

---

## SD-012: Email Change with Verification System

**Date:** September 7, 2025  
**Priority:** High  
**Category:** Authentication & Security  
**Phase:** Phase 2, Task 3  

### Problem Statement

Implement secure email change functionality for Lingora providers that requires dual verification: confirmation from the current email address and verification of the new email address. This prevents unauthorized email changes while maintaining account security.

### Current System Analysis

**Existing Foundation:**
- ✅ EmailService.php with complete template system operational
- ✅ JWT authentication and user management working
- ✅ Database schema supports users table with email field and verification tokens
- ✅ Password reset patterns established (secure token generation, expiration, email integration)
- ✅ Rate limiting infrastructure exists (10 requests/hour for auth endpoints)
- ✅ Frontend dashboard infrastructure ready
- ❌ Email change tokens not implemented in database
- ❌ Dual verification workflow not implemented
- ❌ Frontend interface for email change requests missing
- ❌ Email change endpoints not implemented

### Technical Design

#### 1. Database Schema Extension

**New columns needed in users table:**
```sql
ALTER TABLE users ADD COLUMN email_change_token VARCHAR(255);
ALTER TABLE users ADD COLUMN email_change_expires TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN new_email VARCHAR(255);
ALTER TABLE users ADD COLUMN email_change_confirmed_current BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD INDEX idx_email_change_token (email_change_token);
```

**Rationale:**
- Reuse existing token pattern from password reset
- Store new email temporarily until both verifications complete
- Track confirmation status for dual verification workflow
- Maintain referential integrity with existing users table

#### 2. Dual Verification Workflow

**Step 1: Email Change Request**
1. User submits new email address from dashboard
2. System validates new email is not already in use
3. Generate secure token with 1-hour expiry
4. Store `new_email`, `email_change_token`, `email_change_expires`
5. Send confirmation email to **current** email address

**Step 2: Current Email Confirmation**
1. User clicks link in current email
2. System validates token and marks `email_change_confirmed_current = TRUE`
3. Send verification email to **new** email address
4. Display status: "Check your new email to complete the change"

**Step 3: New Email Verification**
1. User clicks verification link in new email
2. System validates token and `email_change_confirmed_current = TRUE`
3. Update `email` field to `new_email`
4. Clear all email change fields
5. Send confirmation to both old and new email addresses

**Security Features:**
- Single-use tokens (cleared after completion)
- 1-hour expiry on all tokens
- Both emails must be verified for change to complete
- Rollback capability if new email verification fails
- Email change history logging

#### 3. API Endpoint Structure

**New Endpoints Required:**

**`POST /api/auth/request-email-change`** (Authenticated)
```json
{
  "new_email": "newemail@example.com"
}
```
Response: `{"message": "Verification email sent to current address"}`

**`POST /api/auth/confirm-email-change-current`** (Public)
```json
{
  "token": "abc123..."
}
```
Response: `{"message": "Current email confirmed. Check your new email."}`

**`POST /api/auth/verify-new-email`** (Public)
```json
{
  "token": "abc123..."
}
```
Response: `{"message": "Email changed successfully"}`

**`POST /api/auth/cancel-email-change`** (Authenticated)
Response: `{"message": "Email change request cancelled"}`

#### 4. Security Measures

**Rate Limiting:**
- Use existing 10 requests/hour limit for auth endpoints
- Additional limit: 3 email change requests per day per user

**Token Security:**
- Use same secure generation as password reset: `bin2hex(random_bytes(32))`
- 1-hour expiration for all tokens
- Single-use tokens (cleared after use)
- Different tokens for current email confirmation vs new email verification

**Email Validation:**
- Validate new email format before request
- Check new email not already in use
- Prevent changing to same email address

**Additional Security:**
- Log all email change attempts for audit trail
- Clear JWT sessions on successful email change (force re-login)
- Rate limit IP addresses for email change endpoints

#### 5. Email Templates

**Template 1: Current Email Confirmation**
```html
<h2>Confirm Your Email Change Request</h2>
<p>We received a request to change your Lingora account email to: <strong>{new_email}</strong></p>
<p>If you made this request, click the link below to confirm:</p>
<p><a href="{confirm_current_link}">Confirm Email Change</a></p>
<p>If you didn't request this change, please ignore this email or contact support.</p>
```

**Template 2: New Email Verification**
```html
<h2>Verify Your New Email Address</h2>
<p>Please verify this email address for your Lingora account.</p>
<p>Click the link below to complete your email change:</p>
<p><a href="{verify_new_link}">Complete Email Change</a></p>
<p>This request will expire in 1 hour.</p>
```

**Template 3: Email Change Confirmation (sent to both addresses)**
```html
<h2>Email Address Changed Successfully</h2>
<p>Your Lingora account email has been changed successfully.</p>
<p><strong>Old Email:</strong> {old_email}</p>
<p><strong>New Email:</strong> {new_email}</p>
<p>If you didn't make this change, please contact support immediately.</p>
```

#### 6. Frontend Implementation Plan

**Required Components:**
1. **EmailChangeForm.tsx** - Dashboard component
   - Current email display (read-only)
   - New email input with validation
   - Submit button and status display
   - Cancel request functionality

2. **EmailChangeStatus.tsx** - Status tracking component
   - Show current step in process
   - Display instructions for next step
   - Countdown timer for token expiry
   - Cancel option

3. **ConfirmEmailChangePage.tsx** - Standalone page for current email confirmation
   - Token validation on page load
   - Success/error messaging
   - Next steps instructions

4. **VerifyNewEmailPage.tsx** - Standalone page for new email verification
   - Token validation on page load
   - Success/error messaging
   - Automatic redirect to dashboard

**Integration Points:**
- Add to dashboard settings section
- Update AuthService with new methods
- Handle JWT token updates on successful change
- Update user context with new email

#### 7. Database Changes Required

**Migration Script:**
```sql
-- Add email change columns to users table
ALTER TABLE users 
ADD COLUMN email_change_token VARCHAR(255),
ADD COLUMN email_change_expires TIMESTAMP NULL,
ADD COLUMN new_email VARCHAR(255),
ADD COLUMN email_change_confirmed_current BOOLEAN DEFAULT FALSE,
ADD INDEX idx_email_change_token (email_change_token);

-- Create email change log table for audit trail
CREATE TABLE email_change_log (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    old_email VARCHAR(255) NOT NULL,
    new_email VARCHAR(255) NOT NULL,
    status ENUM('requested', 'current_confirmed', 'completed', 'cancelled') NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);
```

### Implementation Plan

#### Phase 1: Backend Infrastructure
1. **Database Migration**
   - Add email change columns to users table
   - Create email change log table
   - Test migration on development database

2. **User Model Extensions**
   - Add `requestEmailChange($userId, $newEmail)` method
   - Add `confirmCurrentEmail($token)` method  
   - Add `verifyNewEmail($token)` method
   - Add `cancelEmailChange($userId)` method

3. **Email Service Extensions**
   - Add email change templates to EmailService.php
   - Add `sendEmailChangeConfirmation($currentEmail, $newEmail, $token)`
   - Add `sendNewEmailVerification($newEmail, $token)`
   - Add `sendEmailChangeComplete($oldEmail, $newEmail)`

#### Phase 2: API Implementation
1. **Auth Endpoints**
   - Implement `/api/auth/request-email-change`
   - Implement `/api/auth/confirm-email-change-current`
   - Implement `/api/auth/verify-new-email` 
   - Implement `/api/auth/cancel-email-change`

2. **Rate Limiting**
   - Add email change specific rate limits
   - Test rate limiting enforcement

3. **Testing**
   - Unit tests for all new User model methods
   - Integration tests for complete email change workflow
   - Security tests for token validation and expiry

#### Phase 3: Frontend Implementation
1. **Dashboard Components**
   - Create EmailChangeForm component
   - Create EmailChangeStatus component
   - Integrate into dashboard settings

2. **Standalone Pages**
   - Create ConfirmEmailChangePage
   - Create VerifyNewEmailPage
   - Add routing for new pages

3. **AuthService Integration**
   - Add email change methods to AuthService
   - Handle JWT updates on successful change
   - Update user context management

#### Phase 4: Testing & Deployment
1. **End-to-End Testing**
   - Complete email change workflow testing
   - Error handling and edge case testing
   - Mobile responsiveness testing

2. **Security Testing**
   - Token expiry and validation testing
   - Rate limiting bypass attempts
   - Email spoofing protection verification

### Security Considerations

**Token Management:**
- All tokens expire after 1 hour
- Different tokens for different steps (security by obscurity)
- Tokens cleared immediately after successful use
- Only one active email change request per user

**Dual Verification Benefits:**
- Prevents unauthorized email changes if account is compromised
- Ensures user has access to both old and new email addresses
- Provides clear audit trail of changes

**Rate Limiting:**
- Prevents abuse of email change functionality
- Additional daily limits prevent persistent attacks
- IP-based limits protect against distributed attacks

**Rollback Procedures:**
- Email change can be cancelled at any stage before completion
- If new email verification fails, old email remains active
- Clear error messages guide users through recovery

**Audit Trail:**
- All email change attempts logged with IP addresses
- Status tracking allows investigation of suspicious activity
- Email notifications to both addresses provide transparency

### User Experience Design

**Dashboard Integration:**
- Email change form in account settings section
- Clear status indicators for multi-step process
- Progress tracking with visual indicators
- Easy cancellation option at any stage

**Email Experience:**
- Clear, professional email templates
- Step-by-step instructions in each email
- Consistent branding with existing emails
- Clear expiry time information

**Error Handling:**
- Comprehensive error messages for all failure scenarios
- Recovery instructions for common issues
- Support contact information for complex cases
- Graceful degradation for edge cases

### Success Criteria

1. **Functional Requirements:**
   - ✅ Secure dual verification process (current + new email)
   - ✅ Prevention of unauthorized email changes
   - ✅ Integration with existing email infrastructure
   - ✅ Dashboard interface for email change requests
   - ✅ Complete rollback capability

2. **Security Requirements:**
   - ✅ Token-based security with expiration
   - ✅ Rate limiting prevents abuse
   - ✅ Audit trail for all changes
   - ✅ Email validation and uniqueness checks
   - ✅ Session invalidation on successful change

3. **User Experience:**
   - ✅ Clear multi-step workflow
   - ✅ Status tracking and progress indicators
   - ✅ Professional email communications
   - ✅ Mobile-responsive design
   - ✅ Consistent with existing UI patterns

### Risk Assessment

**Low Risk:**
- Email infrastructure already proven and tested
- Token generation system already implemented for password reset
- Database schema changes are minimal and non-breaking
- UI patterns established from password reset implementation

**Medium Risk:**
- Complex multi-step workflow requires careful state management
- Email delivery dependency for critical security step
- User confusion with multi-step verification process

**High Risk:**
- Security vulnerability if dual verification is bypassed
- Data loss if email change process corrupts user data
- Account lockout if users lose access to both email addresses

**Mitigation Strategies:**
- Comprehensive testing of all workflow states
- Clear user instructions and status indicators
- Admin override capability for account recovery
- Database transaction safety for atomic operations
- Extensive logging for debugging and audit

### Dependencies

**Existing (Ready):**
- EmailService.php with template system ✅
- JWT authentication system ✅
- User model with authentication methods ✅
- Rate limiting infrastructure ✅
- Dashboard UI framework ✅

**New Requirements:**
- Database migration for email change fields
- Email template additions to EmailService.php
- Frontend components for multi-step workflow

**No External Dependencies:**
- No new packages or services required
- Uses existing infrastructure patterns

### File Structure

**Backend Updates:**
- `backend/migrations/003_add_email_change_fields.sql` - New migration
- `backend/models/User.php` - Add email change methods
- `backend/services/EmailService.php` - Add email change templates
- `backend/api/auth/index.php` - Add email change endpoints

**Frontend New Files:**
- `frontend/src/components/dashboard/EmailChangeForm.tsx`
- `frontend/src/components/dashboard/EmailChangeStatus.tsx`
- `frontend/src/pages/ConfirmEmailChangePage.tsx`
- `frontend/src/pages/VerifyNewEmailPage.tsx`
- `frontend/src/services/authService.ts` - Add email change methods

### Integration Points

**With Password Reset System:**
- Share token generation and validation patterns
- Reuse email template structure and styling
- Follow same security practices and rate limiting

**With Dashboard System:**
- Integrate into existing settings/account section
- Follow established UI patterns and styling
- Use existing error handling and notification systems

**With Authentication System:**
- Maintain JWT authentication throughout process
- Update user session on successful email change
- Integrate with existing user context management

---

*End of SD-012*
