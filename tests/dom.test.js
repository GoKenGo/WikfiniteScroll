const app = require('../src/app');

const mockWikiData = (overrides = {}) => ({
    title: 'Test Article',
    extract: 'This is a test article with enough content to be meaningful for testing purposes.',
    url: 'https://en.wikipedia.org/wiki/Test_Article',
    thumbnail: 'https://upload.wikimedia.org/test.jpg',
    pageid: 12345,
    ...overrides,
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

describe('createPost', () => {
    test('creates a div with class "post" and a category class', () => {
        const post = app.createPost(mockWikiData());
        expect(post.tagName).toBe('DIV');
        expect(post.classList.contains('post')).toBe(true);
        const hasCategory = app.categories.some(c => post.classList.contains(c));
        expect(hasCategory).toBe(true);
    });

    test('sets correct id based on pageid', () => {
        const post = app.createPost(mockWikiData({ pageid: 42 }));
        expect(post.id).toBe('post-42');
    });

    test('renders image with lazy loading by default', () => {
        const post = app.createPost(mockWikiData());
        const img = post.querySelector('.post-image');
        expect(img.tagName).toBe('IMG');
        expect(img.src).toBe('https://upload.wikimedia.org/test.jpg');
        expect(img.getAttribute('loading')).toBe('lazy');
    });

    test('renders image with fetchpriority="high" when eager', () => {
        const post = app.createPost(mockWikiData(), true);
        const img = post.querySelector('.post-image');
        expect(img.tagName).toBe('IMG');
        expect(img.getAttribute('fetchpriority')).toBe('high');
        expect(img.getAttribute('loading')).toBeNull();
    });

    test('renders gradient placeholder when no thumbnail', () => {
        const post = app.createPost(mockWikiData({ thumbnail: null }));
        const imageContainer = post.querySelector('.post-image-container');
        const div = imageContainer.querySelector('.post-image');
        expect(div.tagName).toBe('DIV');
        // jsdom doesn't parse shorthand CSS, so check the attribute directly
        expect(div.getAttribute('style')).toContain('linear-gradient');
    });

    test('displays article title as a link', () => {
        const post = app.createPost(mockWikiData({ title: 'My Title' }));
        const link = post.querySelector('.topic-link');
        expect(link.textContent).toBe('My Title');
        expect(link.href).toBe('https://en.wikipedia.org/wiki/Test_Article');
        expect(link.target).toBe('_blank');
    });

    test('displays truncated excerpt in post-content', () => {
        const longText = 'word '.repeat(100);
        const post = app.createPost(mockWikiData({ extract: longText }));
        const content = post.querySelector('.post-content').textContent;
        expect(content.length).toBeLessThanOrEqual(203); // 200 + '...'
    });

    test('includes favorite and share action buttons', () => {
        const post = app.createPost(mockWikiData());
        const favoriteBtn = post.querySelector('.favorite-btn');
        const shareBtn = post.querySelector('.share-btn');
        expect(favoriteBtn).not.toBeNull();
        expect(shareBtn).not.toBeNull();
        expect(favoriteBtn.getAttribute('aria-label')).toBe('Favorite');
        expect(shareBtn.getAttribute('aria-label')).toBe('Share');
    });

    test('stores wikiData in dataset', () => {
        const wiki = mockWikiData();
        const post = app.createPost(wiki);
        const stored = JSON.parse(post.dataset.wikiData);
        expect(stored.pageid).toBe(wiki.pageid);
        expect(stored.title).toBe(wiki.title);
    });

    test('stores excerpt in dataset', () => {
        const post = app.createPost(mockWikiData());
        expect(post.dataset.excerpt).toBeDefined();
        expect(post.dataset.excerpt.length).toBeGreaterThan(0);
    });

    test('shows favorited state when article is already favorited', () => {
        const wiki = mockWikiData({ pageid: 999 });
        app.favorites = [wiki];
        const post = app.createPost(wiki);
        const btn = post.querySelector('.favorite-btn');
        expect(btn.classList.contains('favorited')).toBe(true);
        expect(btn.textContent.trim()).toBe('❤');
    });

    test('shows unfavorited state for new article', () => {
        const post = app.createPost(mockWikiData());
        const btn = post.querySelector('.favorite-btn');
        expect(btn.classList.contains('favorited')).toBe(false);
        expect(btn.textContent.trim()).toBe('♡');
    });

    test('displays category label', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0); // 'fact'
        const post = app.createPost(mockWikiData());
        const tag = post.querySelector('.category-tag');
        expect(tag.textContent).toBe('Did You Know');
        Math.random.mockRestore();
    });
});

describe('createNewsPost', () => {
    test('creates a div with class "news-post"', () => {
        const post = app.createNewsPost();
        expect(post.tagName).toBe('DIV');
        expect(post.classList.contains('news-post')).toBe(true);
    });

    test('displays headline and source', () => {
        const post = app.createNewsPost();
        const headline = post.querySelector('.news-headline');
        const source = post.querySelector('.news-source');
        expect(headline.textContent).toBe(app.newsArticles[0].headline);
        expect(source.textContent).toBe(app.newsArticles[0].source);
    });

    test('cycles through news articles', () => {
        const post1 = app.createNewsPost();
        const post2 = app.createNewsPost();
        const headline1 = post1.querySelector('.news-headline').textContent;
        const headline2 = post2.querySelector('.news-headline').textContent;
        expect(headline1).toBe(app.newsArticles[0].headline);
        expect(headline2).toBe(app.newsArticles[1].headline);
    });

    test('wraps around to first article after all are shown', () => {
        for (let i = 0; i < app.newsArticles.length; i++) {
            app.createNewsPost();
        }
        const wrappedPost = app.createNewsPost();
        const headline = wrappedPost.querySelector('.news-headline').textContent;
        expect(headline).toBe(app.newsArticles[0].headline);
    });

    test('opens URL on click', () => {
        const openSpy = jest.spyOn(window, 'open').mockImplementation();
        const post = app.createNewsPost();
        post.click();
        expect(openSpy).toHaveBeenCalledWith(
            app.newsArticles[0].url,
            '_blank',
            'noopener'
        );
        openSpy.mockRestore();
    });

    test('contains "TOP STORY" label', () => {
        const post = app.createNewsPost();
        const label = post.querySelector('.news-label');
        expect(label.textContent).toContain('TOP STORY');
    });
});

describe('showToast', () => {
    test('sets toast text and adds show class', () => {
        app.showToast('TEST MESSAGE');
        const toast = document.getElementById('toast');
        expect(toast.textContent).toBe('TEST MESSAGE');
        expect(toast.classList.contains('show')).toBe(true);
    });

    test('removes show class after timeout', () => {
        jest.useFakeTimers();
        app.showToast('TEST');
        const toast = document.getElementById('toast');
        expect(toast.classList.contains('show')).toBe(true);

        jest.advanceTimersByTime(2500);
        expect(toast.classList.contains('show')).toBe(false);

        jest.useRealTimers();
    });
});
