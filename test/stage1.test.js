const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

// Minimal DOM and Browser Mocks
function setupMockDOM() {
    const elements = {};

    global.document = {
        addEventListener: () => {},
        getElementById: (id) => {
            if (!elements[id]) {
                elements[id] = {
                    innerText: '',
                    innerHTML: '',
                    className: '',
                    style: {},
                    classList: {
                        add: () => {},
                        remove: () => {}
                    }
                };
            }
            return elements[id];
        },
        querySelectorAll: () => []
    };

    global.window = {};

    global.localStorage = {
        _data: {},
        setItem: (key, val) => { global.localStorage._data[key] = String(val); },
        getItem: (key) => global.localStorage._data[key] || null,
        removeItem: (key) => { delete global.localStorage._data[key]; }
    };

    return elements;
}

setupMockDOM();

const app = require('../js/app.js');

beforeEach(() => {
    // Reset gameState before each test
    app.gameState.currentStage = 1;
    app.gameState.totalScore = 0;
    app.gameState.traffic = 0;
    app.gameState.rank = "Pemula (Level 1)";
    app.gameState.selectedKeywords = [];
    app.gameState.stageScores.stage1 = 0;
    app.gameState.stageScores.stage2 = 0;
    app.gameState.stageScores.stage3 = 0;
    app.gameState.stageScores.stage4 = 0;
    app.gameState.completedStages.stage1 = false;
    app.gameState.completedStages.stage2 = false;
    app.gameState.completedStages.stage3 = false;
    app.gameState.completedStages.stage4 = false;
    app.gameState.completedStages.stage5 = false;
});

test('evaluateStage1 - calculates correct score and state for 3 recommended keywords', () => {
    app.gameState.selectedKeywords = ['kw2', 'kw3', 'kw4']; // points: 35 + 30 + 25 = 90

    app.evaluateStage1();

    assert.equal(app.gameState.stageScores.stage1, 90);
    assert.equal(app.gameState.completedStages.stage1, true);
    assert.equal(app.gameState.totalScore, 90);
    assert.equal(app.gameState.traffic, Math.round(90 * 85)); // 7650
    assert.equal(app.gameState.rank, 'Pelajar SEO (Level 2)');
});

test('evaluateStage1 - calculates correct score for non-recommended / lower points keywords', () => {
    app.gameState.selectedKeywords = ['kw1', 'kw5', 'kw6']; // points: 10 + 5 + 10 = 25

    app.evaluateStage1();

    assert.equal(app.gameState.stageScores.stage1, 25);
    assert.equal(app.gameState.completedStages.stage1, true);
    assert.equal(app.gameState.totalScore, 25);
    assert.equal(app.gameState.rank, 'Pemula (Level 1)');
});

test('evaluateStage1 - guard clause: does nothing if 0, 1, or 2 keywords are selected', () => {
    // 0 keywords
    app.gameState.selectedKeywords = [];
    app.evaluateStage1();
    assert.equal(app.gameState.stageScores.stage1, 0);
    assert.equal(app.gameState.completedStages.stage1, false);

    // 1 keyword
    app.gameState.selectedKeywords = ['kw1'];
    app.evaluateStage1();
    assert.equal(app.gameState.stageScores.stage1, 0);
    assert.equal(app.gameState.completedStages.stage1, false);

    // 2 keywords
    app.gameState.selectedKeywords = ['kw1', 'kw2'];
    app.evaluateStage1();
    assert.equal(app.gameState.stageScores.stage1, 0);
    assert.equal(app.gameState.completedStages.stage1, false);
});

test('evaluateStage1 - guard clause: does nothing if more than 3 keywords are selected', () => {
    app.gameState.selectedKeywords = ['kw1', 'kw2', 'kw3', 'kw4'];
    app.evaluateStage1();

    assert.equal(app.gameState.stageScores.stage1, 0);
    assert.equal(app.gameState.completedStages.stage1, false);
});

test('evaluateStage1 - edge case: safely handles unknown keyword IDs without throwing', () => {
    app.gameState.selectedKeywords = ['kw2', 'kw3', 'unknown_id']; // points: 35 + 30 + 0 = 65

    app.evaluateStage1();

    assert.equal(app.gameState.stageScores.stage1, 65);
    assert.equal(app.gameState.completedStages.stage1, true);
});

test('evaluateStage1 - updates modal DOM elements with evaluation results', () => {
    const domElements = setupMockDOM();
    app.gameState.selectedKeywords = ['kw2', 'kw3', 'kw4'];

    app.evaluateStage1();

    const titleElem = domElements['modal-title'];
    const bodyElem = domElements['modal-body'];

    assert.equal(titleElem.innerText, 'Evaluasi Riset Kata Kunci Selesai!');
    assert.match(bodyElem.innerHTML, /90 XP/);
    assert.match(bodyElem.innerHTML, /biji kopi arabika lokal/);
    assert.match(bodyElem.innerHTML, /jual kopi online gratis ongkir/);
    assert.match(bodyElem.innerHTML, /resep membuat kopi enak di rumah/);
});

test('loadGameState - handles JSON parse failure gracefully in catch block', () => {
    global.localStorage.setItem('seo_game_state_v1', '{invalid-json');

    // Should catch JSON parsing error without throwing
    assert.doesNotThrow(() => {
        app.loadGameState();
    });

    // gameState currentStage should remain default (1)
    assert.equal(app.gameState.currentStage, 1);
});
