// Utility functions

/**
 * Debounce function to limit the rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Whether to call immediately
 * @returns {Function} Debounced function
 */
export function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

/**
 * Throttle function to limit function calls to once per interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Simple event emitter for component communication
 */
export class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(data));
    }
}

/**
 * DOM utility functions
 */
export const DOM = {
    /**
     * Create an element with attributes and children
     * @param {string} tag - HTML tag name
     * @param {Object} attrs - Element attributes
     * @param {...(string|Element)} children - Child elements or text
     * @returns {Element} Created element
     */
    create(tag, attrs = {}, ...children) {
        const element = document.createElement(tag);

        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Element) {
                element.appendChild(child);
            }
        });

        return element;
    },

    /**
     * Query selector with error handling
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (default: document)
     * @returns {Element|null} Found element
     */
    $(selector, parent = document) {
        try {
            return parent.querySelector(selector);
        } catch (error) {
            console.error('Invalid selector:', selector, error);
            return null;
        }
    },

    /**
     * Query all selector with error handling
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (default: document)
     * @returns {NodeList} Found elements
     */
    $$(selector, parent = document) {
        try {
            return parent.querySelectorAll(selector);
        } catch (error) {
            console.error('Invalid selector:', selector, error);
            return [];
        }
    },

    /**
     * Add class(es) to element
     * @param {Element} element - Target element
     * @param {...string} classes - Classes to add
     */
    addClass(element, ...classes) {
        if (element && element.classList) {
            element.classList.add(...classes);
        }
    },

    /**
     * Remove class(es) from element
     * @param {Element} element - Target element
     * @param {...string} classes - Classes to remove
     */
    removeClass(element, ...classes) {
        if (element && element.classList) {
            element.classList.remove(...classes);
        }
    },

    /**
     * Toggle class on element
     * @param {Element} element - Target element
     * @param {string} className - Class to toggle
     * @param {boolean} force - Force add/remove
     * @returns {boolean} Whether class is present after toggle
     */
    toggleClass(element, className, force) {
        if (element && element.classList) {
            return element.classList.toggle(className, force);
        }
        return false;
    }
};

/**
 * Animation utilities
 */
export const Animation = {
    /**
     * Fade in element
     * @param {Element} element - Element to animate
     * @param {number} duration - Animation duration in milliseconds
     * @returns {Promise} Animation completion promise
     */
    fadeIn(element, duration = 300) {
        return new Promise(resolve => {
            if (!element) {
                resolve();
                return;
            }

            element.style.opacity = '0';
            element.style.display = 'block';
            element.style.transition = `opacity ${duration}ms ease-in-out`;

            requestAnimationFrame(() => {
                element.style.opacity = '1';
                setTimeout(() => {
                    element.style.transition = '';
                    resolve();
                }, duration);
            });
        });
    },

    /**
     * Fade out element
     * @param {Element} element - Element to animate
     * @param {number} duration - Animation duration in milliseconds
     * @returns {Promise} Animation completion promise
     */
    fadeOut(element, duration = 300) {
        return new Promise(resolve => {
            if (!element) {
                resolve();
                return;
            }

            element.style.opacity = '1';
            element.style.transition = `opacity ${duration}ms ease-in-out`;

            requestAnimationFrame(() => {
                element.style.opacity = '0';
                setTimeout(() => {
                    element.style.display = 'none';
                    element.style.transition = '';
                    resolve();
                }, duration);
            });
        });
    },

    /**
     * Slide down element
     * @param {Element} element - Element to animate
     * @param {number} duration - Animation duration in milliseconds
     * @returns {Promise} Animation completion promise
     */
    slideDown(element, duration = 300) {
        return new Promise(resolve => {
            if (!element) {
                resolve();
                return;
            }

            element.style.overflow = 'hidden';
            element.style.height = '0px';
            element.style.display = 'block';

            const height = element.scrollHeight;
            element.style.transition = `height ${duration}ms ease-out`;

            requestAnimationFrame(() => {
                element.style.height = height + 'px';
                setTimeout(() => {
                    element.style.height = '';
                    element.style.overflow = '';
                    element.style.transition = '';
                    resolve();
                }, duration);
            });
        });
    }
};

/**
 * Storage utilities
 */
export const Storage = {
    /**
     * Get item from localStorage with JSON parsing
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Stored value or default
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },

    /**
     * Set item in localStorage with JSON stringification
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {boolean} Success status
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }
};

/**
 * URL utilities
 */
export const URL = {
    /**
     * Get URL parameter value
     * @param {string} name - Parameter name
     * @param {string} url - URL to parse (default: current URL)
     * @returns {string|null} Parameter value
     */
    getParam(name, url = window.location.href) {
        const urlParams = new URLSearchParams(new URL(url).search);
        return urlParams.get(name);
    },

    /**
     * Set URL parameter without page reload
     * @param {string} name - Parameter name
     * @param {string} value - Parameter value
     * @param {boolean} replaceState - Use replaceState instead of pushState
     */
    setParam(name, value, replaceState = false) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);

        const method = replaceState ? 'replaceState' : 'pushState';
        window.history[method]({}, '', url);
    },

    /**
     * Remove URL parameter
     * @param {string} name - Parameter name
     * @param {boolean} replaceState - Use replaceState instead of pushState
     */
    removeParam(name, replaceState = false) {
        const url = new URL(window.location);
        url.searchParams.delete(name);

        const method = replaceState ? 'replaceState' : 'pushState';
        window.history[method]({}, '', url);
    }
};

/**
 * Performance monitoring utilities
 */
export const Performance = {
    /**
     * Mark performance timing
     * @param {string} name - Mark name
     */
    mark(name) {
        if (window.performance && window.performance.mark) {
            window.performance.mark(name);
        }
    },

    /**
     * Measure performance between marks
     * @param {string} name - Measure name
     * @param {string} startMark - Start mark name
     * @param {string} endMark - End mark name
     * @returns {number} Duration in milliseconds
     */
    measure(name, startMark, endMark) {
        if (window.performance && window.performance.measure) {
            window.performance.measure(name, startMark, endMark);
            const entries = window.performance.getEntriesByName(name);
            return entries.length > 0 ? entries[entries.length - 1].duration : 0;
        }
        return 0;
    }
};