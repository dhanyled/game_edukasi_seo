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
    app.gameState.currentStage = 5;
    app.gameState.totalScore = 0;
    app.gameState.traffic = 0;
    app.gameState.rank = "Pemula (Level 1)";
    app.gameState.stageScores.stage1 = 90;
    app.gameState.stageScores.stage2 = 100;
    app.gameState.stageScores.stage3 = 100;
    app.gameState.stageScores.stage4 = 100;
    app.gameState.completedStages.stage1 = true;
    app.gameState.completedStages.stage2 = true;
    app.gameState.completedStages.stage3 = true;
    app.gameState.completedStages.stage4 = true;
    app.gameState.completedStages.stage5 = false;
});

test('updateSERPBreakdown - updates UI breakdown scores accurately', () => {
    app.updateSERPBreakdown();

    assert.equal(document.getElementById('score-kw').innerText, '90 XP');
    assert.equal(document.getElementById('score-onpage').innerText, '100 XP');
    assert.equal(document.getElementById('score-tech').innerText, '100 XP');
    assert.equal(document.getElementById('score-offpage').innerText, '100 XP');
});

test('calculateScoreAndRank - calculates master rank when totalScore >= 350', () => {
    app.updateUIHeader();

    assert.equal(app.gameState.totalScore, 390);
    assert.equal(app.gameState.rank, 'Master SEO (Level 5)');
    assert.equal(app.gameState.traffic, Math.round(390 * 85));
});
