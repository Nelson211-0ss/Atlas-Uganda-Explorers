/**
 * Atlas Uganda Explorers – shared layout & interactions
 * Loads header/footer partials, runs the preloader, and wires up
 * scroll animations, the hero slider, parallax and the mobile menu.
 */
(function () {
    'use strict';

    var root = document.documentElement;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.classList.add('js');

    function $(sel, ctx) { return (ctx || document).querySelector(sel); }
    function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

    function loadPartial(id, url) {
        var placeholder = document.getElementById(id);
        if (!placeholder) return Promise.resolve();
        return fetch(url)
            .then(function (res) { return res.text(); })
            .then(function (html) { placeholder.outerHTML = html; })
            .catch(function (err) { console.error('Error loading ' + url + ':', err); });
    }

    /* ---------- Preloader ---------- */
    function runPreloader() {
        var loader = $('.preloader');
        if (!loader) return Promise.resolve();

        var bar = $('.preloader-bar span', loader);
        var count = $('.preloader-count', loader);
        var seen = false;
        try { seen = sessionStorage.getItem('aue-visited') === '1'; sessionStorage.setItem('aue-visited', '1'); } catch (e) {}
        var minTime = reducedMotion ? 0 : (seen ? 500 : 1600);
        var start = performance.now();

        var images = $$('img').filter(function (img) { return img.loading !== 'lazy'; });
        var total = images.length || 1;
        var done = 0;
        var shown = 0;

        function setProgress(p) {
            shown = Math.max(shown, p);
            if (bar) bar.style.width = shown + '%';
            if (count) count.textContent = Math.round(shown) + '%';
        }

        return new Promise(function (resolve) {
            var finished = false;
            function finish() {
                if (finished) return;
                finished = true;
                setProgress(100);
                var wait = Math.max(0, minTime - (performance.now() - start));
                setTimeout(function () {
                    loader.classList.add('is-done');
                    document.body.classList.remove('is-loading');
                    resolve();
                    setTimeout(function () { loader.classList.add('is-hidden'); }, 1000);
                }, wait);
            }
            function tick() {
                done++;
                setProgress(Math.min(95, (done / total) * 100));
                if (done >= total) finish();
            }
            if (!images.length) { finish(); return; }
            images.forEach(function (img) {
                if (img.complete) tick();
                else { img.addEventListener('load', tick, { once: true }); img.addEventListener('error', tick, { once: true }); }
            });
            // Never block the page for too long on slow connections
            setTimeout(finish, 4500);
        });
    }

    /* ---------- Header ---------- */
    function initHeader() {
        var header = $('.site-header');
        if (!header) return;

        var page = location.pathname.split('/').pop() || 'index.html';
        if (page.indexOf('.html') === -1) page += '.html';
        $$('.nav-menu a', header).forEach(function (a) {
            if (a.getAttribute('href') === page) a.classList.add('is-active');
        });

        var toggle = $('.menu-toggle', header);
        function setMenu(open) {
            document.body.classList.toggle('menu-open', open);
            if (toggle) {
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
                toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            }
        }
        if (toggle) toggle.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
        $$('.nav-menu a', header).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
        window.toggleMenu = function () { setMenu(!document.body.classList.contains('menu-open')); };
    }

    /* ---------- Scroll-driven UI (header state, progress, parallax, to-top) ---------- */
    function initScroll() {
        var header = $('.site-header');
        var progress = document.createElement('div');
        progress.className = 'scroll-progress';
        document.body.appendChild(progress);
        var toTop = $('.to-top');
        var mobileBar = $('.mobile-bar');
        var parallax = reducedMotion ? [] : $$('[data-parallax]');
        var statements = $$('[data-words]');
        var lastY = window.scrollY;
        var ticking = false;

        if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }); });

        function update() {
            var y = window.scrollY;
            var vh = window.innerHeight;
            var max = document.documentElement.scrollHeight - vh;
            progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';

            if (header) {
                header.classList.toggle('is-scrolled', y > 40);
                header.classList.toggle('is-hidden', y > 400 && y > lastY + 2 && !document.body.classList.contains('menu-open'));
                if (y < lastY - 2) header.classList.remove('is-hidden');
            }
            if (toTop) toTop.classList.toggle('is-visible', y > vh);
            if (mobileBar) mobileBar.classList.toggle('is-visible', y > vh * 0.6);

            parallax.forEach(function (el) {
                var rect = el.parentElement.getBoundingClientRect();
                if (rect.bottom < 0 || rect.top > vh) return;
                var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
                var offset = (rect.top + rect.height / 2 - vh / 2) * -speed;
                el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
            });

            statements.forEach(function (el) {
                var rect = el.getBoundingClientRect();
                var p = (vh * 0.85 - rect.top) / (rect.height + vh * 0.35);
                var words = el._words || [];
                var lit = Math.round(Math.max(0, Math.min(1, p)) * words.length);
                for (var i = 0; i < words.length; i++) words[i].classList.toggle('is-lit', i < lit);
            });

            lastY = y;
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    /* ---------- Word-by-word statement ---------- */
    function splitWords(el) {
        var words = [];
        function wrap(node, parent) {
            node.textContent.split(/(\s+)/).forEach(function (part) {
                if (!part) return;
                if (/^\s+$/.test(part)) { parent.appendChild(document.createTextNode(part)); return; }
                var s = document.createElement('span');
                s.className = 'word';
                s.textContent = part;
                parent.appendChild(s);
                words.push(s);
            });
        }
        Array.prototype.slice.call(el.childNodes).forEach(function (node) {
            if (node.nodeType === 3) {
                var frag = document.createDocumentFragment();
                wrap(node, frag);
                el.replaceChild(frag, node);
            } else if (node.nodeType === 1) {
                var text = node.textContent;
                node.textContent = '';
                wrap({ textContent: text }, node);
            }
        });
        el._words = words;
        if (reducedMotion) words.forEach(function (w) { w.classList.add('is-lit'); });
    }

    /* ---------- Reveal on scroll ---------- */
    function initReveals() {
        $$('[data-split]').forEach(function (el) {
            $$('.line > span', el).forEach(function (span, i) { span.style.setProperty('--i', i); });
        });
        // Auto-stagger children of [data-stagger]
        $$('[data-stagger]').forEach(function (group) {
            var step = parseFloat(group.getAttribute('data-stagger')) || 0.1;
            Array.prototype.forEach.call(group.children, function (child, i) {
                if (!child.hasAttribute('data-reveal') && !child.hasAttribute('data-mask')) child.setAttribute('data-reveal', 'up');
                child.style.setProperty('--d', (i * step).toFixed(2) + 's');
            });
        });

        var targets = $$('[data-reveal], [data-mask], [data-split]');
        if (!('IntersectionObserver' in window) || reducedMotion) {
            targets.forEach(function (el) { el.classList.add('is-in'); });
            return;
        }
        // A fully clipped [data-mask] never reports as intersecting, so watch its parent instead
        var owners = new Map();
        targets.forEach(function (el) {
            var watch = el.hasAttribute('data-mask') ? el.parentElement : el;
            if (!owners.has(watch)) owners.set(watch, []);
            owners.get(watch).push(el);
        });
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    (owners.get(entry.target) || []).forEach(function (el) { el.classList.add('is-in'); });
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        owners.forEach(function (_, watch) { io.observe(watch); });
    }

    /* ---------- Counters ---------- */
    function initCounters() {
        var counters = $$('[data-count]');
        if (!counters.length) return;
        function run(el) {
            var target = parseFloat(el.getAttribute('data-count'));
            var node = Array.prototype.filter.call(el.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim(); })[0];
            if (!node) return;
            if (reducedMotion) { node.nodeValue = target; return; }
            var dur = 1800;
            var t0 = performance.now();
            (function step(now) {
                var p = Math.min(1, (now - t0) / dur);
                var eased = 1 - Math.pow(1 - p, 4);
                node.nodeValue = Math.round(target * eased);
                if (p < 1) requestAnimationFrame(step);
            })(t0);
        }
        if (!('IntersectionObserver' in window)) { counters.forEach(run); return; }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
            });
        }, { threshold: 0.6 });
        counters.forEach(function (el) { io.observe(el); });
    }

    /* ---------- Hero slider ---------- */
    function initSlider() {
        var hero = $('.hero');
        if (!hero) return;
        var slides = $$('.hero-slide', hero);
        if (slides.length < 2) return;
        var current = $('[data-slide-current]', hero);
        var label = $('[data-slide-label]', hero);
        var bar = $('.hero-progress span', hero);
        var index = 0;
        var timer;
        var DURATION = 6000;

        function pad(n) { return (n < 10 ? '0' : '') + n; }
        function go(n) {
            slides[index].classList.remove('is-active');
            index = (n + slides.length) % slides.length;
            slides[index].classList.add('is-active');
            if (current) current.textContent = pad(index + 1);
            if (label) label.textContent = slides[index].getAttribute('data-label') || '';
            if (bar) { bar.classList.remove('is-running'); void bar.offsetWidth; bar.classList.add('is-running'); }
            clearTimeout(timer);
            timer = setTimeout(function () { go(index + 1); }, DURATION);
        }
        $$('[data-slide-prev]', hero).forEach(function (b) { b.addEventListener('click', function () { go(index - 1); }); });
        $$('[data-slide-next]', hero).forEach(function (b) { b.addEventListener('click', function () { go(index + 1); }); });

        var startX = null;
        hero.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
        hero.addEventListener('touchend', function (e) {
            if (startX === null) return;
            var dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
            startX = null;
        });
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) clearTimeout(timer); else go(index);
        });
        go(0);
    }

    /* ---------- Floating image preview on service rows ---------- */
    function initRowPreview() {
        var rows = $$('[data-preview]');
        if (!rows.length || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        var box = document.createElement('div');
        box.className = 'svc-preview';
        var img = document.createElement('img');
        img.alt = '';
        box.appendChild(img);
        document.body.appendChild(box);
        var x = 0, y = 0, cx = 0, cy = 0, raf = null;
        function loop() {
            cx += (x - cx) * 0.15;
            cy += (y - cy) * 0.15;
            box.style.left = cx + 'px';
            box.style.top = cy + 'px';
            raf = requestAnimationFrame(loop);
        }
        rows.forEach(function (row) {
            row.addEventListener('mouseenter', function (e) {
                img.src = row.getAttribute('data-preview');
                cx = x = e.clientX; cy = y = e.clientY;
                box.classList.add('is-visible');
                if (!raf) loop();
            });
            row.addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; });
            row.addEventListener('mouseleave', function () {
                box.classList.remove('is-visible');
                cancelAnimationFrame(raf);
                raf = null;
            });
        });
    }

    /* ---------- Contact form: compose an email to the team ---------- */
    function initContactForm() {
        var form = $('[data-contact-form]');
        if (!form) return;
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var data = new FormData(form);
            var name = data.get('name') || '';
            var subject = 'Trip enquiry' + (data.get('interest') ? ' – ' + data.get('interest') : '') + (name ? ' from ' + name : '');
            var lines = [
                'Name: ' + name,
                'Email: ' + (data.get('email') || ''),
                'Phone: ' + (data.get('phone') || '-'),
                'Interested in: ' + (data.get('interest') || '-'),
                '',
                data.get('message') || ''
            ];
            window.location.href = 'mailto:atlasugandaexplorers@gmail.com?subject=' +
                encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
            var note = $('[data-form-note]', form);
            if (note) note.textContent = 'Opening your email app… you can also reach us on WhatsApp.';
        });
    }

    function init() {
        document.body.classList.add('is-loading');
        $$('[data-words]').forEach(splitWords);

        Promise.all([
            loadPartial('header-placeholder', 'header.html'),
            loadPartial('footer-placeholder', 'footer.html')
        ]).then(function () {
            $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
            initHeader();
            initScroll();
            initRowPreview();
            initContactForm();
            return runPreloader();
        }).then(function () {
            initReveals();
            initCounters();
            initSlider();
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
