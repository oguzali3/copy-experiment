export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function fetchWithRetry(url: string, retries = 3, initialDelay = 1000) {
  let delay = initialDelay;
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} for URL: ${url}`);
      const response = await fetch(url);
      
      if (response.ok) {
        return response;
      }
      
      // If we hit rate limit or server error, wait and retry
      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        console.log(`Rate limited or server error (${response.status}), attempt ${i + 1} of ${retries}. Waiting ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      
      // For other status codes, throw error immediately
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    } catch (error) {
      console.error(`Fetch attempt ${i + 1} failed:`, error);
      
      if (i === retries - 1) {
        throw new Error(`Failed after ${retries} retries: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  
  throw new Error(`Failed after ${retries} retries`);
}