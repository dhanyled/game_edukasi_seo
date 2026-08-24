/**
 * SEO Master Game Application
 * JavaScript Logic, Minigame Handlers, Sound Synthesizer, & LocalStorage Management
 */

// Global Game State Structure
const gameState = {
    currentStage: 1,
    totalScore: 0,
    traffic: 0,
    rank: "Pemula (Level 1)",
    stageScores: {
        stage1: 0,
        stage2: 0,
        stage3: 0,
        stage4: 0
    },
    completedStages: {
        stage1: false,
        stage2: false,
        stage3: false,
        stage4: false,
        stage5: false
    },
    // Stage 1 Data
    selectedKeywords: [],
    // Stage 2 Data
    onpageData: {
        title: "Kopi Lokal Indonesia - Biji Kopi Arabika Nikmat",
        meta: "Beli biji kopi arabika dan robika kualitas premium dari petani lokal Indonesia. Bebas ongkir dan dikirim segar ke rumah Anda!",
        slug: "biji-kopi-lokal-premium",
        h1: "Kopi Lokal Nusantara Premium",
        alt: "Biji Kopi Arabika Indonesia Segar Dalam Kemasan"
    },
    // Stage 3 Data
    techIssuesFixed: {
        ssl: false,
        speed: false,
        sitemap: false,
        brokenLinks: false
    },
    // Stage 4 Data
    backlinkDecisions: {
        goodAccepted: 0,
        spamAccepted: 0,
        evaluatedIds: []
    }
};

// Data Models
const KEYWORDS_DATA = [
    { id: 'kw1', text: 'kopi', volume: 150000, kd: 'Sangat Tinggi (92)', intent: 'Informasional / Umum', points: 10, isRecommended: false, note: 'Volume raksasa tetapi terlalu umum dan persaingan sangat sengit!' },
    { id: 'kw2', text: 'biji kopi arabika lokal', volume: 12500, kd: 'Rendah (28)', intent: 'Komersial / Transaksional', points: 35, isRecommended: true, note: 'Sangat direkomendasikan! Relevan, KD rendah, niat beli tinggi.' },
    { id: 'kw3', text: 'jual kopi online gratis ongkir', volume: 8400, kd: 'Sedang (38)', intent: 'Transaksional', points: 30, isRecommended: true, note: 'Bagus! Niat transaksional jelas untuk toko online.' },
    { id: 'kw4', text: 'resep membuat kopi enak di rumah', volume: 22000, kd: 'Sedang (45)', intent: 'Informasional', points: 25, isRecommended: true, note: 'Bagus untuk konten blog guna menarik pembeli potensial.' },
    { id: 'kw5', text: 'sejarah kopi abad ke-18', volume: 3200, kd: 'Rendah (15)', intent: 'Informasional', points: 5, isRecommended: false, note: 'Kurang relevan untuk niat pembelian produk toko kopi.' },
    { id: 'kw6', text: 'mesin kopi espresso 500 juta', volume: 800, kd: 'Tinggi (70)', intent: 'Komersial khusus', points: 10, isRecommended: false, note: 'Volume terlalu kecil & tidak sesuai dengan katalog kopi lokal.' }
];

const KEYWORDS_BY_ID = KEYWORDS_DATA.reduce((acc, kw) => {
    acc[kw.id] = kw;
    return acc;
}, {});

const BACKLINK_REQUESTS = [
    {
        id: 'bl1',
        domain: 'PortalBeritaKuliner.id',
        da: 65,
        type: 'Berkualitas Tinggi (Good)',
        description: 'Situs berita kuliner terpercaya ingin mengulas biji kopi lokal Anda dengan tautan dofollow.',
        isGood: true
    },
    {
        id: 'bl2',
        domain: 'Free-Casino-Slots-Online.xyz',
        da: 8,
        type: 'Spam / Berbahaya',
        description: 'Situs judi & casino menawarkan tukar link otomatis di footer.',
        isGood: false
    },
    {
        id: 'bl3',
        domain: 'BlogGayaHidupSehat.com',
        da: 42,
        type: 'Berkualitas Baik (Good)',
        description: 'Blog artikel kesehatan menulis manfaat kopi hitam bagi metabolisme.',
        isGood: true
    },
    {
        id: 'bl4',
        domain: 'Cheap-Backlink-Farm-1000.top',
        da: 2,
        type: 'Spam / Private Blog Network',
        description: 'Penjual ribuan backlink murah dari ternak blog berkualitas rendah.',
        isGood: false
    }
];

const BACKLINK_REQUESTS_BY_ID = BACKLINK_REQUESTS.reduce((acc, req) => {
    acc[req.id] = req;
    return acc;
}, {});

const SEO_TIPS = [
    "Pilih kata kunci dengan volume pencarian baik dan tingkat persaingan (KD) yang masuk akal!",
    "Judul halaman (Title Tag) idealnya antara 50-60 karakter dan mengandung kata kunci utama.",
    "Gunakan HTTPS (SSL) agar situs aman dan mendapat poin plus dari algoritma Google.",
    "Hindari membeli backlink dari ternak link (PBN/Spam) karena dapat menyebabkan penalti Google!",
    "Sitemap XML membantu bot Google menemukan seluruh halaman penting di web Anda dengan cepat."
];

// Web Audio API Sound Generator
class SoundEffects {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
    }

    playSuccess() {
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
            osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) {
            console.error(e);
        }
    }

    playClick() {
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.05);
        } catch (e) {
            console.error(e);
        }
    }

    playError() {
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.setValueAtTime(180, now + 0.1);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.25);
        } catch (e) {
            console.error(e);
        }
    }
}

const sounds = new SoundEffects();

// LocalStorage Persistence Helpers
function saveGameState() {
    try {
        localStorage.setItem('seo_game_state_v1', JSON.stringify(gameState));
    } catch (e) {
        console.warn('LocalStorage not available or disabled.', e);
    }
}

function loadGameState() {
    try {
        const saved = localStorage.getItem('seo_game_state_v1');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(gameState, parsed);
        }
    } catch (e) {
        console.warn('Failed to parse saved game state.', e);
    }
}

function resetGameState() {
    if (confirm("Apakah Anda yakin ingin mereset seluruh progress game SEO Anda?")) {
        localStorage.removeItem('seo_game_state_v1');
        window.location.reload();
    }
}

// UI Navigation & View Updates
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            sounds.playClick();
            const stageNum = parseInt(item.getAttribute('data-stage'));
            switchStage(stageNum);
        });
    });

    document.getElementById('btn-reset-game')?.addEventListener('click', resetGameState);
    document.getElementById('btn-modal-close')?.addEventListener('click', closeModal);
}

function switchStage(stageNum) {
    gameState.currentStage = stageNum;

    // Update active nav styling
    document.querySelectorAll('.nav-item').forEach(item => {
        const itemStage = parseInt(item.getAttribute('data-stage'));
        if (itemStage === stageNum) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update active panel
    document.querySelectorAll('.stage-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    const targetPanel = document.getElementById(`stage-${stageNum}`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }

    // Dynamic Tip
    const tipElem = document.getElementById('dynamic-tip');
    if (tipElem && SEO_TIPS[stageNum - 1]) {
        tipElem.innerText = SEO_TIPS[stageNum - 1];
    }

    updateUIHeader();
}

function calculateScoreAndRank() {
    gameState.totalScore = gameState.stageScores.stage1 +
                           gameState.stageScores.stage2 +
                           gameState.stageScores.stage3 +
                           gameState.stageScores.stage4;

    gameState.traffic = Math.round(gameState.totalScore * 85);

    if (gameState.totalScore >= 350) {
        gameState.rank = "Master SEO (Level 5)";
    } else if (gameState.totalScore >= 250) {
        gameState.rank = "Spesialis SEO (Level 4)";
    } else if (gameState.totalScore >= 150) {
        gameState.rank = "Praktisi SEO (Level 3)";
    } else if (gameState.totalScore >= 50) {
        gameState.rank = "Pelajar SEO (Level 2)";
    } else {
        gameState.rank = "Pemula (Level 1)";
    }
}

function updateHeaderDOM() {
    const userRank = document.getElementById('user-rank');
    const userScore = document.getElementById('user-score');
    const userTraffic = document.getElementById('user-traffic');

    if (userRank) userRank.innerText = gameState.rank;
    if (userScore) userScore.innerText = `${gameState.totalScore} XP`;
    if (userTraffic) userTraffic.innerText = `${gameState.traffic.toLocaleString('id-ID')} /bln`;
}

function updateStageProgressDOM() {
    let completedCount = 0;
    const statusIcons = [
        document.getElementById('status-stage-1'),
        document.getElementById('status-stage-2'),
        document.getElementById('status-stage-3'),
        document.getElementById('status-stage-4'),
        document.getElementById('status-stage-5')
    ];

    for (let i = 1; i <= 5; i++) {
        const isDone = gameState.completedStages[`stage${i}`];
        const statusIcon = statusIcons[i - 1];
        if (statusIcon) {
            if (isDone) {
                statusIcon.classList.add('completed');
            } else {
                statusIcon.classList.remove('completed');
            }
        }
        if (isDone) completedCount++;
    }

    const completedText = document.getElementById('completed-stages-text');
    const progressBar = document.getElementById('overall-progress-bar');
    const progressPercent = document.getElementById('progress-percent');

    const percent = Math.round((completedCount / 5) * 100);
    if (completedText) completedText.innerText = `${completedCount} dari 5 Tahap Selesai`;
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressPercent) progressPercent.innerText = `${percent}%`;
}

function updateUIHeader() {
    calculateScoreAndRank();
    updateHeaderDOM();
    updateStageProgressDOM();
    saveGameState();
}

// Modal Dialog Utility
const modalElements = {
    get overlay() { return document.getElementById('modal-overlay'); },
    get title() { return document.getElementById('modal-title'); },
    get body() { return document.getElementById('modal-body'); },
    get icon() { return document.getElementById('modal-icon'); }
};

function showModal(title, text, iconClass = 'fa-solid fa-award', isSuccess = true) {
    if (isSuccess) {
        sounds.playSuccess();
    } else {
        sounds.playError();
    }

    if (modalElements.title) modalElements.title.innerText = title;
    if (modalElements.body) modalElements.body.innerHTML = text;
    if (modalElements.icon) modalElements.icon.className = `${iconClass} modal-icon`;

    if (modalElements.overlay) modalElements.overlay.classList.remove('hidden');
}

function closeModal() {
    sounds.playClick();
    if (modalElements.overlay) modalElements.overlay.classList.add('hidden');
}

/* ==========================================================================
   STAGE 1: Keyword Research Logic
   ========================================================================== */
function initStage1() {
    renderKeywordTable();
    updateSelectedKeywordsUI();

    const btnSubmit = document.getElementById('btn-submit-stage1');
    if (btnSubmit) {
        btnSubmit.addEventListener('click', evaluateStage1);
    }
}

function renderKeywordTable() {
    const tbody = document.getElementById('keyword-list-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    const fragment = document.createDocumentFragment();

    KEYWORDS_DATA.forEach(kw => {
        const isSelected = gameState.selectedKeywords.includes(kw.id);
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td><strong>${kw.text}</strong></td>
            <td>${kw.volume.toLocaleString('id-ID')}</td>
            <td><span class="badge">${kw.kd}</span></td>
            <td>${kw.intent}</td>
            <td>
                <button class="btn btn-sm ${isSelected ? 'btn-outline-danger' : 'btn-primary'}" data-kw-id="${kw.id}">
                    ${isSelected ? 'Batal' : 'Pilih'}
                </button>
            </td>
        `;

        const btn = tr.querySelector('button');
        btn.addEventListener('click', () => toggleSelectKeyword(kw.id));

        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
}

function toggleSelectKeyword(id) {
    sounds.playClick();
    const index = gameState.selectedKeywords.indexOf(id);
    if (index > -1) {
        gameState.selectedKeywords.splice(index, 1);
    } else {
        if (gameState.selectedKeywords.length >= 3) {
            showModal('Batas Maksimal', 'Anda hanya dapat memilih 3 kata kunci utama.', 'fa-solid fa-triangle-exclamation', false);
            return;
        }
        gameState.selectedKeywords.push(id);
    }

    renderKeywordTable();
    updateSelectedKeywordsUI();
}

function updateSelectedKeywordsUI() {
    const list = document.getElementById('selected-keywords-list');
    const countSpan = document.getElementById('selected-kw-count');
    const analysisBox = document.getElementById('kw-analysis-result');
    const btnSubmit = document.getElementById('btn-submit-stage1');

    if (countSpan) countSpan.innerText = gameState.selectedKeywords.length;

    if (!list) return;

    if (gameState.selectedKeywords.length === 0) {
        list.innerHTML = '<li class="empty-msg">Belum ada kata kunci terpilih.</li>';
        if (analysisBox) analysisBox.innerHTML = 'Pilih 3 kata kunci di tabel untuk melihat analisis potensi trafik.';
        if (btnSubmit) btnSubmit.disabled = true;
        return;
    }

    list.innerHTML = '';
    let totalVol = 0;
    const fragment = document.createDocumentFragment();

    gameState.selectedKeywords.forEach(id => {
        const kwObj = KEYWORDS_BY_ID[id];
        if (kwObj) {
            totalVol += kwObj.volume;
            const li = document.createElement('li');
            li.className = 'kw-tag';
            li.innerHTML = `
                ${kwObj.text}
                <span class="remove-btn" title="Hapus">&times;</span>
            `;
            li.querySelector('.remove-btn').addEventListener('click', () => toggleSelectKeyword(id));
            fragment.appendChild(li);
        }
    });
    list.appendChild(fragment);

    if (analysisBox) {
        analysisBox.innerHTML = `
            <strong>Estimasi Total Volume Pencarian:</strong> ${totalVol.toLocaleString('id-ID')} /bulan.<br>
            <small>Klik tombol di bawah untuk mengevaluasi strategi kata kunci Anda.</small>
        `;
    }

    if (btnSubmit) {
        btnSubmit.disabled = gameState.selectedKeywords.length !== 3;
    }
}

function evaluateStage1() {
    if (gameState.selectedKeywords.length !== 3) return;

    let totalPoints = 0;
    let feedbackHTML = '<ul style="text-align: left; margin-top: 10px;">';

    gameState.selectedKeywords.forEach(id => {
        const kw = KEYWORDS_BY_ID[id];
        if (kw) {
            totalPoints += kw.points;
            const icon = kw.isRecommended ? '✅' : '⚠️';
            feedbackHTML += `<li style="margin-bottom: 6px;">${icon} <strong>${kw.text}</strong>: ${kw.note} (+${kw.points} XP)</li>`;
        }
    });

    feedbackHTML += '</ul>';

    gameState.stageScores.stage1 = totalPoints;
    gameState.completedStages.stage1 = true;
    updateUIHeader();

    showModal(
        'Evaluasi Riset Kata Kunci Selesai!',
        `Anda mengumpulkan <strong>${totalPoints} XP</strong> dari Tahap 1.<br>${feedbackHTML}`,
        'fa-solid fa-square-poll-vertical',
        true
    );
}

/* ==========================================================================
   STAGE 2: On-Page SEO Editor Logic
   ========================================================================== */
function initStage2() {
    const titleInput = document.getElementById('input-title');
    const metaInput = document.getElementById('input-meta');
    const slugInput = document.getElementById('input-slug');
    const h1Input = document.getElementById('input-h1');
    const altInput = document.getElementById('input-img-alt');
    const btnSubmit = document.getElementById('btn-submit-stage2');

    // Populate initial inputs from state
    if (titleInput) titleInput.value = gameState.onpageData.title;
    if (metaInput) metaInput.value = gameState.onpageData.meta;
    if (slugInput) slugInput.value = gameState.onpageData.slug;
    if (h1Input) h1Input.value = gameState.onpageData.h1;
    if (altInput) altInput.value = gameState.onpageData.alt;

    // Real-time preview & checklist listeners
    const inputs = [titleInput, metaInput, slugInput, h1Input, altInput];
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                updateOnPagePreviewAndChecklist();
            });
        }
    });

    if (btnSubmit) {
        btnSubmit.addEventListener('click', evaluateStage2);
    }

    updateOnPagePreviewAndChecklist();
}

function updateOnPagePreviewAndChecklist() {
    const title = document.getElementById('input-title')?.value || '';
    const meta = document.getElementById('input-meta')?.value || '';
    const slug = document.getElementById('input-slug')?.value || '';
    const h1 = document.getElementById('input-h1')?.value || '';
    const alt = document.getElementById('input-img-alt')?.value || '';

    // Save current values to state
    gameState.onpageData = { title, meta, slug, h1, alt };

    // Update char counts
    const titleCount = document.getElementById('title-count');
    const metaCount = document.getElementById('meta-count');
    if (titleCount) titleCount.innerText = `${title.length}/60 karakter`;
    if (metaCount) metaCount.innerText = `${meta.length}/160 karakter`;

    // Update Live SERP Preview
    const prevTitle = document.getElementById('preview-title');
    const prevDesc = document.getElementById('preview-desc');
    const prevUrl = document.getElementById('preview-url');

    if (prevTitle) prevTitle.innerText = title.trim() || 'Judul Halaman Belum Diisi';
    if (prevDesc) prevDesc.innerText = meta.trim() || 'Deskripsi meta halaman belum diisi...';
    if (prevUrl) prevUrl.innerText = `https://kopilokal.id/${slug.trim().toLowerCase().replace(/\s+/g, '-') || 'halaman'}`;

    // On-Page Checklist validation
    const checklist = document.getElementById('onpage-checklist');
    if (!checklist) return;

    const checks = [
        {
            pass: title.length >= 40 && title.length <= 60 && title.toLowerCase().includes('kopi'),
            label: 'Title Tag memuat kata kunci utama & panjang ideal (40-60 karakter).'
        },
        {
            pass: meta.length >= 100 && meta.length <= 160,
            label: 'Meta Description informatif & panjang ideal (100-160 karakter).'
        },
        {
            pass: slug.length > 3 && !slug.includes(' ') && !slug.includes('_'),
            label: 'URL Slug bersih, ramah SEO, dan menggunakan tanda hubung (-).'
        },
        {
            pass: h1.length > 5 && h1.toLowerCase().includes('kopi'),
            label: 'Tag H1 jelas dan memuat topik kopi.'
        },
        {
            pass: alt.length > 5 && alt.toLowerCase().includes('kopi'),
            label: 'Image Alt Text mendeskripsikan gambar produk kopi.'
        }
    ];

    checklist.innerHTML = '';
    const fragment = document.createDocumentFragment();
    checks.forEach(c => {
        const li = document.createElement('li');
        li.className = c.pass ? 'pass' : 'fail';
        li.innerHTML = `
            <i class="fa-solid ${c.pass ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
            <span>${c.label}</span>
        `;
        fragment.appendChild(li);
    });
    checklist.appendChild(fragment);
}

function evaluateStage2() {
    updateOnPagePreviewAndChecklist();

    const title = gameState.onpageData.title;
    const meta = gameState.onpageData.meta;
    const slug = gameState.onpageData.slug;
    const h1 = gameState.onpageData.h1;
    const alt = gameState.onpageData.alt;

    let score = 0;
    if (title.length >= 40 && title.length <= 60 && title.toLowerCase().includes('kopi')) score += 25;
    if (meta.length >= 100 && meta.length <= 160) score += 25;
    if (slug.length > 3 && !slug.includes(' ') && !slug.includes('_')) score += 15;
    if (h1.length > 5 && h1.toLowerCase().includes('kopi')) score += 15;
    if (alt.length > 5 && alt.toLowerCase().includes('kopi')) score += 20;

    gameState.stageScores.stage2 = score;
    gameState.completedStages.stage2 = true;
    updateUIHeader();

    showModal(
        'Audit On-Page SEO Selesai!',
        `Skor Optimasi On-Page Anda: <strong>${score} / 100 XP</strong>.<br>Halaman Anda kini lebih ramah bagi crawler Google!`,
        'fa-solid fa-file-code',
        true
    );
}

/* ==========================================================================
   STAGE 3: Technical SEO Logic
   ========================================================================== */
function initStage3() {
    renderTechIssues();
    updateTechHealthUI();

    const btnAudit = document.getElementById('btn-submit-stage3');
    if (btnAudit) {
        btnAudit.addEventListener('click', evaluateStage3);
    }
}

const TECH_ISSUES = [
    {
        id: 'ssl',
        title: 'Protokol Keamanan SSL (HTTPS)',
        desc: 'Situs masih menggunakan HTTP biasa. Google memberi penalti pada situs non-secure.',
        fixBtnText: 'Pasang Sertifikat SSL',
        points: 25
    },
    {
        id: 'speed',
        title: 'Kompresi Gambar & Kecepatan Situs',
        desc: 'Kecepatan pemuatan halaman 3.8 detik (lambat). Kompres gambar WebP & aktifkan cache browser.',
        fixBtnText: 'Optimalkan Performa & Gambar',
        points: 25
    },
    {
        id: 'sitemap',
        title: 'Sitemap XML & Robots.txt',
        desc: 'Sitemap XML belum dikirim ke Google Search Console.',
        fixBtnText: 'Buat & Kirim Sitemap XML',
        points: 25
    },
    {
        id: 'brokenLinks',
        title: 'Deteksi Broken Link (Error 404)',
        desc: 'Ditemukan 4 link rusak yang mengganggu pengalaman pengguna.',
        fixBtnText: 'Perbaiki Link Rusak (Redirect 301)',
        points: 25
    }
];

function renderTechIssues() {
    const container = document.getElementById('tech-issues-list');
    if (!container) return;

    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    TECH_ISSUES.forEach(issue => {
        const isFixed = gameState.techIssuesFixed[issue.id];
        const card = document.createElement('div');
        card.className = 'tech-issue-card';

        card.innerHTML = `
            <div class="tech-issue-info">
                <h4><i class="fa-solid ${isFixed ? 'fa-check text-success' : 'fa-triangle-exclamation text-warning'}"></i> ${issue.title}</h4>
                <p>${isFixed ? 'Masalah teknis berhasil diperbaiki!' : issue.desc}</p>
            </div>
            <button class="btn btn-sm ${isFixed ? 'btn-success' : 'btn-primary'}" ${isFixed ? 'disabled' : ''}>
                ${isFixed ? '<i class="fa-solid fa-circle-check"></i> Selesai' : issue.fixBtnText}
            </button>
        `;

        const btn = card.querySelector('button');
        if (!isFixed) {
            btn.addEventListener('click', () => fixTechIssue(issue.id));
        }

        fragment.appendChild(card);
    });

    container.appendChild(fragment);
}

function fixTechIssue(id) {
    sounds.playSuccess();
    gameState.techIssuesFixed[id] = true;
    renderTechIssues();
    updateTechHealthUI();
}

function updateTechHealthUI() {
    let fixedCount = 0;
    Object.values(gameState.techIssuesFixed).forEach(v => { if (v) fixedCount++; });

    const totalCount = TECH_ISSUES.length;
    const healthPercent = Math.round((fixedCount / totalCount) * 100);

    const scoreText = document.getElementById('health-score-text');
    const scoreBar = document.getElementById('health-score-bar');
    const speedStat = document.getElementById('speed-stat');
    const sslStat = document.getElementById('ssl-stat');
    const sitemapStat = document.getElementById('sitemap-stat');

    if (scoreText) scoreText.innerText = `${healthPercent}%`;
    if (scoreBar) scoreBar.style.width = `${healthPercent}%`;

    if (speedStat) {
        speedStat.innerText = gameState.techIssuesFixed.speed ? '1.2 detik (Cepat/Optimal)' : '3.8 detik (Lambat)';
    }
    if (sslStat) {
        sslStat.innerText = gameState.techIssuesFixed.ssl ? 'Aktif (HTTPS Aman)' : 'Belum Terpasang (HTTP)';
    }
    if (sitemapStat) {
        sitemapStat.innerText = gameState.techIssuesFixed.sitemap ? 'Telah Terkirim (sitemap.xml)' : 'Tidak Ditemukan';
    }
}

function evaluateStage3() {
    let fixedCount = 0;
    Object.values(gameState.techIssuesFixed).forEach(v => { if (v) fixedCount++; });

    const score = fixedCount * 25;
    gameState.stageScores.stage3 = score;
    gameState.completedStages.stage3 = true;
    updateUIHeader();

    showModal(
        'Audit Technical SEO Selesai!',
        `Kesehatan situs Anda meningkat ke <strong>${score}%</strong> dengan skor <strong>${score} XP</strong>!`,
        'fa-solid fa-gears',
        true
    );
}

/* ==========================================================================
   STAGE 4: Off-Page SEO & Backlink Logic
   ========================================================================== */
function initStage4() {
    renderBacklinkCards();
    updateOffPageStatsUI();

    const btnSubmit = document.getElementById('btn-submit-stage4');
    if (btnSubmit) {
        btnSubmit.addEventListener('click', evaluateStage4);
    }
}

function renderBacklinkCards() {
    const container = document.getElementById('backlink-cards-container');
    if (!container) return;

    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    BACKLINK_REQUESTS.forEach(req => {
        const isEvaluated = gameState.backlinkDecisions.evaluatedIds.includes(req.id);
        const card = document.createElement('div');
        card.className = 'backlink-card';

        card.innerHTML = `
            <div class="backlink-header">
                <span class="backlink-domain">${req.domain}</span>
                <span class="backlink-da">Domain Authority: ${req.da}</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">${req.description}</p>
            <div class="backlink-actions">
                ${isEvaluated ? `<span class="text-muted" style="font-size:0.85rem;"><i class="fa-solid fa-check"></i> Keputusan Telah Diambil</span>` : `
                    <button class="btn btn-sm btn-success btn-accept"><i class="fa-solid fa-check"></i> Terima Link</button>
                    <button class="btn btn-sm btn-outline-danger btn-reject"><i class="fa-solid fa-xmark"></i> Tolak / Spam</button>
                `}
            </div>
        `;

        if (!isEvaluated) {
            card.querySelector('.btn-accept').addEventListener('click', () => handleBacklinkDecision(req.id, 'accept'));
            card.querySelector('.btn-reject').addEventListener('click', () => handleBacklinkDecision(req.id, 'reject'));
        }

        fragment.appendChild(card);
    });

    container.appendChild(fragment);
}

function handleBacklinkDecision(id, action) {
    const req = BACKLINK_REQUESTS_BY_ID[id];
    if (!req) return;

    gameState.backlinkDecisions.evaluatedIds.push(id);

    if (action === 'accept') {
        if (req.isGood) {
            sounds.playSuccess();
            gameState.backlinkDecisions.goodAccepted++;
            showModal('Keputusan Tepat!', `Backlink dari ${req.domain} menambah otoritas situs Anda! (+25 XP)`, 'fa-solid fa-circle-check', true);
        } else {
            sounds.playError();
            gameState.backlinkDecisions.spamAccepted++;
            showModal('Peringatan SEO Spam!', `Menerima backlink dari ${req.domain} berisiko terkena penalti Google! (-10 XP)`, 'fa-solid fa-triangle-exclamation', false);
        }
    } else {
        if (!req.isGood) {
            sounds.playSuccess();
            showModal('Keputusan Bijak!', `Anda berhasil menolak link spam berbahaya dari ${req.domain}. (+25 XP)`, 'fa-solid fa-shield-halved', true);
        } else {
            sounds.playClick();
            showModal('Peluang Terlewat', `Sayang sekali! ${req.domain} adalah situs bereputasi baik yang sebenarnya bermanfaat.`, 'fa-solid fa-circle-info', false);
        }
    }

    renderBacklinkCards();
    updateOffPageStatsUI();
}

function updateOffPageStatsUI() {
    const goodCountSpan = document.getElementById('good-backlinks-count');
    const spamCountSpan = document.getElementById('spam-backlinks-count');
    const daScoreSpan = document.getElementById('da-score-val');
    const btnSubmit = document.getElementById('btn-submit-stage4');

    const goodCount = gameState.backlinkDecisions.goodAccepted;
    const spamCount = gameState.backlinkDecisions.spamAccepted;

    if (goodCountSpan) goodCountSpan.innerText = goodCount;
    if (spamCountSpan) spamCountSpan.innerText = spamCount;

    // Calculate dynamic DA
    const baseDA = 15;
    const currentDA = Math.max(1, baseDA + (goodCount * 12) - (spamCount * 8));
    if (daScoreSpan) daScoreSpan.innerText = `DA ${currentDA}`;

    const totalEvaluated = gameState.backlinkDecisions.evaluatedIds.length;
    if (btnSubmit) {
        btnSubmit.disabled = totalEvaluated < BACKLINK_REQUESTS.length;
    }
}

function evaluateStage4() {
    let score = 0;
    BACKLINK_REQUESTS.forEach(req => {
        const isEvaluated = gameState.backlinkDecisions.evaluatedIds.includes(req.id);
        if (isEvaluated) {
            if (req.isGood && gameState.backlinkDecisions.goodAccepted > 0) {
                score += 25;
            } else if (!req.isGood && !gameState.backlinkDecisions.evaluatedIds.includes(req.id)) {
                score += 25;
            }
        }
    });

    // Simple robust scoring calculation
    score = (gameState.backlinkDecisions.goodAccepted * 30) + ((BACKLINK_REQUESTS.length - gameState.backlinkDecisions.spamAccepted) * 10);
    score = Math.min(100, Math.max(10, score));

    gameState.stageScores.stage4 = score;
    gameState.completedStages.stage4 = true;
    updateUIHeader();

    showModal(
        'Tahap Off-Page SEO Selesai!',
        `Skor Otoritas Backlink Anda: <strong>${score} XP</strong>! profil backlink situs Anda semakin solid.`,
        'fa-solid fa-link',
        true
    );
}

/* ==========================================================================
   STAGE 5: SERP Rank Simulation Logic
   ========================================================================== */
function initStage5() {
    const btnSim = document.getElementById('btn-run-simulation');
    if (btnSim) {
        btnSim.addEventListener('click', runSERPSimulation);
    }
    updateSERPBreakdown();
}

function updateSERPBreakdown() {
    const scoreKw = document.getElementById('score-kw');
    const scoreOnpage = document.getElementById('score-onpage');
    const scoreTech = document.getElementById('score-tech');
    const scoreOffpage = document.getElementById('score-offpage');

    if (scoreKw) scoreKw.innerText = `${gameState.stageScores.stage1} XP`;
    if (scoreOnpage) scoreOnpage.innerText = `${gameState.stageScores.stage2} XP`;
    if (scoreTech) scoreTech.innerText = `${gameState.stageScores.stage3} XP`;
    if (scoreOffpage) scoreOffpage.innerText = `${gameState.stageScores.stage4} XP`;
}

function runSERPSimulation() {
    sounds.playSuccess();
    updateSERPBreakdown();

    const container = document.getElementById('serp-rankings-list');
    if (!container) return;

    container.innerHTML = '<div class="sim-placeholder"><i class="fa-solid fa-spinner fa-spin fa-3x text-info"></i><p>Menjalankan algoritma Google Spider & merayapi indeks web...</p></div>';

    setTimeout(() => {
        const total = gameState.totalScore;
        let userRankPosition = 10;

        if (total >= 320) userRankPosition = 1; // Peringkat 1 Google
        else if (total >= 250) userRankPosition = 2;
        else if (total >= 180) userRankPosition = 3;
        else if (total >= 120) userRankPosition = 5;
        else if (total >= 60) userRankPosition = 7;
        else userRankPosition = 10;

        gameState.completedStages.stage5 = true;
        updateUIHeader();

        // Competitors mock list
        const mockCompetitors = [
            { title: 'Kopi Kenangan Nusantara - Biji Kopi Pilihan', url: 'https://kopikenangan.example.com', desc: 'Toko kopi online terbesar di Indonesia dengan ragam jenis kopi.' },
            { title: 'Pusat Biji Kopi Arabika Robusta Terlengkap', url: 'https://pusatkopi.example.com', desc: 'Jual grosir dan eceran biji kopi nusantara harga terjangkau.' },
            { title: 'Komunitas Kopi Indonesia - Review & Resep', url: 'https://komunitaskopi.example.com', desc: 'Panduan menyeduh kopi manual brew untuk penikmat rumahan.' },
            { title: 'Kopi Asli Sumatra & Java Preanger Premium', url: 'https://kopiasli.example.com', desc: 'Distributor resmi kopi organik dari perkebunan tinggi.' }
        ];

        const userSiteTitle = gameState.onpageData.title || "Kopi Lokal Nusantara";
        const userSiteDesc = gameState.onpageData.meta || "Toko Biji Kopi Lokal Indonesia Premium.";
        const userSiteSlug = gameState.onpageData.slug || "biji-kopi-lokal";

        const userSiteObject = {
            title: `${userSiteTitle} - KopiLokal.id`,
            url: `https://kopilokal.id/${userSiteSlug}`,
            desc: userSiteDesc,
            isUser: true
        };

        const finalResults = [];
        let compIdx = 0;

        for (let pos = 1; pos <= 5; pos++) {
            if (pos === userRankPosition) {
                finalResults.push(userSiteObject);
            } else {
                if (mockCompetitors[compIdx]) {
                    finalResults.push(mockCompetitors[compIdx]);
                    compIdx++;
                }
            }
        }

        if (!finalResults.includes(userSiteObject)) {
            finalResults.push(userSiteObject);
        }

        container.innerHTML = '';
        const fragment = document.createDocumentFragment();
        finalResults.forEach((res, index) => {
            const rankNum = res.isUser ? userRankPosition : (index >= userRankPosition ? index + 1 : index + 1);
            const div = document.createElement('div');
            div.className = `serp-result-item ${res.isUser ? 'user-site' : ''}`;

            div.innerHTML = `
                <div class="serp-result-rank">${res.isUser ? `🏆 Posisi #${userRankPosition} (Situs Anda)` : `Peringkat #${rankNum}`}</div>
                <div class="serp-result-url">${res.url}</div>
                <div class="serp-result-title">${res.title}</div>
                <div class="serp-result-desc">${res.desc}</div>
            `;

            fragment.appendChild(div);
        });
        container.appendChild(fragment);

        showModal(
            'Simulasi SERP Selesai!',
            `Selamat! Situs Anda berhasil meraih <strong>Peringkat #${userRankPosition}</strong> di Google untuk kata kunci utama!<br>Estimasi Trafik Bulanan: <strong>${gameState.traffic.toLocaleString('id-ID')} pengunjung</strong>.`,
            'fa-solid fa-trophy',
            true
        );

    }, 1200);
}

// App Initialization Entrypoint
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('DOMContentLoaded', () => {
        loadGameState();
        initNavigation();
        initStage1();
        initStage2();
        initStage3();
        initStage4();
        initStage5();
        updateUIHeader();
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        gameState,
        KEYWORDS_DATA,
        BACKLINK_REQUESTS,
        SEO_TIPS,
        SoundEffects,
        sounds,
        saveGameState,
        loadGameState,
        resetGameState,
        initNavigation,
        switchStage,
        updateUIHeader,
        showModal,
        closeModal,
        initStage1,
        renderKeywordTable,
        toggleSelectKeyword,
        updateSelectedKeywordsUI,
        evaluateStage1,
        initStage2,
        updateOnPagePreviewAndChecklist,
        evaluateStage2,
        initStage3,
        renderTechIssues,
        fixTechIssue,
        updateTechHealthUI,
        evaluateStage3,
        initStage4,
        renderBacklinkCards,
        handleBacklinkDecision,
        updateOffPageStatsUI,
        evaluateStage4,
        initStage5,
        updateSERPBreakdown,
        runSERPSimulation
    };
}
