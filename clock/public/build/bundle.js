
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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

    class Clock 

    {
        constructor(hour, minute)
        {
            if (hour<0 || hour>23)
            {
                throw Error ("The Hour Argument Must Be Between 0 and 23");
            }

            if (minute<0 || minute>59)
            {
                throw Error ("The Minute Argument Must Be Between 0 and 59");
            }
            this.hour = hour;
            this.minute = minute;
        }

        get timeRe(){
            return (this.hour< 10 ? "0" + this.hour : this.hour) + ":" + (this.minute< 10 ? "0" + this.minute : this.minute)
        }
        
        get time(){
            return {"hour":this.hour.toString().padStart(2, "0"),
            "minute":this.minute.toString().padStart(2, "0")}
        }

        get alarmTime(){
            return this.hour.toString().padStart(2, "0") + ":" + this.minute.toString().padStart(2, "0")
        }
        
        activateAlarm()
        {
            this.alarmIsActive = true;
        }
        
        deactivateAlarm()
        {
            this.alarmIsActive = false;
        }

        setAlarm(hour,minute)
        {
            if (hour<0 || hour>23)
            {
                throw Error ("The Alarm hour Argument Must Be Between 0 and 23");
            }

            if (minute<0 || minute>59)
            {
                throw Error ("The Alarm Minute Argument Must Be Between 0 and 59");
            }
            this.alarmHour = hour;
            this.alarmMinute = minute;
            clock.activateAlarm();
        }

        tick()
        {
            this.minute++;
            if (this.minute>=60)
            {
                this.hour++; 
                this.minute = 0;
            }

            if (this.hour>=24)
            {
                this.hour = 0;
            }
            console.log((this.hour< 10 ? "0" + this.hour : this.hour) + ":" + (this.minute< 10 ? "0" + this.minute : this.minute));
            if (this.alarmIsActive == true)
            if ((this.hour == this.alarmHour) && (this.minute == this.alarmMinute))
            {
                console.log("Larm!!!");
            }

        }
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }
    function draw(node, { delay = 0, speed, duration, easing = cubicInOut } = {}) {
        let len = node.getTotalLength();
        const style = getComputedStyle(node);
        if (style.strokeLinecap !== 'butt') {
            len += parseInt(style.strokeWidth);
        }
        if (duration === undefined) {
            if (speed === undefined) {
                duration = 800;
            }
            else {
                duration = len / speed;
            }
        }
        else if (typeof duration === 'function') {
            duration = duration(len);
        }
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `stroke-dasharray: ${t * len} ${u * len}`
        };
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

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function tick_spring(ctx, last_value, current_value, target_value) {
        if (typeof current_value === 'number' || is_date(current_value)) {
            // @ts-ignore
            const delta = target_value - current_value;
            // @ts-ignore
            const velocity = (current_value - last_value) / (ctx.dt || 1 / 60); // guard div by 0
            const spring = ctx.opts.stiffness * delta;
            const damper = ctx.opts.damping * velocity;
            const acceleration = (spring - damper) * ctx.inv_mass;
            const d = (velocity + acceleration) * ctx.dt;
            if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
                return target_value; // settled
            }
            else {
                ctx.settled = false; // signal loop to keep ticking
                // @ts-ignore
                return is_date(current_value) ?
                    new Date(current_value.getTime() + d) : current_value + d;
            }
        }
        else if (Array.isArray(current_value)) {
            // @ts-ignore
            return current_value.map((_, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
        }
        else if (typeof current_value === 'object') {
            const next_value = {};
            for (const k in current_value) {
                // @ts-ignore
                next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
            }
            // @ts-ignore
            return next_value;
        }
        else {
            throw new Error(`Cannot spring ${typeof current_value} values`);
        }
    }
    function spring(value, opts = {}) {
        const store = writable(value);
        const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
        let last_time;
        let task;
        let current_token;
        let last_value = value;
        let target_value = value;
        let inv_mass = 1;
        let inv_mass_recovery_rate = 0;
        let cancel_task = false;
        function set(new_value, opts = {}) {
            target_value = new_value;
            const token = current_token = {};
            if (value == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
                cancel_task = true; // cancel any running animation
                last_time = now();
                last_value = new_value;
                store.set(value = target_value);
                return Promise.resolve();
            }
            else if (opts.soft) {
                const rate = opts.soft === true ? .5 : +opts.soft;
                inv_mass_recovery_rate = 1 / (rate * 60);
                inv_mass = 0; // infinite mass, unaffected by spring forces
            }
            if (!task) {
                last_time = now();
                cancel_task = false;
                task = loop(now => {
                    if (cancel_task) {
                        cancel_task = false;
                        task = null;
                        return false;
                    }
                    inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
                    const ctx = {
                        inv_mass,
                        opts: spring,
                        settled: true,
                        dt: (now - last_time) * 60 / 1000
                    };
                    const next_value = tick_spring(ctx, last_value, value, target_value);
                    last_time = now;
                    last_value = value;
                    store.set(value = next_value);
                    if (ctx.settled) {
                        task = null;
                    }
                    return !ctx.settled;
                });
            }
            return new Promise(fulfil => {
                task.promise.then(() => {
                    if (token === current_token)
                        fulfil();
                });
            });
        }
        const spring = {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe,
            stiffness,
            damping,
            precision
        };
        return spring;
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* src\App.svelte generated by Svelte v3.44.1 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (70:14) {#key clock.time.hour}
    function create_key_block_5(ctx) {
    	let span;
    	let t_value = /*clock*/ ctx[0].time.hour + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file, 70, 8, 1864);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clock*/ 1 && t_value !== (t_value = /*clock*/ ctx[0].time.hour + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, { y: -20 });
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_5.name,
    		type: "key",
    		source: "(70:14) {#key clock.time.hour}",
    		ctx
    	});

    	return block;
    }

    // (76:4) {#key clock.time.minute}
    function create_key_block_4(ctx) {
    	let span;
    	let t_value = /*clock*/ ctx[0].time.minute + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file, 76, 8, 2004);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clock*/ 1 && t_value !== (t_value = /*clock*/ ctx[0].time.minute + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, { y: -20 });
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_4.name,
    		type: "key",
    		source: "(76:4) {#key clock.time.minute}",
    		ctx
    	});

    	return block;
    }

    // (103:16) {#each [1, 2, 3, 4] as offset}
    function create_each_block_1(ctx) {
    	let line;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "class", "hour svelte-zwmwen");
    			attr_dev(line, "y1", "44.2");
    			attr_dev(line, "y2", "49.5");
    			attr_dev(line, "transform", "rotate(" + 6 * (/*minutes*/ ctx[9] + /*offset*/ ctx[12]) + ")");
    			add_location(line, file, 103, 20, 2705);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(103:16) {#each [1, 2, 3, 4] as offset}",
    		ctx
    	});

    	return block;
    }

    // (95:12) {#each [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as minutes}
    function create_each_block(ctx) {
    	let line;
    	let each_1_anchor;
    	let each_value_1 = [1, 2, 3, 4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < 4; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			line = svg_element("line");

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(line, "class", "hour svelte-zwmwen");
    			attr_dev(line, "y1", "40.5");
    			attr_dev(line, "y2", "49.5");
    			attr_dev(line, "transform", "rotate(" + 30 * /*minutes*/ ctx[9] + ")");
    			add_location(line, file, 95, 16, 2460);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(95:12) {#each [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as minutes}",
    		ctx
    	});

    	return block;
    }

    // (129:17) {#key clock.time.hour}
    function create_key_block_3(ctx) {
    	let span;
    	let t_value = /*clock*/ ctx[0].time.hour + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file, 129, 12, 3411);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clock*/ 1 && t_value !== (t_value = /*clock*/ ctx[0].time.hour + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, { y: -20 });
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_3.name,
    		type: "key",
    		source: "(129:17) {#key clock.time.hour}",
    		ctx
    	});

    	return block;
    }

    // (135:8) {#key clock.time.minute}
    function create_key_block_2(ctx) {
    	let span;
    	let t_value = /*clock*/ ctx[0].time.minute + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file, 135, 12, 3575);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clock*/ 1 && t_value !== (t_value = /*clock*/ ctx[0].time.minute + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, { y: -20 });
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_2.name,
    		type: "key",
    		source: "(135:8) {#key clock.time.minute}",
    		ctx
    	});

    	return block;
    }

    // (175:18) {#key clock.time.hour}
    function create_key_block_1(ctx) {
    	let span;
    	let t_value = /*clock*/ ctx[0].time.hour + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file, 175, 12, 4797);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clock*/ 1 && t_value !== (t_value = /*clock*/ ctx[0].time.hour + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, { y: -20 });
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_1.name,
    		type: "key",
    		source: "(175:18) {#key clock.time.hour}",
    		ctx
    	});

    	return block;
    }

    // (181:8) {#key clock.time.minute}
    function create_key_block(ctx) {
    	let span;
    	let t_value = /*clock*/ ctx[0].time.minute + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file, 181, 12, 4961);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clock*/ 1 && t_value !== (t_value = /*clock*/ ctx[0].time.minute + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, { y: -20 });
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(181:8) {#key clock.time.minute}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let link2;
    	let t2;
    	let link3;
    	let t3;
    	let main;
    	let div0;
    	let p0;
    	let t4;
    	let previous_key = /*clock*/ ctx[0].time.hour;
    	let t5;
    	let span0;
    	let t7;
    	let previous_key_1 = /*clock*/ ctx[0].time.minute;
    	let t8;
    	let button0;
    	let t10;
    	let div1;
    	let svg0;
    	let circle;
    	let line0;
    	let line0_transform_value;
    	let line1;
    	let line1_transform_value;
    	let t11;
    	let p1;
    	let t12;
    	let previous_key_2 = /*clock*/ ctx[0].time.hour;
    	let t13;
    	let span1;
    	let t15;
    	let previous_key_3 = /*clock*/ ctx[0].time.minute;
    	let t16;
    	let button1;
    	let input0;
    	let t17;
    	let button2;
    	let input1;
    	let t18;
    	let p2;
    	let t20;
    	let div2;
    	let svg1;
    	let rect0;
    	let rect0_y_value;
    	let rect1;
    	let t21;
    	let svg2;
    	let rect2;
    	let rect2_y_value;
    	let rect3;
    	let t22;
    	let p3;
    	let t23;
    	let previous_key_4 = /*clock*/ ctx[0].time.hour;
    	let t24;
    	let span2;
    	let t26;
    	let previous_key_5 = /*clock*/ ctx[0].time.minute;
    	let t27;
    	let button3;
    	let mounted;
    	let dispose;
    	let key_block0 = create_key_block_5(ctx);
    	let key_block1 = create_key_block_4(ctx);
    	let each_value = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < 12; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let key_block2 = create_key_block_3(ctx);
    	let key_block3 = create_key_block_2(ctx);
    	let key_block4 = create_key_block_1(ctx);
    	let key_block5 = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			t0 = space();
    			link1 = element("link");
    			t1 = space();
    			link2 = element("link");
    			t2 = space();
    			link3 = element("link");
    			t3 = space();
    			main = element("main");
    			div0 = element("div");
    			p0 = element("p");
    			t4 = text("Time: ");
    			key_block0.c();
    			t5 = space();
    			span0 = element("span");
    			span0.textContent = ":";
    			t7 = space();
    			key_block1.c();
    			t8 = space();
    			button0 = element("button");
    			button0.textContent = "+ Seconds";
    			t10 = space();
    			div1 = element("div");
    			svg0 = svg_element("svg");
    			circle = svg_element("circle");

    			for (let i = 0; i < 12; i += 1) {
    				each_blocks[i].c();
    			}

    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			t11 = space();
    			p1 = element("p");
    			t12 = text("Time: ");
    			key_block2.c();
    			t13 = space();
    			span1 = element("span");
    			span1.textContent = ":";
    			t15 = space();
    			key_block3.c();
    			t16 = space();
    			button1 = element("button");
    			input0 = element("input");
    			t17 = space();
    			button2 = element("button");
    			input1 = element("input");
    			t18 = space();
    			p2 = element("p");
    			p2.textContent = "alarm is not triggerd";
    			t20 = space();
    			div2 = element("div");
    			svg1 = svg_element("svg");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			t21 = space();
    			svg2 = svg_element("svg");
    			rect2 = svg_element("rect");
    			rect3 = svg_element("rect");
    			t22 = space();
    			p3 = element("p");
    			t23 = text("Time: ");
    			key_block4.c();
    			t24 = space();
    			span2 = element("span");
    			span2.textContent = ":";
    			t26 = space();
    			key_block5.c();
    			t27 = space();
    			button3 = element("button");
    			button3.textContent = "+ Seconds";
    			attr_dev(link0, "href", "https://fonts.googleapis.com/css?family=Dancing Script");
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "type", "text/css");
    			add_location(link0, file, 0, 0, 0);
    			attr_dev(link1, "href", "https://fonts.googleapis.com/css?family=Road Rage");
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "type", "text/css");
    			add_location(link1, file, 1, 0, 102);
    			attr_dev(link2, "href", "https://fonts.googleapis.com/css?family=Yanone Kaffeesatz");
    			attr_dev(link2, "rel", "stylesheet");
    			attr_dev(link2, "type", "text/css");
    			add_location(link2, file, 2, 0, 199);
    			attr_dev(link3, "href", "https://fonts.googleapis.com/css?family=Merienda");
    			attr_dev(link3, "rel", "stylesheet");
    			attr_dev(link3, "type", "text/css");
    			add_location(link3, file, 3, 0, 304);
    			add_location(span0, file, 74, 4, 1952);
    			attr_dev(p0, "id", "tid");
    			attr_dev(p0, "class", "svelte-zwmwen");
    			add_location(p0, file, 68, 4, 1805);
    			attr_dev(button0, "class", "svelte-zwmwen");
    			add_location(button0, file, 83, 4, 2105);
    			attr_dev(div0, "class", "kolumner");
    			add_location(div0, file, 66, 4, 1777);
    			attr_dev(circle, "class", "clock-face svelte-zwmwen");
    			attr_dev(circle, "r", "0");
    			add_location(circle, file, 92, 12, 2324);
    			attr_dev(line0, "class", "hour svelte-zwmwen");
    			attr_dev(line0, "y1", "-4");
    			attr_dev(line0, "y2", "33");
    			attr_dev(line0, "transform", line0_transform_value = "rotate(" + (180 + 6 * /*clock*/ ctx[0].minute) + ")");
    			add_location(line0, file, 112, 12, 2969);
    			attr_dev(line1, "class", "hour svelte-zwmwen");
    			attr_dev(line1, "y1", "-4");
    			attr_dev(line1, "y2", "28");
    			attr_dev(line1, "transform", line1_transform_value = "rotate(" + (180 + 6 / 12 * (/*clock*/ ctx[0].hour * 60 + /*clock*/ ctx[0].minute)) + ")");
    			add_location(line1, file, 119, 12, 3145);
    			attr_dev(svg0, "viewBox", "-50 -50 100 100");
    			attr_dev(svg0, "class", "clock-face svelte-zwmwen");
    			set_style(svg0, "background-size", "300% 300%");
    			set_style(svg0, "border-radius", "50%");
    			add_location(svg0, file, 91, 8, 2205);
    			add_location(span1, file, 133, 8, 3515);
    			attr_dev(p1, "class", "svelte-zwmwen");
    			add_location(p1, file, 127, 8, 3355);
    			attr_dev(input0, "type", "time");
    			attr_dev(input0, "id", "alarm-time");
    			attr_dev(input0, "class", "center svelte-zwmwen");
    			attr_dev(input0, "name", "alarm-time");
    			add_location(input0, file, 143, 12, 3742);
    			attr_dev(button1, "id", "Set-Alarm");
    			attr_dev(button1, "class", "svelte-zwmwen");
    			add_location(button1, file, 142, 8, 3704);
    			attr_dev(input1, "id", "alarm-time");
    			attr_dev(input1, "class", "center svelte-zwmwen");
    			attr_dev(input1, "type", "button");
    			input1.value = "Set Alarm";
    			add_location(input1, file, 147, 12, 3883);
    			attr_dev(button2, "id", "Set-Alarm");
    			attr_dev(button2, "class", "svelte-zwmwen");
    			add_location(button2, file, 146, 8, 3846);
    			attr_dev(p2, "id", "alarm-text");
    			attr_dev(p2, "class", "svelte-zwmwen");
    			add_location(p2, file, 151, 8, 4008);
    			attr_dev(div1, "class", "kolumner");
    			add_location(div1, file, 89, 4, 2173);
    			attr_dev(rect0, "x", "0");
    			attr_dev(rect0, "y", rect0_y_value = 198 - /*clock*/ ctx[0].hour * 8.53);
    			attr_dev(rect0, "width", "100%");
    			attr_dev(rect0, "height", "200");
    			set_style(rect0, "fill", "rgb(0,200,240)");
    			set_style(rect0, "stroke", "rgb(0,150,240)");
    			add_location(rect0, file, 161, 12, 4164);
    			attr_dev(rect1, "x", "0");
    			attr_dev(rect1, "y", "0");
    			attr_dev(rect1, "width", "100%");
    			attr_dev(rect1, "height", "100%");
    			set_style(rect1, "fill", "none");
    			set_style(rect1, "stroke", "rgb(0,0,0)");
    			add_location(rect1, file, 163, 12, 4304);
    			attr_dev(svg1, "id", "clock3");
    			attr_dev(svg1, "width", "80");
    			attr_dev(svg1, "height", "200");
    			attr_dev(svg1, "class", "svelte-zwmwen");
    			add_location(svg1, file, 159, 8, 4109);
    			attr_dev(rect2, "x", "0");
    			attr_dev(rect2, "y", rect2_y_value = 202 - /*clock*/ ctx[0].minute * 3.31);
    			attr_dev(rect2, "width", "100%");
    			attr_dev(rect2, "height", "210");
    			set_style(rect2, "fill", "rgb(0,200,240)");
    			set_style(rect2, "stroke", "rgb(0,150,240)");
    			add_location(rect2, file, 167, 12, 4471);
    			attr_dev(rect3, "x", "0");
    			attr_dev(rect3, "y", "0");
    			attr_dev(rect3, "width", "100%");
    			attr_dev(rect3, "height", "100%");
    			set_style(rect3, "fill", "none");
    			set_style(rect3, "stroke", "rgb(0,0,0)");
    			add_location(rect3, file, 168, 12, 4607);
    			attr_dev(svg2, "id", "clock3");
    			attr_dev(svg2, "width", "80");
    			attr_dev(svg2, "height", "200");
    			attr_dev(svg2, "class", "svelte-zwmwen");
    			add_location(svg2, file, 166, 8, 4415);
    			add_location(span2, file, 179, 8, 4901);
    			attr_dev(p3, "class", "svelte-zwmwen");
    			add_location(p3, file, 173, 8, 4740);
    			attr_dev(button3, "class", "svelte-zwmwen");
    			add_location(button3, file, 187, 8, 5081);
    			add_location(div2, file, 157, 4, 4094);
    			attr_dev(main, "class", "svelte-zwmwen");
    			add_location(main, file, 65, 0, 1766);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, link1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, link2, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, link3, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t4);
    			key_block0.m(p0, null);
    			append_dev(p0, t5);
    			append_dev(p0, span0);
    			append_dev(p0, t7);
    			key_block1.m(p0, null);
    			append_dev(div0, t8);
    			append_dev(div0, button0);
    			append_dev(main, t10);
    			append_dev(main, div1);
    			append_dev(div1, svg0);
    			append_dev(svg0, circle);

    			for (let i = 0; i < 12; i += 1) {
    				each_blocks[i].m(svg0, null);
    			}

    			append_dev(svg0, line0);
    			append_dev(svg0, line1);
    			append_dev(div1, t11);
    			append_dev(div1, p1);
    			append_dev(p1, t12);
    			key_block2.m(p1, null);
    			append_dev(p1, t13);
    			append_dev(p1, span1);
    			append_dev(p1, t15);
    			key_block3.m(p1, null);
    			append_dev(div1, t16);
    			append_dev(div1, button1);
    			append_dev(button1, input0);
    			append_dev(div1, t17);
    			append_dev(div1, button2);
    			append_dev(button2, input1);
    			append_dev(div1, t18);
    			append_dev(div1, p2);
    			append_dev(main, t20);
    			append_dev(main, div2);
    			append_dev(div2, svg1);
    			append_dev(svg1, rect0);
    			append_dev(svg1, rect1);
    			append_dev(div2, t21);
    			append_dev(div2, svg2);
    			append_dev(svg2, rect2);
    			append_dev(svg2, rect3);
    			append_dev(div2, t22);
    			append_dev(div2, p3);
    			append_dev(p3, t23);
    			key_block4.m(p3, null);
    			append_dev(p3, t24);
    			append_dev(p3, span2);
    			append_dev(p3, t26);
    			key_block5.m(p3, null);
    			append_dev(div2, t27);
    			append_dev(div2, button3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*tick*/ ctx[1], false, false, false),
    					listen_dev(input1, "click", /*setAlarmTime*/ ctx[2], false, false, false),
    					listen_dev(button3, "click", /*tick*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*clock*/ 1 && safe_not_equal(previous_key, previous_key = /*clock*/ ctx[0].time.hour)) {
    				group_outros();
    				transition_out(key_block0, 1, 1, noop);
    				check_outros();
    				key_block0 = create_key_block_5(ctx);
    				key_block0.c();
    				transition_in(key_block0);
    				key_block0.m(p0, t5);
    			} else {
    				key_block0.p(ctx, dirty);
    			}

    			if (dirty & /*clock*/ 1 && safe_not_equal(previous_key_1, previous_key_1 = /*clock*/ ctx[0].time.minute)) {
    				group_outros();
    				transition_out(key_block1, 1, 1, noop);
    				check_outros();
    				key_block1 = create_key_block_4(ctx);
    				key_block1.c();
    				transition_in(key_block1);
    				key_block1.m(p0, null);
    			} else {
    				key_block1.p(ctx, dirty);
    			}

    			if (dirty & /*clock*/ 1 && line0_transform_value !== (line0_transform_value = "rotate(" + (180 + 6 * /*clock*/ ctx[0].minute) + ")")) {
    				attr_dev(line0, "transform", line0_transform_value);
    			}

    			if (dirty & /*clock*/ 1 && line1_transform_value !== (line1_transform_value = "rotate(" + (180 + 6 / 12 * (/*clock*/ ctx[0].hour * 60 + /*clock*/ ctx[0].minute)) + ")")) {
    				attr_dev(line1, "transform", line1_transform_value);
    			}

    			if (dirty & /*clock*/ 1 && safe_not_equal(previous_key_2, previous_key_2 = /*clock*/ ctx[0].time.hour)) {
    				group_outros();
    				transition_out(key_block2, 1, 1, noop);
    				check_outros();
    				key_block2 = create_key_block_3(ctx);
    				key_block2.c();
    				transition_in(key_block2);
    				key_block2.m(p1, t13);
    			} else {
    				key_block2.p(ctx, dirty);
    			}

    			if (dirty & /*clock*/ 1 && safe_not_equal(previous_key_3, previous_key_3 = /*clock*/ ctx[0].time.minute)) {
    				group_outros();
    				transition_out(key_block3, 1, 1, noop);
    				check_outros();
    				key_block3 = create_key_block_2(ctx);
    				key_block3.c();
    				transition_in(key_block3);
    				key_block3.m(p1, null);
    			} else {
    				key_block3.p(ctx, dirty);
    			}

    			if (dirty & /*clock*/ 1 && rect0_y_value !== (rect0_y_value = 198 - /*clock*/ ctx[0].hour * 8.53)) {
    				attr_dev(rect0, "y", rect0_y_value);
    			}

    			if (dirty & /*clock*/ 1 && rect2_y_value !== (rect2_y_value = 202 - /*clock*/ ctx[0].minute * 3.31)) {
    				attr_dev(rect2, "y", rect2_y_value);
    			}

    			if (dirty & /*clock*/ 1 && safe_not_equal(previous_key_4, previous_key_4 = /*clock*/ ctx[0].time.hour)) {
    				group_outros();
    				transition_out(key_block4, 1, 1, noop);
    				check_outros();
    				key_block4 = create_key_block_1(ctx);
    				key_block4.c();
    				transition_in(key_block4);
    				key_block4.m(p3, t24);
    			} else {
    				key_block4.p(ctx, dirty);
    			}

    			if (dirty & /*clock*/ 1 && safe_not_equal(previous_key_5, previous_key_5 = /*clock*/ ctx[0].time.minute)) {
    				group_outros();
    				transition_out(key_block5, 1, 1, noop);
    				check_outros();
    				key_block5 = create_key_block(ctx);
    				key_block5.c();
    				transition_in(key_block5);
    				key_block5.m(p3, null);
    			} else {
    				key_block5.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			transition_in(key_block0);
    			transition_in(key_block1);
    			transition_in(key_block2);
    			transition_in(key_block3);
    			transition_in(key_block4);
    			transition_in(key_block5);
    		},
    		o: function outro(local) {
    			transition_out(key_block0);
    			transition_out(key_block1);
    			transition_out(key_block2);
    			transition_out(key_block3);
    			transition_out(key_block4);
    			transition_out(key_block5);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(link1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(link2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(link3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(main);
    			key_block0.d(detaching);
    			key_block1.d(detaching);
    			destroy_each(each_blocks, detaching);
    			key_block2.d(detaching);
    			key_block3.d(detaching);
    			key_block4.d(detaching);
    			key_block5.d(detaching);
    			mounted = false;
    			run_all(dispose);
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

    function Alarm() {
    	document.getElementById("alarm-text").innerText = "Wake Up!!!";
    }

    function instance($$self, $$props, $$invalidate) {
    	let hour;
    	let minute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let clock = new Clock(8, 20);
    	let clock2 = new Clock(13, 37);
    	let clock3 = new Clock(21, 44);
    	var alarmTime = 0;
    	let i = 0;

    	function tick() {
    		clock.tick();
    		$$invalidate(0, clock);

    		if (clock.timeRe == alarmTime) {
    			Alarm();
    		}

    		i++;
    		clock2.tick();
    		$$invalidate(3, clock2);
    		i++;
    		hour.set(clock2.hour);
    		minute.set(clock2.minute);

    		if (clock2.timeRe == alarmTime) {
    			Alarm();
    		}

    		clock3.tick();
    		clock3 = clock3;
    		minute.set(clock3.hour);

    		if (clock3.timeRe == alarmTime) {
    			Alarm();
    		}

    		i++;
    	}

    	setInterval(tick, 1000);

    	function setAlarmTime() {
    		alarmTime = document.getElementById("alarm-time").value;
    		document.getElementById("alarm-text").innerText = "Alarm Is Set" + " " + document.getElementById("alarm-time").value;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Clock,
    		fade,
    		fly,
    		slide,
    		draw,
    		spring,
    		tweened,
    		clock,
    		clock2,
    		clock3,
    		alarmTime,
    		i,
    		tick,
    		setAlarmTime,
    		Alarm,
    		minute,
    		hour
    	});

    	$$self.$inject_state = $$props => {
    		if ('clock' in $$props) $$invalidate(0, clock = $$props.clock);
    		if ('clock2' in $$props) $$invalidate(3, clock2 = $$props.clock2);
    		if ('clock3' in $$props) clock3 = $$props.clock3;
    		if ('alarmTime' in $$props) alarmTime = $$props.alarmTime;
    		if ('i' in $$props) i = $$props.i;
    		if ('minute' in $$props) minute = $$props.minute;
    		if ('hour' in $$props) hour = $$props.hour;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*clock2*/ 8) {
    			hour = spring(clock2.hour);
    		}

    		if ($$self.$$.dirty & /*clock*/ 1) {
    			minute = spring(parseInt(clock.time.hour) * 60 + parseInt(clock.time.minute));
    		}
    	};

    	return [clock, tick, setAlarmTime, clock2];
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
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
