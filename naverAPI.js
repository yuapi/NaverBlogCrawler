const axios = require('axios');
const { client_id, client_secret } = require('./config.json');
const { log } = require('./logger.js')

async function searchBlog(query, display=100, start=1, sort='sim') {
	// Arguments value check
	if (!query) return console.log("naverAPI.js:blogGET() No quert input.");
	if (display < 10 || display > 100) return log("naverAPI.js:blogGET() display value error.");
	if (start < 1 || start > 1000) return log("naverAPI.js:blogGET() start value error.");
	if (sort != 'sim' && sort != 'date') return log("naverAPI.js:blogGET() sort value error.");

	return await apiRequest('/search/blog', {
		query: query,
		display: display,
		start: start,
		sort: sort
	})
}

async function apiRequest(url, params, method='get') {
	if (!url) return log("naverAPI.js:apiRequest() No url address.")
	if (!params) return log("naverAPI.js:apiRequest() No params input.")

	try {
		const response = await axios.get(url, {
			method: method,
			baseURL: 'https://openapi.naver.com/v1',
			headers: {
				'X-Naver-Client-Id':client_id,
				'X-Naver-Client-Secret': client_secret
			},
			params: params
		});

		return { error: null, response: response, data: response.data };
	}
	catch (error) {
		return { error: error, response: null, data: null };
	}
}

module.exports = { searchBlog };