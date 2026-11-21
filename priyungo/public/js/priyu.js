// Base API URL
const API = '/api/method/priyungo';

// Fetch helper
async function apiFetch(endpoint, params = {}) {
  const url = new URL(`${API}.${endpoint}`, window.location.origin);
  Object.keys(params).forEach(k => url.searchParams.append(k, params[k]));
  const res = await fetch(url);
  const data = await res.json();
  return data.message || data;
}

// Load site settings
async function loadSiteSettings() {
  try {
    const s = await apiFetch('website_settings.api.get_site_settings');
    if (s.site_logo) {
      document.querySelectorAll('#site-logo,#footer-logo')
        .forEach(el => el.src = s.site_logo);
    }
    if (s.phone_1) {
      const el = document.getElementById('phone-1');
      if (el) el.textContent = s.phone_1;
    }
    if (s.email) {
      const el = document.getElementById('contact-email');
      if (el) el.textContent = s.email;
    }
    if (s.address) {
      const el = document.getElementById('contact-address');
      if (el) el.textContent = s.address;
    }
    if (s.footer_text) {
      const el = document.getElementById('footer-text');
      if (el) el.textContent = s.footer_text;
    }
    // Social links
    const social = document.getElementById('social-links');
    if (social) {
      let html = '';
      if (s.facebook_url) html += `<a href="${s.facebook_url}" target="_blank"><i class="ti ti-brand-facebook"></i></a>`;
      if (s.instagram_url) html += `<a href="${s.instagram_url}" target="_blank"><i class="ti ti-brand-instagram"></i></a>`;
      if (s.youtube_url) html += `<a href="${s.youtube_url}" target="_blank"><i class="ti ti-brand-youtube"></i></a>`;
      social.innerHTML = html;
    }
  } catch(e) { console.log('Settings error:', e); }
}

// Load homepage settings
async function loadHomepageSettings() {
  try {
    const s = await apiFetch('website_settings.api.get_homepage_settings');
    if (s.hero_title_hi) {
      const el = document.getElementById('hero-title');
      if (el) el.innerHTML = s.hero_title_hi;
    }
    if (s.hero_subtitle_hi) {
      const el = document.getElementById('hero-sub');
      if (el) el.textContent = s.hero_subtitle_hi;
    }
    if (s.cta1_label) {
      const el = document.getElementById('cta1');
      if (el) { el.textContent = s.cta1_label; el.href = s.cta1_link || '/services'; }
    }
    if (s.cta2_label) {
      const el = document.getElementById('cta2');
      if (el) { el.textContent = s.cta2_label; el.href = s.cta2_link || '/donate'; }
    }
    if (s.about_title_en) {
      const el = document.getElementById('about-title');
      if (el) el.textContent = s.about_title_en;
    }
    if (s.about_image) {
      const el = document.getElementById('about-img');
      if (el) el.src = s.about_image;
    }
  } catch(e) { console.log('Homepage settings error:', e); }
}

// Load impact stats
async function loadImpactStats() {
  try {
    const stats = await apiFetch('content.api.get_impact_stats');
    // Impact strip
    const strip = document.getElementById('impact-strip');
    if (strip && stats.length) {
      strip.innerHTML = stats.map(s => `
        <div class="pf-imp-item">
          <div class="pf-imp-num">${s.stat_number}${s.stat_suffix || ''}</div>
          <div class="pf-imp-lbl">${s.stat_label_hi || s.stat_label_en}</div>
        </div>
      `).join('');
    }
    // Stats mini in hero
    const mini = document.getElementById('stats-mini');
    if (mini && stats.length) {
      mini.innerHTML = stats.slice(0,4).map(s => `
        <div class="pf-sm-card">
          <div class="pf-sm-num">${s.stat_number}${s.stat_suffix || ''}</div>
          <div class="pf-sm-lbl">${s.stat_label_hi || s.stat_label_en}</div>
        </div>
      `).join('');
    }
  } catch(e) { console.log('Stats error:', e); }
}

// Load services
async function loadServices() {
  try {
    const services = await apiFetch('content.api.get_services');
    const grid = document.getElementById('services-grid');
    if (grid && services.length) {
      grid.innerHTML = services.map(s => `
        <div class="pf-svc-card">
          ${s.cover_image
            ? `<img src="${s.cover_image}" alt="${s.service_title_en}" class="pf-svc-img">`
            : `<div class="pf-svc-ico"><i class="ti ${s.icon || 'ti-heart'}"></i></div>`
          }
          <div class="pf-svc-body">
            <h3>${s.service_title_hi || s.service_title_en}</h3>
            <p>${s.short_desc || ''}</p>
            ${s.stats_label
              ? `<span class="pf-svc-stat">${s.stats_label}</span>`
              : ''
            }
          </div>
        </div>
      `).join('');
    }
  } catch(e) { console.log('Services error:', e); }
}

// Load featured gallery
async function loadGallery() {
  try {
    const items = await apiFetch('content.api.get_featured_gallery');
    const grid = document.getElementById('gallery-grid');
    if (grid && items.length) {
      grid.innerHTML = items.map(item => `
        <div class="pf-gal-item">
          ${item.media_type === 'Video'
            ? `<div class="pf-gal-video">
                <img src="${item.thumbnail || ''}" alt="${item.title}">
                <div class="pf-play-btn"><i class="ti ti-player-play"></i></div>
               </div>`
            : `<img src="${item.image || ''}" alt="${item.title}">`
          }
          <div class="pf-gal-caption">
            <span>${item.caption_hi || item.title}</span>
            <span class="pf-gal-cat">${item.category || ''}</span>
          </div>
        </div>
      `).join('');
    }
  } catch(e) { console.log('Gallery error:', e); }
}

// Load team
async function loadTeam() {
  try {
    const team = await apiFetch('content.api.get_team');
    const grid = document.getElementById('team-grid');
    if (grid && team.length) {
      const colors = ['#7F77DD','#c0392b','#1D9E75','#BA7517'];
      grid.innerHTML = team.map((m, i) => `
        <div class="pf-team-card">
          ${m.profile_photo
            ? `<img src="${m.profile_photo}" alt="${m.member_name}" class="pf-team-photo">`
            : `<div class="pf-team-av" style="background:${colors[i % colors.length]}">
                ${m.member_name.substring(0,2).toUpperCase()}
               </div>`
          }
          <div class="pf-team-name">${m.member_name}</div>
          <div class="pf-team-role">${m.role_hi || m.role_en}</div>
          ${m.short_bio ? `<p class="pf-team-bio">${m.short_bio}</p>` : ''}
        </div>
      `).join('');
    }
  } catch(e) { console.log('Team error:', e); }
}

// Load bank details
async function loadDonationSettings() {
  try {
    const s = await apiFetch('donation.api.get_donation_settings');
    const el = document.getElementById('bank-quick');
    if (el && s.bank_acc_name) {
      el.innerHTML = `
        <div class="pf-bank-info">
          <p><strong>${s.bank_acc_name}</strong></p>
          <p>A/c: ${s.bank_acc_no}</p>
          <p>IFSC: ${s.bank_ifsc}</p>
          ${s.upi_id ? `<p>UPI: ${s.upi_id}</p>` : ''}
        </div>
        ${s.upi_qr_image
          ? `<img src="${s.upi_qr_image}" alt="UPI QR" class="pf-upi-qr">`
          : ''
        }
      `;
    }
  } catch(e) { console.log('Donation settings error:', e); }
}

// Amount selector
function selectAmt(el, amount) {
  document.querySelectorAll('.pf-amt').forEach(a => a.classList.remove('sel'));
  el.classList.add('sel');
  const input = document.getElementById('custom-amount');
  if (input) input.value = amount;
}

// Mobile nav toggle
function initNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.classList.toggle('open');
    });
  }
  // Active link
  const current = window.location.pathname;
  document.querySelectorAll('.pf-nav-links a').forEach(a => {
    if (a.getAttribute('href') === current) {
      a.classList.add('active');
    }
  });
}

// Init all on page load
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  loadSiteSettings();
  loadHomepageSettings();
  loadImpactStats();
  loadServices();
  loadGallery();
  loadTeam();
  loadDonationSettings();
});

// Load about page stats
async function loadAboutStats() {
  const grid = document.getElementById('about-stats');
  if (!grid) return;
  try {
    const stats = await apiFetch('content.api.get_impact_stats');
    const colorMap = {
      red: 'red', purple: 'purple',
      green: 'green', amber: 'amber', blue: 'blue'
    };
    grid.innerHTML = stats.map(s => `
      <div class="pf-stat-box ${colorMap[s.color] || 'purple'}">
        <div class="pf-stat-num">
          ${s.stat_number}${s.stat_suffix || ''}
        </div>
        <div class="pf-stat-lbl">
          ${s.stat_label_hi || s.stat_label_en}
        </div>
      </div>
    `).join('');
  } catch(e) { console.log('About stats error:', e); }
}

// Run on about page
if (document.getElementById('about-stats')) {
  document.addEventListener('DOMContentLoaded', () => {
    loadSiteSettings();
    loadAboutStats();
    loadTeam();
    initNav();
  });
}

// Load services detail page
async function loadServicesPage() {
  const list = document.getElementById('services-list');
  if (!list) return;
  try {
    const services = await apiFetch('content.api.get_services');
    const colors = ['purple','red','green','amber','purple','red'];
    const defaultIcons = [
      'ti-droplet','ti-heart-handshake',
      'ti-brain','ti-flame',
      'ti-school','ti-first-aid-kit'
    ];
    list.innerHTML = services.map((s, i) => `
      <div class="pf-svc-detail-card">
        <div class="pf-svc-detail-ico ${colors[i % colors.length]}">
          <i class="ti ${s.icon || defaultIcons[i % defaultIcons.length]}"></i>
        </div>
        <div class="pf-svc-detail-body">
          <h3>${s.service_title_hi || s.service_title_en}</h3>
          <p>${s.long_desc || s.short_desc || ''}</p>
          <div class="pf-svc-tags">
            ${s.stats_label
              ? `<span class="pf-svc-tag red">${s.stats_label}</span>`
              : ''
            }
            <span class="pf-svc-tag">निःशुल्क सेवा</span>
            <span class="pf-svc-tag">24/7 उपलब्ध</span>
          </div>
        </div>
        ${s.cover_image ? `
          <div class="pf-svc-img-right">
            <img src="${s.cover_image}"
              alt="${s.service_title_en}">
          </div>` : ''
        }
      </div>
    `).join('');
  } catch(e) { console.log('Services page error:', e); }
}

// Run on services page
if (document.getElementById('services-list')) {
  document.addEventListener('DOMContentLoaded', () => {
    loadSiteSettings();
    loadServicesPage();
    initNav();
  });
}

// All gallery items stored globally for filtering
let allGalleryItems = [];

// Load full gallery
async function loadFullGallery(category = null) {
  const grid = document.getElementById('gallery-full');
  const empty = document.getElementById('gallery-empty');
  if (!grid) return;

  try {
    if (!allGalleryItems.length) {
      allGalleryItems = await apiFetch('content.api.get_gallery');
    }

    let items = allGalleryItems;

    // Filter by category or media type
    if (category && category !== 'all') {
      if (category === 'Video') {
        items = allGalleryItems.filter(i => i.media_type === 'Video');
      } else {
        items = allGalleryItems.filter(i => i.category === category);
      }
    }

    if (!items.length) {
      grid.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }

    if (empty) empty.style.display = 'none';

    grid.innerHTML = items.map((item, idx) => `
      <div class="pf-gal-full-item"
        onclick="${item.media_type === 'Video'
          ? `openVideo('${item.video_url}')`
          : `openLightbox('${item.image}','${item.caption_hi || item.title}')`
        }">
        ${item.media_type === 'Video'
          ? `<div class="pf-gal-video-wrap">
              <img src="${item.thumbnail || '/assets/priyungo/images/logo.jpeg'}"
                alt="${item.title}">
              <div class="pf-gal-play">
                <i class="ti ti-player-play"></i>
              </div>
            </div>`
          : `<img src="${item.image || ''}" alt="${item.title}"
              onerror="this.src='/assets/priyungo/images/logo.jpeg'">`
        }
        <div class="pf-gal-full-caption">
          <h4>${item.caption_hi || item.title}</h4>
          <div class="pf-gal-full-meta">
            <span class="pf-gal-cat-tag">
              ${item.category || 'General'}
            </span>
            ${item.event_date
              ? `<span class="pf-gal-date">${item.event_date}</span>`
              : ''
            }
          </div>
        </div>
      </div>
    `).join('');

  } catch(e) { console.log('Gallery error:', e); }
}

// Filter gallery by category
function filterGallery(btn, category) {
  document.querySelectorAll('.pf-filter-btn')
    .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadFullGallery(category);
}

// Open lightbox
function openLightbox(src, caption) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-caption');
  if (!lb || !img) return;
  img.src = src;
  if (cap) cap.textContent = caption || '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Close lightbox
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
}

// Open video in new tab
function openVideo(url) {
  if (url) window.open(url, '_blank');
}

// Keyboard close lightbox
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// Run on gallery page
if (document.getElementById('gallery-full')) {
  document.addEventListener('DOMContentLoaded', () => {
    loadSiteSettings();
    loadFullGallery();
    initNav();
  });
}

// Load donate page
async function loadDonatePage() {
  if (!document.getElementById('donate-purpose')) return;
  try {
    // Load purposes dropdown
    const purposes = await apiFetch(
      'donation.api.get_donation_purposes'
    );
    const select = document.getElementById('donate-purpose');
    if (select) {
      select.innerHTML = `
        <option value="">उद्देश्य चुनें...</option>
        ${purposes.map(p => `
          <option value="${p.name}">
            ${p.purpose_name_hi || p.purpose_name_en}
          </option>
        `).join('')}
      `;
    }

    // Purpose cards in sidebar
    const colors = {
      red:'#c0392b', blue:'#378ADD',
      green:'#1D9E75', purple:'#7F77DD', amber:'#BA7517'
    };
    const cardsList = document.getElementById('purpose-cards-list');
    if (cardsList) {
      cardsList.innerHTML = purposes.map(p => `
        <div class="pf-purpose-item"
          onclick="selectPurpose('${p.name}')">
          <div class="pf-purpose-dot"
            style="background:${colors[p.display_color]||'#7F77DD'}">
          </div>
          <span>${p.purpose_name_hi || p.purpose_name_en}</span>
        </div>
      `).join('');
    }

    // Load bank details
    const settings = await apiFetch(
      'donation.api.get_donation_settings'
    );
    const bankDetails = document.getElementById('bank-details');
    if (bankDetails && settings.bank_acc_name) {
      bankDetails.innerHTML = `
        <div class="pf-bank-row">
          <span>खाताधारक</span>
          <span>${settings.bank_acc_name}</span>
        </div>
        <div class="pf-bank-row">
          <span>खाता संख्या</span>
          <span>${settings.bank_acc_no}</span>
        </div>
        <div class="pf-bank-row">
          <span>IFSC Code</span>
          <span>${settings.bank_ifsc}</span>
        </div>
        <div class="pf-bank-row">
          <span>Branch</span>
          <span>${settings.bank_branch}</span>
        </div>
        <div class="pf-bank-row">
          <span>MMID</span>
          <span>${settings.bank_mmid || '-'}</span>
        </div>
        <div class="pf-bank-row">
          <span>Account Type</span>
          <span>${settings.bank_acc_type || '-'}</span>
        </div>
      `;
    }

    // UPI details
    const upiContent = document.getElementById('upi-content');
    if (upiContent && (settings.upi_qr_image || settings.upi_id)) {
      upiContent.innerHTML = `
        ${settings.upi_qr_image
          ? `<img src="${settings.upi_qr_image}" alt="UPI QR Code">`
          : ''
        }
        ${settings.upi_id
          ? `<div class="pf-upi-id">UPI: ${settings.upi_id}</div>`
          : ''
        }
      `;
    }

  } catch(e) { console.log('Donate page error:', e); }
}

// Set donate amount
function setDonateAmt(btn, amount) {
  document.querySelectorAll('.pf-amt-big')
    .forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  const input = document.getElementById('donate-amount');
  if (input) input.value = amount;
  if (amount) input.focus();
}

// Select purpose from sidebar
function selectPurpose(name) {
  const select = document.getElementById('donate-purpose');
  if (select) select.value = name;
}

// Show payment fields by mode
function showPaymentFields(mode) {
  const txnGroup = document.getElementById('txn-group');
  const chequeGroup = document.getElementById('cheque-group');
  if (mode === 'Cheque') {
    if (txnGroup) txnGroup.style.display = 'none';
    if (chequeGroup) chequeGroup.style.display = 'block';
  } else if (mode === 'Cash') {
    if (txnGroup) txnGroup.style.display = 'none';
    if (chequeGroup) chequeGroup.style.display = 'none';
  } else {
    if (txnGroup) txnGroup.style.display = 'block';
    if (chequeGroup) chequeGroup.style.display = 'none';
  }
}

// Toggle 80G PAN field
function toggle80G(checked) {
  const panGroup = document.getElementById('pan-group');
  if (panGroup) {
    panGroup.style.display = checked ? 'block' : 'none';
  }
}

// Submit donation
async function submitDonation() {
  const btn = document.getElementById('donate-submit-btn');
  const success = document.getElementById('donate-success');
  const error = document.getElementById('donate-error');
  const successMsg = document.getElementById('success-msg');
  const errorMsg = document.getElementById('error-msg');
  const donationId = document.getElementById('donation-id');

  // Get values
  const amount = document.getElementById('donate-amount').value;
  const purpose = document.getElementById('donate-purpose').value;
  const name = document.getElementById('donor-name').value;
  const phone = document.getElementById('donor-phone').value;
  const email = document.getElementById('donor-email').value;
  const donorType = document.getElementById('donor-type').value;
  const paymentMode = document.getElementById('payment-mode').value;
  const txnId = document.getElementById('transaction-id').value;
  const need80g = document.getElementById('need-80g').checked;
  const pan = document.getElementById('pan-number').value;

  // Validation
  if (!amount || amount <= 0) {
    alert('कृपया दान राशि दर्ज करें'); return;
  }
  if (!name) {
    alert('कृपया अपना नाम दर्ज करें'); return;
  }
  if (!phone) {
    alert('कृपया मोबाइल नंबर दर्ज करें'); return;
  }
  if (!purpose) {
    alert('कृपया दान का उद्देश्य चुनें'); return;
  }
  if (need80g && !pan) {
    alert('80G के लिए PAN नंबर जरूरी है'); return;
  }

  // Disable button
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="ti ti-loader"></i> प्रतीक्षा करें...';
  }

  // Hide messages
  if (success) success.style.display = 'none';
  if (error) error.style.display = 'none';

  try {
    const result = await fetch(
      '/api/method/priyungo.donation.api.submit_donation',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'X-Frappe-CSRF-Token': window.frappe?.csrf_token || '' },
        body: JSON.stringify({
          donor_name: name,
          donor_phone: phone,
          donor_email: email,
          donor_type: donorType,
          amount: amount,
          donation_purpose: purpose,
          payment_mode: paymentMode,
          transaction_id: (paymentMode === 'Cash' || paymentMode === 'Cheque') ? '' : txnId,
          cheque_number: paymentMode === 'Cheque' ? document.getElementById('cheque-number').value : '',
          bank_names: paymentMode === 'Cheque' ? document.getElementById('cheque-bank').value : '',
          receipt_80g: need80g ? 1 : 0,
          pan_number: need80g ? pan : ''
        })
      }
    );
    const data = await result.json();
    const res = data.message || data;

    if (res.status === 'success') {
      if (success) success.style.display = 'block';
      if (successMsg) {
        successMsg.textContent =
          'आपके दान की जानकारी दर्ज हो गई है। भुगतान का सत्यापन बाकी है।';
      }
      if (donationId) {
        donationId.textContent =
          `Donation ID: ${res.donation_id}`;
      }
      // Reset form
      document.getElementById('donate-amount').value = '';
      document.getElementById('donor-name').value = '';
      document.getElementById('donor-phone').value = '';
      document.getElementById('donor-email').value = '';
      document.getElementById('transaction-id').value = '';
      document.getElementById('cheque-number').value = '';
      document.getElementById('cheque-bank').value = '';
      document.getElementById('pan-number').value = '';
      document.getElementById('need-80g').checked = false;
      toggle80G(false);
    } else {
      if (error) error.style.display = 'flex';
      if (errorMsg) errorMsg.textContent =
        res.message || 'कुछ गलत हुआ';
    }
  } catch(e) {
    if (error) error.style.display = 'flex';
    if (errorMsg) errorMsg.textContent =
      'नेटवर्क समस्या। कृपया पुनः प्रयास करें।';
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML =
        '<i class="ti ti-heart"></i> दान दर्ज करें';
    }
  }
}

document.addEventListener('DOMContentLoaded', loadDonatePage);

// Submit contact form
async function submitContact() {
  const btn = document.getElementById('contact-submit-btn');
  const success = document.getElementById('contact-success');
  const error = document.getElementById('contact-error');
  const errorMsg = document.getElementById('contact-error-msg');

  const name = document.getElementById('contact-name').value;
  const phone = document.getElementById('contact-phone').value;
  const email = document.getElementById('contact-email-input').value;
  const city = document.getElementById('contact-city').value;
  const type = document.getElementById('inquiry-type').value;
  const message = document.getElementById('contact-message').value;

  if (!name) { alert('कृपया नाम दर्ज करें'); return; }
  if (!phone) { alert('कृपया मोबाइल नंबर दर्ज करें'); return; }
  if (!type) { alert('कृपया संपर्क का उद्देश्य चुनें'); return; }
  if (!message) { alert('कृपया संदेश लिखें'); return; }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML =
      '<i class="ti ti-loader"></i> भेजा जा रहा है...';
  }
  if (success) success.style.display = 'none';
  if (error) error.style.display = 'none';

  try {
    const res = await fetch(
      '/api/method/priyungo.engagement.api.submit_contact',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Frappe-CSRF-Token': frappe.csrf_token || ''
        },
        body: JSON.stringify({
          full_name: name,
          phone: phone,
          email: email,
          city: city,
          inquiry_type: type,
          message: message
        })
      }
    );
    const data = await res.json();
    const result = data.message || data;

    if (result.status === 'success') {
      if (success) success.style.display = 'block';
      document.getElementById('contact-name').value = '';
      document.getElementById('contact-phone').value = '';
      document.getElementById('contact-email-input').value = '';
      document.getElementById('contact-city').value = '';
      document.getElementById('contact-message').value = '';
    } else {
      if (error) error.style.display = 'flex';
      if (errorMsg) errorMsg.textContent =
        result.message || 'कुछ गलत हुआ';
    }
  } catch(e) {
    if (error) error.style.display = 'flex';
    if (errorMsg) errorMsg.textContent =
      'नेटवर्क समस्या। पुनः प्रयास करें।';
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML =
        '<i class="ti ti-send"></i> संदेश भेजें';
    }
  }
}

// Submit volunteer form
async function submitVolunteer() {
  const btn = document.getElementById('vol-submit-btn');
  const success = document.getElementById('vol-success');
  const error = document.getElementById('vol-error');
  const errorMsg = document.getElementById('vol-error-msg');

  const name = document.getElementById('vol-name').value;
  const phone = document.getElementById('vol-phone').value;
  const city = document.getElementById('vol-city').value;
  const age = document.getElementById('vol-age').value;
  const profession =
    document.getElementById('vol-profession').value;
  const availability =
    document.getElementById('vol-availability').value;
  const message =
    document.getElementById('vol-message').value;

  if (!name) { alert('कृपया नाम दर्ज करें'); return; }
  if (!phone) { alert('कृपया मोबाइल नंबर दर्ज करें'); return; }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML =
      '<i class="ti ti-loader"></i> भेजा जा रहा है...';
  }
  if (success) success.style.display = 'none';
  if (error) error.style.display = 'none';

  try {
    const res = await fetch(
      '/api/method/priyungo.engagement.api.submit_volunteer',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Frappe-CSRF-Token': frappe.csrf_token || ''
        },
        body: JSON.stringify({
          full_name: name,
          phone: phone,
          city: city,
          age: age,
          profession: profession,
          interest_blood: document.getElementById('int-blood').checked ? 1 : 0,
          interest_elder: document.getElementById('int-elder').checked ? 1 : 0,
          interest_rescue: document.getElementById('int-rescue').checked ? 1 : 0,
          interest_lastrites: document.getElementById('int-lastrites').checked ? 1 : 0,
          interest_events: document.getElementById('int-events').checked ? 1 : 0,
          interest_social: document.getElementById('int-social').checked ? 1 : 0,
          availability: availability,
          message: message
        })
      }
    );
    const data = await res.json();
    const result = data.message || data;

    if (result.status === 'success') {
      if (success) success.style.display = 'block';
      document.getElementById('vol-name').value = '';
      document.getElementById('vol-phone').value = '';
      document.getElementById('vol-city').value = '';
      document.getElementById('vol-age').value = '';
      document.getElementById('vol-profession').value = '';
      document.getElementById('vol-message').value = '';
    } else {
      if (error) error.style.display = 'flex';
      if (errorMsg) errorMsg.textContent =
        result.message || 'कुछ गलत हुआ';
    }
  } catch(e) {
    if (error) error.style.display = 'flex';
    if (errorMsg) errorMsg.textContent =
      'नेटवर्क समस्या। पुनः प्रयास करें।';
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML =
        '<i class="ti ti-user-plus"></i> आवेदन करें';
    }
  }
}

// Load contact page settings
async function loadContactPage() {
  if (!document.getElementById('ci-phone1')) return;
  try {
    const s = await apiFetch(
      'website_settings.api.get_site_settings'
    );
    if (s.phone_1) {
      document.getElementById('ci-phone1').textContent = s.phone_1;
    }
    if (s.phone_2) {
      document.getElementById('ci-phone2').textContent = s.phone_2;
    }
    if (s.email) {
      document.getElementById('ci-email').textContent = s.email;
    }
    if (s.address) {
      document.getElementById('ci-address').textContent = s.address;
    }
  } catch(e) { console.log('Contact page error:', e); }
}

// Run on contact page
if (document.getElementById('contact-name')) {
  document.addEventListener('DOMContentLoaded', () => {
    loadSiteSettings();
    loadContactPage();
    initNav();
  });
}

// Animate counter numbers
function animateCounter(el, target) {
  let current = 0;
  const increment = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = current.toLocaleString('en-IN');
  }, 30);
}

// Load impact page
async function loadImpactPage() {
  const grid = document.getElementById('counter-grid');
  const chartBars = document.getElementById('chart-bars');
  if (!grid) return;

  try {
    const stats = await apiFetch('content.api.get_impact_stats');
    const colorMap = {
      red:'red', purple:'purple',
      green:'green', amber:'amber', blue:'blue'
    };
    const iconMap = {
      red:'ti-droplet', purple:'ti-flame',
      green:'ti-brain', amber:'ti-heart-handshake',
      blue:'ti-school'
    };

    // Counter cards
    grid.innerHTML = stats.map((s,i) => `
      <div class="pf-counter-card ${colorMap[s.color]||'purple'}">
        <div class="pf-counter-ico">
          <i class="ti ${s.icon ||
            iconMap[s.color] || 'ti-heart'}"></i>
        </div>
        <div class="pf-counter-num"
          id="counter-${i}">0</div>
        <div class="pf-counter-lbl">
          ${s.stat_label_hi || s.stat_label_en}
        </div>
      </div>
    `).join('');

    // Animate counters
    stats.forEach((s, i) => {
      const el = document.getElementById(`counter-${i}`);
      if (el) {
        const num = parseInt(
          s.stat_number.toString().replace(/\D/g,'')
        ) || 0;
        setTimeout(() => animateCounter(el, num), i * 100);
        // Add suffix after animation
        setTimeout(() => {
          if (el && s.stat_suffix) {
            el.textContent =
              el.textContent + (s.stat_suffix || '');
          }
        }, 2500);
      }
    });

    // Chart bars
    if (chartBars && stats.length) {
      const maxVal = Math.max(
        ...stats.map(s =>
          parseInt(s.stat_number.toString().replace(/\D/g,'')) || 0
        )
      );
      chartBars.innerHTML = stats.map(s => {
        const num = parseInt(
          s.stat_number.toString().replace(/\D/g,'')
        ) || 0;
        const pct = Math.round((num / maxVal) * 100);
        const color = colorMap[s.color] || 'purple';
        return `
          <div class="pf-chart-row">
            <div class="pf-chart-label">
              ${s.stat_label_hi || s.stat_label_en}
            </div>
            <div class="pf-chart-bar-wrap">
              <div class="pf-chart-bar ${color}"
                style="width:${pct}%">
                ${pct > 15 ? num.toLocaleString('en-IN') : ''}
              </div>
            </div>
            <div class="pf-chart-val">
              ${num.toLocaleString('en-IN')}
              ${s.stat_suffix || ''}
            </div>
          </div>
        `;
      }).join('');
    }

  } catch(e) { console.log('Impact page error:', e); }
}

// Run on impact page
if (document.getElementById('counter-grid')) {
  document.addEventListener('DOMContentLoaded', () => {
    loadSiteSettings();
    loadImpactPage();
    initNav();
  });
}