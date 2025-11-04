## Template Cleanup Checklist

Use this checklist to replace any remaining demo/template content with your own. Check off items as you review/update them.

### High priority: Profile and Homepage

- [ ] `content/authors/admin/_index.md`
  - [ ] L37: `mailto:alex.johnson@meta.com` → replace with your email
  - [ ] L40: `https://twitter.com/AlexAIResearch` → replace with your X/Twitter URL
  - [ ] L42: `https://github.com/alexjohnsonai` → replace with your GitHub URL
  - [ ] L44: `https://www.linkedin.com/in/alexjohnsonai/` → replace with your LinkedIn URL
  - [ ] L46: `https://scholar.google.com/citations?user=alexjohnson` → replace with your Google Scholar URL (if applicable)
  - [ ] L48: `https://orcid.org/0000-0002-1825-0097` → replace with your ORCID (if applicable)
  - [ ] L75: `company_url: 'https://ai.meta.com/'` → replace with your organization URL or remove
  - [ ] Review sections for relevance and tone:
    - Interests (L50–L54)
    - Skills (L83–L100) – adjust items/percentages/icons
    - Hobbies (L100–L113) – e.g., "Tinkering with AI" #thats actually from me
    - Languages (L114–L120) # also from me
    - Awards (L122–L147) – currently commented and AI-themed; customize or keep commented

- [ ] `content/_index.md`
  - [ ] L37–L41: Demo bio paragraph mentions DeepMind/Moonshot and ML – replace with your own description
  - [ ] L104–L118: Demo CTA block for Hugo Blox (shown only in demo via `demo: true`) – remove or keep as desired

### Example content to review/replace or remove

- [ ] `content/blog/` (example posts)
  - [ ] `content/blog/get-started/`
  - [ ] `content/blog/data-visualization/`
  - [ ] `content/blog/project-management/`
  - [ ] `content/blog/second-brain/`
  - [ ] `content/blog/teach-courses/`

- [ ] `content/projects/` (example projects)
  - [ ] `content/projects/pandas/`
  - [ ] `content/projects/pytorch/`
  - [ ] `content/projects/scikit/` – contains ML text; adjust to your voice or remove

- [ ] `content/publications/` (example publications)
  - [ ] `content/publications/conference-paper/`
  - [ ] `content/publications/journal-article/`
  - [ ] `content/publications/preprint/`

- [ ] `content/events/example/` (example talk/event)

- [ ] `content/courses/hugo-blox/` (theme docs/tutorial content) – remove if not using courses/docs on your site

### Configuration review

- [ ] `config/_default/params.yaml`
  - [ ] `marketing.seo` – ensure description, site_type, and `twitter` handle are yours
  - [ ] `header.navbar.logo.text` – set to your preferred site title/brand
  - [ ] Analytics/verification IDs (Google Analytics, etc.) – add if needed

### Media

- [ ] `content/authors/admin/avatar.png` – replace with your portrait
- [ ] `static/uploads/resume.pdf` – replace with your CV
- [ ] Featured images in example content folders (replace or remove)

Notes:
- Line numbers reflect the current repository state and may shift after edits.
- Some demo blocks are hidden on real sites (e.g., `demo: true`) but are listed here so you can decide whether to keep or remove them.



