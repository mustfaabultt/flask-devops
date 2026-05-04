/**
 * MHRS Pro - Premium Appointment System
 * Frontend Application Controller
 */

// ============ State ============
let currentUser = null;
let token = localStorage.getItem('token');
const API = '';

// ============ DOM ============
const $ = id => document.getElementById(id);
const authSection = $('authSection');
const dashboardSection = $('dashboardSection');
const authLinks = $('authLinks');
const mainContent = $('mainContent');
const sidebarNav = $('sidebarNav');

// ============ Toast Notification System ============
function showToast(message, type = 'info') {
    const container = $('toastContainer');
    const icons = { success: 'check-circle-fill', error: 'x-circle-fill', info: 'info-circle-fill', warning: 'exclamation-triangle-fill' };
    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    toast.innerHTML = `<i class="bi bi-${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.4s ease forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ============ Turkish Date Helper ============
const MONTHS_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

function formatDateTR(dateStr) {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    return `${parts[2]} ${MONTHS_TR[parseInt(parts[1]) - 1]} ${parts[0]}`;
}

function formatTime(timeStr) {
    if (!timeStr) return '-';
    return timeStr.substring(0, 5);
}

// ============ Auth Check ============
if (token) checkAuth();

async function checkAuth() {
    try {
        const res = await fetch(`${API}/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
            currentUser = await res.json();
            showDashboard();
        } else {
            logout();
        }
    } catch (e) {
        console.error(e);
        logout();
    }
}

// ============ Login ============
$('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.append('username', $('loginTC').value);
    params.append('password', $('loginPass').value);

    try {
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('token', data.access_token);
            token = data.access_token;
            checkAuth();
            showToast('Giriş başarılı! Hoş geldiniz.', 'success');
        } else {
            showToast('Hatalı TC Kimlik veya Şifre!', 'error');
        }
    } catch (err) {
        showToast('Bağlantı hatası! Sunucuyu kontrol edin.', 'error');
    }
};

// ============ Register ============
$('registerForm').onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
        name: $('regName').value,
        tc_kimlik: $('regTC').value,
        password: $('regPass').value
    };

    try {
        const res = await fetch(`${API}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showToast('Kayıt başarılı! Şimdi giriş yapabilirsiniz.', 'success');
            $('showLogin').click();
        } else {
            const error = await res.json();
            showToast('Kayıt Hatası: ' + (error.detail || 'Bilinmeyen hata'), 'error');
        }
    } catch (err) {
        showToast('Bağlantı hatası!', 'error');
    }
};

// Toggle forms
$('showRegister').onclick = () => {
    $('loginFormWrapper').style.display = 'none';
    $('registerFormWrapper').style.display = 'block';
};

$('showLogin').onclick = () => {
    $('registerFormWrapper').style.display = 'none';
    $('loginFormWrapper').style.display = 'block';
};

function logout() {
    localStorage.removeItem('token');
    token = null;
    currentUser = null;
    location.reload();
}

// ============ Dashboard ============
function showDashboard() {
    authSection.style.display = 'none';
    dashboardSection.style.display = 'flex';

    authLinks.innerHTML = `
        <div style="display:flex;align-items:center;gap:15px;">
            <span class="user-badge">${currentUser.name} <span style="opacity:0.6;font-weight:400;margin-left:5px;">(${getRoleLabel(currentUser.role)})</span></span>
            <button class="btn-ghost" onclick="logout()" style="padding: 5px 12px; font-size:0.8rem; display:flex; align-items:center; gap:5px;">
                <i class="bi bi-box-arrow-right"></i> Çıkış
            </button>
        </div>
    `;

    renderSidebar();
    navigateTo(getDefaultView());
}

function getRoleLabel(role) {
    const labels = { patient: 'Hasta', doctor: 'Hekim', admin: 'Sistem Yöneticisi' };
    return labels[role] || role;
}

function getDefaultView() {
    if (currentUser.role === 'patient') return 'home';
    if (currentUser.role === 'doctor') return 'doctor-dash';
    return 'admin-dash';
}

// ============ Sidebar ============
function renderSidebar() {
    $('sidebarHeader').innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:45px;height:45px;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.2rem;">
                ${currentUser.name[0]}
            </div>
            <div>
                <div class="user-name">${currentUser.name}</div>
                <div class="user-role">Hoş geldiniz</div>
            </div>
        </div>
    `;

    let items = [];
    if (currentUser.role === 'patient') {
        items = [
            { id: 'home', icon: 'grid', label: 'Ana Sayfa' },
            { id: 'book', icon: 'calendar-plus', label: 'Randevu Al' },
            { id: 'appointments', icon: 'clock-history', label: 'Randevularım' },
            { id: 'reports', icon: 'file-medical', label: 'Raporlarım' },
            { id: 'tests', icon: 'droplet', label: 'Tahlillerim' },
            { id: 'history', icon: 'activity', label: 'Sağlık Geçmişim' },
            { id: 'profile', icon: 'person-gear', label: 'Profilim' },
        ];
        $('healthCard').style.display = 'block';
        updateHealthSummary();
    } else if (currentUser.role === 'doctor') {
        items = [
            { id: 'doctor-dash', icon: 'calendar-check', label: 'Günlük Plan' },
            { id: 'doctor-all', icon: 'people', label: 'Hastalarım' },
        ];
    } else {
        items = [
            { id: 'admin-dash', icon: 'speedometer2', label: 'Panel Özeti' },
            { id: 'admin-appointments', icon: 'list-task', label: 'Randevu Listesi' },
            { id: 'admin-users', icon: 'people', label: 'Kullanıcılar' },
        ];
    }

    sidebarNav.innerHTML = items.map(i => `
        <button class="nav-item" data-view="${i.id}" onclick="navigateTo('${i.id}')">
            <i class="bi bi-${i.icon}"></i> ${i.label}
        </button>
    `).join('');
}

function updateHealthSummary() {
    if (!currentUser) return;
    $('sumBloodType').innerText = currentUser.blood_type || '-';
    const w = currentUser.weight, h = currentUser.height;
    if (w && h) {
        const bmi = (w / ((h / 100) ** 2)).toFixed(1);
        $('sumBMI').innerText = bmi;
        $('sumHeightWeight').innerText = `${h}cm / ${w}kg`;
    } else {
        $('sumBMI').innerText = '-';
        $('sumHeightWeight').innerText = '-';
    }
}

// ============ Navigation ============
function navigateTo(view) {
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Render content
    const renderers = {
        'home': renderHome,
        'book': renderBooking,
        'appointments': renderAppointments,
        'reports': renderReports,
        'tests': renderTests,
        'history': renderHistory,
        'profile': renderProfile,
        'doctor-dash': renderDoctorDash,
        'doctor-all': renderDoctorAll,
        'admin-dash': renderAdminDash,
        'admin-appointments': renderAdminAppointments,
        'admin-users': renderAdminUsers,
    };

    if (renderers[view]) renderers[view]();
}

async function renderHistory() {
    mainContent.innerHTML = `
        <div class="fade-in-up">
            <div class="page-header">
                <h3><i class="bi bi-activity" style="color:var(--primary);margin-right:8px;"></i>Sağlık Geçmişim</h3>
                <p>Geçmiş tanılarınız, tedavileriniz ve hastane ziyaretleriniz.</p>
            </div>
            <div class="glass-card">
                <div class="empty-state" style="padding:30px;">
                    <i class="bi bi-shield-check" style="font-size:3rem;color:var(--primary);opacity:0.3;margin-bottom:15px;"></i>
                    <h5 style="font-weight:700;">Kaydınız Güvende</h5>
                    <p>Sağlık geçmişiniz e-Nabız üzerinden otomatik olarak senkronize edilmektedir. Şu an için sadece bu uygulama üzerinden alınan randevuların geçmişi mevcuttur.</p>
                </div>
            </div>
        </div>
    `;
}

// ============ PATIENT: Home ============
async function renderHome() {
    mainContent.innerHTML = `
        <div class="fade-in-up">
            <div class="page-header">
                <h3>Hoş Geldiniz, ${currentUser.name} 👋</h3>
                <p>Sağlık ajandanıza göz atın, randevu alın veya geçmişinizi inceleyin.</p>
            </div>
            <div id="homeStats" class="stats-grid"></div>
            <div class="action-grid">
                <div class="action-card" onclick="navigateTo('book')">
                    <div class="action-icon"><i class="bi bi-calendar-plus-fill"></i></div>
                    <h6>Randevu Al</h6>
                    <p>Hızlı ve kolay doktor seçimi</p>
                </div>
                <div class="action-card" onclick="navigateTo('reports')">
                    <div class="action-icon" style="color:var(--success)"><i class="bi bi-file-medical-fill"></i></div>
                    <h6>Raporlarım</h6>
                    <p>Tıbbi dökümanlarınız</p>
                </div>
                <div class="action-card" onclick="navigateTo('tests')">
                    <div class="action-icon" style="color:var(--info)"><i class="bi bi-droplet-fill"></i></div>
                    <h6>Tahlillerim</h6>
                    <p>Laboratuvar sonuçları</p>
                </div>
                <div class="action-card" onclick="navigateTo('history')">
                    <div class="action-icon" style="color:var(--secondary)"><i class="bi bi-activity"></i></div>
                    <h6>Geçmişim</h6>
                    <p>Sağlık özetiniz</p>
                </div>
            </div>
            <div class="glass-card">
                <h5><i class="bi bi-calendar-event" style="color:var(--primary);margin-right:8px;"></i>Yaklaşan Randevular</h5>
                <div id="upcomingList">Yükleniyor...</div>
            </div>
        </div>
    `;
    
    // Load stats + upcoming
    const res = await fetch(`${API}/appointments/my`, { headers: { 'Authorization': `Bearer ${token}` } });
    const apts = await res.json();
    
    const active = apts.filter(a => a.status === 'aktif').length;
    const completed = apts.filter(a => a.status === 'tamamlandi').length;
    const cancelled = apts.filter(a => a.status === 'iptal').length;
    
    $('homeStats').innerHTML = `
        <div class="stat-card primary">
            <div class="stat-icon"><i class="bi bi-calendar-check"></i></div>
            <div class="stat-value">${active}</div>
            <div class="stat-label">Aktif Randevu</div>
        </div>
        <div class="stat-card success">
            <div class="stat-icon"><i class="bi bi-check-circle"></i></div>
            <div class="stat-value">${completed}</div>
            <div class="stat-label">Tamamlanan</div>
        </div>
        <div class="stat-card danger">
            <div class="stat-icon"><i class="bi bi-x-circle"></i></div>
            <div class="stat-value">${cancelled}</div>
            <div class="stat-label">İptal Edilen</div>
        </div>
        <div class="stat-card info">
            <div class="stat-icon"><i class="bi bi-clipboard2-pulse"></i></div>
            <div class="stat-value">${apts.length}</div>
            <div class="stat-label">Toplam Randevu</div>
        </div>
    `;
    
    const upcoming = apts.filter(a => a.status === 'aktif');
    if (upcoming.length === 0) {
        $('upcomingList').innerHTML = `
            <div class="empty-state">
                <i class="bi bi-calendar-x"></i>
                <h6>Yaklaşan randevunuz yok</h6>
                <p>Yeni bir randevu almak için "Randevu Al" bölümüne gidin.</p>
            </div>
        `;
    } else {
        $('upcomingList').innerHTML = upcoming.slice(0, 5).map(a => `
            <div class="apt-item">
                <div class="apt-date-box">
                    <div class="day">${a.date.split('-')[2]}</div>
                    <div class="month">${MONTHS_TR[parseInt(a.date.split('-')[1]) - 1]}</div>
                </div>
                <div class="apt-info">
                    <div class="apt-dept">${a.department_name || '-'}</div>
                    <div class="apt-meta">${a.doctor_name || '-'} &middot; Saat: ${formatTime(a.time)}</div>
                </div>
                <span class="badge-status badge-aktif">Aktif</span>
            </div>
        `).join('');
    }
}

// ============ PATIENT: Booking Wizard ============
let bookingStep = 1;
let bookingData = {};

async function renderBooking() {
    bookingStep = 1;
    bookingData = {};
    mainContent.innerHTML = `
        <div class="fade-in-up">
            <div class="page-header">
                <h3><i class="bi bi-calendar-plus" style="color:var(--primary);margin-right:8px;"></i>Randevu Al</h3>
                <p>Adım adım randevunuzu oluşturun.</p>
            </div>
            <div class="stepper" id="stepper">
                ${renderStepper()}
            </div>
            <div class="glass-card" id="bookingContent">
                ${renderBookingStep()}
            </div>
        </div>
    `;
    loadCities();
}

function renderStepper() {
    const steps = [
        { n: 1, label: 'İl/İlçe' },
        { n: 2, label: 'Hastane' },
        { n: 3, label: 'Klinik' },
        { n: 4, label: 'Doktor' },
        { n: 5, label: 'Tarih/Saat' },
    ];
    return steps.map((s, i) => `
        <div class="step ${bookingStep > s.n ? 'done' : ''} ${bookingStep === s.n ? 'active' : ''}">
            <div class="step-circle">${bookingStep > s.n ? '<i class="bi bi-check"></i>' : s.n}</div>
            <span class="step-label">${s.label}</span>
        </div>
        ${i < steps.length - 1 ? `<div class="step-line ${bookingStep > s.n ? 'done' : ''}"></div>` : ''}
    `).join('');
}

function renderBookingStep() {
    if (bookingStep === 1) {
        return `
            <h5>İl ve İlçe Seçin</h5>
            <div class="profile-grid" style="margin-top:1rem;">
                <div class="form-group">
                    <label class="form-label-custom">İl</label>
                    <select id="selCity" class="form-select-custom" onchange="onCityChange()">
                        <option value="">Seçiniz</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label-custom">İlçe</label>
                    <select id="selDistrict" class="form-select-custom" disabled onchange="onDistrictChange()">
                        <option value="">Önce İl Seçiniz</option>
                    </select>
                </div>
            </div>
        `;
    } else if (bookingStep === 2) {
        return `
            <h5>Hastane Seçin</h5>
            <div class="form-group" style="margin-top:1rem;">
                <label class="form-label-custom">Hastane</label>
                <select id="selHospital" class="form-select-custom" onchange="onHospitalChange()">
                    <option value="">Seçiniz</option>
                </select>
            </div>
        `;
    } else if (bookingStep === 3) {
        return `
            <h5>Klinik (Poliklinik) Seçin</h5>
            <div class="form-group" style="margin-top:1rem;">
                <label class="form-label-custom">Klinik</label>
                <select id="selClinic" class="form-select-custom" onchange="onClinicChange()">
                    <option value="">Seçiniz</option>
                </select>
            </div>
        `;
    } else if (bookingStep === 4) {
        return `
            <h5>Doktor Seçin</h5>
            <div class="form-group" style="margin-top:1rem;">
                <label class="form-label-custom">Doktor</label>
                <select id="selDoctor" class="form-select-custom" onchange="onDoctorChange()">
                    <option value="">Seçiniz</option>
                </select>
            </div>
        `;
    } else if (bookingStep === 5) {
        return `
            <h5>Tarih ve Saat Seçin</h5>
            <div class="form-group" style="margin-top:1rem;">
                <label class="form-label-custom">Randevu Tarihi</label>
                <input type="date" id="selDate" class="form-input form-input-noicon" min="${new Date().toISOString().split('T')[0]}" onchange="onDateChange()">
            </div>
            <div id="slotArea" style="margin-top:1rem;"></div>
        `;
    }
}

function advanceStep() {
    bookingStep++;
    $('stepper').innerHTML = renderStepper();
    $('bookingContent').innerHTML = renderBookingStep();
}

async function loadCities() {
    const res = await fetch('/cities');
    const cities = await res.json();
    const sel = $('selCity');
    if (sel) {
        sel.innerHTML = '<option value="">Seçiniz</option>' + cities.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }
}

async function onCityChange() {
    const cityId = $('selCity').value;
    if (!cityId) return;
    const res = await fetch(`/cities/${cityId}/districts`);
    const data = await res.json();
    const sel = $('selDistrict');
    sel.innerHTML = '<option value="">Seçiniz</option>' + data.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    sel.disabled = false;
}

async function onDistrictChange() {
    const distId = $('selDistrict').value;
    if (!distId) return;
    bookingData.districtId = distId;
    // Load hospitals and advance
    const res = await fetch(`/districts/${distId}/hospitals`);
    const data = await res.json();
    advanceStep();
    const sel = $('selHospital');
    sel.innerHTML = '<option value="">Seçiniz</option>' + data.map(h => `<option value="${h.id}">${h.name}</option>`).join('');
}

async function onHospitalChange() {
    const hospId = $('selHospital').value;
    if (!hospId) return;
    bookingData.hospitalId = hospId;
    const res = await fetch(`/hospitals/${hospId}/departments`);
    const data = await res.json();
    advanceStep();
    const sel = $('selClinic');
    sel.innerHTML = '<option value="">Seçiniz</option>' + data.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
}

async function onClinicChange() {
    const clinicId = $('selClinic').value;
    if (!clinicId) return;
    bookingData.departmentId = parseInt(clinicId);
    const res = await fetch(`/departments/${clinicId}/doctors`);
    const data = await res.json();
    advanceStep();
    const sel = $('selDoctor');
    sel.innerHTML = '<option value="">Seçiniz</option>' + data.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
}

function onDoctorChange() {
    const docId = $('selDoctor').value;
    if (!docId) return;
    bookingData.doctorId = parseInt(docId);
    advanceStep();
}

async function onDateChange() {
    const dateVal = $('selDate').value;
    if (!dateVal) return;
    bookingData.date = dateVal;
    
    const res = await fetch(`/appointments/slots?doctor_id=${bookingData.doctorId}&date_str=${dateVal}`);
    const slots = await res.json();
    
    const area = $('slotArea');
    if (slots.length === 0) {
        area.innerHTML = `
            <div class="empty-state" style="padding:1rem;">
                <i class="bi bi-clock" style="font-size:1.5rem;"></i>
                <h6>Uygun saat bulunamadı</h6>
                <p>Lütfen başka bir tarih deneyin.</p>
            </div>
        `;
        return;
    }
    
    area.innerHTML = `
        <label class="form-label-custom">Uygun Saatler</label>
        <div class="slot-grid">
            ${slots.map(s => `<button class="slot-btn" onclick="selectSlot(this, '${s}')">${s}</button>`).join('')}
        </div>
        <button id="btnConfirmBooking" class="btn-primary-custom" style="margin-top:1.5rem;display:none;" onclick="confirmBooking()">
            <i class="bi bi-check-circle"></i> Randevuyu Onayla
        </button>
    `;
}

function selectSlot(btn, time) {
    document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    bookingData.time = time;
    $('btnConfirmBooking').style.display = 'block';
}

async function confirmBooking() {
    const payload = {
        doctor_id: bookingData.doctorId,
        department_id: bookingData.departmentId,
        date: bookingData.date,
        time: bookingData.time
    };

    const res = await fetch('/appointments/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        showToast('Randevunuz başarıyla oluşturuldu! 🎉', 'success');
        navigateTo('appointments');
    } else {
        const error = await res.json();
        showToast('Hata: ' + (error.detail || 'Randevu alınamadı.'), 'error');
    }
}

// ============ PATIENT: Appointments ============
async function renderAppointments() {
    mainContent.innerHTML = `
        <div class="fade-in-up">
            <div class="page-header">
                <h3><i class="bi bi-clock-history" style="color:var(--primary);margin-right:8px;"></i>Randevularım</h3>
                <p>Tüm randevu geçmişinizi görüntüleyin.</p>
            </div>
            <div id="aptListArea">Yükleniyor...</div>
        </div>
    `;

    const res = await fetch(`${API}/appointments/my`, { headers: { 'Authorization': `Bearer ${token}` } });
    const apts = await res.json();

    if (apts.length === 0) {
        $('aptListArea').innerHTML = `
            <div class="empty-state">
                <i class="bi bi-calendar-x"></i>
                <h6>Henüz randevunuz yok</h6>
                <p>"Randevu Al" bölümünden ilk randevunuzu oluşturun.</p>
            </div>
        `;
        return;
    }

    $('aptListArea').innerHTML = `
        <div class="glass-card" style="overflow-x:auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Doktor</th>
                        <th>Bölüm</th>
                        <th>Tarih</th>
                        <th>Saat</th>
                        <th>Durum</th>
                        <th>Not</th>
                        <th>İşlem</th>
                    </tr>
                </thead>
                <tbody>
                    ${apts.map(a => `
                        <tr>
                            <td style="font-weight:600;color:var(--text-primary);">${a.doctor_name || '-'}</td>
                            <td>${a.department_name || '-'}</td>
                            <td>${formatDateTR(a.date)}</td>
                            <td style="font-weight:600;">${formatTime(a.time)}</td>
                            <td><span class="badge-status badge-${a.status}">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span></td>
                            <td style="font-size:0.82rem;color:var(--text-muted);">${a.doctor_note || '-'}</td>
                            <td>
                                ${a.status === 'aktif' ? `<button class="btn-sm-custom btn-cancel" onclick="cancelApt(${a.id})"><i class="bi bi-x"></i> İptal</button>` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function cancelApt(id) {
    if (!confirm('Bu randevuyu iptal etmek istediğinize emin misiniz?')) return;
    await fetch(`${API}/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'iptal' })
    });
    showToast('Randevu iptal edildi.', 'warning');
    renderAppointments();
}

// ============ PATIENT: Reports ============
async function renderReports() {
    mainContent.innerHTML = `
        <div class="fade-in-up">
            <div class="page-header">
                <h3><i class="bi bi-file-earmark-medical" style="color:var(--success);margin-right:8px;"></i>Tıbbi Raporlarım</h3>
                <p>Doktorlarınız tarafından yazılan raporlarınız.</p>
            </div>
            <div id="reportListArea">Yükleniyor...</div>
        </div>
    `;

    const res = await fetch(`${API}/me/reports`, { headers: { 'Authorization': `Bearer ${token}` } });
    const reports = await res.json();

    if (reports.length === 0) {
        $('reportListArea').innerHTML = `
            <div class="empty-state">
                <i class="bi bi-file-earmark-x"></i>
                <h6>Henüz raporunuz yok</h6>
                <p>Doktorunuz muayene sonrası rapor oluşturduğunda burada görünecektir.</p>
            </div>
        `;
        return;
    }

    $('reportListArea').innerHTML = reports.map(r => `
        <div class="report-card">
            <div class="report-header">
                <span class="report-title"><i class="bi bi-file-text" style="margin-right:6px;"></i>${r.title}</span>
                <span class="report-date">${formatDateTR(r.date)}</span>
            </div>
            <div class="report-doctor"><i class="bi bi-person" style="margin-right:4px;"></i> ${r.doctor_name || 'Bilinmeyen Doktor'}</div>
            <div class="report-content">${r.content}</div>
        </div>
    `).join('');
}

// ============ PATIENT: Tests ============
async function renderTests() {
    mainContent.innerHTML = `
        <div class="fade-in-up">
            <div class="page-header">
                <h3><i class="bi bi-droplet" style="color:var(--info);margin-right:8px;"></i>Tahlil Sonuçlarım</h3>
                <p>Laboratuvar test sonuçlarınız.</p>
            </div>
            <div id="testListArea">Yükleniyor...</div>
        </div>
    `;

    const res = await fetch(`${API}/me/tests`, { headers: { 'Authorization': `Bearer ${token}` } });
    const tests = await res.json();

    if (tests.length === 0) {
        $('testListArea').innerHTML = `
            <div class="empty-state">
                <i class="bi bi-droplet"></i>
                <h6>Tahlil sonucunuz yok</h6>
                <p>Laboratuvar sonuçlarınız burada listelenecektir.</p>
            </div>
        `;
        return;
    }

    $('testListArea').innerHTML = `
        <div class="glass-card" style="overflow-x:auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tahlil Adı</th>
                        <th>Sonuç</th>
                        <th>Referans Aralığı</th>
                        <th>Tarih</th>
                    </tr>
                </thead>
                <tbody>
                    ${tests.map(t => `
                        <tr>
                            <td style="font-weight:600;color:var(--text-primary);">${t.test_name}</td>
                            <td style="color:var(--primary);font-weight:700;">${t.result_value} <span style="font-weight:400;color:var(--text-muted);">${t.unit || ''}</span></td>
                            <td style="color:var(--text-muted);">${t.reference_range || '-'}</td>
                            <td>${formatDateTR(t.date)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ============ PATIENT: Profile ============
function renderProfile() {
    mainContent.innerHTML = `
        <div class="fade-in-up">
            <div class="page-header">
                <h3><i class="bi bi-person-gear" style="color:var(--warning);margin-right:8px;"></i>Profil Bilgilerim</h3>
                <p>Kişisel ve sağlık bilgilerinizi güncelleyin.</p>
            </div>
            <div class="glass-card">
                <form id="profileForm" onsubmit="saveProfile(event)">
                    <div class="profile-grid">
                        <div class="form-group">
                            <label class="form-label-custom">Ad Soyad</label>
                            <input type="text" id="profName" class="form-input form-input-noicon" value="${currentUser.name}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label-custom">E-Posta</label>
                            <input type="email" id="profEmail" class="form-input form-input-noicon" value="${currentUser.email || ''}" placeholder="example@mail.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label-custom">Telefon</label>
                            <input type="tel" id="profPhone" class="form-input form-input-noicon" value="${currentUser.phone || ''}" placeholder="05XX XXX XX XX">
                        </div>
                        <div class="form-group">
                            <label class="form-label-custom">Kan Grubu</label>
                            <select id="profBlood" class="form-select-custom">
                                <option value="">Seçiniz</option>
                                ${['A+','A-','B+','B-','AB+','AB-','0+','0-'].map(b => `<option value="${b}" ${currentUser.blood_type === b ? 'selected' : ''}>${b}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label-custom">Cinsiyet</label>
                            <select id="profGender" class="form-select-custom">
                                <option value="">Seçiniz</option>
                                <option value="Erkek" ${currentUser.gender === 'Erkek' ? 'selected' : ''}>Erkek</option>
                                <option value="Kadın" ${currentUser.gender === 'Kadın' ? 'selected' : ''}>Kadın</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label-custom">Doğum Tarihi</label>
                            <input type="date" id="profBirth" class="form-input form-input-noicon" value="${currentUser.birth_date || ''}">
                        </div>
                        <div class="form-group">
                            <label class="form-label-custom">Boy (cm)</label>
                            <input type="number" id="profHeight" class="form-input form-input-noicon" value="${currentUser.height || ''}" placeholder="175">
                        </div>
                        <div class="form-group">
                            <label class="form-label-custom">Kilo (kg)</label>
                            <input type="number" id="profWeight" class="form-input form-input-noicon" value="${currentUser.weight || ''}" placeholder="70">
                        </div>
                    </div>
                    <div style="margin-top:1.5rem;">
                        <button type="submit" class="btn-primary-custom" style="width:auto;padding:12px 30px;">
                            <i class="bi bi-check-lg"></i> Değişiklikleri Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

async function saveProfile(e) {
    e.preventDefault();
    const payload = {
        name: $('profName').value,
        email: $('profEmail').value || null,
        phone: $('profPhone').value || null,
        blood_type: $('profBlood').value || null,
        gender: $('profGender').value || null,
        birth_date: $('profBirth').value || null,
        weight: parseInt($('profWeight').value) || null,
        height: parseInt($('profHeight').value) || null
    };

    const res = await fetch(`${API}/me`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        currentUser = await res.json();
        updateHealthSummary();
        showToast('Profil başarıyla güncellendi! ✅', 'success');
    } else {
        showToast('Profil güncellenemedi.', 'error');
    }
}

// ============ DOCTOR: Dashboard ============
async function renderDoctorDash() {
    const today = new Date().toISOString().split('T')[0];
    mainContent.innerHTML = `
        <div class="fade-in-up">
            <div class="page-header">
                <h3><i class="bi bi-calendar-check" style="color:var(--success);margin-right:8px;"></i>Günlük Programım</h3>
                <p>Bugünkü randevu listeniz (${formatDateTR(today)})</p>
            </div>
            <div id="doctorAptList">Yükleniyor...</div>
        </div>
    `;

    const res = await fetch(`${API}/appointments/my`, { headers: { 'Authorization': `Bearer ${token}` } });
    const apts = await res.json();
    const todayApts = apts.filter(a => a.date === today);

    renderDoctorAppointments(todayApts, 'doctorAptList');
}

async function renderDoctorAll() {
    mainContent.innerHTML = `
        <div class="fade-in-up">
            <div class="page-header">
                <h3><i class="bi bi-calendar3" style="color:var(--primary);margin-right:8px;"></i>Tüm Randevularım</h3>
                <p>Geçmiş ve gelecek tüm randevularınız.</p>
            </div>
            <div id="doctorAllList">Yükleniyor...</div>
        </div>
    `;

    const res = await fetch(`${API}/appointments/my`, { headers: { 'Authorization': `Bearer ${token}` } });
    const apts = await res.json();
    renderDoctorAppointments(apts, 'doctorAllList');
}

function renderDoctorAppointments(apts, targetId) {
    if (apts.length === 0) {
        $(targetId).innerHTML = `
            <div class="empty-state">
                <i class="bi bi-calendar-x"></i>
                <h6>Randevu bulunamadı</h6>
            </div>
        `;
        return;
    }

    $(targetId).innerHTML = `
        <div class="glass-card" style="overflow-x:auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Hasta</th>
                        <th>Bölüm</th>
                        <th>Tarih</th>
                        <th>Saat</th>
                        <th>Durum</th>
                        <th>Not</th>
                        <th>İşlem</th>
                    </tr>
                </thead>
                <tbody>
                    ${apts.map(a => `
                        <tr>
                            <td style="font-weight:600;color:var(--text-primary);">${a.patient_name || '-'}</td>
                            <td>${a.department_name || '-'}</td>
                            <td>${formatDateTR(a.date)}</td>
                            <td style="font-weight:600;">${formatTime(a.time)}</td>
                            <td><span class="badge-status badge-${a.status}">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span></td>
                            <td style="font-size:0.82rem;color:var(--text-muted);">${a.doctor_note || '-'}</td>
                            <td style="display:flex;gap:4px;flex-wrap:wrap;">
                                ${a.status === 'aktif' ? `
                                    <button class="btn-sm-custom btn-complete" onclick="completeApt(${a.id})"><i class="bi bi-check"></i> Tamamla</button>
                                    <button class="btn-sm-custom btn-note" onclick="addNote(${a.id})"><i class="bi bi-pencil"></i> Not</button>
                                ` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function completeApt(id) {
    await fetch(`${API}/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'tamamlandi' })
    });
    showToast('Randevu tamamlandı olarak işaretlendi.', 'success');
    renderDoctorDash();
}

function addNote(aptId) {
    // Show modal
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-box fade-in-up">
            <h5><i class="bi bi-pencil-square" style="color:var(--info);margin-right:8px;"></i>Doktor Notu Ekle</h5>
            <div class="form-group">
                <label class="form-label-custom">Not</label>
                <textarea id="noteText" class="form-input form-input-noicon" rows="4" placeholder="Muayene notlarınızı yazın..." style="resize:vertical;"></textarea>
            </div>
            <div class="modal-actions">
                <button class="btn-ghost" onclick="this.closest('.modal-overlay').remove()">İptal</button>
                <button class="btn-primary-custom" style="width:auto;padding:10px 24px;" onclick="saveNote(${aptId})">Kaydet</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

async function saveNote(aptId) {
    const note = $('noteText').value;
    if (!note.trim()) {
        showToast('Lütfen bir not yazın.', 'warning');
        return;
    }
    await fetch(`${API}/appointments/${aptId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_note: note })
    });
    document.querySelector('.modal-overlay').remove();
    showToast('Not başarıyla eklendi.', 'success');
    renderDoctorDash();
}

// ============ ADMIN: Dashboard ============
async function renderAdminDash() {
    mainContent.innerHTML = `
        <div class="fade-in-up">
            <div class="page-header">
                <h3><i class="bi bi-speedometer2" style="color:var(--primary);margin-right:8px;"></i>Yönetici Paneli</h3>
                <p>Sistem genel istatistikleri ve analizler.</p>
            </div>
            <div id="adminStatsArea">Yükleniyor...</div>
        </div>
    `;

    const res = await fetch(`${API}/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) {
        $('adminStatsArea').innerHTML = `<div class="empty-state"><h6>İstatistikler yüklenemedi</h6></div>`;
        return;
    }
    const stats = await res.json();

    $('adminStatsArea').innerHTML = `
        <div class="stats-grid">
            <div class="stat-card primary">
                <div class="stat-icon"><i class="bi bi-people"></i></div>
                <div class="stat-value">${stats.total_users}</div>
                <div class="stat-label">Toplam Kullanıcı</div>
            </div>
            <div class="stat-card success">
                <div class="stat-icon"><i class="bi bi-person-badge"></i></div>
                <div class="stat-value">${stats.total_patients}</div>
                <div class="stat-label">Hasta</div>
            </div>
            <div class="stat-card info">
                <div class="stat-icon"><i class="bi bi-hospital"></i></div>
                <div class="stat-value">${stats.total_doctors}</div>
                <div class="stat-label">Doktor</div>
            </div>
            <div class="stat-card warning">
                <div class="stat-icon"><i class="bi bi-calendar-day"></i></div>
                <div class="stat-value">${stats.today_appointments}</div>
                <div class="stat-label">Bugünkü Randevu</div>
            </div>
        </div>
        <div class="stats-grid" style="margin-top:0;">
            <div class="stat-card primary">
                <div class="stat-icon"><i class="bi bi-calendar3"></i></div>
                <div class="stat-value">${stats.total_appointments}</div>
                <div class="stat-label">Toplam Randevu</div>
            </div>
            <div class="stat-card success">
                <div class="stat-icon"><i class="bi bi-check-circle"></i></div>
                <div class="stat-value">${stats.active_appointments}</div>
                <div class="stat-label">Aktif</div>
            </div>
            <div class="stat-card danger">
                <div class="stat-icon"><i class="bi bi-x-circle"></i></div>
                <div class="stat-value">${stats.cancelled_appointments}</div>
                <div class="stat-label">İptal</div>
            </div>
            <div class="stat-card info">
                <div class="stat-icon"><i class="bi bi-check-all"></i></div>
                <div class="stat-value">${stats.completed_appointments}</div>
                <div class="stat-label">Tamamlanan</div>
            </div>
        </div>
        <div class="glass-card">
            <h5><i class="bi bi-bar-chart" style="color:var(--primary);margin-right:8px;"></i>Son 7 Günlük Randevu Dağılımı</h5>
            <div style="display:flex;align-items:flex-end;gap:12px;height:120px;margin-top:1rem;">
                ${stats.weekly_data.map(d => {
                    const maxCount = Math.max(...stats.weekly_data.map(w => w.count), 1);
                    const height = Math.max((d.count / maxCount) * 100, 4);
                    return `
                        <div style="flex:1;text-align:center;">
                            <div style="font-size:0.75rem;color:var(--text-primary);font-weight:700;margin-bottom:4px;">${d.count}</div>
                            <div style="height:${height}px;background:linear-gradient(180deg, var(--primary), var(--secondary));border-radius:6px 6px 2px 2px;transition:height 0.5s ease;"></div>
                            <div style="font-size:0.7rem;color:var(--text-muted);margin-top:6px;">${d.day}</div>
                            <div style="font-size:0.6rem;color:var(--text-muted);">${d.date}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// ============ ADMIN: All Appointments ============
async function renderAdminAppointments() {
    mainContent.innerHTML = `
        <div class="fade-in-up">
            <div class="page-header">
                <h3><i class="bi bi-calendar3" style="color:var(--primary);margin-right:8px;"></i>Tüm Randevular</h3>
                <p>Sistemdeki tüm randevuları listeleyin.</p>
            </div>
            <div id="adminAptList">Yükleniyor...</div>
        </div>
    `;

    const res = await fetch(`${API}/appointments/my`, { headers: { 'Authorization': `Bearer ${token}` } });
    const apts = await res.json();

    if (apts.length === 0) {
        $('adminAptList').innerHTML = `<div class="empty-state"><h6>Randevu bulunamadı</h6></div>`;
        return;
    }

    $('adminAptList').innerHTML = `
        <div class="glass-card" style="overflow-x:auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Hasta</th>
                        <th>Doktor</th>
                        <th>Bölüm</th>
                        <th>Tarih</th>
                        <th>Saat</th>
                        <th>Durum</th>
                    </tr>
                </thead>
                <tbody>
                    ${apts.map(a => `
                        <tr>
                            <td style="color:var(--text-muted);">#${a.id}</td>
                            <td style="font-weight:600;color:var(--text-primary);">${a.patient_name || '-'}</td>
                            <td>${a.doctor_name || '-'}</td>
                            <td>${a.department_name || '-'}</td>
                            <td>${formatDateTR(a.date)}</td>
                            <td style="font-weight:600;">${formatTime(a.time)}</td>
                            <td><span class="badge-status badge-${a.status}">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ============ ADMIN: Users ============
async function renderAdminUsers() {
    mainContent.innerHTML = `
        <div class="fade-in-up">
            <div class="page-header">
                <h3><i class="bi bi-people" style="color:var(--info);margin-right:8px;"></i>Kullanıcılar</h3>
                <p>Sistemdeki tüm kullanıcıları görüntüleyin.</p>
            </div>
            <div id="adminUserList">Yükleniyor...</div>
        </div>
    `;

    const res = await fetch(`${API}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) {
        $('adminUserList').innerHTML = `<div class="empty-state"><h6>Kullanıcılar yüklenemedi</h6></div>`;
        return;
    }
    const users = await res.json();

    $('adminUserList').innerHTML = `
        <div class="glass-card" style="overflow-x:auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Ad Soyad</th>
                        <th>TC Kimlik</th>
                        <th>Rol</th>
                        <th>E-Posta</th>
                        <th>Telefon</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.slice(0, 50).map(u => `
                        <tr>
                            <td style="color:var(--text-muted);">#${u.id}</td>
                            <td style="font-weight:600;color:var(--text-primary);">${u.name}</td>
                            <td style="font-family:monospace;">${u.tc_kimlik}</td>
                            <td><span class="badge-status badge-${u.role === 'admin' ? 'tamamlandi' : u.role === 'doctor' ? 'aktif' : 'iptal'}">${getRoleLabel(u.role)}</span></td>
                            <td style="color:var(--text-muted);">${u.email || '-'}</td>
                            <td style="color:var(--text-muted);">${u.phone || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
