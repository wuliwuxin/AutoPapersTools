/**
 * Test script to diagnose arXiv API issues
 */

async function testArxivAPI() {
  console.log("Testing arXiv API...\n");

  // Test 1: Basic API call
  console.log("Test 1: Basic arXiv API call");
  const baseUrl = "http://export.arxiv.org/api/query";
  const params = new URLSearchParams({
    search_query: 'all:"time series" AND submittedDate:[202412010000 TO 202412131000]',
    start: "0",
    max_results: "5",
    sortBy: "submittedDate",
    sortOrder: "descending",
  });

  const url = `${baseUrl}?${params}`;
  console.log("URL:", url);
  console.log("");

  try {
    const response = await fetch(url);
    console.log("Status:", response.status);
    console.log("Content-Type:", response.headers.get("content-type"));
    console.log("");

    if (!response.ok) {
      console.error("API Error:", response.statusText);
      return;
    }

    const text = await response.text();
    console.log("Response length:", text.length);
    console.log("First 500 chars:");
    console.log(text.substring(0, 500));
    console.log("\n");

    // Test 2: Parse XML
    console.log("Test 2: Parsing XML response");
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    let count = 0;

    while ((match = entryRegex.exec(text)) !== null) {
      count++;
      const entry = match[1];

      // Extract title
      const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(entry);
      const title = titleMatch ? titleMatch[1].trim() : "N/A";

      // Extract ID
      const idMatch = /<id>([\s\S]*?)<\/id>/.exec(entry);
      const id = idMatch ? idMatch[1].trim() : "N/A";

      // Extract published date
      const pubMatch = /<published>([\s\S]*?)<\/published>/.exec(entry);
      const published = pubMatch ? pubMatch[1].trim() : "N/A";

      console.log(`\nEntry ${count}:`);
      console.log("  Title:", title.substring(0, 80));
      console.log("  ID:", id);
      console.log("  Published:", published);

      if (count >= 3) break;
    }

    console.log(`\nTotal entries found: ${count}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

testArxivAPI();
