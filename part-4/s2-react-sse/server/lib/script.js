const sseStaticResponses = require('./data/mock-prompts');

/**
 * Generates an array of "tokens" (words) for a simulated AI response.
 * Picks a random response from the mock-prompts list.
 * @returns {Array} Array of strings
 */
function getLoremIpsumTokens() {
    const randomIndex = Math.floor(Math.random() * sseStaticResponses.length);
    const selectedText = sseStaticResponses[randomIndex];
    return selectedText.split(' ');
}

module.exports = { getLoremIpsumTokens };
