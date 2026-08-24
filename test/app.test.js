const test = require('node:test');
const assert = require('node:assert/strict');

// Mock localStorage globally before loading app module
const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem(key) {
            return store[key] !== undefined ? store[key] : null;
        },
        setItem(key, value) {
            store[key] = String(value);
        },
        removeItem(key) {
            delete store[key];
        },
        clear() {
            store = {};
        }
    };
})();

global.localStorage = mockLocalStorage;

const { gameState, loadGameState, saveGameState } = require('../js/app.js');

test.describe('loadGameState tests', () => {

    test.beforeEach(() => {
        global.localStorage.clear();
        // Reset gameState to defaults
        gameState.currentStage = 1;
        gameState.totalScore = 0;
        gameState.traffic = 0;
        gameState.rank = "Pemula (Level 1)";
        gameState.stageScores = { stage1: 0, stage2: 0, stage3: 0, stage4: 0 };
        gameState.completedStages = { stage1: false, stage2: false, stage3: false, stage4: false, stage5: false };
    });

    test('loads saved state correctly when valid JSON exists in localStorage', () => {
        const savedData = {
            currentStage: 3,
            totalScore: 150,
            rank: "Praktisi SEO (Level 3)",
            stageScores: { stage1: 50, stage2: 100, stage3: 0, stage4: 0 }
        };
        global.localStorage.setItem('seo_game_state_v1', JSON.stringify(savedData));

        loadGameState();

        assert.equal(gameState.currentStage, 3);
        assert.equal(gameState.totalScore, 150);
        assert.equal(gameState.rank, "Praktisi SEO (Level 3)");
        assert.equal(gameState.stageScores.stage1, 50);
    });

    test('handles invalid/corrupt JSON gracefully without crashing and logs warning', () => {
        const warnings = [];
        const originalWarn = console.warn;
        console.warn = (...args) => warnings.push(args.join(' '));

        global.localStorage.setItem('seo_game_state_v1', 'INVALID_JSON_{{{');

        try {
            loadGameState();
            assert.equal(warnings.length, 1);
            assert.match(warnings[0], /Failed to parse saved game state/);
            // Default state should remain intact
            assert.equal(gameState.currentStage, 1);
            assert.equal(gameState.totalScore, 0);
        } finally {
            console.warn = originalWarn;
        }
    });

    test('does nothing when no saved state exists in localStorage (null)', () => {
        loadGameState();
        assert.equal(gameState.currentStage, 1);
        assert.equal(gameState.totalScore, 0);
    });

    test('handles exceptions thrown by localStorage.getItem gracefully', () => {
        const originalGetItem = global.localStorage.getItem;
        const warnings = [];
        const originalWarn = console.warn;
        console.warn = (...args) => warnings.push(args.join(' '));

        global.localStorage.getItem = () => {
            throw new Error('Storage access denied');
        };

        try {
            loadGameState();
            assert.equal(warnings.length, 1);
            assert.match(warnings[0], /Failed to parse saved game state/);
        } finally {
            global.localStorage.getItem = originalGetItem;
            console.warn = originalWarn;
        }
    });
});
