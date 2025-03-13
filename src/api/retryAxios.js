import axios from 'axios';
import pRetry from 'p-retry';



// Reusable function for retrying Axios requests
export const retryAxios = async (url, options = {}, retries = 3, minTimeout = 2000) => {
    console.log(url);
    return pRetry(
        async () => {
            const response = await axios.get(url, options);
            return response; // Return only the data
        },
        {
            retries,
            minTimeout,
            factor: 2, // Exponential backoff: 2s → 4s → 8s
            onFailedAttempt: (error) => {
                console.warn(`Attempt ${error.attemptNumber} failed. Retrying...`);
            },
        }
    );
};
