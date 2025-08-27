# CLAUDE.md - Documentation System Guide
*Instructions for using Lingora's consolidated documentation*
*Last Updated: 2025-08-27*

## 📚 New Documentation Structure

**IMPORTANT**: We've consolidated 20+ scattered .md files into 6 organized documents. Always use this structured approach:

### 🗂️ The 6 Core Documents

1. **PROJECT_OVERVIEW.md** - Start here for project status and MVP requirements
2. **DEVELOPMENT_GUIDE.md** - Setup, architecture, and development workflow  
3. **FEATURE_PROGRESS.md** - Implementation tracking and sprint management
4. **BUG_MANAGEMENT.md** - Issue tracking and fix procedures
5. **TECHNICAL_NOTES.md** - Detailed technical reference and troubleshooting
6. **HANDOVERS.md** - Unified session transfer documentation (replaces all individual handover files)

---

## 🔄 Documentation Workflow (CRITICAL)

### After Each Development Session:
1. **Update Status**: Modify `FEATURE_PROGRESS.md` with completed tasks
2. **Log Issues**: Add any discovered bugs to `BUG_MANAGEMENT.md`
3. **Update Overview**: Refresh `PROJECT_OVERVIEW.md` if major milestones reached
4. **Technical Changes**: Document architectural changes in `TECHNICAL_NOTES.md`
5. **Session Handover**: Update `HANDOVERS.md` with current session status and next priorities
6. **🔄 Git Commit**: Automatically commit all changes with descriptive message and push to GitHub

### For Handovers Between Sessions:
1. **Start**: Read `HANDOVERS.md` for latest session status and immediate next steps
2. **Check Overview**: Review `PROJECT_OVERVIEW.md` for overall project status  
3. **Check Progress**: Review `FEATURE_PROGRESS.md` for active sprint
4. **Review Issues**: Check `BUG_MANAGEMENT.md` for critical problems
5. **Setup**: Use `DEVELOPMENT_GUIDE.md` for technical context

### When Starting New Features:
1. **Plan**: Add feature to `FEATURE_PROGRESS.md` backlog
2. **Implement**: Follow patterns in `DEVELOPMENT_GUIDE.md`
3. **Test**: Use testing procedures in `BUG_MANAGEMENT.md`
4. **Document**: Update technical details in `TECHNICAL_NOTES.md`

---

## 🎯 Project Context Summary

### Mission & Value Prop
"Find professionals who speak YOUR language." Launch market: Netherlands.

### Current Status: ~85% MVP Complete ✅
- **Core Systems**: Search, auth, contact system, dashboards - ALL WORKING
- **Critical Fixes**: All major bugs from handover document - RESOLVED
- **Next Phase**: Complete staff-service association and provider forms

### Quick Access for Development:
- **Admin Login**: admin@lingora.nl / password123
- **Provider Login**: dr.hassan@medcentrum.nl / password123
- **Frontend**: http://localhost:5174 
- **Backend**: XAMPP Apache + MySQL

---

## ⚠️ Documentation Rules (MANDATORY)

### DO NOT:
- ❌ Create new .md files without consolidating into the 6 core documents
- ❌ Create new handover files (use `HANDOVERS.md` instead)
- ❌ Leave features uncommitted without updating `FEATURE_PROGRESS.md`
- ❌ Fix bugs without logging in `BUG_MANAGEMENT.md`  
- ❌ Make architectural changes without documenting in `TECHNICAL_NOTES.md`
- ❌ End sessions without updating `HANDOVERS.md` with current status

### ALWAYS DO:
- ✅ Update relevant documentation after each coding session
- ✅ Mark tasks as completed in `FEATURE_PROGRESS.md`
- ✅ Add new bugs/issues to `BUG_MANAGEMENT.md` immediately
- ✅ Keep `PROJECT_OVERVIEW.md` current with overall project status
- ✅ Update `HANDOVERS.md` at end of each session with current status
- ✅ Use consistent formatting and update "Last Updated" dates
- ✅ **Commit to Git after completing each feature/task with descriptive messages**

---

## 🚀 Quick Start for Any Developer

### First Time Setup:
1. Read `HANDOVERS.md` - Get immediate context and current session status
2. Read `PROJECT_OVERVIEW.md` - Understand project scope and current status
3. Follow `DEVELOPMENT_GUIDE.md` - Get environment running
4. Check `FEATURE_PROGRESS.md` - See what's in current sprint
5. Review `BUG_MANAGEMENT.md` - Understand known issues

### Before Coding:
1. Update your target feature status to "in_progress" in `FEATURE_PROGRESS.md`
2. Check `BUG_MANAGEMENT.md` for related issues
3. Reference `TECHNICAL_NOTES.md` for architecture patterns

### After Coding:
1. Mark feature "completed" in `FEATURE_PROGRESS.md`
2. Add any discovered issues to `BUG_MANAGEMENT.md`
3. Update `PROJECT_OVERVIEW.md` if significant milestone reached
4. Document technical decisions in `TECHNICAL_NOTES.md`
5. Update `HANDOVERS.md` with session results and next priorities

---

## 📋 Current Sprint Context

### MVP Status: 85% Complete
**✅ WORKING**: Search, authentication, contact system, provider dashboards, admin dashboards, geographic radius search, contact modals with real data

**🚧 IN PROGRESS**: Staff-service association, UI polish (language flags), provider profile forms

**📅 NEXT**: Complete provider management, admin approval workflow, subscription UI

### Today's Priority:
1. Connect staff members to specific services (database design + UI)
2. Replace CEFR levels with language flags in search results
3. Remove service mode from filters (display-only)

---

## 🛟 Emergency Reference

If documentation is unclear or missing:
1. **Technical Issues**: Check `TECHNICAL_NOTES.md` troubleshooting section
2. **Setup Problems**: Follow `DEVELOPMENT_GUIDE.md` step-by-step
3. **Bug Reproduction**: Use templates in `BUG_MANAGEMENT.md`
4. **Feature Status**: Always check `FEATURE_PROGRESS.md` first

**Remember**: This consolidated system prevents information fragmentation and ensures continuity across development sessions.

## 📋 Handover System

**CRITICAL**: Use `HANDOVERS.md` for all session transfers instead of creating new handover files. This unified system:
- Archives all historical handovers for reference
- Maintains current session status at the top
- Prevents handover file proliferation 
- Ensures continuity between development sessions

**Handover Workflow:**
1. **Start Session**: Check `HANDOVERS.md` for latest status and priorities
2. **During Session**: Update current session section with progress
3. **End Session**: Archive completed session, update current status for next developer
4. **Never**: Create files like `HANDOVER_NEW.md`, `SESSION_HANDOVER.md`, etc.

---

# Original MVP Technical Context (For Reference Only)

Mission / Value Prop
"Find professionals who speak YOUR language." Launch market: Netherlands.

1) Scope (In-MVP)

User roles

Resident/Seeker: Search, filter, view provider pages, send contact messages. No account required. (Favorites post-MVP.)

Provider/Professional: Register/login, create/edit profile, add service listings, add staff members, optional opening hours; visible only after admin approval (KVK & BTW).

Admin: Approve/reject providers, edit listings, manage categories/languages/pages, view contact logs.

Discovery

List + Map view (OSM) results.

Filters: Language(s), Category, City + Radius, Mode (In-person/Online).

Keyword search bar (Google-style). (LLM intent parsing is post-MVP exploration.)

Sorting: Best match; Distance. (No ratings in MVP.)

Provider public page

Business name, city, bio (multilingual), services (title, description, price range, mode), staff cards (name/role/languages; contact click-to-reveal), optional opening hours, gallery (max 6 images).

Contact & messaging

Contact form → email relay to provider; Admin BCC on all messages; Auto-reply to resident.

Provider/public email/phone/links are hidden until clicked (anti-scrape).

Moderation & trust

Manual verification of KVK & BTW by Admin before publish.

Report listing (abuse) to Admin queue.

Trials & monetization

Free trial = 3 months per provider account. After expiry, account frozen (listings hidden) until paid plan (€9.99/mo or €99.99/yr).

Anti-abuse: one trial per KVK/BTW (persist identifier).

Actual payment processing may be stubbed for MVP; freeze/unfreeze logic must work.

Internationalization

UI languages at launch: Dutch, English, German, Arabic, Amazigh (Berber), Ukrainian, Polish, Chinese (Mandarin & Cantonese), Spanish, Hindi, Turkish, French, Tigrinya (Eritrees), Somali.

Providers mark spoken languages (+ CEFR level A1–C2) for filtering.

Legal & privacy (GDPR)

Cookie banner (informational), contact consent checkbox.

Auto-purge unverified provider accounts after 30 days.

Takedown SLA for flagged content: 72h.

Publish Terms/Privacy/Cookies/Impressum (texts to be provided/generated).

Non-functional (targets)

Fast first render on 4G; accessible basics (WCAG AA labels/contrast/keyboard).

SEO-ready: unique slugs, meta tags, sitemap.xml, robots.txt, hreflang for all UI locales.

Basic analytics (privacy-friendly, free).

Spam/abuse controls: CAPTCHA on auth/contact, IP rate-limits.

2) Out of Scope (Post-MVP)

Reviews & ratings (and any rating filters/sorts).

Availability bookings / calendar reservations.

Payments integration (Stripe, etc.) beyond enabling freeze/unfreeze.

SMS/WhatsApp relay (links allowed, still click-to-reveal).

Bulk provider import (CSV).

3) Key User Flows (Happy Paths)

Resident: discover → contact

Land on home → set language + category + city/radius (and mode).

See list + map; open provider page.

Submit contact form (name, email, preferred language, message, consent) → provider receives email; admin BCC; resident gets auto-reply.

Provider: register → publish

Register + verify email → access provider dashboard.

Complete profile (business + address + languages + optional hours + gallery).

Add service listings (title/desc/prices/mode) and staff members (name/role/languages; contact fields).

Submit for Admin approval (KVK & BTW required).

Once approved, provider becomes searchable/public (unless trial expired → frozen).

Admin: moderate → manage

Review pending providers (KVK/BTW check) → Approve/Reject (with reason).

Edit/takedown content; manage categories/languages/pages; view contact logs.

Respond to reports within SLA.

4) Entities (What we store conceptually)

User (auth, role: provider/admin).

Provider (business profile; address + geolocation; bio (multilingual); KVK, BTW; approval status; trial/subscription status; opening hours; gallery).

Service (provider FK; category; title; description (multilingual); price range; mode; linked contact staff).

Staff (provider FK; name; role; languages; contact fields (revealed on click); photo).

Category (taxonomy; multilingual label).

ProviderLanguage (provider ↔ language code + CEFR level).

Message (resident → provider contact log; includes preferred language).

Report (abuse/takedown).

Language (catalog for filters & labels).

Settings (site & templates), Pages (Terms/Privacy/Cookies).

5) Search & Ranking (Behavioral Requirements)

Filters: Language(s), Category, City + Radius (default 25 km), Mode (In-person/Online).

Keyword search: matches provider/service text.

Sort: Best match by profile completeness + recency; Distance (when radius is set).

Map behavior: show results in current bounds; clicking marker opens provider card.

No ratings in MVP → no rating filter/sort.

6) Publishing Rules & Visibility

Provider pages/listings are publicly visible only when:

Email verified and Admin approved (KVK & BTW).

Account not frozen (trial active or subscription active).

Frozen or unapproved providers are not discoverable and show a neutral “temporarily unavailable” message if a direct link exists.

7) Compliance & Anti-abuse Requirements

Click-to-reveal for email/phone/links on public pages; log reveals.

CAPTCHA on contact and auth; rate-limit per IP + endpoint.

Store KVK/BTW to prevent multiple trials for the same business.

Data retention for unverified accounts (30 days); deletion on request.

8) Acceptance Criteria (Go/No-Go)

Residents can filter by language + category + city/radius and see relevant providers on list + map.

Provider public page shows bio (localized), services, staff, optional opening hours, and gallery (≤6).

Resident can contact provider via form; provider gets email; admin BCC; resident receives auto-reply.

Providers can register, complete profile, add services/staff, and submit for approval; Admin can approve/reject; approved providers become searchable.

Trial logic: new providers visible during 3-month trial; after expiry, visibility is suspended (frozen) until subscription is activated.

Security & compliance: CAPTCHA & rate-limit active; consent captured; cookie banner shown; legal pages published; unverified purged after 30 days.

SEO: unique slugs, meta tags present, sitemap/robots, and hreflang for all UI locales.

9) Assumptions & Notes

KVK & BTW both required before publish (edge cases like private tutors without BTW are out of scope for MVP).

Analytics uses a free, privacy-friendly tool; no user-level profiling.

LLM-powered search understanding is post-MVP (keep classic keyword + filters now).

Glossary

Provider: business or professional offering services.

Service listing: a specific offering under a provider (e.g., “Haircut”, “Therapy session”).

Staff: individual team member/contact linked to a provider.

Frozen: provider not publicly visible due to expired trial/no subscription.