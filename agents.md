# Agent Guide for paradoxical-twin.github.io

This is a Hugo website using the **Hugo Blox** (formerly Wowchemy) theme with the `academic-cv` starter. This guide documents non-obvious aspects of the codebase to help coding agents work effectively.

## Tech Stack

- **Static Site Generator**: Hugo (v0.152+)
- **Theme**: Hugo Blox (`blox-tailwind` module)
- **CSS Framework**: Tailwind CSS (processed by Hugo Blox)
- **Hosting**: Netlify (see `netlify.toml`)

## Critical: Custom Styles Location

**The SCSS file at `assets/scss/custom.scss` is NOT processed by default.**

Custom styles that actually work are in:
```
layouts/_partials/hooks/head-end/custom-styles.html
```

This file injects inline `<style>` tags at the end of `<head>`, ensuring they override theme defaults. Always add CSS overrides here, not in the SCSS file.

## Directory Structure

```
├── content/
│   ├── _index.md              # Homepage sections configuration
│   ├── authors/admin/         # Author profile (interests, education, etc.)
│   ├── blog/                  # Blog posts
│   ├── publications/          # Academic publications
│   └── ...
├── layouts/
│   ├── partials/blox/         # Custom block template overrides
│   │   └── resume-biography-3/block.html  # Custom biography block
│   └── _partials/hooks/       # Hugo Blox hook system
│       └── head-end/          # Styles injected at end of <head>
│           └── custom-styles.html  # <-- PRIMARY CUSTOM CSS LOCATION
├── assets/
│   └── scss/custom.scss       # SCSS file (NOT auto-processed, legacy)
├── config/                    # Hugo configuration
├── static/                    # Static assets (images, files)
└── public/                    # Generated output (gitignored)
```

## Hugo Blox Section System

The homepage (`content/_index.md`) uses a block-based section system:

```yaml
sections:
  - block: resume-biography-3   # Block type
    content:
      username: admin           # References content/authors/admin/
    design:
      # Block-specific design options
```

Each section renders as:
```html
<section class="relative hbb-section blox-{block-name}">
```

### Default Section Spacing Problem

The theme applies **6rem padding top + 6rem padding bottom** to `.hbb-section`:
```css
.hbb-section {
  padding-top: 6rem;
  padding-bottom: 6rem;
}
```

This creates ~12rem gaps between sections. Override in `custom-styles.html`:
```css
.hbb-section {
  padding-top: 2rem !important;
  padding-bottom: 2rem !important;
}
```

## Custom Block Templates

To override a Hugo Blox block template:

1. Find the original in Hugo modules (check `go.sum` for module paths)
2. Create override at: `layouts/partials/blox/{block-name}/block.html`

Example: The `resume-biography-3` block is customized at:
```
layouts/partials/blox/resume-biography-3/block.html
```

## Author Profile Data

The main author profile lives at `content/authors/admin/_index.md` and contains:
- `title`: Display name
- `role`: Job title
- `organizations`: Affiliations
- `interests`: List of interests (displayed as tags)
- `education`: Education history
- `profiles`: Social links
- Body content: Biography text

## Generated Output

After running `hugo`:
- Output goes to `public/`
- Main CSS bundle: `public/css/_entry.css`
- Check this file to verify if styles are actually being applied

## Common Issues & Solutions

### Styles not applying
1. Check if editing the right file (`custom-styles.html`, not `custom.scss`)
2. Use `!important` to override Tailwind utilities
3. Rebuild with `hugo` (the `public/` folder may have stale content)

### Section spacing issues
Override `.hbb-section` padding in `custom-styles.html`

### Template changes not reflecting
1. Clear Hugo cache: `hugo --gc`
2. Delete `public/` and rebuild
3. Check template path matches Hugo Blox conventions

### Finding theme defaults
The compiled CSS is in `public/css/_entry.css` - search there to find what you're overriding.

## Useful Commands

```bash
hugo server         # Development server with hot reload
hugo                # Build site to public/
hugo --gc           # Build and clean cache
```

## Module Dependencies

From `go.sum`, this site uses:
- `github.com/HugoBlox/hugo-blox-builder/modules/blox-tailwind`
- `github.com/HugoBlox/hugo-blox-builder/modules/blox-analytics`
- `github.com/HugoBlox/hugo-blox-builder/modules/blox-plugin-netlify`
