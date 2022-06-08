
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35731/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const chosen_video = writable();

    const video_player_is_active = writable(false);

    /* eslint-disable no-param-reassign */

    /**
     * Options for customizing ripples
     */
    const defaults = {
      color: 'currentColor',
      class: '',
      opacity: 0.1,
      centered: false,
      spreadingDuration: '.4s',
      spreadingDelay: '0s',
      spreadingTimingFunction: 'linear',
      clearingDuration: '1s',
      clearingDelay: '0s',
      clearingTimingFunction: 'ease-in-out',
    };

    /**
     * Creates a ripple element but does not destroy it (use RippleStop for that)
     *
     * @param {Event} e
     * @param {*} options
     * @returns Ripple element
     */
    function RippleStart(e, options = {}) {
      e.stopImmediatePropagation();
      const opts = { ...defaults, ...options };

      const isTouchEvent = e.touches ? !!e.touches[0] : false;
      // Parent element
      const target = isTouchEvent ? e.touches[0].currentTarget : e.currentTarget;

      // Create ripple
      const ripple = document.createElement('div');
      const rippleStyle = ripple.style;

      // Adding default stuff
      ripple.className = `material-ripple ${opts.class}`;
      rippleStyle.position = 'absolute';
      rippleStyle.color = 'inherit';
      rippleStyle.borderRadius = '50%';
      rippleStyle.pointerEvents = 'none';
      rippleStyle.width = '100px';
      rippleStyle.height = '100px';
      rippleStyle.marginTop = '-50px';
      rippleStyle.marginLeft = '-50px';
      target.appendChild(ripple);
      rippleStyle.opacity = opts.opacity;
      rippleStyle.transition = `transform ${opts.spreadingDuration} ${opts.spreadingTimingFunction} ${opts.spreadingDelay},opacity ${opts.clearingDuration} ${opts.clearingTimingFunction} ${opts.clearingDelay}`;
      rippleStyle.transform = 'scale(0) translate(0,0)';
      rippleStyle.background = opts.color;

      // Positioning ripple
      const targetRect = target.getBoundingClientRect();
      if (opts.centered) {
        rippleStyle.top = `${targetRect.height / 2}px`;
        rippleStyle.left = `${targetRect.width / 2}px`;
      } else {
        const distY = isTouchEvent ? e.touches[0].clientY : e.clientY;
        const distX = isTouchEvent ? e.touches[0].clientX : e.clientX;
        rippleStyle.top = `${distY - targetRect.top}px`;
        rippleStyle.left = `${distX - targetRect.left}px`;
      }

      // Enlarge ripple
      rippleStyle.transform = `scale(${
    Math.max(targetRect.width, targetRect.height) * 0.02
  }) translate(0,0)`;
      return ripple;
    }

    /**
     * Destroys the ripple, slowly fading it out.
     *
     * @param {Element} ripple
     */
    function RippleStop(ripple) {
      if (ripple) {
        ripple.addEventListener('transitionend', (e) => {
          if (e.propertyName === 'opacity') ripple.remove();
        });
        ripple.style.opacity = 0;
      }
    }

    /**
     * @param node {Element}
     */
    var Ripple = (node, _options = {}) => {
      let options = _options;
      let destroyed = false;
      let ripple;
      let keyboardActive = false;
      const handleStart = (e) => {
        ripple = RippleStart(e, options);
      };
      const handleStop = () => RippleStop(ripple);
      const handleKeyboardStart = (e) => {
        if (!keyboardActive && (e.keyCode === 13 || e.keyCode === 32)) {
          ripple = RippleStart(e, { ...options, centered: true });
          keyboardActive = true;
        }
      };
      const handleKeyboardStop = () => {
        keyboardActive = false;
        handleStop();
      };

      function setup() {
        node.classList.add('s-ripple-container');
        node.addEventListener('pointerdown', handleStart);
        node.addEventListener('pointerup', handleStop);
        node.addEventListener('pointerleave', handleStop);
        node.addEventListener('keydown', handleKeyboardStart);
        node.addEventListener('keyup', handleKeyboardStop);
        destroyed = false;
      }

      function destroy() {
        node.classList.remove('s-ripple-container');
        node.removeEventListener('pointerdown', handleStart);
        node.removeEventListener('pointerup', handleStop);
        node.removeEventListener('pointerleave', handleStop);
        node.removeEventListener('keydown', handleKeyboardStart);
        node.removeEventListener('keyup', handleKeyboardStop);
        destroyed = true;
      }

      if (options) setup();

      return {
        update(newOptions) {
          options = newOptions;
          if (options && destroyed) setup();
          else if (!(options || destroyed)) destroy();
        },
        destroy,
      };
    };

    const filter = (classes) => classes.filter((x) => !!x);
    const format$1 = (classes) => classes.split(' ').filter((x) => !!x);

    /**
     * @param node {Element}
     * @param classes {Array<string>}
     */
    var Class = (node, _classes) => {
      let classes = _classes;
      node.classList.add(...format$1(filter(classes).join(' ')));
      return {
        update(_newClasses) {
          const newClasses = _newClasses;
          newClasses.forEach((klass, i) => {
            if (klass) node.classList.add(...format$1(klass));
            else if (classes[i]) node.classList.remove(...format$1(classes[i]));
          });
          classes = newClasses;
        },
      };
    };

    /* node_modules\svelte-materialify\dist\components\Button\Button.svelte generated by Svelte v3.44.1 */
    const file$4 = "node_modules\\svelte-materialify\\dist\\components\\Button\\Button.svelte";

    function create_fragment$4(ctx) {
    	let button_1;
    	let span;
    	let button_1_class_value;
    	let Class_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	let button_1_levels = [
    		{
    			class: button_1_class_value = "s-btn size-" + /*size*/ ctx[5] + " " + /*klass*/ ctx[1]
    		},
    		{ type: /*type*/ ctx[14] },
    		{ style: /*style*/ ctx[16] },
    		{ disabled: /*disabled*/ ctx[11] },
    		{ "aria-disabled": /*disabled*/ ctx[11] },
    		/*$$restProps*/ ctx[17]
    	];

    	let button_1_data = {};

    	for (let i = 0; i < button_1_levels.length; i += 1) {
    		button_1_data = assign(button_1_data, button_1_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button_1 = element("button");
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", "s-btn__content");
    			add_location(span, file$4, 46, 2, 5233);
    			set_attributes(button_1, button_1_data);
    			toggle_class(button_1, "s-btn--fab", /*fab*/ ctx[2]);
    			toggle_class(button_1, "icon", /*icon*/ ctx[3]);
    			toggle_class(button_1, "block", /*block*/ ctx[4]);
    			toggle_class(button_1, "tile", /*tile*/ ctx[6]);
    			toggle_class(button_1, "text", /*text*/ ctx[7] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "depressed", /*depressed*/ ctx[8] || /*text*/ ctx[7] || /*disabled*/ ctx[11] || /*outlined*/ ctx[9] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "outlined", /*outlined*/ ctx[9]);
    			toggle_class(button_1, "rounded", /*rounded*/ ctx[10]);
    			toggle_class(button_1, "disabled", /*disabled*/ ctx[11]);
    			add_location(button_1, file$4, 26, 0, 4783);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button_1, anchor);
    			append_dev(button_1, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			if (button_1.autofocus) button_1.focus();
    			/*button_1_binding*/ ctx[21](button_1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, button_1, [/*active*/ ctx[12] && /*activeClass*/ ctx[13]])),
    					action_destroyer(Ripple_action = Ripple.call(null, button_1, /*ripple*/ ctx[15])),
    					listen_dev(button_1, "click", /*click_handler*/ ctx[20], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 262144)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[18],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(button_1, button_1_data = get_spread_update(button_1_levels, [
    				(!current || dirty & /*size, klass*/ 34 && button_1_class_value !== (button_1_class_value = "s-btn size-" + /*size*/ ctx[5] + " " + /*klass*/ ctx[1])) && { class: button_1_class_value },
    				(!current || dirty & /*type*/ 16384) && { type: /*type*/ ctx[14] },
    				(!current || dirty & /*style*/ 65536) && { style: /*style*/ ctx[16] },
    				(!current || dirty & /*disabled*/ 2048) && { disabled: /*disabled*/ ctx[11] },
    				(!current || dirty & /*disabled*/ 2048) && { "aria-disabled": /*disabled*/ ctx[11] },
    				dirty & /*$$restProps*/ 131072 && /*$$restProps*/ ctx[17]
    			]));

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 12288) Class_action.update.call(null, [/*active*/ ctx[12] && /*activeClass*/ ctx[13]]);
    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple*/ 32768) Ripple_action.update.call(null, /*ripple*/ ctx[15]);
    			toggle_class(button_1, "s-btn--fab", /*fab*/ ctx[2]);
    			toggle_class(button_1, "icon", /*icon*/ ctx[3]);
    			toggle_class(button_1, "block", /*block*/ ctx[4]);
    			toggle_class(button_1, "tile", /*tile*/ ctx[6]);
    			toggle_class(button_1, "text", /*text*/ ctx[7] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "depressed", /*depressed*/ ctx[8] || /*text*/ ctx[7] || /*disabled*/ ctx[11] || /*outlined*/ ctx[9] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "outlined", /*outlined*/ ctx[9]);
    			toggle_class(button_1, "rounded", /*rounded*/ ctx[10]);
    			toggle_class(button_1, "disabled", /*disabled*/ ctx[11]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button_1);
    			if (default_slot) default_slot.d(detaching);
    			/*button_1_binding*/ ctx[21](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"class","fab","icon","block","size","tile","text","depressed","outlined","rounded","disabled","active","activeClass","type","ripple","style","button"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	let { class: klass = '' } = $$props;
    	let { fab = false } = $$props;
    	let { icon = false } = $$props;
    	let { block = false } = $$props;
    	let { size = 'default' } = $$props;
    	let { tile = false } = $$props;
    	let { text = false } = $$props;
    	let { depressed = false } = $$props;
    	let { outlined = false } = $$props;
    	let { rounded = false } = $$props;
    	let { disabled = null } = $$props;
    	let { active = false } = $$props;
    	let { activeClass = 'active' } = $$props;
    	let { type = 'button' } = $$props;
    	let { ripple = {} } = $$props;
    	let { style = null } = $$props;
    	let { button = null } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function button_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			button = $$value;
    			$$invalidate(0, button);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(17, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(1, klass = $$new_props.class);
    		if ('fab' in $$new_props) $$invalidate(2, fab = $$new_props.fab);
    		if ('icon' in $$new_props) $$invalidate(3, icon = $$new_props.icon);
    		if ('block' in $$new_props) $$invalidate(4, block = $$new_props.block);
    		if ('size' in $$new_props) $$invalidate(5, size = $$new_props.size);
    		if ('tile' in $$new_props) $$invalidate(6, tile = $$new_props.tile);
    		if ('text' in $$new_props) $$invalidate(7, text = $$new_props.text);
    		if ('depressed' in $$new_props) $$invalidate(8, depressed = $$new_props.depressed);
    		if ('outlined' in $$new_props) $$invalidate(9, outlined = $$new_props.outlined);
    		if ('rounded' in $$new_props) $$invalidate(10, rounded = $$new_props.rounded);
    		if ('disabled' in $$new_props) $$invalidate(11, disabled = $$new_props.disabled);
    		if ('active' in $$new_props) $$invalidate(12, active = $$new_props.active);
    		if ('activeClass' in $$new_props) $$invalidate(13, activeClass = $$new_props.activeClass);
    		if ('type' in $$new_props) $$invalidate(14, type = $$new_props.type);
    		if ('ripple' in $$new_props) $$invalidate(15, ripple = $$new_props.ripple);
    		if ('style' in $$new_props) $$invalidate(16, style = $$new_props.style);
    		if ('button' in $$new_props) $$invalidate(0, button = $$new_props.button);
    		if ('$$scope' in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Ripple,
    		Class,
    		klass,
    		fab,
    		icon,
    		block,
    		size,
    		tile,
    		text,
    		depressed,
    		outlined,
    		rounded,
    		disabled,
    		active,
    		activeClass,
    		type,
    		ripple,
    		style,
    		button
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('klass' in $$props) $$invalidate(1, klass = $$new_props.klass);
    		if ('fab' in $$props) $$invalidate(2, fab = $$new_props.fab);
    		if ('icon' in $$props) $$invalidate(3, icon = $$new_props.icon);
    		if ('block' in $$props) $$invalidate(4, block = $$new_props.block);
    		if ('size' in $$props) $$invalidate(5, size = $$new_props.size);
    		if ('tile' in $$props) $$invalidate(6, tile = $$new_props.tile);
    		if ('text' in $$props) $$invalidate(7, text = $$new_props.text);
    		if ('depressed' in $$props) $$invalidate(8, depressed = $$new_props.depressed);
    		if ('outlined' in $$props) $$invalidate(9, outlined = $$new_props.outlined);
    		if ('rounded' in $$props) $$invalidate(10, rounded = $$new_props.rounded);
    		if ('disabled' in $$props) $$invalidate(11, disabled = $$new_props.disabled);
    		if ('active' in $$props) $$invalidate(12, active = $$new_props.active);
    		if ('activeClass' in $$props) $$invalidate(13, activeClass = $$new_props.activeClass);
    		if ('type' in $$props) $$invalidate(14, type = $$new_props.type);
    		if ('ripple' in $$props) $$invalidate(15, ripple = $$new_props.ripple);
    		if ('style' in $$props) $$invalidate(16, style = $$new_props.style);
    		if ('button' in $$props) $$invalidate(0, button = $$new_props.button);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		button,
    		klass,
    		fab,
    		icon,
    		block,
    		size,
    		tile,
    		text,
    		depressed,
    		outlined,
    		rounded,
    		disabled,
    		active,
    		activeClass,
    		type,
    		ripple,
    		style,
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		button_1_binding
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			class: 1,
    			fab: 2,
    			icon: 3,
    			block: 4,
    			size: 5,
    			tile: 6,
    			text: 7,
    			depressed: 8,
    			outlined: 9,
    			rounded: 10,
    			disabled: 11,
    			active: 12,
    			activeClass: 13,
    			type: 14,
    			ripple: 15,
    			style: 16,
    			button: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fab() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fab(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depressed() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depressed(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get button() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set button(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* eslint-disable */
    // Shamefully ripped from https://github.com/lukeed/uid
    let IDX = 36;
    let HEX = '';
    while (IDX--) HEX += IDX.toString(36);

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* eslint-disable no-param-reassign */

    const themeColors = ['primary', 'secondary', 'success', 'info', 'warning', 'error'];

    /**
     * @param {string} klass
     */
    function formatClass(klass) {
      return klass.split(' ').map((i) => {
        if (themeColors.includes(i)) return `${i}-color`;
        return i;
      });
    }

    function setBackgroundColor(node, text) {
      if (/^(#|rgb|hsl|currentColor)/.test(text)) {
        // This is a CSS hex.
        node.style.backgroundColor = text;
        return false;
      }

      if (text.startsWith('--')) {
        // This is a CSS variable.
        node.style.backgroundColor = `var(${text})`;
        return false;
      }

      const klass = formatClass(text);
      node.classList.add(...klass);
      return klass;
    }

    /**
     * @param node {Element}
     * @param text {string|boolean}
     */
    var BackgroundColor = (node, text) => {
      let klass;
      if (typeof text === 'string') {
        klass = setBackgroundColor(node, text);
      }

      return {
        update(newText) {
          if (klass) {
            node.classList.remove(...klass);
          } else {
            node.style.backgroundColor = null;
          }

          if (typeof newText === 'string') {
            klass = setBackgroundColor(node, newText);
          }
        },
      };
    };

    /* node_modules\svelte-materialify\dist\components\Overlay\Overlay.svelte generated by Svelte v3.44.1 */
    const file$3 = "node_modules\\svelte-materialify\\dist\\components\\Overlay\\Overlay.svelte";

    // (20:0) {#if active}
    function create_if_block$1(ctx) {
    	let div2;
    	let div0;
    	let BackgroundColor_action;
    	let t;
    	let div1;
    	let div2_class_value;
    	let div2_style_value;
    	let div2_intro;
    	let div2_outro;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "s-overlay__scrim svelte-zop6hb");
    			set_style(div0, "opacity", /*opacity*/ ctx[5]);
    			add_location(div0, file$3, 27, 4, 1076);
    			attr_dev(div1, "class", "s-overlay__content svelte-zop6hb");
    			add_location(div1, file$3, 28, 4, 1167);
    			attr_dev(div2, "class", div2_class_value = "s-overlay " + /*klass*/ ctx[0] + " svelte-zop6hb");
    			attr_dev(div2, "style", div2_style_value = "z-index:" + /*index*/ ctx[7] + ";" + /*style*/ ctx[9]);
    			toggle_class(div2, "absolute", /*absolute*/ ctx[8]);
    			add_location(div2, file$3, 20, 2, 912);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(BackgroundColor_action = BackgroundColor.call(null, div0, /*color*/ ctx[6])),
    					listen_dev(div2, "click", /*click_handler*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty & /*opacity*/ 32) {
    				set_style(div0, "opacity", /*opacity*/ ctx[5]);
    			}

    			if (BackgroundColor_action && is_function(BackgroundColor_action.update) && dirty & /*color*/ 64) BackgroundColor_action.update.call(null, /*color*/ ctx[6]);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div2_class_value !== (div2_class_value = "s-overlay " + /*klass*/ ctx[0] + " svelte-zop6hb")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty & /*index, style*/ 640 && div2_style_value !== (div2_style_value = "z-index:" + /*index*/ ctx[7] + ";" + /*style*/ ctx[9])) {
    				attr_dev(div2, "style", div2_style_value);
    			}

    			if (dirty & /*klass, absolute*/ 257) {
    				toggle_class(div2, "absolute", /*absolute*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div2_outro) div2_outro.end(1);
    				div2_intro = create_in_transition(div2, /*transition*/ ctx[1], /*inOpts*/ ctx[2]);
    				div2_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div2_intro) div2_intro.invalidate();
    			div2_outro = create_out_transition(div2, /*transition*/ ctx[1], /*outOpts*/ ctx[3]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div2_outro) div2_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(20:0) {#if active}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*active*/ ctx[4] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*active*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*active*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Overlay', slots, ['default']);
    	let { class: klass = '' } = $$props;
    	let { transition = fade } = $$props;
    	let { inOpts = { duration: 250 } } = $$props;
    	let { outOpts = { duration: 250 } } = $$props;
    	let { active = true } = $$props;
    	let { opacity = 0.46 } = $$props;
    	let { color = 'rgb(33, 33, 33)' } = $$props;
    	let { index = 5 } = $$props;
    	let { absolute = false } = $$props;
    	let { style = '' } = $$props;

    	const writable_props = [
    		'class',
    		'transition',
    		'inOpts',
    		'outOpts',
    		'active',
    		'opacity',
    		'color',
    		'index',
    		'absolute',
    		'style'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Overlay> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, klass = $$props.class);
    		if ('transition' in $$props) $$invalidate(1, transition = $$props.transition);
    		if ('inOpts' in $$props) $$invalidate(2, inOpts = $$props.inOpts);
    		if ('outOpts' in $$props) $$invalidate(3, outOpts = $$props.outOpts);
    		if ('active' in $$props) $$invalidate(4, active = $$props.active);
    		if ('opacity' in $$props) $$invalidate(5, opacity = $$props.opacity);
    		if ('color' in $$props) $$invalidate(6, color = $$props.color);
    		if ('index' in $$props) $$invalidate(7, index = $$props.index);
    		if ('absolute' in $$props) $$invalidate(8, absolute = $$props.absolute);
    		if ('style' in $$props) $$invalidate(9, style = $$props.style);
    		if ('$$scope' in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		BackgroundColor,
    		klass,
    		transition,
    		inOpts,
    		outOpts,
    		active,
    		opacity,
    		color,
    		index,
    		absolute,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ('klass' in $$props) $$invalidate(0, klass = $$props.klass);
    		if ('transition' in $$props) $$invalidate(1, transition = $$props.transition);
    		if ('inOpts' in $$props) $$invalidate(2, inOpts = $$props.inOpts);
    		if ('outOpts' in $$props) $$invalidate(3, outOpts = $$props.outOpts);
    		if ('active' in $$props) $$invalidate(4, active = $$props.active);
    		if ('opacity' in $$props) $$invalidate(5, opacity = $$props.opacity);
    		if ('color' in $$props) $$invalidate(6, color = $$props.color);
    		if ('index' in $$props) $$invalidate(7, index = $$props.index);
    		if ('absolute' in $$props) $$invalidate(8, absolute = $$props.absolute);
    		if ('style' in $$props) $$invalidate(9, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		transition,
    		inOpts,
    		outOpts,
    		active,
    		opacity,
    		color,
    		index,
    		absolute,
    		style,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Overlay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			class: 0,
    			transition: 1,
    			inOpts: 2,
    			outOpts: 3,
    			active: 4,
    			opacity: 5,
    			color: 6,
    			index: 7,
    			absolute: 8,
    			style: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Overlay",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get class() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inOpts() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inOpts(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outOpts() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outOpts(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get opacity() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opacity(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get absolute() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set absolute(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const videos = [
        {
            "poster": "https://reluare.org/wp-content/uploads/2022/05/clark-serial-2022-subtitrat-si-tradus-in-romana-2022-online-complet-s-682x1024.jpg",
            "src": "https://drive.google.com/uc?id=1Q8W0R7xiteXGOkICNIkhkt2gKtSQNyPF"
        },
        {
            "poster": "https://flxt.tmsimg.com/assets/p185846_b_v8_ad.jpg",
            "src": "https://drive.google.com/uc?id=1px6IIcF00U-Nw-zE1BfSSZ-Cj8BtzgGo"
        },
        {
            "poster": "https://static.posters.cz/image/750/poster/narcos-blow-business-i31851.jpg",
            "src": "https://drive.google.com/uc?id=1NWmJm-r4i72F72bCMEIxAKwGVmJtIhQr"
        },
        {
            "poster": "https://picfiles.alphacoders.com/359/359473.jpg",
            "src": "https://drive.google.com/uc?id=1s4x1mfed4fkk8uZ_fQvArfD1fgE82-IE"
        },
        {
            "poster": "https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_FMjpg_UX1000_.jpg<<<<<<<s",
            "src": "https://drive.google.com/uc?id=1NCp8y79ZG7uOs1iqllR4AmwpcUFFsw10"
        },
        {
            "poster": "https://m.media-amazon.com/images/I/51WxjlRLf+L._AC_.jpg",
            "src": "https://drive.google.com/uc?id=1n47C_OdP9ObCKFevuKzNKsY_0zskP8Ru"
        },
        {
            "poster": "https://i.pinimg.com/originals/6a/d0/5c/6ad05cbccb6ea4996a1aeeec566403e5.jpg",
            "src": "https://drive.google.com/uc?id=15gR0as5Li2kC2EDRGP8ragaYvrrF6RWK"
        }
    ];

    const videos2 = [
        {
            "poster": "https://reluare.org/wp-content/uploads/2022/05/clark-serial-2022-subtitrat-si-tradus-in-romana-2022-online-complet-s-682x1024.jpg" ,
            "src": "https://sveltejs.github.io/assets/caminandes-llamigos.mp4"
        },
        {
            "poster": "https://www.puolenkuunpelit.com/kauppa/images/generated_filenames/011115_dvd_torsk_p_tallin_-_collection.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://vortexcultural.com.br/images/2014/07/Bron-Broen-Poster.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_FMjpg_UX1000_.jpg<<<<<<<s",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://image.tmdb.org/t/p/w780/xGY5rr8441ib0lT9mtHZn7e8Aay.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQxnU6pEmsm7JSuUHo6EozhbQ4kf0A6J2ug39ZBEyh9_fDA82uB",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://m.media-amazon.com/images/M/MV5BNmY3OTdkOWEtNjc2ZC00OTZmLWI5OWItMjdjYjRkNTExNDNhXkEyXkFqcGdeQXVyMjkwOTAyMDU@._V1_FMjpg_UX1000_.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        }
    ];

    const videos3 = 
    [
        {
            "poster": "https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F6%2F2012%2F09%2Fsinister-poster.jpg&q=60" ,
            "src": "https://sveltejs.github.io/assets/caminandes-llamigos.mp4"
        },
        {
            "poster": "https://i.pinimg.com/originals/36/bb/49/36bb49242012726d42a65eca361f0da9.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://mblogthumb-phinf.pstatic.net/MjAxOTA5MDZfNDMg/MDAxNTY3NzMzODc2NDE1.tiEaPGBwutLCQkoQzQnCuvnWY-h97XIank-hvvVxYEIg.KP2JPs5BOBDj1_jUUQMK6olwkBORdgxWDORuAPJ0dGQg.JPEG.toosj895/3%EC%B8%B5_%EB%B3%B5%EB%8F%84_%EB%81%9D%EC%97%90%EC%84%9C.jpg?type=w800",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://d2iltjk184xms5.cloudfront.net/uploads/photo/file/322482/small_dd7c1ff7ee325c65e79a7269f0bc1725-small_c53eb25122120e7033cc98362131c538-stephen-king-det-poster.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://sfanytime-images-prod-http2.secure2.footprint.net/COVERM/COVERM_55eaa3be-6d2e-49dd-a6ce-d5ceb76f9087_01.jpg?w=375&ar=0.692&fit=crop&fm=pjpg&s=056b919bcfa9fe2cdb9c10ad0296d2b1",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://images.moviefit.me/t/o/7347-hush.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://i0.wp.com/readysteadycut.com////wp-content/uploads/2018/01/promo.jpg?resize=666%2C1000&ssl=1",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        }
    ];

    const videos4 = 
    [
        {
            "poster": "https://sumo.cdn.tv2.no/imageapi/v3/img/607e918a498e1ee1a5b51253-1641391767960?location=moviePoster&quality=92&width=260&height=390" ,
            "src": "https://sveltejs.github.io/assets/caminandes-llamigos.mp4"
        },
        {
            "poster": "https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_FMjpg_UX1000_.jpg<<<<<<<s",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://reluare.org/wp-content/uploads/2022/05/clark-serial-2022-subtitrat-si-tradus-in-romana-2022-online-complet-s-682x1024.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://www.puolenkuunpelit.com/kauppa/images/generated_filenames/011115_dvd_torsk_p_tallin_-_collection.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://image.tmdb.org/t/p/w500/5Oq1fqOmdLS4pSEgWEdmHwwnKOc.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://i-viaplay-com.akamaized.net/viaplay-prod/693/696/1459936257-2cb5afedb1b5a6240637d5047645cb777cdb1253.jpg?width=400&height=600",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://prod.cdn.bbaws.net/TDC_Blockbuster_-_Production/656/548/WB-0348_po-reg-medium_orig.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        }
    ];
        const videos5 = [
        {
            "poster": "https://prod.cdn.bbaws.net/TDC_Blockbuster_-_Production/960/628/4280008836-po-reg-medium_orig-1635317868539.jpg" ,
            "src": "https://sveltejs.github.io/assets/caminandes-llamigos.mp4"
        },
        {
            "poster": "https://www.idg.se/editorial/0/path/1.759585!imageManager/3229336147.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://musicart.xboxlive.com/7/b8185100-0000-0000-0000-000000000002/504/image.jpg?w=1920&h=1080",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://chsprowl.org/wp-content/uploads/2022/03/ZZnejojq3cPGi1Cv8CImxjYydWoXFrZAjppGl9eX.jpeg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://movieposters2.com/images/705801-b.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://lumiere-a.akamaihd.net/v1/images/image_b97b56f3.jpeg?region=0%2C0%2C540%2C810",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://www.tenatthetop.org/wp-content/uploads/2021/05/star-wars-the-rise-of-skywalker-theatrical-poster-1000_ebc74357.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        }
    ]; 



        const videos6 = [
            {
                "poster": "https://m.media-amazon.com/images/M/MV5BMTA2NDc3Njg5NDVeQTJeQWpwZ15BbWU4MDc1NDcxNTUz._V1_FMjpg_UX1000_.jpg" ,
                "src": "https://sveltejs.github.io/assets/caminandes-llamigos.mp4"
            },
            {
                "poster": "https://www.reelviews.net/resources/img/posters/thumbs/greyhound.jpg",
                "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
            },
            {
                "poster": "https://i-viaplay-com.akamaized.net/viaplay-prod/893/844/1627472210-1129ff9575bfe0973f9909a2978b66c8144c98a9.jpg?width=400&height=600",
                "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
            },
            {
                "poster": "https://static.posters.cz/image/750/poster/narcos-blow-business-i31851.jpg",
                "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
            },
            {
                "poster": "https://i.pinimg.com/originals/6a/d0/5c/6ad05cbccb6ea4996a1aeeec566403e5.jpg",
                "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
            },
            {
                "poster": "https://i-viaplay-com.akamaized.net/viaplay-prod/67/248/1645773705-881c6809f5f10b3154cf04fa94546477ccdb4919.jpg?width=400&height=600",
                "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
            },
            {
                "poster": "https://flxt.tmsimg.com/assets/p185846_b_v8_ad.jpg",
                "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
            }
    ]; 

    const videos7 = [
        {
            "poster": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_-609fpcg7s1wi-L1sRvUXrDHY3m00xAb3X2CdHWP8RuszsnpGGdQYUYKnY8u1pOhqpU&usqp=CAU" ,
            "src": "https://sveltejs.github.io/assets/caminandes-llamigos.mp4"
        },
        {
            "poster": "https://m.media-amazon.com/images/M/MV5BZDU1YWQ0NmYtOGFiYi00OWJkLTgzODMtMGE4MDgxNmE5MDMxXkEyXkFqcGdeQXVyMjM5NDQzNTk@._V1_.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQxnU6pEmsm7JSuUHo6EozhbQ4kf0A6J2ug39ZBEyh9_fDA82uB",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://picfiles.alphacoders.com/359/359473.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://img.cmore.incomet.io/cd798e46-8fbc-4308-a41d-6483d305bedb/crop2x3.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://www.allatvkanaler.se/poster/ronnasfallet-jakten-pa-sanning_a-5ZuOF75a.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://www.commonsensemedia.org/sites/default/files/styles/ratio_2_3_medium/public/product-images/csm-movie/the-social-dilemma-movie-poster-image0.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        }
    ]; 

    const videos8 = [
        {
            "poster": "https://themagnificent60s.files.wordpress.com/2022/02/uncharted-3.jpg" ,
            "src": "https://sveltejs.github.io/assets/caminandes-llamigos.mp4"
        },
        {
            "poster": "https://sfanytime-images-prod-http2.secure2.footprint.net/COVERM/COVERM_5700d451-ea93-4b55-a578-446cc3efa8af_01.jpg?w=375&ar=0.692&fit=crop&fm=pjpg&s=3fef88fd5c30687f0eb645d2785e01c5",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2JnyWCXgSOjQS8N_CG7XxKlL0z-R9T6Fs5vhOcnUC_2Xu7AMrFe--vPowvgQDyvKr62s&usqp=CAU",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://m.media-amazon.com/images/M/MV5BMTc3NjI2MjU0Nl5BMl5BanBnXkFtZTgwNDk3ODYxMTE@._V1_FMjpg_UX1000_.jpg",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://sfanytime-images-prod-http2.secure2.footprint.net/COVERM/COVERM_9b838abd-3933-48f6-b6ea-e522d1027711_01.jpg?w=375&ar=0.692&fit=crop&fm=pjpg&s=6f386a4c8c3232d89538b8b6a7a94bcb",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://sfanytime-images-prod.secure.footprint.net/COVERM/38754820-f8f8-4d7e-9cd7-9f81010f5635_COVERM_01.jpg?w=375&fm=pjpg&s=c5385b40ee3734bd18a18abe5a8b877f",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        },
        {
            "poster": "https://sfanytime-images-prod-http2.secure2.footprint.net/COVERM/COVERM_3b6875e9-95ca-4355-8a06-9085b6581066_01.jpg?w=375&ar=0.692&fit=crop&fm=pjpg&s=a1e38089b64f7c87a5eb8b672980390a",
            "src": "https://shattereddisk.github.io/rickroll/rickroll.mp4"
        }
    ];

    /* src\Player.svelte generated by Svelte v3.44.1 */

    const { isNaN: isNaN_1 } = globals;
    const file$2 = "src\\Player.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let video;
    	let track;
    	let video_poster_value;
    	let video_src_value;
    	let video_updating = false;
    	let video_animationframe;
    	let video_is_paused = true;
    	let t0;
    	let div1;
    	let div0;
    	let span0;
    	let t1_value = format(/*time*/ ctx[0]) + "";
    	let t1;
    	let t2;
    	let span2;
    	let span1;
    	let t3_value = format(/*duration*/ ctx[1]) + "";
    	let t3;
    	let t4;
    	let progress;
    	let progress_value_value;
    	let mounted;
    	let dispose;

    	function video_timeupdate_handler() {
    		cancelAnimationFrame(video_animationframe);

    		if (!video.paused) {
    			video_animationframe = raf(video_timeupdate_handler);
    			video_updating = true;
    		}

    		/*video_timeupdate_handler*/ ctx[9].call(video);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			video = element("video");
    			track = element("track");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			span2 = element("span");
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			progress = element("progress");
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$2, 82, 2, 2105);
    			attr_dev(video, "id", "vid");
    			attr_dev(video, "poster", video_poster_value = /*$chosen_video*/ ctx[4].poster);
    			if (!src_url_equal(video.src, video_src_value = /*$chosen_video*/ ctx[4].src)) attr_dev(video, "src", video_src_value);
    			attr_dev(video, "class", "svelte-l3mufg");
    			if (/*duration*/ ctx[1] === void 0) add_render_callback(() => /*video_durationchange_handler*/ ctx[10].call(video));
    			add_location(video, file$2, 72, 1, 1834);
    			attr_dev(span0, "class", "time svelte-l3mufg");
    			add_location(span0, file$2, 94, 3, 2494);
    			attr_dev(span1, "class", "time svelte-l3mufg");
    			add_location(span1, file$2, 96, 4, 2551);
    			attr_dev(span2, "class", "svelte-l3mufg");
    			add_location(span2, file$2, 95, 3, 2539);
    			attr_dev(div0, "class", "info svelte-l3mufg");
    			add_location(div0, file$2, 93, 2, 2471);
    			progress.value = progress_value_value = /*time*/ ctx[0] / /*duration*/ ctx[1] || 0;
    			attr_dev(progress, "class", "svelte-l3mufg");
    			add_location(progress, file$2, 99, 2, 2621);
    			attr_dev(div1, "class", "controls svelte-l3mufg");
    			set_style(div1, "opacity", /*duration*/ ctx[1] && /*showControls*/ ctx[3] ? 1 : 0);
    			add_location(div1, file$2, 85, 1, 2146);
    			attr_dev(div2, "id", "container");
    			attr_dev(div2, "class", "svelte-l3mufg");
    			add_location(div2, file$2, 71, 0, 1811);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, video);
    			append_dev(video, track);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, span0);
    			append_dev(span0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, span2);
    			append_dev(span2, span1);
    			append_dev(span1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, progress);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", prevent_default(/*handleKeyDown*/ ctx[8]), false, true, false),
    					listen_dev(video, "mousedown", stop_propagation(prevent_default(/*handleMousedown*/ ctx[6])), false, true, true),
    					listen_dev(video, "mouseup", stop_propagation(prevent_default(/*handleMouseup*/ ctx[7])), false, true, true),
    					listen_dev(video, "timeupdate", video_timeupdate_handler),
    					listen_dev(video, "durationchange", /*video_durationchange_handler*/ ctx[10]),
    					listen_dev(video, "play", /*video_play_pause_handler*/ ctx[11]),
    					listen_dev(video, "pause", /*video_play_pause_handler*/ ctx[11]),
    					listen_dev(div1, "mousemove", stop_propagation(prevent_default(/*handleMove*/ ctx[5])), false, true, true),
    					listen_dev(div1, "touchmove", stop_propagation(prevent_default(/*handleMove*/ ctx[5])), false, true, true),
    					listen_dev(div1, "mousedown", stop_propagation(prevent_default(/*handleMove*/ ctx[5])), false, true, true),
    					listen_dev(div1, "mouseup", stop_propagation(prevent_default(/*handleMove*/ ctx[5])), false, true, true)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$chosen_video*/ 16 && video_poster_value !== (video_poster_value = /*$chosen_video*/ ctx[4].poster)) {
    				attr_dev(video, "poster", video_poster_value);
    			}

    			if (dirty & /*$chosen_video*/ 16 && !src_url_equal(video.src, video_src_value = /*$chosen_video*/ ctx[4].src)) {
    				attr_dev(video, "src", video_src_value);
    			}

    			if (!video_updating && dirty & /*time*/ 1 && !isNaN_1(/*time*/ ctx[0])) {
    				video.currentTime = /*time*/ ctx[0];
    			}

    			video_updating = false;

    			if (dirty & /*paused*/ 4 && video_is_paused !== (video_is_paused = /*paused*/ ctx[2])) {
    				video[video_is_paused ? "pause" : "play"]();
    			}

    			if (dirty & /*time*/ 1 && t1_value !== (t1_value = format(/*time*/ ctx[0]) + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*duration*/ 2 && t3_value !== (t3_value = format(/*duration*/ ctx[1]) + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*time, duration*/ 3 && progress_value_value !== (progress_value_value = /*time*/ ctx[0] / /*duration*/ ctx[1] || 0)) {
    				prop_dev(progress, "value", progress_value_value);
    			}

    			if (dirty & /*duration, showControls*/ 10) {
    				set_style(div1, "opacity", /*duration*/ ctx[1] && /*showControls*/ ctx[3] ? 1 : 0);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function format(seconds) {
    	if (isNaN(seconds)) return "...";
    	const minutes = Math.floor(seconds / 60);
    	seconds = Math.floor(seconds % 60);
    	if (seconds < 10) seconds = "0" + seconds;
    	return `${minutes}:${seconds}`;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $chosen_video;
    	validate_store(chosen_video, 'chosen_video');
    	component_subscribe($$self, chosen_video, $$value => $$invalidate(4, $chosen_video = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Player', slots, []);
    	let time = 0;
    	let duration;
    	let paused = true;
    	let showControls = true;
    	let showControlsTimeout;

    	// Used to track time of last mouse down event
    	let lastMouseDown;

    	function handleMove(e) {
    		// Make the controls visible, but fade out after
    		// 2.5 seconds of inactivity
    		clearTimeout(showControlsTimeout);

    		showControlsTimeout = setTimeout(() => $$invalidate(3, showControls = false), 2500);
    		$$invalidate(3, showControls = true);
    		if (!duration) return; // video not loaded yet
    		if (e.type !== "touchmove" && !(e.buttons & 1)) return; // mouse not down

    		const clientX = e.type === "touchmove"
    		? e.touches[0].clientX
    		: e.clientX;

    		const { left, right } = this.getBoundingClientRect();
    		$$invalidate(0, time = duration * (clientX - left) / (right - left));
    	}

    	// we can't rely on the built-in click event, because it fires
    	// after a drag — we have to listen for clicks ourselves
    	function handleMousedown(e) {
    		lastMouseDown = new Date();
    	}

    	function handleMouseup(e) {
    		if (new Date() - lastMouseDown < 300) {
    			if (paused) e.target.play(); else e.target.pause();
    		}
    	}

    	function handleKeyDown(e) {
    		let video = document.getElementById("vid");

    		if (e && e.key == " ") {
    			if (paused) video.play(); else video.pause();
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Player> was created with unknown prop '${key}'`);
    	});

    	function video_timeupdate_handler() {
    		time = this.currentTime;
    		$$invalidate(0, time);
    	}

    	function video_durationchange_handler() {
    		duration = this.duration;
    		$$invalidate(1, duration);
    	}

    	function video_play_pause_handler() {
    		paused = this.paused;
    		$$invalidate(2, paused);
    	}

    	$$self.$capture_state = () => ({
    		chosen_video,
    		time,
    		duration,
    		paused,
    		showControls,
    		showControlsTimeout,
    		lastMouseDown,
    		handleMove,
    		handleMousedown,
    		handleMouseup,
    		handleKeyDown,
    		format,
    		$chosen_video
    	});

    	$$self.$inject_state = $$props => {
    		if ('time' in $$props) $$invalidate(0, time = $$props.time);
    		if ('duration' in $$props) $$invalidate(1, duration = $$props.duration);
    		if ('paused' in $$props) $$invalidate(2, paused = $$props.paused);
    		if ('showControls' in $$props) $$invalidate(3, showControls = $$props.showControls);
    		if ('showControlsTimeout' in $$props) showControlsTimeout = $$props.showControlsTimeout;
    		if ('lastMouseDown' in $$props) lastMouseDown = $$props.lastMouseDown;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		time,
    		duration,
    		paused,
    		showControls,
    		$chosen_video,
    		handleMove,
    		handleMousedown,
    		handleMouseup,
    		handleKeyDown,
    		video_timeupdate_handler,
    		video_durationchange_handler,
    		video_play_pause_handler
    	];
    }

    class Player extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Player",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Thumbnail.svelte generated by Svelte v3.44.1 */
    const file$1 = "src\\Thumbnail.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "grid-item svelte-v117xy");
    			set_style(div, "background-image", "url(" + /*video*/ ctx[0].poster + ")");
    			add_location(div, file$1, 5, 0, 114);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*video*/ 1) {
    				set_style(div, "background-image", "url(" + /*video*/ ctx[0].poster + ")");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $chosen_video;
    	let $video_player_is_active;
    	validate_store(chosen_video, 'chosen_video');
    	component_subscribe($$self, chosen_video, $$value => $$invalidate(1, $chosen_video = $$value));
    	validate_store(video_player_is_active, 'video_player_is_active');
    	component_subscribe($$self, video_player_is_active, $$value => $$invalidate(2, $video_player_is_active = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Thumbnail', slots, []);
    	let { video } = $$props;
    	const writable_props = ['video'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Thumbnail> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		set_store_value(chosen_video, $chosen_video = video, $chosen_video);
    		set_store_value(video_player_is_active, $video_player_is_active = true, $video_player_is_active);
    	};

    	$$self.$$set = $$props => {
    		if ('video' in $$props) $$invalidate(0, video = $$props.video);
    	};

    	$$self.$capture_state = () => ({
    		video,
    		chosen_video,
    		video_player_is_active,
    		$chosen_video,
    		$video_player_is_active
    	});

    	$$self.$inject_state = $$props => {
    		if ('video' in $$props) $$invalidate(0, video = $$props.video);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [video, $chosen_video, $video_player_is_active, click_handler];
    }

    class Thumbnail extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { video: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Thumbnail",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*video*/ ctx[0] === undefined && !('video' in props)) {
    			console.warn("<Thumbnail> was created without expected prop 'video'");
    		}
    	}

    	get video() {
    		throw new Error("<Thumbnail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set video(value) {
    		throw new Error("<Thumbnail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.1 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (27:4) {#each Array(7) as _, i}
    function create_each_block_7(ctx) {
    	let thumbnail;
    	let current;

    	thumbnail = new Thumbnail({
    			props: { video: videos[/*i*/ ctx[8] % 7] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(thumbnail.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(thumbnail, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumbnail.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumbnail.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(thumbnail, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(27:4) {#each Array(7) as _, i}",
    		ctx
    	});

    	return block;
    }

    // (36:4) {#each Array(7) as _, i}
    function create_each_block_6(ctx) {
    	let thumbnail;
    	let current;

    	thumbnail = new Thumbnail({
    			props: { video: videos2[/*i*/ ctx[8] % 7] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(thumbnail.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(thumbnail, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumbnail.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumbnail.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(thumbnail, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(36:4) {#each Array(7) as _, i}",
    		ctx
    	});

    	return block;
    }

    // (44:4) {#each Array(7) as _, i}
    function create_each_block_5(ctx) {
    	let thumbnail;
    	let current;

    	thumbnail = new Thumbnail({
    			props: { video: videos3[/*i*/ ctx[8] % 7] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(thumbnail.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(thumbnail, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumbnail.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumbnail.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(thumbnail, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(44:4) {#each Array(7) as _, i}",
    		ctx
    	});

    	return block;
    }

    // (52:4) {#each Array(7) as _, i}
    function create_each_block_4(ctx) {
    	let thumbnail;
    	let current;

    	thumbnail = new Thumbnail({
    			props: { video: videos4[/*i*/ ctx[8] % 7] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(thumbnail.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(thumbnail, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumbnail.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumbnail.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(thumbnail, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(52:4) {#each Array(7) as _, i}",
    		ctx
    	});

    	return block;
    }

    // (60:4) {#each Array(7) as _, i}
    function create_each_block_3(ctx) {
    	let thumbnail;
    	let current;

    	thumbnail = new Thumbnail({
    			props: { video: videos5[/*i*/ ctx[8] % 7] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(thumbnail.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(thumbnail, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumbnail.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumbnail.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(thumbnail, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(60:4) {#each Array(7) as _, i}",
    		ctx
    	});

    	return block;
    }

    // (68:4) {#each Array(7) as _, i}
    function create_each_block_2(ctx) {
    	let thumbnail;
    	let current;

    	thumbnail = new Thumbnail({
    			props: { video: videos6[/*i*/ ctx[8] % 7] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(thumbnail.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(thumbnail, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumbnail.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumbnail.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(thumbnail, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(68:4) {#each Array(7) as _, i}",
    		ctx
    	});

    	return block;
    }

    // (76:4) {#each Array(7) as _, i}
    function create_each_block_1(ctx) {
    	let thumbnail;
    	let current;

    	thumbnail = new Thumbnail({
    			props: { video: videos7[/*i*/ ctx[8] % 7] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(thumbnail.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(thumbnail, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumbnail.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumbnail.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(thumbnail, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(76:4) {#each Array(7) as _, i}",
    		ctx
    	});

    	return block;
    }

    // (84:4) {#each Array(7) as _, i}
    function create_each_block(ctx) {
    	let thumbnail;
    	let current;

    	thumbnail = new Thumbnail({
    			props: { video: videos8[/*i*/ ctx[8] % 7] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(thumbnail.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(thumbnail, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumbnail.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumbnail.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(thumbnail, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(84:4) {#each Array(7) as _, i}",
    		ctx
    	});

    	return block;
    }

    // (106:8) <Button           class="error-color"           size="small"           on:click={() => {             $video_player_is_active = false;           }}         >
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Close");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(106:8) <Button           class=\\\"error-color\\\"           size=\\\"small\\\"           on:click={() => {             $video_player_is_active = false;           }}         >",
    		ctx
    	});

    	return block;
    }

    // (117:8) <Button           size="small"           class="primary-color"           on:click={() => {             is_fullscreen = !is_fullscreen;             // do not focus the fullscreenbutton if clicked             // this is because otherwise clicking space will cause             // the video player to maximize/minimize instead of pause/play             // when space is clicked             if (document.activeElement != document.body)               document.activeElement.blur();           }}         >
    function create_default_slot_2(ctx) {
    	let t_value = (/*is_fullscreen*/ ctx[0] ? "Minimize" : "Theatre Mode") + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*is_fullscreen*/ 1 && t_value !== (t_value = (/*is_fullscreen*/ ctx[0] ? "Minimize" : "Theatre Mode") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(117:8) <Button           size=\\\"small\\\"           class=\\\"primary-color\\\"           on:click={() => {             is_fullscreen = !is_fullscreen;             // do not focus the fullscreenbutton if clicked             // this is because otherwise clicking space will cause             // the video player to maximize/minimize instead of pause/play             // when space is clicked             if (document.activeElement != document.body)               document.activeElement.blur();           }}         >",
    		ctx
    	});

    	return block;
    }

    // (134:6) {#if is_fullscreen}
    function create_if_block(ctx) {
    	let div;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				size: "small",
    				class: "secondary-color",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_2*/ ctx[4]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div, "id", "gigascreen");
    			attr_dev(div, "class", "svelte-q53y99");
    			add_location(div, file, 134, 8, 3922);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(134:6) {#if is_fullscreen}",
    		ctx
    	});

    	return block;
    }

    // (136:10) <Button             size="small"             class="secondary-color"             on:click={() => {               // do not focus the fullscreenbutton if clicked               // this is because otherwise clicking space will cause               // the video player to maximize/minimize instead of pause/play               // when space is clicked               if (document.activeElement != document.body)                 document.activeElement.blur();                let div = document.getElementById("vid");               if (div.requestFullscreen) div.requestFullscreen();               else if (div.webkitRequestFullscreen)                 div.webkitRequestFullscreen();               else if (div.msRequestFullScreen) div.msRequestFullScreen();             }}           >
    function create_default_slot_1(ctx) {
    	let t_value = "Gigascreen" + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(136:10) <Button             size=\\\"small\\\"             class=\\\"secondary-color\\\"             on:click={() => {               // do not focus the fullscreenbutton if clicked               // this is because otherwise clicking space will cause               // the video player to maximize/minimize instead of pause/play               // when space is clicked               if (document.activeElement != document.body)                 document.activeElement.blur();                let div = document.getElementById(\\\"vid\\\");               if (div.requestFullscreen) div.requestFullscreen();               else if (div.webkitRequestFullscreen)                 div.webkitRequestFullscreen();               else if (div.msRequestFullScreen) div.msRequestFullScreen();             }}           >",
    		ctx
    	});

    	return block;
    }

    // (90:2) <Overlay     opacity={is_fullscreen ? 1 : 0.7}     color="black"     active={$video_player_is_active}     on:click={() => {       $video_player_is_active = false;     }}   >
    function create_default_slot(ctx) {
    	let div2;
    	let div0;
    	let button0;
    	let t0;
    	let div1;
    	let button1;
    	let t1;
    	let t2;
    	let player;
    	let current;
    	let mounted;
    	let dispose;

    	button0 = new Button({
    			props: {
    				class: "error-color",
    				size: "small",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler*/ ctx[2]);

    	button1 = new Button({
    			props: {
    				size: "small",
    				class: "primary-color",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_1*/ ctx[3]);
    	let if_block = /*is_fullscreen*/ ctx[0] && create_if_block(ctx);
    	player = new Player({ $$inline: true });

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(button0.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(button1.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			create_component(player.$$.fragment);
    			attr_dev(div0, "id", "close");
    			attr_dev(div0, "class", "svelte-q53y99");
    			add_location(div0, file, 104, 6, 3036);
    			attr_dev(div1, "id", "fullscreen");
    			attr_dev(div1, "class", "svelte-q53y99");
    			add_location(div1, file, 115, 6, 3271);
    			attr_dev(div2, "id", "video");
    			attr_dev(div2, "class", "svelte-q53y99");
    			toggle_class(div2, "fullscreen", /*is_fullscreen*/ ctx[0] == true);
    			add_location(div2, file, 97, 4, 2892);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(button0, div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			mount_component(button1, div1, null);
    			append_dev(div2, t1);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t2);
    			mount_component(player, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div2, "click", click_handler_3, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope, is_fullscreen*/ 65537) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);

    			if (/*is_fullscreen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*is_fullscreen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, t2);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*is_fullscreen*/ 1) {
    				toggle_class(div2, "fullscreen", /*is_fullscreen*/ ctx[0] == true);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(player.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(player.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(button0);
    			destroy_component(button1);
    			if (if_block) if_block.d();
    			destroy_component(player);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(90:2) <Overlay     opacity={is_fullscreen ? 1 : 0.7}     color=\\\"black\\\"     active={$video_player_is_active}     on:click={() => {       $video_player_is_active = false;     }}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let link;
    	let t0;
    	let main;
    	let h1;
    	let img;
    	let img_src_value;
    	let t1;
    	let t2;
    	let h30;
    	let t4;
    	let div0;
    	let t5;
    	let h31;
    	let t7;
    	let div1;
    	let t8;
    	let h32;
    	let t10;
    	let div2;
    	let t11;
    	let h33;
    	let t13;
    	let div3;
    	let t14;
    	let h34;
    	let t16;
    	let div4;
    	let t17;
    	let h35;
    	let t19;
    	let div5;
    	let t20;
    	let h36;
    	let t22;
    	let div6;
    	let t23;
    	let h37;
    	let t25;
    	let div7;
    	let t26;
    	let overlay;
    	let t27;
    	let src;
    	let current;
    	let each_value_7 = Array(7);
    	validate_each_argument(each_value_7);
    	let each_blocks_7 = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks_7[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	const out = i => transition_out(each_blocks_7[i], 1, 1, () => {
    		each_blocks_7[i] = null;
    	});

    	let each_value_6 = Array(7);
    	validate_each_argument(each_value_6);
    	let each_blocks_6 = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks_6[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	const out_1 = i => transition_out(each_blocks_6[i], 1, 1, () => {
    		each_blocks_6[i] = null;
    	});

    	let each_value_5 = Array(7);
    	validate_each_argument(each_value_5);
    	let each_blocks_5 = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks_5[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	const out_2 = i => transition_out(each_blocks_5[i], 1, 1, () => {
    		each_blocks_5[i] = null;
    	});

    	let each_value_4 = Array(7);
    	validate_each_argument(each_value_4);
    	let each_blocks_4 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_4[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const out_3 = i => transition_out(each_blocks_4[i], 1, 1, () => {
    		each_blocks_4[i] = null;
    	});

    	let each_value_3 = Array(7);
    	validate_each_argument(each_value_3);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_3[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const out_4 = i => transition_out(each_blocks_3[i], 1, 1, () => {
    		each_blocks_3[i] = null;
    	});

    	let each_value_2 = Array(7);
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out_5 = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let each_value_1 = Array(7);
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out_6 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = Array(7);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out_7 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	overlay = new Overlay({
    			props: {
    				opacity: /*is_fullscreen*/ ctx[0] ? 1 : 0.7,
    				color: "black",
    				active: /*$video_player_is_active*/ ctx[1],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	overlay.$on("click", /*click_handler_4*/ ctx[5]);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			main = element("main");
    			h1 = element("h1");
    			img = element("img");
    			t1 = text("                Netflex");
    			t2 = space();
    			h30 = element("h3");
    			h30.textContent = "Trendar";
    			t4 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_7.length; i += 1) {
    				each_blocks_7[i].c();
    			}

    			t5 = space();
    			h31 = element("h3");
    			h31.textContent = "Rekomenderat för dig";
    			t7 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_6.length; i += 1) {
    				each_blocks_6[i].c();
    			}

    			t8 = space();
    			h32 = element("h3");
    			h32.textContent = "Scräck";
    			t10 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				each_blocks_5[i].c();
    			}

    			t11 = space();
    			h33 = element("h3");
    			h33.textContent = "Humor";
    			t13 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].c();
    			}

    			t14 = space();
    			h34 = element("h3");
    			h34.textContent = "Action";
    			t16 = space();
    			div4 = element("div");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t17 = space();
    			h35 = element("h3");
    			h35.textContent = "Dramatik";
    			t19 = space();
    			div5 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t20 = space();
    			h36 = element("h3");
    			h36.textContent = "Dokumentär";
    			t22 = space();
    			div6 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t23 = space();
    			h37 = element("h3");
    			h37.textContent = "Ävetyr";
    			t25 = space();
    			div7 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t26 = space();
    			create_component(overlay.$$.fragment);
    			t27 = space();
    			src = element("src");
    			attr_dev(link, "href", "https://fonts.googleapis.com/css?family=Zen Maru Gothic");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "type", "text/css");
    			add_location(link, file, 0, 0, 0);
    			attr_dev(img, "class", "netflex svelte-q53y99");
    			if (!src_url_equal(img.src, img_src_value = "netflix2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "id", "logo");
    			attr_dev(img, "alt", "symbole");
    			attr_dev(img, "width", "110");
    			attr_dev(img, "height", "80");
    			add_location(img, file, 20, 18, 706);
    			attr_dev(h1, "id", "title");
    			attr_dev(h1, "class", "svelte-q53y99");
    			add_location(h1, file, 20, 2, 690);
    			attr_dev(h30, "id", "trendar");
    			attr_dev(h30, "class", "svelte-q53y99");
    			add_location(h30, file, 23, 2, 831);
    			attr_dev(div0, "class", "grid svelte-q53y99");
    			add_location(div0, file, 25, 2, 866);
    			attr_dev(h31, "class", "svelte-q53y99");
    			add_location(h31, file, 32, 2, 1077);
    			attr_dev(div1, "class", "grid svelte-q53y99");
    			add_location(div1, file, 33, 2, 1109);
    			attr_dev(h32, "class", "svelte-q53y99");
    			add_location(h32, file, 41, 2, 1329);
    			attr_dev(div2, "class", "grid svelte-q53y99");
    			add_location(div2, file, 42, 2, 1347);
    			attr_dev(h33, "class", "svelte-q53y99");
    			add_location(h33, file, 49, 2, 1559);
    			attr_dev(div3, "class", "grid svelte-q53y99");
    			add_location(div3, file, 50, 2, 1576);
    			attr_dev(h34, "class", "svelte-q53y99");
    			add_location(h34, file, 57, 2, 1788);
    			attr_dev(div4, "class", "grid svelte-q53y99");
    			add_location(div4, file, 58, 2, 1806);
    			attr_dev(h35, "class", "svelte-q53y99");
    			add_location(h35, file, 65, 2, 2018);
    			attr_dev(div5, "class", "grid svelte-q53y99");
    			add_location(div5, file, 66, 2, 2038);
    			attr_dev(h36, "class", "svelte-q53y99");
    			add_location(h36, file, 73, 2, 2250);
    			attr_dev(div6, "class", "grid svelte-q53y99");
    			add_location(div6, file, 74, 2, 2272);
    			attr_dev(h37, "class", "svelte-q53y99");
    			add_location(h37, file, 81, 2, 2484);
    			attr_dev(div7, "class", "grid svelte-q53y99");
    			add_location(div7, file, 82, 2, 2502);
    			add_location(src, file, 162, 2, 4849);
    			attr_dev(main, "class", "svelte-q53y99");
    			add_location(main, file, 18, 0, 678);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(h1, img);
    			append_dev(h1, t1);
    			append_dev(main, t2);
    			append_dev(main, h30);
    			append_dev(main, t4);
    			append_dev(main, div0);

    			for (let i = 0; i < each_blocks_7.length; i += 1) {
    				each_blocks_7[i].m(div0, null);
    			}

    			append_dev(main, t5);
    			append_dev(main, h31);
    			append_dev(main, t7);
    			append_dev(main, div1);

    			for (let i = 0; i < each_blocks_6.length; i += 1) {
    				each_blocks_6[i].m(div1, null);
    			}

    			append_dev(main, t8);
    			append_dev(main, h32);
    			append_dev(main, t10);
    			append_dev(main, div2);

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				each_blocks_5[i].m(div2, null);
    			}

    			append_dev(main, t11);
    			append_dev(main, h33);
    			append_dev(main, t13);
    			append_dev(main, div3);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].m(div3, null);
    			}

    			append_dev(main, t14);
    			append_dev(main, h34);
    			append_dev(main, t16);
    			append_dev(main, div4);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(div4, null);
    			}

    			append_dev(main, t17);
    			append_dev(main, h35);
    			append_dev(main, t19);
    			append_dev(main, div5);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div5, null);
    			}

    			append_dev(main, t20);
    			append_dev(main, h36);
    			append_dev(main, t22);
    			append_dev(main, div6);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div6, null);
    			}

    			append_dev(main, t23);
    			append_dev(main, h37);
    			append_dev(main, t25);
    			append_dev(main, div7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div7, null);
    			}

    			append_dev(main, t26);
    			mount_component(overlay, main, null);
    			append_dev(main, t27);
    			append_dev(main, src);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*videos*/ 0) {
    				each_value_7 = Array(7);
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7(ctx, each_value_7, i);

    					if (each_blocks_7[i]) {
    						each_blocks_7[i].p(child_ctx, dirty);
    						transition_in(each_blocks_7[i], 1);
    					} else {
    						each_blocks_7[i] = create_each_block_7(child_ctx);
    						each_blocks_7[i].c();
    						transition_in(each_blocks_7[i], 1);
    						each_blocks_7[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_7.length; i < each_blocks_7.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*videos2*/ 0) {
    				each_value_6 = Array(7);
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks_6[i]) {
    						each_blocks_6[i].p(child_ctx, dirty);
    						transition_in(each_blocks_6[i], 1);
    					} else {
    						each_blocks_6[i] = create_each_block_6(child_ctx);
    						each_blocks_6[i].c();
    						transition_in(each_blocks_6[i], 1);
    						each_blocks_6[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_6.length; i < each_blocks_6.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*videos3*/ 0) {
    				each_value_5 = Array(7);
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks_5[i]) {
    						each_blocks_5[i].p(child_ctx, dirty);
    						transition_in(each_blocks_5[i], 1);
    					} else {
    						each_blocks_5[i] = create_each_block_5(child_ctx);
    						each_blocks_5[i].c();
    						transition_in(each_blocks_5[i], 1);
    						each_blocks_5[i].m(div2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_5.length; i < each_blocks_5.length; i += 1) {
    					out_2(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*videos4*/ 0) {
    				each_value_4 = Array(7);
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks_4[i]) {
    						each_blocks_4[i].p(child_ctx, dirty);
    						transition_in(each_blocks_4[i], 1);
    					} else {
    						each_blocks_4[i] = create_each_block_4(child_ctx);
    						each_blocks_4[i].c();
    						transition_in(each_blocks_4[i], 1);
    						each_blocks_4[i].m(div3, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_4.length; i < each_blocks_4.length; i += 1) {
    					out_3(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*videos5*/ 0) {
    				each_value_3 = Array(7);
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    						transition_in(each_blocks_3[i], 1);
    					} else {
    						each_blocks_3[i] = create_each_block_3(child_ctx);
    						each_blocks_3[i].c();
    						transition_in(each_blocks_3[i], 1);
    						each_blocks_3[i].m(div4, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_3.length; i < each_blocks_3.length; i += 1) {
    					out_4(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*videos6*/ 0) {
    				each_value_2 = Array(7);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						transition_in(each_blocks_2[i], 1);
    						each_blocks_2[i].m(div5, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
    					out_5(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*videos7*/ 0) {
    				each_value_1 = Array(7);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div6, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out_6(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*videos8*/ 0) {
    				each_value = Array(7);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div7, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_7(i);
    				}

    				check_outros();
    			}

    			const overlay_changes = {};
    			if (dirty & /*is_fullscreen*/ 1) overlay_changes.opacity = /*is_fullscreen*/ ctx[0] ? 1 : 0.7;
    			if (dirty & /*$video_player_is_active*/ 2) overlay_changes.active = /*$video_player_is_active*/ ctx[1];

    			if (dirty & /*$$scope, is_fullscreen, $video_player_is_active*/ 65539) {
    				overlay_changes.$$scope = { dirty, ctx };
    			}

    			overlay.$set(overlay_changes);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_7.length; i += 1) {
    				transition_in(each_blocks_7[i]);
    			}

    			for (let i = 0; i < each_value_6.length; i += 1) {
    				transition_in(each_blocks_6[i]);
    			}

    			for (let i = 0; i < each_value_5.length; i += 1) {
    				transition_in(each_blocks_5[i]);
    			}

    			for (let i = 0; i < each_value_4.length; i += 1) {
    				transition_in(each_blocks_4[i]);
    			}

    			for (let i = 0; i < each_value_3.length; i += 1) {
    				transition_in(each_blocks_3[i]);
    			}

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(overlay.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_7 = each_blocks_7.filter(Boolean);

    			for (let i = 0; i < each_blocks_7.length; i += 1) {
    				transition_out(each_blocks_7[i]);
    			}

    			each_blocks_6 = each_blocks_6.filter(Boolean);

    			for (let i = 0; i < each_blocks_6.length; i += 1) {
    				transition_out(each_blocks_6[i]);
    			}

    			each_blocks_5 = each_blocks_5.filter(Boolean);

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				transition_out(each_blocks_5[i]);
    			}

    			each_blocks_4 = each_blocks_4.filter(Boolean);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				transition_out(each_blocks_4[i]);
    			}

    			each_blocks_3 = each_blocks_3.filter(Boolean);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				transition_out(each_blocks_3[i]);
    			}

    			each_blocks_2 = each_blocks_2.filter(Boolean);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(overlay.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_7, detaching);
    			destroy_each(each_blocks_6, detaching);
    			destroy_each(each_blocks_5, detaching);
    			destroy_each(each_blocks_4, detaching);
    			destroy_each(each_blocks_3, detaching);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			destroy_component(overlay);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const click_handler_3 = e => {
    	e.stopPropagation();
    };

    function instance($$self, $$props, $$invalidate) {
    	let $video_player_is_active;
    	validate_store(video_player_is_active, 'video_player_is_active');
    	component_subscribe($$self, video_player_is_active, $$value => $$invalidate(1, $video_player_is_active = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let is_fullscreen = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		set_store_value(video_player_is_active, $video_player_is_active = false, $video_player_is_active);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, is_fullscreen = !is_fullscreen);

    		// do not focus the fullscreenbutton if clicked
    		// this is because otherwise clicking space will cause
    		// the video player to maximize/minimize instead of pause/play
    		// when space is clicked
    		if (document.activeElement != document.body) document.activeElement.blur();
    	};

    	const click_handler_2 = () => {
    		// do not focus the fullscreenbutton if clicked
    		// this is because otherwise clicking space will cause
    		// the video player to maximize/minimize instead of pause/play
    		// when space is clicked
    		if (document.activeElement != document.body) document.activeElement.blur();

    		let div = document.getElementById("vid");
    		if (div.requestFullscreen) div.requestFullscreen(); else if (div.webkitRequestFullscreen) div.webkitRequestFullscreen(); else if (div.msRequestFullScreen) div.msRequestFullScreen();
    	};

    	const click_handler_4 = () => {
    		set_store_value(video_player_is_active, $video_player_is_active = false, $video_player_is_active);
    	};

    	$$self.$capture_state = () => ({
    		video_player_is_active,
    		Button,
    		Overlay,
    		videos,
    		videos2,
    		videos3,
    		videos4,
    		videos5,
    		videos6,
    		videos7,
    		videos8,
    		Player,
    		Thumbnail,
    		is_fullscreen,
    		$video_player_is_active
    	});

    	$$self.$inject_state = $$props => {
    		if ('is_fullscreen' in $$props) $$invalidate(0, is_fullscreen = $$props.is_fullscreen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		is_fullscreen,
    		$video_player_is_active,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_4
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
