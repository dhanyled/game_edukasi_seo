const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

// Mock localStorage in global environment before requiring app.js
let storageStore = {};
const mockLocalStorage = {
    getItem(key) {
        return storageStore[key] || null;
    },
    setItem(key, value) {
        storageStore[key] = String(value);
    },
    removeItem(key) {
        delete storageStore[key];
    },
    clear() {
        storageStore = {};
    }
};

global.localStorage = mockLocalStorage;

const { gameState, saveGameState } = require('../js/app.js');

describe('saveGameState tests', () => {
    let originalWarn;
    let warningsLogged = [];

    beforeEach(() => {
        storageStore = {};
        warningsLogged = [];
        originalWarn = console.warn;
        console.warn = (...args) => {
            warningsLogged.push(args);
        };
    });

    afterEach(() => {
        console.warn = originalWarn;
    });

    it('should correctly serialize and save gameState to localStorage', () => {
        gameState.currentStage = 2;
        gameState.totalScore = 100;
        gameState.stageScores.stage1 = 50;
        gameState.onpageData.title = 'Custom Title Test';

        saveGameState();

        const savedRaw = mockLocalStorage.getItem('seo_game_state_v1');
        assert.notStrictEqual(savedRaw, null, 'Saved state should exist in localStorage');

        const savedData = JSON.parse(savedRaw);
        assert.strictEqual(savedData.currentStage, 2);
        assert.strictEqual(savedData.totalScore, 100);
        assert.strictEqual(savedData.stageScores.stage1, 50);
        assert.strictEqual(savedData.onpageData.title, 'Custom Title Test');
        assert.strictEqual(warningsLogged.length, 0, 'No warnings should be logged on success');
    });

    it('should preserve nested objects and state modifications in saved data', () => {
        gameState.stageScores.stage2 = 75;
        gameState.completedStages = {
            stage1: true,
            stage2: true,
            stage3: false,
            stage4: false,
            stage5: false
        };

        saveGameState();

        const savedData = JSON.parse(mockLocalStorage.getItem('seo_game_state_v1'));
        assert.strictEqual(savedData.stageScores.stage2, 75);
        assert.strictEqual(savedData.completedStages.stage1, true);
        assert.strictEqual(savedData.completedStages.stage2, true);
    });

    it('should catch localStorage setItem errors gracefully and log a warning', () => {
        const setItemError = new Error('QuotaExceededError');
        mockLocalStorage.setItem = () => {
            throw setItemError;
        };

        assert.doesNotThrow(() => {
            saveGameState();
        });

        assert.strictEqual(warningsLogged.length, 1);
        assert.strictEqual(warningsLogged[0][0], 'LocalStorage not available or disabled.');
        assert.strictEqual(warningsLogged[0][1], setItemError);

        // Restore mock setItem
        mockLocalStorage.setItem = (key, value) => {
            storageStore[key] = String(value);
        };
    });
});
