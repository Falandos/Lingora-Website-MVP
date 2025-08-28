# 🚀 Translation Quick Start Guide
*Immediate action plan for completing homepage translations*
*Created: 2024-12-17 - For next session use*

## 🎯 **CRITICAL ISSUE SUMMARY**
- ✅ Translation infrastructure complete (react-i18next, language files, RTL support)
- ❌ 70% of homepage text still hardcoded English
- ❌ Hero title grammar broken in Dutch ("Vind Professionals Die" missing "Spreken")
- ❌ Search bar, statistics, carousel, examples all need translation keys

## 🔧 **IMMEDIATE TASKS (IN ORDER)**

### **TASK 1: Fix Hero Title Template (15 mins) 🚨 CRITICAL**

**Files to update:**
1. `frontend/src/locales/en.json` - Add:
```json
"home": {
  "hero_title_template": "Find Professionals Who Speak {{language}}"
}
```

2. `frontend/src/locales/nl.json` - Add:
```json
"home": {
  "hero_title_template": "Vind Professionals Die {{language}} Spreken"
}
```

3. `frontend/src/locales/ar.json` - Add:
```json
"home": {
  "hero_title_template": "ابحث عن محترفين يتحدثون {{language}}"
}
```

4. `frontend/src/pages/HomePage.tsx` - Change:
```tsx
// FROM:
{t('home.hero_title')}

// TO:
{t('home.hero_title_template', { language: currentLanguage })}
```

### **TASK 2: Add Missing Translation Keys (20 mins)**

**Add to ALL language files (en.json, nl.json, ar.json, tr.json, de.json, pl.json):**

```json
{
  "search": {
    "placeholder_prefix": "I'm searching for a:",
    "location_near": "Near:",
    "my_location": "📍 My location", 
    "button_search": "Search",
    "ai_powered": "🧠 AI-powered",
    "search_any_language": "Search in any language",
    "no_registration": "🇳🇱 🇬🇧 🇸🇦 🇩🇪 🇪🇸 +10 more"
  },
  "stats": {
    "active_businesses": "Active Businesses",
    "professional_staff": "Professional Staff",
    "languages": "Languages",
    "services": "Services"
  },
  "carousel": {
    "recently_joined": "Recently Joined Professionals"
  },
  "discover": {
    "try_your_search": "Try Your Own Search Now",
    "search_tagline": "Search in any language • Get instant results • No registration needed",
    "examples_title": "Real Search Examples:",
    "example_1_query": "dokter die arabisch spreekt",
    "example_1_desc": "Arabic-speaking doctor in Dutch",
    "example_1_results": "Found 3 providers",
    "example_2_query": "need help with stress",
    "example_2_desc": "Natural English expression",
    "example_2_results": "Found 2 psychologists",
    "example_3_query": "Turkish lawyer immigration",
    "example_3_desc": "Mixed language search",
    "example_3_results": "Found 1 specialist",
    "example_4_query": "طبيب نفسي",
    "example_4_desc": "Arabic for psychologist",
    "example_4_results": "Found 2 providers"
  }
}
```

### **TASK 3: Update Components (40 mins)**

**Files to edit:**

1. **HeroSearchBar.tsx** - Replace hardcoded text:
   - `placeholder="I'm searching for a:"` → `placeholder={t('search.placeholder_prefix')}`
   - `"Near:"` → `{t('search.location_near')}`
   - `"📍 My location"` → `{t('search.my_location')}`
   - `"Search"` → `{t('search.button_search')}`
   - `"🧠 AI-powered"` → `{t('search.ai_powered')}`
   - `"Search in any language"` → `{t('search.search_any_language')}`
   - `"🇳🇱 🇬🇧 🇸🇦 🇩🇪 🇪🇸 +10 more"` → `{t('search.no_registration')}`

2. **StatisticsBar.tsx** - Replace stat labels:
   - `"Active Businesses"` → `{t('stats.active_businesses')}`
   - `"Professional Staff"` → `{t('stats.professional_staff')}`
   - `"Languages"` → `{t('stats.languages')}`
   - `"Services"` → `{t('stats.services')}`

3. **RecentProvidersCarousel.tsx** - Replace title:
   - `"Recently Joined Professionals"` → `{t('carousel.recently_joined')}`

4. **DiscoverSection.tsx** - Make examples translatable:
   - `"Try Your Own Search Now"` → `{t('discover.try_your_search')}`
   - `"Search in any language • Get instant results • No registration needed"` → `{t('discover.search_tagline')}`
   - Replace hardcoded example queries with translation keys
   - Use `t('discover.example_1_query')`, `t('discover.example_1_desc')`, etc.

5. **HomePage.tsx** - Update hero title:
   - Import `LanguageCarousel` component to get `currentLanguage`
   - Change `{t('home.hero_title')}` to `{t('home.hero_title_template', { language: currentLanguage })}`

### **TASK 4: Dutch Translations Reference**

```json
{
  "search": {
    "placeholder_prefix": "Ik zoek naar:",
    "location_near": "Nabij:",
    "my_location": "📍 Mijn locatie",
    "button_search": "Zoeken",
    "ai_powered": "🧠 AI-powered",
    "search_any_language": "Zoek in elke taal",
    "no_registration": "🇳🇱 🇬🇧 🇸🇦 🇩🇪 🇪🇸 +10 meer"
  },
  "stats": {
    "active_businesses": "Actieve Bedrijven",
    "professional_staff": "Professioneel Personeel", 
    "languages": "Talen",
    "services": "Diensten"
  },
  "carousel": {
    "recently_joined": "Recent Aangesloten Professionals"
  },
  "discover": {
    "try_your_search": "Probeer Nu Je Eigen Zoekopdracht",
    "search_tagline": "Zoek in elke taal • Onmiddellijke resultaten • Geen registratie vereist",
    "examples_title": "Echte Zoekvoorbeelden:",
    "example_1_query": "dokter die arabisch spreekt",
    "example_1_desc": "Arabisch sprekende dokter in het Nederlands",
    "example_1_results": "3 aanbieders gevonden",
    "example_2_query": "hulp bij stress",
    "example_2_desc": "Natuurlijke Nederlandse uitdrukking",
    "example_2_results": "2 psychologen gevonden",
    "example_3_query": "Turkse advocaat immigratie",
    "example_3_desc": "Gemixte taal zoekopdracht",
    "example_3_results": "1 specialist gevonden",
    "example_4_query": "طبيب نفسي",
    "example_4_desc": "Arabisch voor psycholoog",
    "example_4_results": "2 aanbieders gevonden"
  }
}
```

### **TASK 5: Arabic Translations Reference**

```json
{
  "search": {
    "placeholder_prefix": "أبحث عن:",
    "location_near": "بالقرب من:",
    "my_location": "📍 موقعي",
    "button_search": "بحث",
    "ai_powered": "🧠 مدعوم بالذكاء الاصطناعي",
    "search_any_language": "ابحث بأي لغة",
    "no_registration": "🇳🇱 🇬🇧 🇸🇦 🇩🇪 🇪🇸 +10 أخرى"
  },
  "stats": {
    "active_businesses": "الشركات النشطة",
    "professional_staff": "الموظفون المحترفون",
    "languages": "اللغات", 
    "services": "الخدمات"
  },
  "carousel": {
    "recently_joined": "المحترفون المنضمون مؤخراً"
  },
  "discover": {
    "try_your_search": "جرب بحثك الخاص الآن",
    "search_tagline": "ابحث بأي لغة • احصل على نتائج فورية • لا حاجة للتسجيل",
    "examples_title": "أمثلة بحث حقيقية:",
    "example_1_query": "dokter die arabisch spreekt",
    "example_1_desc": "طبيب يتحدث العربية بالهولندية",
    "example_1_results": "تم العثور على 3 مقدمين",
    "example_2_query": "need help with stress",
    "example_2_desc": "تعبير طبيعي بالإنجليزية",
    "example_2_results": "تم العثور على 2 من علماء النفس",
    "example_3_query": "Turkish lawyer immigration",
    "example_3_desc": "بحث بلغة مختلطة",
    "example_3_results": "تم العثور على متخصص واحد",
    "example_4_query": "طبيب نفسي",
    "example_4_desc": "عربية لطبيب نفسي",
    "example_4_results": "تم العثور على 2 مقدمين"
  }
}
```

## 🧪 **TESTING CHECKLIST**

After implementation:
- [ ] Switch to Dutch - hero title should read "Vind Professionals Die Nederlands Spreken"
- [ ] Switch to Arabic - layout should be RTL, text should be Arabic
- [ ] Search bar should show translated placeholders
- [ ] Statistics should show translated labels
- [ ] Carousel title should be translated
- [ ] Language selection should persist after page reload

## 🎯 **SUCCESS CRITERIA**

When complete:
- ✅ Hero title grammar correct in all languages
- ✅ All homepage text properly translated (no hardcoded English)
- ✅ RTL layout working for Arabic
- ✅ Language switching instant and persistent

## 🔄 **AFTER COMPLETION**

1. Test all 6 implemented languages
2. Create git commit: "Complete homepage translations - Pre-Alpha 0.9"
3. Move to Messages Component implementation
4. Update handovers.md with completion status

### **TASK 6: Additional Language Files (15 mins)**

**Create or update remaining language files with all translation keys:**

**Turkish (tr.json):**
```json
"home": { "hero_title_template": "{{language}} Konuşan Profesyonelleri Bulun" }
"search": { "placeholder_prefix": "Arıyorum:", "button_search": "Ara" }
"stats": { "active_businesses": "Aktif İşletmeler", "languages": "Diller" }
```

**German (de.json):**
```json
"home": { "hero_title_template": "Finden Sie Profis, die {{language}} sprechen" }
"search": { "placeholder_prefix": "Ich suche:", "button_search": "Suchen" }
"stats": { "active_businesses": "Aktive Unternehmen", "languages": "Sprachen" }
```

**Polish (pl.json):**
```json
"home": { "hero_title_template": "Znajdź profesjonalistów mówiących {{language}}" }
"search": { "placeholder_prefix": "Szukam:", "button_search": "Szukaj" }
"stats": { "active_businesses": "Aktywne Firmy", "languages": "Języki" }
```

---

**Time Estimate: 80 minutes total**
**Expected Result: Pre-Alpha 0.9 - Homepage fully multilingual** 🎉