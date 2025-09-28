// Content loading and caching system
import { EventEmitter, Storage, Performance } from './utils.js';
import APP_CONFIG from './config.js';

export class ContentLoader extends EventEmitter {
    constructor() {
        super();
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.retryCount = new Map();
    }

    /**
     * Load content for a specific tab
     * @param {string} tabId - Tab identifier
     * @param {boolean} useCache - Whether to use cached content
     * @returns {Promise<string>} Content HTML
     */
    async loadContent(tabId, useCache = true) {
        Performance.mark(`content-load-start-${tabId}`);

        // Check cache first
        if (useCache && this.cache.has(tabId)) {
            const cached = this.cache.get(tabId);
            if (Date.now() - cached.timestamp < APP_CONFIG.content.cacheTimeout) {
                Performance.mark(`content-load-end-${tabId}`);
                Performance.measure(`content-load-${tabId}`, `content-load-start-${tabId}`, `content-load-end-${tabId}`);
                return cached.content;
            }
        }

        // Check if already loading
        if (this.loadingPromises.has(tabId)) {
            return this.loadingPromises.get(tabId);
        }

        // Start loading
        const loadPromise = this._fetchContent(tabId);
        this.loadingPromises.set(tabId, loadPromise);

        try {
            const content = await loadPromise;

            // Cache successful result
            this.cache.set(tabId, {
                content,
                timestamp: Date.now()
            });

            // Reset retry count on success
            this.retryCount.delete(tabId);

            Performance.mark(`content-load-end-${tabId}`);
            Performance.measure(`content-load-${tabId}`, `content-load-start-${tabId}`, `content-load-end-${tabId}`);

            this.emit('contentLoaded', { tabId, content });
            return content;

        } catch (error) {
            console.error(`Failed to load content for ${tabId}:`, error);
            this.emit('contentError', { tabId, error });
            throw error;
        } finally {
            this.loadingPromises.delete(tabId);
        }
    }

    /**
     * Fetch content from server with retry logic
     * @param {string} tabId - Tab identifier
     * @returns {Promise<string>} Content HTML
     * @private
     */
    async _fetchContent(tabId) {
        const url = `${APP_CONFIG.content.basePath}${tabId}${APP_CONFIG.content.fileExtension}`;
        const retries = this.retryCount.get(tabId) || 0;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'text/html',
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const content = await response.text();

            if (!content.trim()) {
                throw new Error('Empty content received');
            }

            return content;

        } catch (error) {
            if (retries < APP_CONFIG.content.retryAttempts) {
                console.warn(`Retrying content load for ${tabId} (attempt ${retries + 1})`);
                this.retryCount.set(tabId, retries + 1);

                // Wait before retry
                await new Promise(resolve =>
                    setTimeout(resolve, APP_CONFIG.content.retryDelay * (retries + 1))
                );

                return this._fetchContent(tabId);
            }

            // All retries failed, try fallback
            return this._getFallbackContent(tabId, error);
        }
    }

    /**
     * Get fallback content when loading fails
     * @param {string} tabId - Tab identifier
     * @param {Error} error - Original error
     * @returns {string} Fallback HTML content
     * @private
     */
    _getFallbackContent(tabId, error) {
        const tabConfig = APP_CONFIG.tabs.find(tab => tab.id === tabId);
        const tabTitle = tabConfig ? tabConfig.title : tabId;

        return `
            <div class="content-error">
                <div class="text-center py-12">
                    <div class="text-6xl text-red-400 mb-4">⚠️</div>
                    <h2 class="text-2xl font-bold text-red-400 mb-4">Content Unavailable</h2>
                    <p class="text-gray-400 mb-6">
                        Sorry, we couldn't load the content for <strong>${tabTitle}</strong>.
                    </p>
                    <div class="text-sm text-gray-500 mb-6">
                        Error: ${error.message}
                    </div>
                    <button
                        onclick="window.contentLoader.loadContent('${tabId}', false)"
                        class="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Preload content for multiple tabs
     * @param {string[]} tabIds - Array of tab identifiers
     * @returns {Promise<void>}
     */
    async preloadContent(tabIds) {
        if (!Array.isArray(tabIds)) return;

        const promises = tabIds.map(tabId =>
            this.loadContent(tabId).catch(error => {
                console.warn(`Preload failed for ${tabId}:`, error);
                return null;
            })
        );

        await Promise.allSettled(promises);
        this.emit('preloadComplete', { tabIds });
    }

    /**
     * Clear cache for specific tab or all tabs
     * @param {string} [tabId] - Tab identifier (if not provided, clears all)
     */
    clearCache(tabId) {
        if (tabId) {
            this.cache.delete(tabId);
            this.retryCount.delete(tabId);
        } else {
            this.cache.clear();
            this.retryCount.clear();
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        const stats = {
            totalCached: this.cache.size,
            cacheSize: 0,
            items: []
        };

        this.cache.forEach((value, key) => {
            const size = new Blob([value.content]).size;
            stats.cacheSize += size;
            stats.items.push({
                tabId: key,
                size,
                timestamp: value.timestamp,
                age: Date.now() - value.timestamp
            });
        });

        return stats;
    }

    /**
     * Save content to persistent storage
     * @param {string} tabId - Tab identifier
     * @param {string} content - Content to save
     */
    saveToStorage(tabId, content) {
        if (!Storage.set(`content_${tabId}`, {
            content,
            timestamp: Date.now(),
            version: APP_CONFIG.version || '1.0.0'
        })) {
            console.warn(`Failed to save content for ${tabId} to storage`);
        }
    }

    /**
     * Load content from persistent storage
     * @param {string} tabId - Tab identifier
     * @returns {string|null} Stored content or null
     */
    loadFromStorage(tabId) {
        const stored = Storage.get(`content_${tabId}`);

        if (!stored || !stored.content) {
            return null;
        }

        // Check if stored content is too old
        const age = Date.now() - stored.timestamp;
        if (age > APP_CONFIG.content.cacheTimeout * 2) {
            Storage.remove(`content_${tabId}`);
            return null;
        }

        return stored.content;
    }

    /**
     * Initialize content loader with offline support
     */
    init() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.emit('connectionChange', { online: true });
        });

        window.addEventListener('offline', () => {
            this.emit('connectionChange', { online: false });
        });

        // Preload critical content
        if (navigator.onLine && APP_CONFIG.performance.preloadAdjacentTabs) {
            const criticalTabs = ['string', 'vector', 'algorithms'];
            this.preloadContent(criticalTabs);
        }
    }
}

// Create singleton instance
export const contentLoader = new ContentLoader();

// Make it globally available for fallback buttons
window.contentLoader = contentLoader;