/* Omega Kalkulator – frontend (WP plugin port of app.js v8) */
(function () {
    'use strict';

    var DATA = window.OmegaKalkData || {};
    var RULES = DATA.rules || null;
    var I18N = DATA.i18n || {};

    function $(id) { return document.getElementById(id); }

    function pricePerDocument(count) {
        if (!RULES || !Array.isArray(RULES.documents)) { return 0; }
        for (var i = 0; i < RULES.documents.length; i++) {
            var tier = RULES.documents[i];
            var max = (tier.max === null || tier.max === '' || typeof tier.max === 'undefined') ? null : parseInt(tier.max, 10);
            if (max === null || count <= max) { return parseFloat(tier.price_per_doc) || 0; }
        }
        return 0;
    }

    function formatPLN(n) {
        try {
            return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(n);
        } catch (e) {
            return Math.round(n) + ' zł';
        }
    }

    function enforceAccountingOptions() {
        var forma = $('omega-kalk-forma').value;
        var rodzaj = $('omega-kalk-rodzaj');
        var hint = $('omega-kalk-rodzaj-hint');
        var opts = Array.prototype.slice.call(rodzaj.options);

        if (forma === 'SPOLKA_ZOO') {
            rodzaj.value = 'PELNA';
            opts.forEach(function (o) { o.disabled = (o.value !== 'PELNA'); });
            if (hint) { hint.textContent = I18N.hint_spolka || ''; }
        } else {
            opts.forEach(function (o) { o.disabled = false; });
            if (hint) { hint.textContent = ''; }
        }
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function countDigits(str) {
        var m = (String(str).match(/\d/g) || []);
        return m.length;
    }

    function collectPayload(total) {
        return {
            imie:      ($('omega-kalk-imie').value || '').trim(),
            telefon:   ($('omega-kalk-telefon').value || '').trim(),
            email:     ($('omega-kalk-email').value || '').trim(),
            forma:     $('omega-kalk-forma').value,
            rodzaj:    $('omega-kalk-rodzaj').value,
            dokumenty: Math.max(0, parseInt($('omega-kalk-dokumenty').value || '0', 10)),
            pracUop:   Math.max(0, parseInt($('omega-kalk-pracUop').value || '0', 10)),
            pracUoz:   Math.max(0, parseInt($('omega-kalk-pracUoz').value || '0', 10)),
            vat:       $('omega-kalk-vat').checked ? 1 : 0,
            eksport:   $('omega-kalk-eksport').checked ? 1 : 0,
            privacy:   $('omega-kalk-privacy').checked ? 1 : 0,
            total:     total,
            hp_field:  $('omega-kalk-hp').value || '',
            submitted_at: new Date().toISOString()
        };
    }

    function sendLead(payload) {
        var status = $('omega-kalk-status');
        status.textContent = I18N.sending || 'Wysyłam zgłoszenie…';

        var formData = new FormData();
        formData.append('action', 'omega_kalk_lead');
        formData.append('nonce', DATA.nonce || '');
        Object.keys(payload).forEach(function (k) {
            formData.append(k, payload[k]);
        });

        fetch(DATA.ajax_url, { method: 'POST', body: formData, credentials: 'same-origin' })
            .then(function (res) { return res.json().catch(function () { return {}; }); })
            .then(function (data) {
                if (data && data.success) {
                    status.textContent = I18N.success || 'Dziękujemy!';
                } else {
                    status.textContent = (data && data.data && data.data.message) ? data.data.message : (I18N.error_send || 'Nie udało się wysłać wiadomości.');
                }
            })
            .catch(function () {
                status.textContent = I18N.error_network || 'Błąd połączenia.';
            });
    }

    function calculate() {
        var privacy = $('omega-kalk-privacy');
        if (!privacy.checked) {
            alert(I18N.privacy_required || 'Zaakceptuj politykę prywatności.');
            return;
        }

        var imie = ($('omega-kalk-imie').value || '').trim();
        var telefon = ($('omega-kalk-telefon').value || '').trim();
        var email = ($('omega-kalk-email').value || '').trim();

        if (!imie) { alert(I18N.name_required || 'Podaj imię.'); return; }
        if (countDigits(telefon) < 9) { alert(I18N.phone_required || 'Podaj telefon.'); return; }
        if (!isValidEmail(email)) { alert(I18N.email_required || 'Podaj e-mail.'); return; }

        var forma = $('omega-kalk-forma').value;
        var rodzajSelect = $('omega-kalk-rodzaj');
        if (forma === 'SPOLKA_ZOO') { rodzajSelect.value = 'PELNA'; }
        var rodzaj = rodzajSelect.value;

        var dokumenty = Math.max(0, parseInt($('omega-kalk-dokumenty').value || '0', 10));
        var pracUop   = Math.max(0, parseInt($('omega-kalk-pracUop').value   || '0', 10));
        var pracUoz   = Math.max(0, parseInt($('omega-kalk-pracUoz').value   || '0', 10));
        var vat       = $('omega-kalk-vat').checked;
        var eksport   = $('omega-kalk-eksport').checked;

        if (!RULES) { return; }

        var base       = (RULES.base[forma] && RULES.base[forma][rodzaj]) ? parseFloat(RULES.base[forma][rodzaj]) : 0;
        var perDoc     = pricePerDocument(dokumenty);
        var docsCost   = perDoc * Math.max(0, dokumenty - 10);
        var uopCost    = pracUop * (parseFloat((RULES.employees && RULES.employees.UOP) || 0));
        var uozCost    = pracUoz * (parseFloat((RULES.employees && RULES.employees.UOZ) || 0));
        var vatCost    = vat     ? (parseFloat((RULES.surcharges && RULES.surcharges.VAT) || 0)) : 0;
        var exportCost = eksport ? (parseFloat((RULES.surcharges && RULES.surcharges.EXPORT) || 0)) : 0;
        var subtotal   = base + docsCost + uopCost + uozCost + vatCost + exportCost;
        var minimum    = parseFloat((RULES.minimums && RULES.minimums[rodzaj]) || 0);
        var total      = Math.max(subtotal, minimum);

        var docShort = I18N.doc_short || 'dok.';
        var badges = [
            '<span class="ok-badge">' + forma + '</span>',
            '<span class="ok-badge">' + rodzaj + '</span>',
            dokumenty ? '<span class="ok-badge">' + dokumenty + ' ' + docShort + '</span>' : '',
            pracUop ? '<span class="ok-badge">' + pracUop + ' UoP</span>' : '',
            pracUoz ? '<span class="ok-badge">' + pracUoz + ' UoZ</span>' : '',
            vat ? '<span class="ok-badge">VAT</span>' : '',
            eksport ? '<span class="ok-badge">Eksport</span>' : ''
        ].filter(Boolean).join('');

        $('omega-kalk-kwota').textContent = formatPLN(total);
        $('omega-kalk-breakdown').innerHTML = badges +
            '<div style="margin-top:8px"></div>' +
            '<p><em>' + (I18N.disclaimer || '') + '</em></p>';
        $('omega-kalk-wynik').classList.remove('ok-hidden');

        sendLead(collectPayload(Math.round(total)));
    }

    function init() {
        if (!$('omega-kalk-form')) { return; }
        enforceAccountingOptions();
        $('omega-kalk-forma').addEventListener('change', enforceAccountingOptions);
        var btn = $('omega-kalk-oblicz');
        if (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                calculate();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
