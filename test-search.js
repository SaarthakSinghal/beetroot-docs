// Simulates what fumadocs search does
async function simulateSearch() {
  console.log("=== SEARCH REQUEST FLOW ===\n");
  
  // 1. User types "goal" (debounced, so only fires after user stops typing)
  console.log("1. User types 'goal' in search box");
  console.log("   → Debounced for 300ms\n");
  
  // 2. Network request
  console.log("2. Browser sends request:");
  console.log("   GET /beetroot/api/search?query=goal\n");
  
  // 3. Serverless function wakes up
  console.log("3. Vercel Edge/Serverless function starts:");
  console.log("   → Cold start: ~200-500ms (first time)");
  console.log("   → Warm start: ~10-50ms (subsequent times)\n");
  
  // 4. Build search index
  console.log("4. Server builds search index:");
  const pages = 19;
  console.log(`   → Reads metadata for ${pages} MDX files`);
  console.log("   → Processes titles, descriptions, content");
  console.log("   → Creates in-memory search index\n");
  
  // 5. Search execution
  console.log("5. Orama search algorithm:");
  console.log("   → Searches through all pages");
  console.log("   → Ranks results by relevance");
  console.log("   → Returns top matches\n");
  
  // 6. Response
  console.log("6. Server returns JSON:");
  console.log("   [{"title": "Goal Setting", "url": "/docs/..."}, ...]\n");
  
  // 7. Function shuts down
  console.log("7. Serverless function terminates");
  console.log("   → Frees memory\n");
  
  console.log("=== COST ANALYSIS ===");
  console.log("Every keystroke (debounced) = 1 serverless invocation");
  console.log("100 users × 10 searches/day = 1,000 invocations/day");
  console.log("Vercel Free tier: 100K invocations/month");
  console.log("Your usage: ~30K invocations/month (well within limits)\n");
}

simulateSearch();
