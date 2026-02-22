// All translation calls go through our backend proxy to avoid CORS issues.
// The backend relays the request to https://api.sarvam.ai/translate with the API key.
const PROXY_URL = `${import.meta.env.VITE_API_URL}/api/translate`;

/**
 * Translate text via our backend proxy (which calls Sarvam AI)
 * @param {string} text          Text to translate
 * @param {string} targetLanguage Sarvam language code e.g. 'hi-IN'
 * @returns {Promise<string>}    Translated string, or original if it fails
 */
export const translateText = async (text, targetLanguage) => {
    if (!text || !text.trim()) return text;

    try {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                input: text.trim(),
                source_language_code: 'en-IN',
                target_language_code: targetLanguage,
            })
        });

        if (!response.ok) {
            console.error('[Sarvam] Proxy error:', response.status);
            return text;
        }

        const data = await response.json();
        return data.translated_text || text;
    } catch (error) {
        console.error('[Sarvam] Fetch failed:', error.message);
        return text;
    }
};
