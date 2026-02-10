const { fetchRandomWikipedia, RANDOM_API } = require('../src/app');

const mockApiResponse = {
    title: 'Quantum mechanics',
    extract: 'Quantum mechanics is a fundamental theory in physics.',
    content_urls: {
        desktop: {
            page: 'https://en.wikipedia.org/wiki/Quantum_mechanics'
        }
    },
    thumbnail: {
        source: 'https://upload.wikimedia.org/thumb.jpg'
    },
    pageid: 12345
};

function createMockFetch(responseData, ok = true) {
    return jest.fn().mockResolvedValue({
        ok,
        json: () => Promise.resolve(responseData),
    });
}

describe('fetchRandomWikipedia', () => {
    test('returns formatted article data on success', async () => {
        const mockFetch = createMockFetch(mockApiResponse);
        const result = await fetchRandomWikipedia(mockFetch);

        expect(result).toEqual({
            title: 'Quantum mechanics',
            extract: 'Quantum mechanics is a fundamental theory in physics.',
            url: 'https://en.wikipedia.org/wiki/Quantum_mechanics',
            thumbnail: 'https://upload.wikimedia.org/thumb.jpg',
            pageid: 12345
        });
    });

    test('calls the correct API endpoint', async () => {
        const mockFetch = createMockFetch(mockApiResponse);
        await fetchRandomWikipedia(mockFetch);
        expect(mockFetch).toHaveBeenCalledWith(RANDOM_API);
    });

    test('handles missing thumbnail gracefully', async () => {
        const noThumb = { ...mockApiResponse };
        delete noThumb.thumbnail;
        const mockFetch = createMockFetch(noThumb);
        const result = await fetchRandomWikipedia(mockFetch);

        expect(result.thumbnail).toBeNull();
    });

    test('returns null on network error', async () => {
        const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const result = await fetchRandomWikipedia(mockFetch);

        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalledWith(
            'Error fetching Wikipedia:',
            expect.any(Error)
        );
        consoleSpy.mockRestore();
    });

    test('returns null when response.json() fails', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            json: () => Promise.reject(new Error('Invalid JSON')),
        });
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const result = await fetchRandomWikipedia(mockFetch);

        expect(result).toBeNull();
        consoleSpy.mockRestore();
    });

    test('returns null when response is missing content_urls', async () => {
        const badData = { title: 'Test', extract: 'Test', pageid: 1 };
        const mockFetch = createMockFetch(badData);
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const result = await fetchRandomWikipedia(mockFetch);

        expect(result).toBeNull();
        consoleSpy.mockRestore();
    });

    test('handles thumbnail with null source', async () => {
        const data = { ...mockApiResponse, thumbnail: { source: null } };
        const mockFetch = createMockFetch(data);
        const result = await fetchRandomWikipedia(mockFetch);
        expect(result.thumbnail).toBeNull();
    });
});
