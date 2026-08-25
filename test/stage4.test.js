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
    app.gameState.currentStage = 4;
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
    app.gameState.backlinkDecisions = {
        goodAccepted: 0,
        spamAccepted: 0,
        evaluatedIds: []
    };
});

test('handleBacklinkDecision - records good backlink acceptance correctly', () => {
    app.handleBacklinkDecision('bl1', 'accept'); // bl1 is good

    assert.equal(app.gameState.backlinkDecisions.goodAccepted, 1);
    assert.equal(app.gameState.backlinkDecisions.spamAccepted, 0);
    assert.ok(app.gameState.backlinkDecisions.evaluatedIds.includes('bl1'));
});

test('handleBacklinkDecision - records spam backlink acceptance correctly', () => {
    app.handleBacklinkDecision('bl2', 'accept'); // bl2 is spam

    assert.equal(app.gameState.backlinkDecisions.goodAccepted, 0);
    assert.equal(app.gameState.backlinkDecisions.spamAccepted, 1);
    assert.ok(app.gameState.backlinkDecisions.evaluatedIds.includes('bl2'));
});

test('updateOffPageStatsUI - calculates DA score and updates UI elements', () => {
    app.gameState.backlinkDecisions.goodAccepted = 2;
    app.gameState.backlinkDecisions.spamAccepted = 1;

    app.updateOffPageStatsUI();

    assert.equal(document.getElementById('good-backlinks-count').innerText, 2);
    assert.equal(document.getElementById('spam-backlinks-count').innerText, 1);
    // baseDA (15) + (2 * 12) - (1 * 8) = 15 + 24 - 8 = 31
    assert.equal(document.getElementById('da-score-val').innerText, 'DA 31');
});

test('evaluateStage4 - calculates optimal stage score when accepting good & avoiding spam backlinks', () => {
    app.gameState.backlinkDecisions.goodAccepted = 2;
    app.gameState.backlinkDecisions.spamAccepted = 0;
    app.gameState.backlinkDecisions.evaluatedIds = ['bl1', 'bl2', 'bl3', 'bl4'];

    app.evaluateStage4();

    // score calculation: (2 * 30) + ((4 - 0) * 10) = 60 + 40 = 100
    assert.equal(app.gameState.stageScores.stage4, 100);
    assert.equal(app.gameState.completedStages.stage4, true);
});
