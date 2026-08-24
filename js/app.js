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

const SEO_TIPS = [
    "Pilih kata kunci dengan volume pencarian baik dan tingkat persaingan (KD) yang masuk akal!",
    "Judul halaman (Title Tag) idealnya antara 50-60 karakter dan mengandung kata kunci utama.",
    "Gunakan HTTPS (SSL) agar situs aman dan mendapat poin plus dari algoritma Google.",
    "Hindari membeli backlink dari ternak link (PBN/Spam) karena dapat menyebabkan penalti Google!",
    "Sitemap XML membantu bot Google menemukan seluruh halaman penting di web Anda dengan cepat."
];

// Performance Helper: Debounce
function debounce(func, wait = 150) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

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
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
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

// Voice Humanizer & Text-to-Speech Engine
function humanizeTextForVoice(text) {
    if (!text || typeof text !== 'string') return '';

    // Strip HTML tags for clean voice reading
    let cleanText = text.replace(/<[^>]*>/g, ' ');

    // English-to-Indonesian Phonetic Humanizer Map
    const voicePhoneticMap = [
        { pattern: /\bSEO\b/gi, replacement: 'Es E O' },
        { pattern: /\bGoogle\b/gi, replacement: 'Gugel' },
        { pattern: /\bKeyword Research\b/gi, replacement: 'Riset Kata Kunci' },
        { pattern: /\bOn-Page\b/gi, replacement: 'On Pej' },
        { pattern: /\bOff-Page\b/gi, replacement: 'Of Pej' },
        { pattern: /\bBacklink\b/gi, replacement: 'Bekling' },
        { pattern: /\bDomain Authority\b/gi, replacement: 'Otoritas Domain' },
        { pattern: /\bXP\b/gi, replacement: 'Eks Pi' },
        { pattern: /\bSSL\b/gi, replacement: 'Es Es El' },
        { pattern: /\bSERP\b/gi, replacement: 'Serp' },
        { pattern: /\bSlug\b/gi, replacement: 'Slag' },
        { pattern: /\bPrivate Blog Network\b/gi, replacement: 'Jaringan Blog Pribadi' },
        { pattern: /\bPBN\b/gi, replacement: 'Pe Be En' },
        { pattern: /\bHTTPS\b/gi, replacement: 'Ha Te Te Pe Es' },
        { pattern: /\bHTTP\b/gi, replacement: 'Ha Te Te Pe' },
        { pattern: /\bXML\b/gi, replacement: 'Eks Em El' },
        { pattern: /\bHTML\b/gi, replacement: 'Ha Te Em El' },
        { pattern: /\bAlt Text\b/gi, replacement: 'Teks Alternatif Gambar' },
        { pattern: /\bTitle Tag\b/gi, replacement: 'Tag Judul' },
        { pattern: /\bMeta Description\b/gi, replacement: 'Deskripsi Meta' },
        { pattern: /\bHeading\b/gi, replacement: 'Heding' },
        { pattern: /\bCrawler\b/gi, replacement: 'Kroler' },
        { pattern: /\bRedirect\b/gi, replacement: 'Pengalihan' },
        { pattern: /\bBroken Link\b/gi, replacement: 'Tautan Rusak' },
        { pattern: /\bdofollow\b/gi, replacement: 'do folo' },
        { pattern: /\b /g, replacement: ' ' }
    ];

    voicePhoneticMap.forEach(item => {
        cleanText = cleanText.replace(item.pattern, item.replacement);
    });

    return cleanText.trim();
}

function speakText(text) {
    if (!('speechSynthesis' in window)) {
        alert('Fitur Text-to-Speech tidak didukung di browser ini.');
        return;
    }

    window.speechSynthesis.cancel(); // Stop any active speech

    const humanized = humanizeTextForVoice(text);
    const utterance = new SpeechSynthesisUtterance(humanized);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95; // Slightly relaxed pace for human-like reading
    utterance.pitch = 1.0;

    // Pick Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID'));
    if (idVoice) {
        utterance.voice = idVoice;
    }

    window.speechSynthesis.speak(utterance);
}

// Security Helper
function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, function(match) {
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return escapeMap[match];
    });
}

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
            if (parsed && typeof parsed === 'object') {
                Object.assign(gameState, parsed);
            }
        }
    } catch (e) {
        console.warn('Failed to parse saved game state, resetting corrupted state.', e);
        try {
            localStorage.removeItem('seo_game_state_v1');
        } catch (err) {
            console.error('Failed to clear corrupted storage state', err);
        }
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

    // Voice Narration Listener for Tips
    document.getElementById('btn-speak-tip')?.addEventListener('click', () => {
        const tipText = document.getElementById('dynamic-tip')?.innerText || '';
        if (tipText) speakText(tipText);
    });

    // Voice Narration Listener for Modals
    document.getElementById('btn-modal-speak')?.addEventListener('click', () => {
        const title = document.getElementById('modal-title')?.innerText || '';
        const body = document.getElementById('modal-body')?.innerText || '';
        speakText(`${title}. ${body}`);
    });

    // Modal Keyboard Escape Key Listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('modal-overlay');
            if (modal && !modal.classList.contains('hidden')) {
                closeModal();
            }
        }
    });
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

function updateUIHeader() {
    // Calculate total score
    gameState.totalScore = gameState.stageScores.stage1 +
                           gameState.stageScores.stage2 +
                           gameState.stageScores.stage3 +
                           gameState.stageScores.stage4;

    // Traffic estimation logic
    gameState.traffic = Math.round(gameState.totalScore * 85);

    // Rank title
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

    // Update DOM
    const userRank = document.getElementById('user-rank');
    const userScore = document.getElementById('user-score');
    const userTraffic = document.getElementById('user-traffic');

    if (userRank) userRank.innerText = gameState.rank;
    if (userScore) userScore.innerText = `${gameState.totalScore} XP`;
    if (userTraffic) userTraffic.innerText = `${gameState.traffic.toLocaleString('id-ID')} /bln`;

    // Calculate completed count
    let completedCount = 0;
    for (let i = 1; i <= 5; i++) {
        const isDone = gameState.completedStages[`stage${i}`];
        const statusIcon = document.getElementById(`status-stage-${i}`);
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

    saveGameState();
}

// Modal Dialog Utility
function showModal(title, text, iconClass = 'fa-solid fa-award', isSuccess = true, customButtons = null) {
    if (isSuccess) {
        sounds.playSuccess();
    } else {
        sounds.playError();
    }

    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalIcon = document.getElementById('modal-icon');
    const modalFooter = document.querySelector('.modal-footer');

    if (modalTitle) modalTitle.innerText = title;
    if (modalBody) modalBody.innerHTML = text;
    if (modalIcon) modalIcon.className = `${iconClass} modal-icon`;

    if (modalFooter) {
        if (customButtons && Array.isArray(customButtons)) {
            modalFooter.innerHTML = '';
            const speakBtn = document.createElement('button');
            speakBtn.className = 'btn btn-outline-info';
            speakBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Baca Suara';
            speakBtn.addEventListener('click', () => {
                const titleVal = document.getElementById('modal-title')?.innerText || '';
                const bodyVal = document.getElementById('modal-body')?.innerText || '';
                speakText(`${titleVal}. ${bodyVal}`);
            });
            modalFooter.appendChild(speakBtn);

            customButtons.forEach(btnConfig => {
                const btn = document.createElement('button');
                btn.className = btnConfig.className || 'btn btn-primary';
                btn.innerHTML = btnConfig.text;
                btn.addEventListener('click', () => {
                    closeModal();
                    if (btnConfig.onClick) btnConfig.onClick();
                });
                modalFooter.appendChild(btn);
            });
        } else {
            modalFooter.innerHTML = `
                <button id="btn-modal-speak" class="btn btn-outline-info" title="Dengarkan Narator">
                    <i class="fa-solid fa-volume-high"></i> Baca Suara
                </button>
                <button id="btn-modal-close" class="btn btn-primary">Lanjutkan</button>
            `;
            document.getElementById('btn-modal-close')?.addEventListener('click', closeModal);
            document.getElementById('btn-modal-speak')?.addEventListener('click', () => {
                const titleVal = document.getElementById('modal-title')?.innerText || '';
                const bodyVal = document.getElementById('modal-body')?.innerText || '';
                speakText(`${titleVal}. ${bodyVal}`);
            });
        }
    }

    if (modal) modal.classList.remove('hidden');
}

function closeModal() {
    sounds.playClick();
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.classList.add('hidden');
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
    const selectedSet = new Set(gameState.selectedKeywords);

    KEYWORDS_DATA.forEach(kw => {
        const isSelected = selectedSet.has(kw.id);
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td><strong>${escapeHTML(kw.text)}</strong></td>
            <td>${kw.volume.toLocaleString('id-ID')}</td>
            <td><span class="badge">${escapeHTML(kw.kd)}</span></td>
            <td>${escapeHTML(kw.intent)}</td>
            <td>
                <button class="btn btn-sm ${isSelected ? 'btn-outline-danger' : 'btn-primary'}" data-kw-id="${kw.id}">
                    ${isSelected ? 'Batal' : 'Pilih'}
                </button>
            </td>
        `;

        const btn = tr.querySelector('button');
        btn.addEventListener('click', () => toggleSelectKeyword(kw.id));

        tbody.appendChild(tr);
    });
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

    gameState.selectedKeywords.forEach(id => {
        const kwObj = KEYWORDS_DATA.find(k => k.id === id);
        if (kwObj) {
            totalVol += kwObj.volume;
            const li = document.createElement('li');
            li.className = 'kw-tag';
            li.innerHTML = `
                ${escapeHTML(kwObj.text)}
                <span class="remove-btn" title="Hapus">&times;</span>
            `;
            li.querySelector('.remove-btn').addEventListener('click', () => toggleSelectKeyword(id));
            list.appendChild(li);
        }
    });

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
        const kw = KEYWORDS_DATA.find(k => k.id === id);
        if (kw) {
            totalPoints += kw.points;
            const icon = kw.isRecommended ? '✅' : '⚠️';
            feedbackHTML += `<li style="margin-bottom: 6px;">${icon} <strong>${escapeHTML(kw.text)}</strong>: ${escapeHTML(kw.note)} (+${kw.points} XP)</li>`;
        }
    });

    feedbackHTML += '</ul>';

    gameState.stageScores.stage1 = totalPoints;
    gameState.completedStages.stage1 = true;
    updateUIHeader();

    const isGoodResult = totalPoints >= 65;
    showModal(
        isGoodResult ? 'Evaluasi Riset Kata Kunci Selesai!' : 'Evaluasi Riset Kata Kunci: Perlu Ditingkatkan',
        `Anda mengumpulkan <strong>${totalPoints} XP</strong> (maksimal 100 XP) dari Tahap 1.<br>${feedbackHTML}${!isGoodResult ? '<br><em>💡 Tips SEO: Prioritaskan kata kunci berniat transaksional/komersial dengan kesulitan (KD) yang masuk akal!</em>' : ''}`,
        isGoodResult ? 'fa-solid fa-square-poll-vertical' : 'fa-solid fa-triangle-exclamation',
        isGoodResult
    );
}

/* ==========================================================================
   STAGE 2: On-Page SEO Editor Logic
   ========================================================================== */
function initStage2() {
    const form = document.getElementById('onpage-form');
    const titleInput = document.getElementById('input-title');
    const metaInput = document.getElementById('input-meta');
    const slugInput = document.getElementById('input-slug');
    const h1Input = document.getElementById('input-h1');
    const altInput = document.getElementById('input-img-alt');
    const btnSubmit = document.getElementById('btn-submit-stage2');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            evaluateStage2();
        });
    }

    // Populate initial inputs from state
    if (titleInput) titleInput.value = gameState.onpageData.title;
    if (metaInput) metaInput.value = gameState.onpageData.meta;
    if (slugInput) slugInput.value = gameState.onpageData.slug;
    if (h1Input) h1Input.value = gameState.onpageData.h1;
    if (altInput) altInput.value = gameState.onpageData.alt;

    // Real-time preview & checklist listeners with debouncing
    const debouncedUpdate = debounce(updateOnPagePreviewAndChecklist, 150);
    const inputs = [titleInput, metaInput, slugInput, h1Input, altInput];
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', debouncedUpdate);
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
    checks.forEach(c => {
        const li = document.createElement('li');
        li.className = c.pass ? 'pass' : 'fail';
        li.innerHTML = `
            <i class="fa-solid ${c.pass ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
            <span>${c.label}</span>
        `;
        checklist.appendChild(li);
    });
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

    const isGoodResult = score >= 70;
    showModal(
        isGoodResult ? 'Audit On-Page SEO Selesai!' : 'Audit On-Page SEO: Belum Optimal',
        `Skor Optimasi On-Page Anda: <strong>${score} / 100 XP</strong>.<br>${isGoodResult ? 'Halaman Anda kini lebih ramah bagi crawler Google!' : 'Beberapa elemen penting seperti Title Tag, Meta Description, atau Alt Gambar belum memenuhi panduan ideal.'}`,
        isGoodResult ? 'fa-solid fa-file-code' : 'fa-solid fa-triangle-exclamation',
        isGoodResult
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

    TECH_ISSUES.forEach(issue => {
        const isFixed = gameState.techIssuesFixed[issue.id];
        const card = document.createElement('div');
        card.className = 'tech-issue-card';

        card.innerHTML = `
            <div class="tech-issue-info">
                <h4><i class="fa-solid ${isFixed ? 'fa-check text-success' : 'fa-triangle-exclamation text-warning'}"></i> ${escapeHTML(issue.title)}</h4>
                <p>${isFixed ? 'Masalah teknis berhasil diperbaiki!' : escapeHTML(issue.desc)}</p>
            </div>
            <button class="btn btn-sm ${isFixed ? 'btn-success' : 'btn-primary'}" ${isFixed ? 'disabled' : ''}>
                ${isFixed ? '<i class="fa-solid fa-circle-check"></i> Selesai' : escapeHTML(issue.fixBtnText)}
            </button>
        `;

        const btn = card.querySelector('button');
        if (!isFixed) {
            btn.addEventListener('click', () => fixTechIssue(issue.id));
        }

        container.appendChild(card);
    });
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

    const isGoodResult = score >= 75;
    showModal(
        isGoodResult ? 'Audit Technical SEO Selesai!' : 'Audit Technical SEO: Perlu Ditingkatkan',
        `Kesehatan situs Anda: <strong>${score}%</strong> (Skor: <strong>${score} XP</strong>).<br>${isGoodResult ? 'Situs Anda kini cepat, aman (HTTPS), dan mudah diindeks Google!' : 'Masih ada masalah teknis yang belum diperbaiki. Masalah teknis ini memperlambat perayapan bot Google.'}`,
        isGoodResult ? 'fa-solid fa-gears' : 'fa-solid fa-triangle-exclamation',
        isGoodResult
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
    const evaluatedSet = new Set(gameState.backlinkDecisions.evaluatedIds);

    BACKLINK_REQUESTS.forEach(req => {
        const isEvaluated = evaluatedSet.has(req.id);
        const card = document.createElement('div');
        card.className = 'backlink-card';

        card.innerHTML = `
            <div class="backlink-header">
                <span class="backlink-domain">${escapeHTML(req.domain)}</span>
                <span class="backlink-da">Domain Authority: ${req.da}</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">${escapeHTML(req.description)}</p>
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

        container.appendChild(card);
    });
}

function handleBacklinkDecision(id, action) {
    const req = BACKLINK_REQUESTS.find(r => r.id === id);
    if (!req) return;

    gameState.backlinkDecisions.evaluatedIds.push(id);

    if (action === 'accept') {
        if (req.isGood) {
            sounds.playSuccess();
            gameState.backlinkDecisions.goodAccepted++;
            showModal('Keputusan Tepat!', `Backlink dari ${escapeHTML(req.domain)} menambah otoritas situs Anda! (+25 XP)`, 'fa-solid fa-circle-check', true);
        } else {
            sounds.playError();
            gameState.backlinkDecisions.spamAccepted++;
            showModal('Peringatan SEO Spam!', `Menerima backlink dari ${escapeHTML(req.domain)} berisiko terkena penalti Google! (-10 XP)`, 'fa-solid fa-triangle-exclamation', false);
        }
    } else {
        if (!req.isGood) {
            sounds.playSuccess();
            showModal('Keputusan Bijak!', `Anda berhasil menolak link spam berbahaya dari ${escapeHTML(req.domain)}. (+25 XP)`, 'fa-solid fa-shield-halved', true);
        } else {
            sounds.playClick();
            showModal('Peluang Terlewat', `Sayang sekali! ${escapeHTML(req.domain)} adalah situs bereputasi baik yang sebenarnya bermanfaat.`, 'fa-solid fa-circle-info', false);
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
    // Scoring logic:
    // goodAccepted (max 2): +25 XP each
    // spamRejected (total spam - spamAccepted): +25 XP each
    // spamAccepted: -10 XP penalty each
    const spamCountTotal = BACKLINK_REQUESTS.filter(r => !r.isGood).length;
    const spamRejected = spamCountTotal - gameState.backlinkDecisions.spamAccepted;

    const calculatedScore = (gameState.backlinkDecisions.goodAccepted * 25) + (spamRejected * 25) - (gameState.backlinkDecisions.spamAccepted * 10);
    const score = Math.max(0, calculatedScore);

    gameState.stageScores.stage4 = score;
    gameState.completedStages.stage4 = true;
    updateUIHeader();

    const isGoodResult = score >= 75;
    showModal(
        isGoodResult ? 'Tahap Off-Page SEO Selesai!' : 'Tahap Off-Page SEO: Profil Link Berisiko',
        `Skor Otoritas Backlink Anda: <strong>${score} XP</strong>.<br>${isGoodResult ? 'Profil backlink situs Anda semakin solid dan bereputasi tinggi!' : 'Menerima link spam atau menolak link berkualitas dapat merugikan otoritas domain situs Anda.'}`,
        isGoodResult ? 'fa-solid fa-link' : 'fa-solid fa-triangle-exclamation',
        isGoodResult
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
    document.getElementById('btn-back-to-hub')?.addEventListener('click', () => switchStage(1));
    document.getElementById('btn-replay-game')?.addEventListener('click', resetGameState);
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
        finalResults.forEach((res, index) => {
            const rankNum = res.isUser ? userRankPosition : (index >= userRankPosition ? index + 1 : index + 1);
            const div = document.createElement('div');
            div.className = `serp-result-item ${res.isUser ? 'user-site' : ''}`;

            div.innerHTML = `
                <div class="serp-result-rank">${res.isUser ? `🏆 Posisi #${userRankPosition} (Situs Anda)` : `Peringkat #${rankNum}`}</div>
                <div class="serp-result-url">${escapeHTML(res.url)}</div>
                <div class="serp-result-title">${escapeHTML(res.title)}</div>
                <div class="serp-result-desc">${escapeHTML(res.desc)}</div>
            `;

            container.appendChild(div);
        });

        const actionsCard = document.getElementById('stage5-actions');
        if (actionsCard) actionsCard.classList.remove('hidden');

        const isExcellent = userRankPosition <= 3;
        const isModerate = userRankPosition <= 5;

        let modalTitle = '';
        let modalIcon = '';
        let statusMessage = '';

        if (isExcellent) {
            modalTitle = `🏆 Performa SEO Luar Biasa! (Peringkat #${userRankPosition})`;
            modalIcon = 'fa-solid fa-trophy';
            statusMessage = `Selamat! Strategi SEO Anda sangat sukses meraih <strong>Peringkat #${userRankPosition}</strong> di Google!<br>Estimasi Trafik Bulanan: <strong>${gameState.traffic.toLocaleString('id-ID')} pengunjung</strong>.<br>Situs Anda berhasil mengungguli kompetitor utama!`;
        } else if (isModerate) {
            modalTitle = `📊 Evaluasi SERP: Peringkat #${userRankPosition}`;
            modalIcon = 'fa-solid fa-chart-line';
            statusMessage = `Hasil yang cukup baik! Situs Anda meraih <strong>Peringkat #${userRankPosition}</strong> di Google.<br>Estimasi Trafik Bulanan: <strong>${gameState.traffic.toLocaleString('id-ID')} pengunjung</strong>.<br>Tingkatkan lagi skor On-Page atau Technical SEO Anda untuk menembus 3 besar!`;
        } else {
            modalTitle = `⚠️ Evaluasi SERP: Peringkat #${userRankPosition} (Perlu Ditingkatkan)`;
            modalIcon = 'fa-solid fa-triangle-exclamation';
            statusMessage = `Peringkat situs Anda masih di <strong>Peringkat #${userRankPosition}</strong> dengan trafik <strong>${gameState.traffic.toLocaleString('id-ID')} /bulan</strong>.<br>Beberapa optimasi kurang maksimal (kata kunci kurang tepat, masalah teknis belum diperbaiki, atau menerima link spam).<br>Silakan pelajari lagi dan perbaiki pilihan optimasi Anda!`;
        }

        showModal(
<<<<<<< HEAD
            'Simulasi SERP Selesai!',
            `Selamat! Situs Anda berhasil meraih **Peringkat #${userRankPosition}** di Google untuk kata kunci utama!<br>Estimasi Trafik Bulanan: <strong>${gameState.traffic.toLocaleString('id-ID')} pengunjung</strong>.`,
            'fa-solid fa-trophy',
            true
=======
            modalTitle,
            `${statusMessage}<br><br>Pilih aksi selanjutnya:`,
            modalIcon,
            isExcellent,
            [
                {
                    text: '<i class="fa-solid fa-house"></i> Kembali ke Hub (Tahap 1)',
                    className: 'btn btn-primary',
                    onClick: () => switchStage(1)
                },
                {
                    text: '<i class="fa-solid fa-rotate-right"></i> Main Lagi (Reset)',
                    className: 'btn btn-outline-danger',
                    onClick: () => resetGameState()
                }
            ]
>>>>>>> a91ead3 (Optimize SEO Game performance, security, UI responsiveness, and Indonesian voice narration)
        );

    }, 1200);
}

// App Initialization Entrypoint
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
