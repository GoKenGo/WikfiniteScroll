const app = require('../src/app');

const mockWikiData = (pageid = 12345) => ({
    title: 'Test Article',
    extract: 'This is a test article about testing.',
    url: 'https://en.wikipedia.org/wiki/Test',
    thumbnail: 'https://upload.wikimedia.org/test.jpg',
    pageid,
});

beforeEach(() => {
    app.resetState();
    localStorage.clear();

    document.body.innerHTML = `
        <span id="favCount">0</span>
        <div id="toast"></div>
    `;
});

describe('isFavorited', () => {
    test('returns false when favorites is empty', () => {
        expect(app.isFavorited(12345)).toBe(false);
    });

    test('returns true when pageid exists in favorites', () => {
        app.favorites = [mockWikiData(12345)];
        expect(app.isFavorited(12345)).toBe(true);
    });

    test('returns false when pageid does not exist in favorites', () => {
        app.favorites = [mockWikiData(12345)];
        expect(app.isFavorited(99999)).toBe(false);
    });

    test('works with multiple favorites', () => {
        app.favorites = [mockWikiData(1), mockWikiData(2), mockWikiData(3)];
        expect(app.isFavorited(2)).toBe(true);
        expect(app.isFavorited(4)).toBe(false);
    });
});

describe('toggleFavorite', () => {
    test('adds article to favorites and returns true', () => {
        const wiki = mockWikiData(100);
        const result = app.toggleFavorite(wiki);
        expect(result).toBe(true);
        expect(app.isFavorited(100)).toBe(true);
    });

    test('removes article from favorites and returns false', () => {
        const wiki = mockWikiData(100);
        app.toggleFavorite(wiki); // add
        const result = app.toggleFavorite(wiki); // remove
        expect(result).toBe(false);
        expect(app.isFavorited(100)).toBe(false);
    });

    test('persists favorites to localStorage', () => {
        const wiki = mockWikiData(100);
        app.toggleFavorite(wiki);
        const stored = JSON.parse(localStorage.getItem('scrollFavorites'));
        expect(stored).toHaveLength(1);
        expect(stored[0].pageid).toBe(100);
    });

    test('removes from localStorage when unfavorited', () => {
        const wiki = mockWikiData(100);
        app.toggleFavorite(wiki);
        app.toggleFavorite(wiki);
        const stored = JSON.parse(localStorage.getItem('scrollFavorites'));
        expect(stored).toHaveLength(0);
    });

    test('updates favCount DOM element', () => {
        app.toggleFavorite(mockWikiData(1));
        expect(document.getElementById('favCount').textContent).toBe('1');

        app.toggleFavorite(mockWikiData(2));
        expect(document.getElementById('favCount').textContent).toBe('2');

        app.toggleFavorite(mockWikiData(1));
        expect(document.getElementById('favCount').textContent).toBe('1');
    });

    test('shows toast when adding favorite', () => {
        app.toggleFavorite(mockWikiData(1));
        const toast = document.getElementById('toast');
        expect(toast.textContent).toBe('ADDED TO FAVORITES');
    });

    test('shows toast when removing favorite', () => {
        app.toggleFavorite(mockWikiData(1));
        app.toggleFavorite(mockWikiData(1));
        const toast = document.getElementById('toast');
        expect(toast.textContent).toBe('REMOVED FROM FAVORITES');
    });

    test('handles multiple distinct articles', () => {
        app.toggleFavorite(mockWikiData(1));
        app.toggleFavorite(mockWikiData(2));
        app.toggleFavorite(mockWikiData(3));
        expect(app.isFavorited(1)).toBe(true);
        expect(app.isFavorited(2)).toBe(true);
        expect(app.isFavorited(3)).toBe(true);
    });
});

describe('showFavorites', () => {
    test('shows "NO FAVORITES YET" toast when empty', () => {
        app.showFavorites();
        expect(document.getElementById('toast').textContent).toBe('NO FAVORITES YET');
    });

    test('shows singular form for 1 favorite', () => {
        app.toggleFavorite(mockWikiData(1));
        app.showFavorites();
        expect(document.getElementById('toast').textContent).toBe('1 FAVORITE SAVED');
    });

    test('shows plural form for multiple favorites', () => {
        app.toggleFavorite(mockWikiData(1));
        app.toggleFavorite(mockWikiData(2));
        app.showFavorites();
        expect(document.getElementById('toast').textContent).toBe('2 FAVORITES SAVED');
    });
});

describe('initFavorites', () => {
    test('loads favorites from localStorage', () => {
        localStorage.setItem('scrollFavorites', JSON.stringify([mockWikiData(42)]));
        const result = app.initFavorites();
        expect(result).toHaveLength(1);
        expect(result[0].pageid).toBe(42);
    });

    test('returns empty array when localStorage is empty', () => {
        const result = app.initFavorites();
        expect(result).toEqual([]);
    });

    test('returns empty array when localStorage has invalid JSON', () => {
        localStorage.setItem('scrollFavorites', 'not valid json{{{');
        const result = app.initFavorites();
        expect(result).toEqual([]);
    });
});
