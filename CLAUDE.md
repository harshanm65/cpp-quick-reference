# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a C++ STL Quick Reference webapp - a single-page application (SPA) built with vanilla JavaScript that provides an interactive reference guide for C++ Standard Template Library components. The application uses dynamic content loading, automatic table of contents generation, and modern responsive design.

## Architecture

### Core Application Structure
- **Main Entry Point**: `index.html` - Modern SPA with sidebar navigation
- **Legacy Version**: `cpp_guide.html` - Older monolithic version (1336 lines)
- **Application Controller**: `js/app.js` - Main `CPPGuideApp` class handling navigation, content loading, and UI management

### JavaScript Architecture (4 modules, 1132 total lines)
- **`js/app.js`** (417 lines) - Core SPA logic, tab switching, TOC generation, scroll spy
- **`js/content-loader.js`** (269 lines) - Advanced content loading with caching, retry logic, performance monitoring
- **`js/utils.js`** (388 lines) - Utility classes (EventEmitter, Storage, Performance tools, debounce/throttle)
- **`js/config.js`** (58 lines) - Application configuration and tab definitions

### Content System
- **19 HTML content modules** in `/content/` directory covering STL containers, algorithms, concurrency, etc.
- **Dynamic content loading** - Content files are loaded via fetch() and cached in memory
- **Consistent content structure** - Each file follows standardized format with TOC containers and section IDs
- **Automatic TOC generation** - Sidebar TOC is dynamically generated from content headings

### Styling System
- **Tailwind CSS** (via CDN) for utility classes
- **Custom CSS** in 3 files: `main.css` (base styles), `components.css` (sidebar/navigation), `syntax-highlighting.css` (Prism.js customization)
- **Responsive sidebar layout** - Fixed 30% sidebar converts to stacked layout on mobile

## Development Workflow

### No Build Process
- Direct file serving - no webpack, gulp, or build tools required
- All dependencies loaded via CDN (Tailwind CSS, Prism.js)
- No package.json or npm dependencies

### Local Development
```bash
# Serve files locally (any simple HTTP server)
python3 -m http.server 8000
# or
npx serve .
```

### Content Updates
When adding new C++ topics:
1. Create new HTML file in `/content/` directory following existing structure
2. Add tab configuration to `js/config.js` tabs array
3. Ensure content includes proper heading hierarchy for TOC generation
4. Test content loading and navigation

## Key Implementation Details

### Content Loading System
- **Caching strategy** - Content cached in memory Map with timestamp validation
- **Error handling** - Graceful fallbacks with user-friendly error messages
- **Loading states** - Visual indicators prevent duplicate requests

### Navigation Features
- **Scroll spy** - Automatically highlights current section in TOC based on scroll position
- **Smooth scrolling** - Enhanced UX with CSS `scroll-behavior: smooth`
- **Responsive behavior** - Sidebar navigation adapts to screen size

### Performance Optimizations
- **Throttled scroll events** for scroll spy functionality
- **Debounced user interactions** where appropriate
- **Content caching** prevents redundant HTTP requests
- **Lazy loading** of content modules

## File Organization

```
/
├── index.html          # Modern SPA entry point
├── cpp_guide.html      # Legacy monolithic version
├── content/           # 19 HTML content modules
│   ├── vector.html    # STL containers
│   ├── algorithms.html # STL algorithms
│   └── ...
├── css/              # 3 CSS files
│   ├── main.css      # Base styles, responsive design
│   ├── components.css # Sidebar, navigation, cards
│   └── syntax-highlighting.css # Code highlighting
└── js/               # 4 JavaScript modules
    ├── app.js        # Main application controller
    ├── content-loader.js # Content loading system
    ├── utils.js      # Utility functions and classes
    └── config.js     # Application configuration
```

## Technical Considerations

### Code Patterns
- **Class-based architecture** with clear separation of concerns
- **Event-driven design** using custom EventEmitter
- **Promise-based async operations** for content loading
- **Consistent naming** - kebab-case for IDs/classes, camelCase for JavaScript

### Content Structure
Each content file should follow this pattern:
```html
<div id="{topic}-content" class="tab-content">
    <h2>Topic Title</h2>
    <p>Description with performance notes</p>
    <div class="space-y-12">
        <div>
            <h3 id="section-name">Section Name</h3>
            <!-- Content with code examples -->
        </div>
    </div>
</div>
```

### Dependencies
- **Tailwind CSS** - Utility-first CSS framework
- **Prism.js** - Syntax highlighting for code blocks
- **No runtime dependencies** - Pure vanilla JavaScript implementation