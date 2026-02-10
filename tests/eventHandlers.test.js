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
        <div id="content"></div>
        <span id="favCount">0</span>
        <span id="postCount">0</span>
        <div id="toast"></div>
    `;
});

describe('handleFavorite', () => {
    function setupPost(pageid = 12345) {
        const wiki = mockWikiData(pageid);
        const post = app.createPost(wiki);
        document.getElementById('content').appendChild(post);
        return { wiki, post, postId: post.id };
    }

    test('favorites an unfavorited article', () => {
        const { postId, post } = setupPost();
        const event = new Event('click', { bubbles: true });
        jest.spyOn(event, 'stopPropagation');

        app.handleFavorite(event, postId, 12345);

        const btn = post.querySelector('.favorite-btn');
        expect(btn.classList.contains('favorited')).toBe(true);
        expect(btn.textContent).toBe('❤');
        expect(app.isFavorited(12345)).toBe(true);
    });

    test('unfavorites a favorited article', () => {
        const { postId, post } = setupPost();
        const event1 = new Event('click', { bubbles: true });
        const event2 = new Event('click', { bubbles: true });

        app.handleFavorite(event1, postId, 12345);
        app.handleFavorite(event2, postId, 12345);

        const btn = post.querySelector('.favorite-btn');
        expect(btn.classList.contains('favorited')).toBe(false);
        expect(btn.textContent).toBe('♡');
        expect(app.isFavorited(12345)).toBe(false);
    });

    test('calls stopPropagation on the event', () => {
        const { postId } = setupPost();
        const event = new Event('click', { bubbles: true });
        const spy = jest.spyOn(event, 'stopPropagation');

        app.handleFavorite(event, postId, 12345);
        expect(spy).toHaveBeenCalled();
    });
});

describe('handleShare', () => {
    test('opens Twitter share dialog', () => {
        const wiki = mockWikiData();
        const post = app.createPost(wiki);
        document.getElementById('content').appendChild(post);

        const openSpy = jest.spyOn(window, 'open').mockImplementation();
        const shareBtn = post.querySelector('.share-btn');
        const event = new Event('click', { bubbles: true });
        Object.defineProperty(event, 'target', { value: shareBtn });

        app.handleShare(event, wiki.pageid);

        expect(openSpy).toHaveBeenCalledTimes(1);
        const url = openSpy.mock.calls[0][0];
        expect(url).toContain('twitter.com/intent/tweet');
        expect(url).toContain(encodeURIComponent(wiki.url));
        openSpy.mockRestore();
    });

    test('calls stopPropagation', () => {
        const wiki = mockWikiData();
        const post = app.createPost(wiki);
        document.getElementById('content').appendChild(post);

        jest.spyOn(window, 'open').mockImplementation();
        const shareBtn = post.querySelector('.share-btn');
        const event = new Event('click', { bubbles: true });
        Object.defineProperty(event, 'target', { value: shareBtn });
        const spy = jest.spyOn(event, 'stopPropagation');

        app.handleShare(event, wiki.pageid);
        expect(spy).toHaveBeenCalled();
        window.open.mockRestore();
    });
});

describe('shareToTwitter', () => {
    test('builds correct Twitter intent URL', () => {
        const openSpy = jest.spyOn(window, 'open').mockImplementation();
        const wiki = mockWikiData();
        const excerpt = 'A test excerpt';

        app.shareToTwitter(wiki, excerpt);

        const url = openSpy.mock.calls[0][0];
        expect(url).toContain('twitter.com/intent/tweet');
        expect(url).toContain(encodeURIComponent('A test excerpt\n\nLearn more:'));
        expect(url).toContain(encodeURIComponent(wiki.url));
        openSpy.mockRestore();
    });

    test('opens in new window with correct dimensions', () => {
        const openSpy = jest.spyOn(window, 'open').mockImplementation();
        app.shareToTwitter(mockWikiData(), 'excerpt');

        expect(openSpy).toHaveBeenCalledWith(
            expect.any(String),
            '_blank',
            'width=550,height=420'
        );
        openSpy.mockRestore();
    });

    test('shows toast notification', () => {
        jest.spyOn(window, 'open').mockImplementation();
        app.shareToTwitter(mockWikiData(), 'excerpt');
        expect(document.getElementById('toast').textContent).toBe('OPENING TWITTER...');
        window.open.mockRestore();
    });

    test('handles special characters in excerpt', () => {
        const openSpy = jest.spyOn(window, 'open').mockImplementation();
        app.shareToTwitter(mockWikiData(), 'He said "hello" & goodbye <script>');

        const url = openSpy.mock.calls[0][0];
        expect(url).not.toContain('<script>');
        expect(url).toContain(encodeURIComponent('"hello"'));
        openSpy.mockRestore();
    });
});
