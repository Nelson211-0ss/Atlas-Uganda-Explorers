/**
 * Atlas Uganda Explorers – shared layout
 * Loads header and footer into #header-placeholder and #footer-placeholder on every page.
 */
(function() {
    'use strict';

    window.toggleMenu = function() {
        var menu = document.querySelector('.nav-menu');
        var icon = document.querySelector('#menu-icon');
        if (menu) {
            menu.classList.toggle('active');
            if (icon) {
                icon.classList.toggle('fa-bars', !menu.classList.contains('active'));
                icon.classList.toggle('fa-xmark', menu.classList.contains('active'));
            }
            var ph = document.getElementById('header-placeholder');
            var headerEl = document.querySelector('.site-header');
            if (ph && headerEl) ph.style.height = headerEl.offsetHeight + 'px';
        }
    };

    function loadHeader() {
        var placeholder = document.getElementById('header-placeholder');
        if (!placeholder) return;
        fetch('header.html')
            .then(function(response) { return response.text(); })
            .then(function(html) {
                placeholder.innerHTML = html;
                var headerEl = placeholder.querySelector('.site-header');
                if (headerEl) {
                    placeholder.style.height = headerEl.offsetHeight + 'px';
                }
                placeholder.addEventListener('click', function(e) {
                    if (e.target.closest('.menu-toggle')) toggleMenu();
                    if (e.target.closest('.nav-menu a') && document.querySelector('.nav-menu.active')) toggleMenu();
                });
            })
            .catch(function(err) { console.error('Error loading header:', err); });
    }

    function loadFooter() {
        var placeholder = document.getElementById('footer-placeholder');
        if (!placeholder) return;
        fetch('footer.html')
            .then(function(response) { return response.text(); })
            .then(function(html) { placeholder.innerHTML = html; })
            .catch(function(err) { console.error('Error loading footer:', err); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            loadHeader();
            loadFooter();
        });
    } else {
        loadHeader();
        loadFooter();
    }
})();
