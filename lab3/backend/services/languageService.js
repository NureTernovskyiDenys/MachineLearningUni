const language = require('@google-cloud/language');
const languageClient = new language.LanguageServiceClient();

/**
 * Uses Regex to clean up Ukrainian filler words
 */
const cleanText = (text) => {
    let cleaned = text.replace(/\b(ну|типу|знаєш|коротше|еее+|ммм+|якби)\b/gi, '');
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
    return cleaned;
};

/**
 * Analyzes the sentiment of a given text
 */
const analyzeSentiment = async (text) => {
    const document = {
        content: text,
        type: 'PLAIN_TEXT',
        // Не вказуємо 'language', щоб Google Cloud автоматично визначав мову (en, ru тощо)
    };

    try {
        const [result] = await languageClient.analyzeSentiment({ document });
        const sentiment = result.documentSentiment;
        
        return {
            score: sentiment.score,
            magnitude: sentiment.magnitude,
            sentences: result.sentences.map(s => ({
                text: s.text.content,
                score: s.sentiment.score,
                magnitude: s.sentiment.magnitude
            }))
        };
    } catch (error) {
        // Якщо мова не підтримується API (наприклад, uk - українська)
        if (error.code === 3 || (error.message && error.message.includes('not supported'))) {
            console.warn('Google NLP API does not support this language. Using fallback neutral sentiment.');
            
            // Розбиваємо текст на речення для базового відображення
            const fallbackSentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
            
            return {
                score: 0.0, 
                magnitude: 0.0,
                sentences: fallbackSentences.filter(s => s.trim().length > 0).map(s => ({
                    text: s.trim(),
                    score: 0.0, // Нейтральний
                    magnitude: 0.0
                }))
            };
        }
        throw error;
    }
};

module.exports = { cleanText, analyzeSentiment };
