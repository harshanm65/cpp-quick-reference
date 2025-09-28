// C++ STL Interactive Cheat Sheet - Main Application
class CPPGuideApp {
    constructor() {
        this.currentTab = null;
        this.contentCache = new Map();
        this.tocContainer = null;
        this.scrollTimer = null;
        this.activeSection = null;
        this.tabsConfig = [
            { id: 'string', label: 'std::string', file: 'string.html' },
            { id: 'stringstream', label: 'std::stringstream', file: 'stringstream.html' },
            { id: 'vector', label: 'std::vector', file: 'vector.html' },
            { id: 'map', label: 'std::map', file: 'map.html' },
            { id: 'unordered_map', label: 'std::unordered_map', file: 'unordered_map.html' },
            { id: 'set', label: 'std::set', file: 'set.html' },
            { id: 'unordered_set', label: 'std::unordered_set', file: 'unordered_set.html' },
            { id: 'priority_queue', label: 'std::priority_queue', file: 'priority_queue.html' },
            { id: 'list', label: 'std::list', file: 'list.html' },
            { id: 'queue', label: 'std::queue', file: 'queue.html' },
            { id: 'stack', label: 'std::stack', file: 'stack.html' },
            { id: 'deque', label: 'std::deque', file: 'deque.html' },
            { id: 'algorithms', label: 'Algorithms', file: 'algorithms.html' },
            { id: 'smart_pointers', label: 'Smart Pointers', file: 'smart_pointers.html' },
            { id: 'concurrency', label: 'Concurrency', file: 'concurrency.html' },
            { id: 'coroutines', label: 'Coroutines', file: 'coroutines.html' },
            { id: 'oop', label: 'OOP Concepts', file: 'oop.html' },
            { id: 'custom_types', label: 'Custom Types', file: 'custom_types.html' }
        ];

        this.init();
    }

    async init() {
        console.log('Initializing C++ Guide App...');
        this.createTabs();
        this.setupEventListeners();
        this.setupSmoothScrolling();

        // Load first tab by default
        if (this.tabsConfig.length > 0) {
            console.log('Loading first tab:', this.tabsConfig[0].id);
            await this.switchTab(this.tabsConfig[0].id);
        }

        this.hideLoading();
        console.log('App initialized successfully');
    }

    createTabs() {
        const tabContainer = document.getElementById('tab-container');
        if (!tabContainer) return;

        tabContainer.innerHTML = '';

        this.tabsConfig.forEach(tab => {
            const button = document.createElement('button');
            button.dataset.tab = tab.id;
            button.className = 'tab-button bg-gray-700 hover:bg-cyan-500 hover:text-white text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors duration-300';
            button.textContent = tab.label;
            tabContainer.appendChild(button);
        });
    }

    setupEventListeners() {
        const tabContainer = document.getElementById('tab-container');
        if (!tabContainer) return;

        tabContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('tab-button')) {
                const tabId = e.target.dataset.tab;
                await this.switchTab(tabId);
            }
        });
    }

    async switchTab(tabId) {
        try {
            this.showLoading();

            // Update tab visual states
            this.updateTabStates(tabId);

            // Load and display content
            const content = await this.loadContent(tabId);
            this.displayContent(content);

            // Highlight syntax
            this.highlightSyntax();

            // Generate TOC for the new content
            this.generateTOC();

            // Setup scroll spy for the new content
            this.setupScrollSpy();

            this.currentTab = tabId;
        } catch (error) {
            console.error('Error switching tab:', error);
            this.showError('Failed to load content. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    updateTabStates(activeTabId) {
        const tabs = document.querySelectorAll('.tab-button');
        const activeClasses = 'bg-cyan-500 text-white';
        const inactiveClasses = 'bg-gray-700 text-gray-200 hover:bg-cyan-500 hover:text-white';

        tabs.forEach(tab => {
            const tabId = tab.dataset.tab;

            // Remove all state classes
            tab.className = 'tab-button font-semibold py-2 px-4 rounded-lg transition-colors duration-300';

            // Add appropriate state classes
            if (tabId === activeTabId) {
                tab.className += ` ${activeClasses}`;
            } else {
                tab.className += ` ${inactiveClasses}`;
            }
        });
    }

    async loadContent(tabId) {
        // Check cache first
        if (this.contentCache.has(tabId)) {
            console.log('Loading content from cache for:', tabId);
            return this.contentCache.get(tabId);
        }

        // Find tab configuration
        const tabConfig = this.tabsConfig.find(tab => tab.id === tabId);
        if (!tabConfig) {
            throw new Error(`Tab configuration not found for: ${tabId}`);
        }

        console.log('Fetching content for:', tabId, 'from:', `content/${tabConfig.file}`);

        // Load content from file
        const response = await fetch(`content/${tabConfig.file}`);
        if (!response.ok) {
            console.error('Failed to fetch content:', response.status, response.statusText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const content = await response.text();
        console.log('Content loaded, length:', content.length);

        // Cache the content
        this.contentCache.set(tabId, content);

        return content;
    }

    displayContent(content) {
        const contentContainer = document.getElementById('content-container');
        if (!contentContainer) {
            console.error('Content container not found!');
            return;
        }

        console.log('Displaying content in container:', contentContainer);
        console.log('Content preview:', content.substring(0, 200) + '...');

        contentContainer.innerHTML = content;

        // Find the tab-content div and make it visible
        const tabContentDiv = contentContainer.querySelector('.tab-content');
        if (tabContentDiv) {
            tabContentDiv.classList.add('active');
            console.log('Added active class to tab content');
        }

        console.log('Content displayed. Container innerHTML length:', contentContainer.innerHTML.length);

        // Scroll to top of page when new content is loaded
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    highlightSyntax() {
        // Re-highlight all code blocks
        if (window.Prism) {
            window.Prism.highlightAll();
        }
    }

    showLoading() {
        const contentContainer = document.getElementById('content-container');
        if (!contentContainer) return;

        contentContainer.innerHTML = `
            <div id="loading" class="text-center text-gray-400">
                <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                <p>Loading content...</p>
            </div>
        `;
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.remove();
        }
    }

    showError(message) {
        const contentContainer = document.getElementById('content-container');
        if (!contentContainer) return;

        contentContainer.innerHTML = `
            <div class="text-center text-red-400">
                <div class="text-6xl mb-4">⚠️</div>
                <h3 class="text-xl font-semibold mb-2">Error Loading Content</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300">
                    Reload Page
                </button>
            </div>
        `;
    }

    setupSmoothScrolling() {
        // Add smooth scrolling CSS behavior
        document.documentElement.style.scrollBehavior = 'smooth';
    }

    generateTOC() {
        const contentContainer = document.getElementById('content-container');
        const sidebar = document.getElementById('sidebar');

        if (!contentContainer || !sidebar) return;

        // Clear existing TOC from sidebar
        sidebar.innerHTML = '';

        // Remove any existing inline TOC from content
        const existingInlineTOCs = contentContainer.querySelectorAll('.toc-container');
        existingInlineTOCs.forEach(toc => toc.remove());

        // Find all headings in the content
        const headings = contentContainer.querySelectorAll('h2, h3, h4, h5');
        if (headings.length === 0) {
            // If no headings, show a message in sidebar
            sidebar.innerHTML = '<div class="toc-container"><p class="text-gray-400 text-center">No table of contents available</p></div>';
            return;
        }

        // Create TOC container
        const tocContainer = document.createElement('div');
        tocContainer.id = 'toc-container';
        tocContainer.className = 'toc-container';

        // Create TOC header
        const tocHeader = document.createElement('h3');
        tocHeader.textContent = 'Table of Contents';
        tocHeader.className = 'toc-header';
        tocContainer.appendChild(tocHeader);

        // Create TOC list
        const tocList = document.createElement('ul');
        tocList.className = 'toc-list';

        headings.forEach((heading, index) => {
            // Generate unique ID for the heading if it doesn't have one
            if (!heading.id) {
                heading.id = `heading-${index}-${heading.textContent.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`;
            }

            // Create TOC item
            const tocItem = document.createElement('li');
            const tocLink = document.createElement('a');

            tocLink.href = `#${heading.id}`;
            tocLink.textContent = heading.textContent;
            tocLink.className = `toc-link toc-level-${heading.tagName.toLowerCase()}`;

            // Add click handler for smooth scrolling
            tocLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToSection(heading.id);
            });

            tocItem.appendChild(tocLink);
            tocList.appendChild(tocItem);
        });

        tocContainer.appendChild(tocList);

        // Place TOC in sidebar
        sidebar.appendChild(tocContainer);

        this.tocContainer = tocContainer;
    }

    scrollToSection(sectionId) {
        const targetElement = document.getElementById(sectionId);
        if (!targetElement) return;

        // Calculate offset from top of page
        const elementRect = targetElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset + elementRect.top - 100; // 100px offset for header

        // Scroll the window/document to the target position
        window.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
        });

        // Update URL hash without triggering scroll
        if (history.replaceState) {
            history.replaceState(null, null, `#${sectionId}`);
        }
    }

    setupScrollSpy() {
        if (!this.tocContainer) return;

        // Remove existing scroll listener
        if (this.scrollSpyListener) {
            window.removeEventListener('scroll', this.scrollSpyListener);
        }

        // Create throttled scroll handler
        this.scrollSpyListener = this.throttle(() => {
            this.updateActiveSection();
        }, 100);

        window.addEventListener('scroll', this.scrollSpyListener);
    }

    updateActiveSection() {
        const contentContainer = document.getElementById('content-container');
        if (!contentContainer) return;

        const headings = contentContainer.querySelectorAll('h2, h3, h4, h5');
        const tocLinks = this.tocContainer?.querySelectorAll('.toc-link');
        if (!headings.length || !tocLinks?.length) return;

        let activeHeading = null;
        const scrollTop = window.pageYOffset;

        // Find the heading that's currently in view
        for (let i = 0; i < headings.length; i++) {
            const heading = headings[i];
            const rect = heading.getBoundingClientRect();
            const headingTop = scrollTop + rect.top;

            // Check if heading is above the current scroll position (with some offset)
            if (headingTop <= scrollTop + 150) {
                activeHeading = heading;
            } else {
                break;
            }
        }

        // Update active state
        if (activeHeading && this.activeSection !== activeHeading.id) {
            this.activeSection = activeHeading.id;

            // Remove active class from all TOC links
            tocLinks.forEach(link => link.classList.remove('toc-active'));

            // Add active class to current section's TOC link
            const activeLink = this.tocContainer.querySelector(`a[href="#${activeHeading.id}"]`);
            if (activeLink) {
                activeLink.classList.add('toc-active');
            }
        }
    }

    // Utility function for throttling scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Public API for external access
    getCurrentTab() {
        return this.currentTab;
    }

    async goToTab(tabId) {
        await this.switchTab(tabId);
    }

    clearCache() {
        this.contentCache.clear();
    }
}

// Initialize the application when DOM is loaded
function initializeApp() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.cppGuideApp = new CPPGuideApp();
        });
    } else {
        // DOM is already loaded
        window.cppGuideApp = new CPPGuideApp();
    }
}

// Initialize immediately
initializeApp();

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CPPGuideApp;
}