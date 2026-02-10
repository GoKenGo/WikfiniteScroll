const app = require('../src/app');

const mockApiResponse = {
    title: 'Test Article',
    extract: 'This is a test article about testing things.',
    content_urls: {
        desktop: { page: 'https://en.wikipedia.org/wiki/Test' }
    },
    thumbnail: { source: 'https://upload.wikimedia.org/test.jpg' },
    pageid: 12345
};

function createMockFetch(response) {
    let id = 0;
    return jest.fn(() => {
        id++;
        const data = typeof response === 'function' ? response(id) : response;
        return Promise.resolve({
            json: () => Promise.resolve({ ...data, pageid: data.pageid || id }),
        });
    });
}

function createFailingFetch() {
    return jest.fn(() => Promise.reject(new Error('Network error')));
}

beforeEach(() => {
    app.resetState();
    localStorage.clear();
    jest.useFakeTimers();

    document.body.innerHTML = `
        <div id="content">
            <div class="skeleton-post">skeleton1</div>
            <div class="skeleton-post">skeleton2</div>
        </div>
        <span id="favCount">0</span>
        <span id="postCount">0</span>
        <div id="toast"></div>
    `;
});

afterEach(() => {
    jest.useRealTimers();
});

describe('loadPosts', () => {
    test('loads specified number of posts', async () => {
        const mockFetch = createMockFetch(mockApiResponse);
        const promise = app.loadPosts(3, mockFetch);
        await jest.advanceTimersByTimeAsync(3000);
        await promise;

        const posts = document.querySelectorAll('.post');
        expect(posts).toHaveLength(3);
    });

    test('fetches all articles in parallel via Promise.all', async () => {
        const mockFetch = createMockFetch(mockApiResponse);
        const promise = app.loadPosts(5, mockFetch);

        // All 5 fetches should be initiated immediately (parallel)
        expect(mockFetch).toHaveBeenCalledTimes(5);

        await jest.advanceTimersByTimeAsync(5000);
        await promise;
    });

    test('updates postCount counter in DOM', async () => {
        const mockFetch = createMockFetch(mockApiResponse);
        const promise = app.loadPosts(2, mockFetch);
        await jest.advanceTimersByTimeAsync(2000);
        await promise;

        expect(document.getElementById('postCount').textContent).toBe('2');
    });

    test('removes skeleton loaders on first call', async () => {
        const mockFetch = createMockFetch(mockApiResponse);
        expect(document.querySelectorAll('.skeleton-post')).toHaveLength(2);

        const promise = app.loadPosts(1, mockFetch);
        await jest.advanceTimersByTimeAsync(1000);
        await promise;

        expect(document.querySelectorAll('.skeleton-post')).toHaveLength(0);
    });

    test('prevents concurrent loads via loading flag', async () => {
        const mockFetch = createMockFetch(mockApiResponse);

        const promise1 = app.loadPosts(1, mockFetch);
        const promise2 = app.loadPosts(1, mockFetch); // should be blocked

        await jest.advanceTimersByTimeAsync(2000);
        await promise1;
        await promise2;

        expect(document.querySelectorAll('.post')).toHaveLength(1);
    });

    test('resets loading flag after completion', async () => {
        const mockFetch = createMockFetch(mockApiResponse);
        const promise = app.loadPosts(1, mockFetch);
        await jest.advanceTimersByTimeAsync(1000);
        await promise;

        expect(app.loading).toBe(false);
    });

    test('inserts news post every 5 articles', async () => {
        const mockFetch = createMockFetch(mockApiResponse);
        const promise = app.loadPosts(5, mockFetch);
        await jest.advanceTimersByTimeAsync(5000);
        await promise;

        const newsPosts = document.querySelectorAll('.news-post');
        expect(newsPosts).toHaveLength(1);
    });

    test('handles null responses from fetch gracefully', async () => {
        const mockFetch = createFailingFetch();
        jest.spyOn(console, 'error').mockImplementation();

        const promise = app.loadPosts(2, mockFetch);
        await jest.advanceTimersByTimeAsync(2000);
        await promise;

        const posts = document.querySelectorAll('.post');
        expect(posts).toHaveLength(0);
        expect(app.loading).toBe(false);

        console.error.mockRestore();
    });

    test('defaults to 5 posts when no count specified', async () => {
        const mockFetch = createMockFetch(mockApiResponse);
        const promise = app.loadPosts(undefined, mockFetch);
        await jest.advanceTimersByTimeAsync(5000);
        await promise;

        expect(mockFetch).toHaveBeenCalledTimes(5);
    });

    test('allows new load after previous completes', async () => {
        const mockFetch = createMockFetch(mockApiResponse);

        const promise1 = app.loadPosts(1, mockFetch);
        await jest.advanceTimersByTimeAsync(1000);
        await promise1;

        const promise2 = app.loadPosts(1, mockFetch);
        await jest.advanceTimersByTimeAsync(1000);
        await promise2;

        expect(document.querySelectorAll('.post')).toHaveLength(2);
    });

    test('uses eager loading for first 3 posts', async () => {
        const mockFetch = createMockFetch(mockApiResponse);
        const promise = app.loadPosts(5, mockFetch);
        await jest.advanceTimersByTimeAsync(5000);
        await promise;

        const posts = document.querySelectorAll('.post');
        // First 3 posts should have fetchpriority="high"
        for (let i = 0; i < 3; i++) {
            const img = posts[i].querySelector('.post-image');
            expect(img.getAttribute('fetchpriority')).toBe('high');
        }
        // Posts 4+ should have loading="lazy"
        for (let i = 3; i < 5; i++) {
            const img = posts[i].querySelector('.post-image');
            expect(img.getAttribute('loading')).toBe('lazy');
        }
    });
});
