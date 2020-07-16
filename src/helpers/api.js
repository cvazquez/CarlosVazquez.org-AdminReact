// Helper functions to use in API calls

function checkAPIResponse(res) {
	if(res.ok) {
		// Check if API response is JSON
		const contentType = res.headers.get('content-type');

		if (!contentType || !contentType.includes('application/json')) {
			throw new TypeError("API response is not JSON!");
		}

		return res.json()
	} else {
		// Invalid network response from API - Server is possibly down
		throw new Error("Invalid API network response: " + res.statusText + ` (${res.status}) - Check if API is running`)
	}
}

export { checkAPIResponse };