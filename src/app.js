const RANDOM_API = 'https://en.wikipedia.org/api/rest_v1/page/random/summary';

const categories = ['fact', 'person', 'history', 'science'];
const categoryLabels = {
    'fact': 'Did You Know',
    'person': 'Notable Person',
    'history': 'Historical Event',
    'science': 'Science & Tech'
};

const newsArticles = [
    {
        headline: "Tech Giants Face New AI Regulation Proposals in EU",
        source: "Reuters",
        url: "https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB"
    },
    {
        headline: "Global Climate Summit Reaches Historic Carbon Agreement",
        source: "AP News",
        url: "https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGs0ZERWU0FtVnVHZ0pWVXlnQVAB"
    },
    {
        headline: "Quantum Computing Breakthrough Announced by Research Team",
        source: "Science Daily",
        url: "https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB"
    },
    {
        headline: "Stock Markets Rally on Economic Growth Data",
        source: "Financial Times",
        url: "https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB"
    },
    {
        headline: "New Archaeological Discovery Challenges Historical Timeline",
        source: "National Geographic",
        url: "https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtVnVHZ0pWVXlnQVAB"
    }
];

let newsIndex = 0;
let postCount = 0;
let loading = false;
let articlesLoaded = 0;
let favorites = [];

function initFavorites() {
    try {
        favorites = JSON.parse(localStorage.getItem('scrollFavorites') || '[]');
    } catch {
        favorites = [];
    }
    return favorites;
}

function getRandomCategory() {
    return categories[Math.floor(Math.random() * categories.length)];
}

function truncateText(text, maxLength = 200) {
    if (text.length <= maxLength) return text;

    const shortened = text.substring(0, maxLength);
    const lastPeriod = shortened.lastIndexOf('.');

    if (lastPeriod > maxLength * 0.6) {
        return shortened.substring(0, lastPeriod + 1);
    }

    return shortened.split(' ').slice(0, -1).join(' ') + '...';
}

async function fetchRandomWikipedia(fetchFn = fetch) {
    try {
        const response = await fetchFn(RANDOM_API);
        const data = await response.json();

        return {
            title: data.title,
            extract: data.extract,
            url: data.content_urls.desktop.page,
            thumbnail: data.thumbnail?.source || null,
            pageid: data.pageid
        };
    } catch (error) {
        console.error('Error fetching Wikipedia:', error);
        return null;
    }
}

function isFavorited(pageid) {
    return favorites.some(fav => fav.pageid === pageid);
}

function toggleFavorite(wikiData) {
    const index = favorites.findIndex(fav => fav.pageid === wikiData.pageid);

    if (index > -1) {
        favorites.splice(index, 1);
        showToast('REMOVED FROM FAVORITES');
    } else {
        favorites.push(wikiData);
        showToast('ADDED TO FAVORITES');
    }

    localStorage.setItem('scrollFavorites', JSON.stringify(favorites));
    document.getElementById('favCount').textContent = favorites.length;

    return index === -1;
}

function shareToTwitter(wikiData, excerpt) {
    const tweetText = `${excerpt}\n\nLearn more:`;
    const url = wikiData.url;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    showToast('OPENING TWITTER...');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

function showFavorites() {
    if (favorites.length === 0) {
        showToast('NO FAVORITES YET');
        return;
    }

    showToast(`${favorites.length} FAVORITE${favorites.length !== 1 ? 'S' : ''} SAVED`);
}

function createPost(wikiData) {
    const category = getRandomCategory();
    const excerpt = truncateText(wikiData.extract, 200);
    const postId = `post-${wikiData.pageid}`;

    const post = document.createElement('div');
    post.className = `post ${category}`;
    post.id = postId;

    const imageHtml = wikiData.thumbnail
        ? `<img src="${wikiData.thumbnail}" alt="${wikiData.title}" class="post-image" loading="lazy">`
        : `<div class="post-image" style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);"></div>`;

    post.innerHTML = `
        <div class="post-inner">
            <div class="post-image-container">
                ${imageHtml}
            </div>
            <div class="post-body">
                <div>
                    <div class="category-tag">${categoryLabels[category]}</div>
                    <div class="post-content">${excerpt}</div>
                </div>
                <div class="post-footer">
                    <a href="${wikiData.url}" target="_blank" rel="noopener" class="topic-link" onclick="event.stopPropagation()">${wikiData.title}</a>
                    <div class="post-actions">
                        <button class="action-btn favorite-btn ${isFavorited(wikiData.pageid) ? 'favorited' : ''}"
                                onclick="handleFavorite(event, '${postId}', ${wikiData.pageid})"
                                aria-label="Favorite">
                            ${isFavorited(wikiData.pageid) ? '❤' : '♡'}
                        </button>
                        <button class="action-btn share-btn"
                                onclick="handleShare(event, ${wikiData.pageid})"
                                aria-label="Share">
                            ↗
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    post.dataset.wikiData = JSON.stringify(wikiData);
    post.dataset.excerpt = excerpt;

    return post;
}

function createNewsPost() {
    const news = newsArticles[newsIndex % newsArticles.length];
    newsIndex++;

    const newsPost = document.createElement('div');
    newsPost.className = 'news-post';
    newsPost.innerHTML = `
        <div class="news-label">— TOP STORY —</div>
        <div class="news-headline">${news.headline}</div>
        <div class="news-source">${news.source}</div>
    `;

    newsPost.addEventListener('click', () => {
        window.open(news.url, '_blank', 'noopener');
    });

    return newsPost;
}

function handleFavorite(event, postId, pageid) {
    event.stopPropagation();
    const post = document.getElementById(postId);
    const wikiData = JSON.parse(post.dataset.wikiData);

    const nowFavorited = toggleFavorite(wikiData);
    const btn = post.querySelector('.favorite-btn');

    if (nowFavorited) {
        btn.classList.add('favorited');
        btn.textContent = '❤';
    } else {
        btn.classList.remove('favorited');
        btn.textContent = '♡';
    }
}

function handleShare(event, pageid) {
    event.stopPropagation();
    const post = event.target.closest('.post');
    const wikiData = JSON.parse(post.dataset.wikiData);
    const excerpt = post.dataset.excerpt;

    shareToTwitter(wikiData, excerpt);
}

async function loadPosts(count = 5, fetchFn = fetch) {
    if (loading) return;
    loading = true;

    if (articlesLoaded === 0) {
        document.querySelectorAll('.skeleton-post').forEach(el => el.remove());
    }

    const container = document.getElementById('content');

    for (let i = 0; i < count; i++) {
        const wikiData = await fetchRandomWikipedia(fetchFn);

        if (wikiData) {
            const post = createPost(wikiData);
            container.appendChild(post);

            postCount++;
            document.getElementById('postCount').textContent = postCount;

            if (postCount % 5 === 0) {
                const newsPost = createNewsPost();
                container.appendChild(newsPost);
            }
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    articlesLoaded += count;
    loading = false;
}

function resetState() {
    newsIndex = 0;
    postCount = 0;
    loading = false;
    articlesLoaded = 0;
    favorites = [];
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RANDOM_API,
        categories,
        categoryLabels,
        newsArticles,
        getRandomCategory,
        truncateText,
        fetchRandomWikipedia,
        isFavorited,
        toggleFavorite,
        shareToTwitter,
        showToast,
        showFavorites,
        createPost,
        createNewsPost,
        handleFavorite,
        handleShare,
        loadPosts,
        resetState,
        initFavorites,
        get favorites() { return favorites; },
        set favorites(val) { favorites = val; },
        get postCount() { return postCount; },
        get loading() { return loading; },
        get articlesLoaded() { return articlesLoaded; },
        get newsIndex() { return newsIndex; },
    };
}
