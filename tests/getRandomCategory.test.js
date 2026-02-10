const { getRandomCategory, categories } = require('../src/app');

describe('getRandomCategory', () => {
    test('returns a value from the categories array', () => {
        for (let i = 0; i < 50; i++) {
            expect(categories).toContain(getRandomCategory());
        }
    });

    test('can return all four categories given enough iterations', () => {
        const seen = new Set();
        for (let i = 0; i < 200; i++) {
            seen.add(getRandomCategory());
        }
        expect(seen.size).toBe(4);
        expect(seen).toContain('fact');
        expect(seen).toContain('person');
        expect(seen).toContain('history');
        expect(seen).toContain('science');
    });

    test('categories array has exactly 4 entries', () => {
        expect(categories).toHaveLength(4);
    });

    test('uses Math.random for selection', () => {
        const spy = jest.spyOn(Math, 'random').mockReturnValue(0);
        expect(getRandomCategory()).toBe('fact');
        spy.mockReturnValue(0.25);
        expect(getRandomCategory()).toBe('person');
        spy.mockReturnValue(0.5);
        expect(getRandomCategory()).toBe('history');
        spy.mockReturnValue(0.75);
        expect(getRandomCategory()).toBe('science');
        spy.mockRestore();
    });

    test('handles Math.random returning value just below 1', () => {
        const spy = jest.spyOn(Math, 'random').mockReturnValue(0.999);
        expect(categories).toContain(getRandomCategory());
        spy.mockRestore();
    });
});
