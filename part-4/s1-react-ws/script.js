const stocks = require('./stocks-data/stocks');

/**
 * Updates stock prices with random fluctuations and calculates change/percentage.
 * @returns {Array} Updated stocks array
 */
function getUpdatedStocks() {
    stocks.forEach(stock => {
        // Random fluctuation between -1% and +1%
        const volatility = 0.01;
        const fluctuation = (Math.random() * 2 - 1) * volatility;

        const oldPrice = stock.price;
        const changeAmount = oldPrice * fluctuation;

        stock.price = parseFloat((oldPrice + changeAmount).toFixed(2));
        stock.change = parseFloat(changeAmount.toFixed(2));
        stock.percentage = parseFloat(((stock.change / oldPrice) * 100).toFixed(2));
    });

    return stocks;
}

module.exports = { getUpdatedStocks };
