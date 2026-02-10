const { truncateText } = require('../src/app');

describe('truncateText', () => {
    test('returns text unchanged when shorter than maxLength', () => {
        expect(truncateText('Hello world', 200)).toBe('Hello world');
    });

    test('returns text unchanged when exactly maxLength', () => {
        const text = 'a'.repeat(200);
        expect(truncateText(text, 200)).toBe(text);
    });

    test('truncates at last period when period is past 60% of maxLength', () => {
        // 130 chars of text + period at position 131, then more text to exceed 200
        const before = 'a'.repeat(130);
        const after = ' ' + 'b'.repeat(80);
        const text = before + '.' + after;
        expect(truncateText(text, 200)).toBe(before + '.');
    });

    test('truncates at word boundary with ellipsis when no suitable period', () => {
        const text = 'word '.repeat(50); // 250 chars, no periods
        const result = truncateText(text, 200);
        expect(result).toEndWith('...');
        expect(result.length).toBeLessThanOrEqual(203); // word + ...
    });

    test('does not truncate at period that is before 60% mark', () => {
        // Period at position 50 (25% of 200) — too early
        const text = 'a'.repeat(50) + '. ' + 'b '.repeat(100);
        const result = truncateText(text, 200);
        // Should fall through to word-boundary truncation
        expect(result).toEndWith('...');
    });

    test('handles empty string', () => {
        expect(truncateText('', 200)).toBe('');
    });

    test('handles single character', () => {
        expect(truncateText('a', 200)).toBe('a');
    });

    test('handles maxLength of 0', () => {
        // text.length (5) > 0, shortened = '', no period, split on space = [''], slice(0,-1) = [], join = ''
        expect(truncateText('hello', 0)).toBe('...');
    });

    test('handles text with no spaces and no periods', () => {
        const text = 'a'.repeat(250);
        const result = truncateText(text, 200);
        // No spaces to split on, so slice(0, -1) removes the single element
        expect(result).toBe('...');
    });

    test('uses default maxLength of 200', () => {
        const text = 'a'.repeat(201);
        const result = truncateText(text);
        expect(result).not.toBe(text);
    });

    test('prefers period break over word break when available', () => {
        // Period at position ~150 (75% of 200)
        const text = 'This is a sentence that goes on. ' + 'x '.repeat(20) +
            'Another sentence that is quite long and ends here. ' + 'y '.repeat(40);
        const result = truncateText(text, 200);
        expect(result).toEndWith('.');
        expect(result).not.toEndWith('...');
    });

    test('handles text with multiple periods', () => {
        const text = 'First sentence. Second sentence. Third sentence. ' + 'x '.repeat(100);
        const result = truncateText(text, 200);
        expect(result).toEndWith('.');
    });

    test('handles unicode characters', () => {
        const text = 'café '.repeat(50);
        const result = truncateText(text, 200);
        expect(result.length).toBeLessThanOrEqual(203);
    });

    test('handles text with only whitespace beyond maxLength', () => {
        const text = 'word' + ' '.repeat(300);
        const result = truncateText(text, 200);
        // No period, so falls through to word-boundary truncation with ellipsis
        expect(result).toEndWith('...');
    });
});

expect.extend({
    toEndWith(received, suffix) {
        const pass = received.endsWith(suffix);
        return {
            message: () => `expected "${received}" to end with "${suffix}"`,
            pass,
        };
    },
});
