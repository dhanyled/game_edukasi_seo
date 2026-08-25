const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

let domElements = {};

function setupMockDOM() {
    domElements = {};

    global.document = {
        addEventListener: () => {},
        getElementById: (id) => {
            if (!domElements[id]) {
                domElements[id] = {
                    innerText: '',
                    innerHTML: '',
                    value: '',
                    className: '',
                    style: {},
                    classList: {
                        add: () => {},
                        remove: () => {}
                    },
                    appendChild: (child) => {
                        if (!domElements[id].children) domElements[id].children = [];
                        domElements[id].children.push(child);
                    }
                };
            }
            return domElements[id];
        },
        querySelectorAll: () => [],
        createDocumentFragment: () => ({
            appendChild: () => {}
        }),
        createElement: () => ({
            className: '',
            innerHTML: '',
            addEventListener: () => {}
        })
    };

    global.window = {};

    global.localStorage = {
        _data: {},
        setItem: (key, val) => { global.localStorage._data[key] = String(val); },
        getItem: (key) => global.localStorage._data[key] || null,
        removeItem: (key) => { delete global.localStorage._data[key]; }
    };

    return domElements;
}

setupMockDOM();

const app = require('../js/app.js');

beforeEach(() => {
    setupMockDOM();
    app.gameState.currentStage = 2;
    app.gameState.totalScore = 0;
    app.gameState.traffic = 0;
    app.gameState.rank = "Pemula (Level 1)";
    app.gameState.stageScores.stage1 = 0;
    app.gameState.stageScores.stage2 = 0;
    app.gameState.stageScores.stage3 = 0;
    app.gameState.stageScores.stage4 = 0;
    app.gameState.completedStages.stage1 = false;
    app.gameState.completedStages.stage2 = false;
    app.gameState.completedStages.stage3 = false;
    app.gameState.completedStages.stage4 = false;
    app.gameState.completedStages.stage5 = false;
    app.gameState.onpageData = {
        title: "Kopi Lokal Indonesia - Biji Kopi Arabika Nikmat",
        meta: "Beli biji kopi arabika dan robika kualitas premium dari petani lokal Indonesia. Bebas ongkir dan dikirim segar ke rumah Anda!",
        slug: "biji-kopi-lokal-premium",
        h1: "Kopi Lokal Nusantara Premium",
        alt: "Biji Kopi Arabika Indonesia Segar Dalam Kemasan"
    };
});

test('evaluateStage2 - calculates max score (100) when all onpage criteria pass', () => {
    document.getElementById('input-title').value = "Kopi Lokal Indonesia - Biji Kopi Arabika Nikmat"; // length 48, has 'kopi'
    document.getElementById('input-meta').value = "Beli biji kopi arabika dan robika kualitas premium dari petani lokal Indonesia. Bebas ongkir dan dikirim segar ke rumah Anda!"; // length 136
    document.getElementById('input-slug').value = "biji-kopi-lokal-premium"; // >3 chars, no space/underscore
    document.getElementById('input-h1').value = "Kopi Lokal Nusantara Premium"; // >5 chars, has 'kopi'
    document.getElementById('input-img-alt').value = "Biji Kopi Arabika Indonesia Segar Dalam Kemasan"; // >5 chars, has 'kopi'

    app.evaluateStage2();

    assert.equal(app.gameState.stageScores.stage2, 100);
    assert.equal(app.gameState.completedStages.stage2, true);
    assert.equal(app.gameState.totalScore, 100);
});

test('evaluateStage2 - calculates partial score when criteria fail', () => {
    document.getElementById('input-title').value = "Terlalu Pendek"; // Fail (len < 40) -> +0
    document.getElementById('input-meta').value = "Beli biji kopi arabika dan robika kualitas premium dari petani lokal Indonesia. Bebas ongkir dan dikirim segar ke rumah Anda!"; // Pass -> +25
    document.getElementById('input-slug').value = "biji_kopi_salah"; // Fail (has underscore) -> +0
    document.getElementById('input-h1').value = "Kopi Enak"; // Pass -> +15
    document.getElementById('input-img-alt').value = "Kopi"; // Fail (len <= 5) -> +0

    app.evaluateStage2();

    assert.equal(app.gameState.stageScores.stage2, 40);
    assert.equal(app.gameState.completedStages.stage2, true);
});

test('updateOnPagePreviewAndChecklist - updates DOM preview and state correctly', () => {
    document.getElementById('input-title').value = "Kopi Arabika Super Mantap Rasa Nikmat Sekali";
    document.getElementById('input-meta').value = "Deskripsi meta singkat kopi.";
    document.getElementById('input-slug').value = "kopi-arabika";
    document.getElementById('input-h1').value = "Judul Kopi";
    document.getElementById('input-img-alt').value = "Gambar Kopi";

    app.updateOnPagePreviewAndChecklist();

    assert.equal(app.gameState.onpageData.title, "Kopi Arabika Super Mantap Rasa Nikmat Sekali");
    assert.equal(app.gameState.onpageData.slug, "kopi-arabika");
    assert.equal(document.getElementById('preview-title').innerText, "Kopi Arabika Super Mantap Rasa Nikmat Sekali");
    assert.equal(document.getElementById('preview-url').innerText, "https://kopilokal.id/kopi-arabika");
});
