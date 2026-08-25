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
            addEventListener: () => {},
            querySelector: () => ({
                addEventListener: () => {}
            })
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
    app.gameState.currentStage = 3;
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
    app.gameState.techIssuesFixed = {
        ssl: false,
        speed: false,
        sitemap: false,
        brokenLinks: false
    };
});

test('fixTechIssue - marks specific technical issue as fixed and updates state', () => {
    app.fixTechIssue('ssl');
    assert.equal(app.gameState.techIssuesFixed.ssl, true);
    assert.equal(app.gameState.techIssuesFixed.speed, false);
});

test('updateTechHealthUI - updates health score and status text DOM elements correctly', () => {
    app.gameState.techIssuesFixed = {
        ssl: true,
        speed: true,
        sitemap: false,
        brokenLinks: false
    };

    app.updateTechHealthUI();

    assert.equal(document.getElementById('health-score-text').innerText, '50%');
    assert.equal(document.getElementById('ssl-stat').innerText, 'Aktif (HTTPS Aman)');
    assert.equal(document.getElementById('speed-stat').innerText, '1.2 detik (Cepat/Optimal)');
    assert.equal(document.getElementById('sitemap-stat').innerText, 'Tidak Ditemukan');
});

test('evaluateStage3 - calculates full score when all issues fixed', () => {
    app.gameState.techIssuesFixed = {
        ssl: true,
        speed: true,
        sitemap: true,
        brokenLinks: true
    };

    app.evaluateStage3();

    assert.equal(app.gameState.stageScores.stage3, 100);
    assert.equal(app.gameState.completedStages.stage3, true);
    assert.equal(app.gameState.totalScore, 100);
});

test('evaluateStage3 - calculates partial score for partially fixed issues', () => {
    app.gameState.techIssuesFixed = {
        ssl: true,
        speed: false,
        sitemap: true,
        brokenLinks: false
    };

    app.evaluateStage3();

    assert.equal(app.gameState.stageScores.stage3, 50);
    assert.equal(app.gameState.completedStages.stage3, true);
});
