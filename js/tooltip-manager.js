(function(global) {
    const DEFAULT_TOOLTIP_DEFINITIONS = [
        {
            id: 'decltype',
            triggers: [/\bdecltype\b/],
            title: 'decltype',
            body: '<p>Deduce the type of an expression at compile time without evaluating it.</p><pre><code class="language-cpp">int value = 42;\nauto lambda = [&value]() { return value; };\ndecltype(lambda()) copy = value; // copy is int</code></pre>'
        },
        {
            id: 'std-move',
            triggers: [/std::move/, /\bmove\b(?=\s*\()/],
            title: 'std::move',
            body: '<p>Cast an object to an rvalue so move-aware APIs can transfer its resources.</p><pre><code class="language-cpp">std::string source = "abc";\nstd::string dest = std::move(source); // source becomes empty</code></pre>'
        },
        {
            id: 'std-forward',
            triggers: [/std::forward/],
            title: 'std::forward',
            body: '<p>Preserve the value category of a forwarded template argument inside forwarding functions.</p><pre><code class="language-cpp">template <typename T>\nvoid wrapper(T&& arg) {\n    callee(std::forward<T>(arg));\n}</code></pre>'
        },
        {
            id: 'unique-ptr',
            triggers: [/std::unique_ptr/, /\bunique_ptr\b/],
            title: 'std::unique_ptr',
            body: '<p>Exclusive-owning smart pointer that deletes its resource when leaving scope.</p><pre><code class="language-cpp">auto ptr = std::make_unique<int>(42);\nif (ptr) { /* use *ptr */ }</code></pre>'
        },
        {
            id: 'shared-ptr',
            triggers: [/std::shared_ptr/, /\bshared_ptr\b/],
            title: 'std::shared_ptr',
            body: '<p>Reference-counted smart pointer that frees the resource when the last owner dies.</p><pre><code class="language-cpp">auto shared = std::make_shared<std::vector<int>>(5, 1);\nauto copy = shared; // increments use-count</code></pre>'
        },
        {
            id: 'weak-ptr',
            triggers: [/std::weak_ptr/, /\bweak_ptr\b/],
            title: 'std::weak_ptr',
            body: '<p>Non-owning weak reference that lets you observe a std::shared_ptr without extending its lifetime.</p><pre><code class="language-cpp">std::weak_ptr<int> weak = shared;\nif (auto locked = weak.lock()) { /* safe access */ }</code></pre>'
        },
        {
            id: 'make-unique',
            triggers: [/std::make_unique/],
            title: 'std::make_unique',
            body: '<p>Factory helper that allocates an object and returns a std::unique_ptr with exception safety.</p><pre><code class="language-cpp">auto logger = std::make_unique<Logger>("app.log");</code></pre>'
        },
        {
            id: 'make-shared',
            triggers: [/std::make_shared/],
            title: 'std::make_shared',
            body: '<p>Allocate control block and object in one step, returning a std::shared_ptr.</p><pre><code class="language-cpp">auto config = std::make_shared<Config>("prod.json");</code></pre>'
        },
        {
            id: 'enable-shared-from-this',
            triggers: [/std::enable_shared_from_this/],
            title: 'std::enable_shared_from_this',
            body: '<p>Base class that lets an object create shared_ptr instances to itself safely.</p><pre><code class="language-cpp">struct Session : std::enable_shared_from_this<Session> {\n    void start() { queue(shared_from_this()); }\n};</code></pre>'
        },
        {
            id: 'lock-guard',
            triggers: [/std::lock_guard/],
            title: 'std::lock_guard',
            body: '<p>RAII wrapper that acquires a mutex in its constructor and releases it in the destructor.</p><pre><code class="language-cpp">std::mutex m;\n{\n    std::lock_guard<std::mutex> guard(m);\n    // protected section\n}</code></pre>'
        },
        {
            id: 'scoped-lock',
            triggers: [/std::scoped_lock/],
            title: 'std::scoped_lock',
            body: '<p>RAII lock that can take multiple mutexes and avoids deadlock by locking them atomically.</p><pre><code class="language-cpp">std::scoped_lock guard(mutexA, mutexB);</code></pre>'
        },
        {
            id: 'unique-lock',
            triggers: [/std::unique_lock/],
            title: 'std::unique_lock',
            body: '<p>Flexible mutex guard that supports deferred locking, try_lock, and manual unlock/lock.</p><pre><code class="language-cpp">std::unique_lock<std::mutex> lock(m, std::defer_lock);\nif (lock.try_lock()) { /* ... */ }</code></pre>'
        },
        {
            id: 'async',
            triggers: [/std::async/],
            title: 'std::async',
            body: '<p>Launch a task asynchronously and get a std::future representing its eventual result.</p><pre><code class="language-cpp">auto fut = std::async(std::launch::async, compute);\nauto value = fut.get();</code></pre>'
        },
        {
            id: 'future',
            triggers: [/std::future/],
            title: 'std::future',
            body: '<p>Read-only handle that retrieves the result of an asynchronous computation.</p><pre><code class="language-cpp">std::future<int> fut = promise.get_future();\nint result = fut.get();</code></pre>'
        },
        {
            id: 'promise',
            triggers: [/std::promise/],
            title: 'std::promise',
            body: '<p>Producer side of a future; set a value or exception that a std::future will observe.</p><pre><code class="language-cpp">std::promise<int> promise;\nauto fut = promise.get_future();\npromise.set_value(42);</code></pre>'
        },
        {
            id: 'condition-variable',
            triggers: [/std::condition_variable/],
            title: 'std::condition_variable',
            body: '<p>Synchronization primitive used to block threads until notified by another thread.</p><pre><code class="language-cpp">std::condition_variable cv;\ncv.wait(lock, [&] { return ready; });</code></pre>'
        },
        {
            id: 'atomic',
            triggers: [/std::atomic/],
            title: 'std::atomic',
            body: '<p>Lock-free (when possible) wrapper that provides atomic operations on the underlying type.</p><pre><code class="language-cpp">std::atomic<int> counter{0};\n++counter;</code></pre>'
        },
        {
            id: 'optional',
            triggers: [/std::optional/, /\boptional\b/],
            title: 'std::optional',
            body: '<p>Type-safe wrapper that may or may not contain a value.</p><pre><code class="language-cpp">std::optional<std::string> name;\nname = "Ada";\nif (name) { use(*name); }</code></pre>'
        },
        {
            id: 'variant',
            triggers: [/std::variant/, /\bvariant\b/],
            title: 'std::variant',
            body: '<p>Type-safe union that can hold one of several alternative types at a time.</p><pre><code class="language-cpp">std::variant<int, std::string> v = 42;\nv = std::string{"text"};</code></pre>'
        },
        {
            id: 'visit',
            triggers: [/std::visit/, /\bvisit\b\s*\(/],
            title: 'std::visit',
            body: '<p>Apply a visitor callable to the active alternative stored inside a std::variant.</p><pre><code class="language-cpp">std::visit([](const auto& value) { std::cout << value; }, v);</code></pre>'
        },
        {
            id: 'tie',
            triggers: [/std::tie/, /\btie\b\s*\(/],
            title: 'std::tie',
            body: '<p>Create a tuple of lvalue references, often used to unpack multiple return values.</p><pre><code class="language-cpp">int x, y;\nstd::tie(x, y) = std::pair{1, 2};</code></pre>'
        },
        {
            id: 'emplace',
            triggers: [/\bemplace_back\b/, /\bemplace\b/],
            title: 'emplace*',
            body: '<p>Construct elements in-place inside a container, forwarding constructor arguments.</p><pre><code class="language-cpp">std::vector<std::string> names;\nnames.emplace_back("Ada", 3);</code></pre>'
        },
        {
            id: 'decltype',
            triggers: [/\bdecltype\b/],
            title: 'decltype',
            body: '<p>Compile-time type deduction operator that returns the type of an expression without evaluating it.</p><pre><code class="language-cpp">int x = 42;\ndecltype(x) y = 10; // y is int\n\nauto func() -> int { return 5; }\ndecltype(func()) z = 3; // z is int</code></pre>'
        },
        {
            id: 'raii',
            triggers: [/\bRAII\b/],
            title: 'RAII',
            body: '<p>Resource Acquisition Is Initialization - programming idiom where resource management is tied to object lifetime.</p><pre><code class="language-cpp">class FileWrapper {\n    FILE* file;\npublic:\n    FileWrapper(const char* name) : file(fopen(name, "r")) {}\n    ~FileWrapper() { if(file) fclose(file); }\n};</code></pre>'
        },
        {
            id: 'alignas',
            triggers: [/\balignas\b/],
            title: 'alignas',
            body: '<p>Specifies the alignment requirement of a type or object, useful for SIMD operations and cache optimization.</p><pre><code class="language-cpp">alignas(16) float data[4]; // 16-byte aligned for SIMD\nalignas(64) struct CacheAligned {\n    int values[16];\n};</code></pre>'
        },
        {
            id: 'constexpr',
            triggers: [/\bconstexpr\b/],
            title: 'constexpr',
            body: '<p>Specifies that a function or variable can be evaluated at compile time.</p><pre><code class="language-cpp">constexpr int factorial(int n) {\n    return n <= 1 ? 1 : n * factorial(n - 1);\n}\n\nconstexpr int result = factorial(5); // Computed at compile time</code></pre>'
        },
        {
            id: 'noexcept',
            triggers: [/\bnoexcept\b/],
            title: 'noexcept',
            body: '<p>Specifies that a function does not throw exceptions, enabling optimizations.</p><pre><code class="language-cpp">void safe_function() noexcept {\n    // Guaranteed not to throw\n}\n\n// Conditional noexcept\ntemplate<typename T>\nvoid conditional(T&& t) noexcept(noexcept(t.process()));</code></pre>'
        },
        {
            id: 'auto-keyword',
            triggers: [/\bauto\b(?!\s*=)/],
            title: 'auto',
            body: '<p>Automatic type deduction that lets the compiler determine the type of a variable from its initializer.</p><pre><code class="language-cpp">auto x = 42;        // int\nauto y = 3.14;      // double\nauto z = "hello";   // const char*\nauto ptr = std::make_unique<int>(10);</code></pre>'
        },
        {
            id: 'lambda',
            triggers: [/\blambda\b/, /\[\s*[^\]]*\s*\]/],
            title: 'Lambda Expression',
            body: '<p>Anonymous function objects that can capture variables from their scope.</p><pre><code class="language-cpp">auto lambda = [](int x) { return x * 2; };\nint result = lambda(5); // 10\n\n// With capture\nint multiplier = 3;\nauto capture_lambda = [multiplier](int x) {\n    return x * multiplier;\n};</code></pre>'
        },
        {
            id: 'sfinae',
            triggers: [/\bSFINAE\b/],
            title: 'SFINAE',
            body: '<p>Substitution Failure Is Not An Error - principle that allows template overload resolution to work properly.</p><pre><code class="language-cpp">// If substitution fails for a template,\n// it\'s not an error, just removes it from consideration\ntemplate<typename T>\nauto func(T t) -> decltype(t.size()) {\n    return t.size(); // Only works if T has size() method\n}</code></pre>'
        },
        {
            id: 'enable-if',
            triggers: [/std::enable_if/, /\benable_if\b/],
            title: 'std::enable_if',
            body: '<p>SFINAE utility for conditionally enabling template instantiations based on type traits.</p><pre><code class="language-cpp">template<typename T>\ntypename std::enable_if<std::is_integral<T>::value, T>::type\nprocess(T value) {\n    return value * 2; // Only for integral types\n}</code></pre>'
        },
        {
            id: 'perfect-forwarding',
            triggers: [/perfect forwarding/, /universal reference/],
            title: 'Perfect Forwarding',
            body: '<p>Technique to preserve the value category (lvalue/rvalue) of arguments when forwarding them to another function.</p><pre><code class="language-cpp">template<typename T>\nvoid wrapper(T&& arg) {\n    // Forward arg preserving its value category\n    target_function(std::forward<T>(arg));\n}</code></pre>'
        },
        {
            id: 'move-semantics',
            triggers: [/move semantics/],
            title: 'Move Semantics',
            body: '<p>C++11 feature that allows efficient transfer of resources from one object to another, avoiding unnecessary copies.</p><pre><code class="language-cpp">std::string source = "Hello";\nstd::string dest = std::move(source);\n// source is now in valid but unspecified state\n// dest contains "Hello" without copying</code></pre>'
        },
        {
            id: 'template-specialization',
            triggers: [/template specialization/],
            title: 'Template Specialization',
            body: '<p>Mechanism to provide specific implementations of a template for particular types.</p><pre><code class="language-cpp">template<typename T>\nstruct TypeName { static constexpr const char* value = "unknown"; };\n\n// Specialization for int\ntemplate<>\nstruct TypeName<int> { static constexpr const char* value = "integer"; };</code></pre>'
        }
    ];

    class TooltipManager {
        constructor(definitions = DEFAULT_TOOLTIP_DEFINITIONS) {
            this.definitions = definitions.map(def => ({
                ...def,
                triggers: (def.triggers || []).map(pattern => new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'))
            }));

            this.definitionMap = new Map();
            this.definitions.forEach(def => this.definitionMap.set(def.id, def));

            this.tooltipElement = this.createTooltipElement();
            this.activeTerm = null;
            this.hideTimeout = null;

            this.handlePointerEnter = this.handlePointerEnter.bind(this);
            this.handlePointerLeave = this.handlePointerLeave.bind(this);
            this.handleFocus = this.handleFocus.bind(this);
            this.handleBlur = this.handleBlur.bind(this);
            this.handleScroll = this.handleScroll.bind(this);

            document.addEventListener('mouseover', this.handlePointerEnter, true);
            document.addEventListener('mouseout', this.handlePointerLeave, true);
            document.addEventListener('focusin', this.handleFocus, true);
            document.addEventListener('focusout', this.handleBlur, true);
            window.addEventListener('scroll', this.handleScroll, true);
            window.addEventListener('resize', this.handleScroll);
        }

        createTooltipElement() {
            const element = document.createElement('div');
            element.className = 'tooltip-popover';
            element.setAttribute('role', 'dialog');
            element.setAttribute('aria-live', 'polite');
            element.setAttribute('aria-hidden', 'true');
            element.style.visibility = 'hidden';
            document.body.appendChild(element);
            return element;
        }

        decorate(root) {
            if (!root) return;

            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
                acceptNode: (node) => this.shouldProcessNode(node)
            });

            const nodesToProcess = [];
            let current;
            while ((current = walker.nextNode())) {
                nodesToProcess.push(current);
            }

            nodesToProcess.forEach(node => this.processTextNode(node));
        }

        shouldProcessNode(node) {
            if (!node || !node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            if (!node.parentNode) return NodeFilter.FILTER_REJECT;

            const parentElement = node.parentElement;
            if (!parentElement) return NodeFilter.FILTER_REJECT;

            if (parentElement.closest('.tooltip-term') || parentElement.closest('.tooltip-popover')) {
                return NodeFilter.FILTER_REJECT;
            }

            const tagName = parentElement.tagName;
            if (tagName === 'SCRIPT' || tagName === 'STYLE') return NodeFilter.FILTER_REJECT;

            return NodeFilter.FILTER_ACCEPT;
        }

        processTextNode(node) {
            const text = node.nodeValue;
            if (!text) return;

            const matches = this.findMatches(text);
            if (!matches.length) return;

            const fragment = document.createDocumentFragment();
            let lastIndex = 0;

            matches.forEach(match => {
                if (match.start > lastIndex) {
                    fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.start)));
                }

                const termNode = this.createTermNode(match, node.parentNode);
                fragment.appendChild(termNode);
                lastIndex = match.end;
            });

            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
            }

            node.parentNode.replaceChild(fragment, node);
        }

        findMatches(text) {
            const matches = [];

            this.definitions.forEach(definition => {
                definition.triggers.forEach(pattern => {
                    pattern.lastIndex = 0;
                    let result;
                    while ((result = pattern.exec(text)) !== null) {
                        matches.push({
                            start: result.index,
                            end: result.index + result[0].length,
                            length: result[0].length,
                            text: result[0],
                            definitionId: definition.id,
                            context: definition
                        });
                    }
                });
            });

            if (!matches.length) return matches;

            matches.sort((a, b) => {
                if (a.start === b.start) {
                    return b.length - a.length;
                }
                return a.start - b.start;
            });

            const filtered = [];
            let currentEnd = -1;
            matches.forEach(match => {
                if (match.start >= currentEnd) {
                    filtered.push(match);
                    currentEnd = match.end;
                }
            });

            return filtered;
        }

        createTermNode(match, originalParent) {
            const span = document.createElement('span');
            span.className = 'tooltip-term';
            span.dataset.tooltipId = match.definitionId;
            span.textContent = match.text;
            span.tabIndex = 0;

            if (this.isCodeContext(originalParent)) {
                span.classList.add('tooltip-term--code');
            }

            return span;
        }

        isCodeContext(node) {
            let current = node;
            while (current) {
                if (current.nodeType !== 1) {
                    current = current.parentNode;
                    continue;
                }
                if (current.classList.contains('tooltip-term')) return false;
                if (current.tagName === 'CODE') return true;
                if (current.tagName === 'PRE') return true;
                current = current.parentNode;
            }
            return false;
        }

        handlePointerEnter(event) {
            const term = event.target.closest('.tooltip-term');
            if (!term) return;
            this.showTooltip(term);
        }

        handlePointerLeave(event) {
            const term = event.target.closest('.tooltip-term');
            if (!term) return;
            if (event.relatedTarget && term.contains(event.relatedTarget)) return;
            this.scheduleHide();
        }

        handleFocus(event) {
            const term = event.target.closest('.tooltip-term');
            if (!term) return;
            this.showTooltip(term);
        }

        handleBlur(event) {
            const term = event.target.closest('.tooltip-term');
            if (!term) return;
            this.scheduleHide();
        }

        handleScroll() {
            if (this.activeTerm) {
                this.positionTooltip(this.activeTerm);
            }
        }

        showTooltip(term) {
            const definition = this.definitionMap.get(term.dataset.tooltipId);
            if (!definition) return;

            clearTimeout(this.hideTimeout);
            this.activeTerm = term;

            this.tooltipElement.innerHTML = `
                <div class="tooltip-content">
                    <div class="tooltip-title">${definition.title}</div>
                    <div class="tooltip-body">${definition.body}</div>
                </div>
            `;
            this.tooltipElement.setAttribute('aria-hidden', 'false');
            this.tooltipElement.style.visibility = 'visible';
            this.tooltipElement.classList.add('visible');

            this.positionTooltip(term);

            if (global.Prism && typeof global.Prism.highlightAllUnder === 'function') {
                global.Prism.highlightAllUnder(this.tooltipElement);
            }
        }

        positionTooltip(term) {
            const rect = term.getBoundingClientRect();
            const tooltipRect = this.tooltipElement.getBoundingClientRect();

            let top = rect.top - tooltipRect.height - 12;
            if (top < 12) {
                top = rect.bottom + 12;
            }

            let left = rect.left + (rect.width - tooltipRect.width) / 2;
            const padding = 12;
            if (left < padding) {
                left = padding;
            }
            const maxLeft = window.innerWidth - tooltipRect.width - padding;
            if (left > maxLeft) {
                left = maxLeft;
            }

            this.tooltipElement.style.top = `${Math.round(top)}px`;
            this.tooltipElement.style.left = `${Math.round(left)}px`;
        }

        scheduleHide() {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = setTimeout(() => this.hideTooltip(), 150);
        }

        hideTooltip() {
            this.activeTerm = null;
            this.tooltipElement.classList.remove('visible');
            this.tooltipElement.setAttribute('aria-hidden', 'true');
            this.tooltipElement.style.visibility = 'hidden';
        }
    }

    global.TooltipManager = TooltipManager;
    global.DEFAULT_TOOLTIP_DEFINITIONS = DEFAULT_TOOLTIP_DEFINITIONS;
})(typeof window !== 'undefined' ? window : this);
