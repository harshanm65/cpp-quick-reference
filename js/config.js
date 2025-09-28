// Application configuration
export const APP_CONFIG = {
    // Available tabs and their configurations
    tabs: [
        { id: 'string', title: 'std::string', description: 'String manipulation and utilities' },
        { id: 'stringstream', title: 'std::stringstream', description: 'String stream operations' },
        { id: 'vector', title: 'std::vector', description: 'Dynamic arrays' },
        { id: 'map', title: 'std::map', description: 'Ordered key-value pairs' },
        { id: 'unordered_map', title: 'std::unordered_map', description: 'Hash-based key-value pairs' },
        { id: 'set', title: 'std::set', description: 'Ordered unique elements' },
        { id: 'unordered_set', title: 'std::unordered_set', description: 'Hash-based unique elements' },
        { id: 'priority_queue', title: 'std::priority_queue', description: 'Heap-based priority queue' },
        { id: 'list', title: 'std::list', description: 'Doubly-linked list' },
        { id: 'queue', title: 'std::queue', description: 'FIFO queue' },
        { id: 'stack', title: 'std::stack', description: 'LIFO stack' },
        { id: 'deque', title: 'std::deque', description: 'Double-ended queue' },
        { id: 'algorithms', title: 'Algorithms', description: 'STL algorithms and utilities' },
        { id: 'smart_pointers', title: 'Smart Pointers', description: 'Memory management' },
        { id: 'concurrency', title: 'Concurrency', description: 'Multithreading primitives' },
        { id: 'coroutines', title: 'Coroutines', description: 'C++20 coroutines' },
        { id: 'oop', title: 'OOP Concepts', description: 'Object-oriented programming' },
        { id: 'custom_types', title: 'Custom Types', description: 'Using custom types in containers' }
    ],

    // Content loading settings
    content: {
        basePath: './content/',
        fileExtension: '.html',
        cacheTimeout: 5 * 60 * 1000, // 5 minutes
        retryAttempts: 3,
        retryDelay: 1000 // 1 second
    },

    // UI settings
    ui: {
        animationDuration: 300,
        loadingTimeout: 10000, // 10 seconds
        tabTransitionDelay: 100,
        scrollBehavior: 'smooth'
    },

    // Performance settings
    performance: {
        lazyLoadImages: true,
        preloadAdjacentTabs: true,
        enableVirtualScrolling: false,
        debounceDelay: 300
    },

    // Analytics and tracking (if needed)
    analytics: {
        enabled: false,
        trackPageViews: true,
        trackTabSwitches: true,
        trackCodeCopies: true
    }
};

export default APP_CONFIG;