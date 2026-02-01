/**
 * Clash of Clans MCP Server for Cloudflare Workers
 * ES Module format with proper exports
 */

// Clash of Clans API base URL
const COC_API_BASE = 'https://api.clashofclans.com/v1';

/**
 * Helper function to format player/clan tags
 */
function formatTag(tag) {
  if (!tag) return null;
  tag = tag.trim().toUpperCase();
  if (!tag.startsWith('#')) {
    tag = '#' + tag;
  }
  return encodeURIComponent(tag);
}

/**
 * Helper function to make API calls to Clash of Clans API
 */
async function fetchFromClashAPI(endpoint, apiKey, env) {
  // Configuration for your VPS Relay
  const USE_PROXY = true; // Set to true after setting up your VPS
  // Use environment variable for Proxy URL (e.g. https://xxxx.ngrok-free.app/relay)
  const PROXY_URL = env.PROXY_URL || "http://localhost:3000/relay"; 
  const RELAY_SECRET = env.RELAY_SECRET || "make-up-a-secure-password-here";

  const targetUrl = `${COC_API_BASE}${endpoint}`;
  const fetchUrl = USE_PROXY ? `${PROXY_URL}?url=${encodeURIComponent(targetUrl)}` : targetUrl;

  const response = await fetch(fetchUrl, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      ...(USE_PROXY ? { 'x-relay-auth': RELAY_SECRET } : {})
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Clash API Error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Cache helper functions
 */
async function getCachedData(env, key) {
  try {
    const cached = await env.CLASH_DATA.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

async function setCachedData(env, key, data, ttl = 300) {
  try {
    await env.CLASH_DATA.put(key, JSON.stringify(data), {
      expirationTtl: ttl,
    });
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * CORS headers for responses
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * Handle CORS preflight requests
 */
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Create JSON response with CORS headers
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

/**
 * Error response helper
 */
function errorResponse(message, status = 500) {
  return jsonResponse({ error: message }, status);
}

/**
 * Record player stats to D1 Database
 */
async function recordPlayerStats(tag, data, env) {
  if (!env.coc_stats) {
    console.log('D1 binding coc_stats not found');
    return;
  }

  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Extract stats from achievements (Lifetime loot)
  const gold = data.achievements.find(a => a.name === 'Gold Grab')?.value || 0;
  const elixir = data.achievements.find(a => a.name === 'Elixir Escapade')?.value || 0;
  const darkElixir = data.achievements.find(a => a.name === 'Heroic Heist')?.value || 0;
  const trophies = data.trophies || 0;

  try {
    // Check if entry exists for today
    const exists = await env.coc_stats.prepare(
      'SELECT 1 FROM player_stats WHERE tag = ? AND date = ?'
    ).bind(tag, date).first();

    if (!exists) {
      await env.coc_stats.prepare(
        'INSERT INTO player_stats (tag, date, gold, elixir, dark_elixir, trophies) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(tag, date, gold, elixir, darkElixir, trophies).run();
    }
  } catch (e) {
    console.error('Failed to record stats:', e);
  }
}

/**
 * Get player history from D1
 */
async function getPlayerHistory(tag, env) {
  if (!env.coc_stats) return [];

  const formattedTag = formatTag(tag);

  const { results } = await env.coc_stats.prepare(
    'SELECT * FROM player_stats WHERE tag = ? ORDER BY date ASC'
  ).bind(formattedTag).all();
  return results || [];
}

/**
 * Get player information
 */
async function getPlayer(tag, apiKey, env, ctx) {
  const formattedTag = formatTag(tag);
  if (!formattedTag) {
    throw new Error('Invalid player tag');
  }

  const cacheKey = `player:${formattedTag}`;
  
  // Check cache first
  const cached = await getCachedData(env, cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const data = await fetchFromClashAPI(`/players/${formattedTag}`, apiKey, env);
  
  // Cache for 5 minutes
  await setCachedData(env, cacheKey, data, 300);

  // Record stats to DB (fire and forget to not slow down response)
  if (ctx && typeof ctx.waitUntil === 'function') {
    ctx.waitUntil(recordPlayerStats(formattedTag, data, env));
  }
  
  return data;
}

/**
 * Get clan information
 */
async function getClan(tag, apiKey, env) {
  const formattedTag = formatTag(tag);
  if (!formattedTag) {
    throw new Error('Invalid clan tag');
  }

  const cacheKey = `clan:${formattedTag}`;
  
  // Check cache first
  const cached = await getCachedData(env, cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const data = await fetchFromClashAPI(`/clans/${formattedTag}`, apiKey, env);
  
  // Cache for 10 minutes
  await setCachedData(env, cacheKey, data, 600);
  
  return data;
}

/**
 * Get current war information
 */
async function getCurrentWar(tag, apiKey, env) {
  const formattedTag = formatTag(tag);
  if (!formattedTag) {
    throw new Error('Invalid clan tag');
  }

  const cacheKey = `war:${formattedTag}`;
  
  // Check cache first
  const cached = await getCachedData(env, cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const data = await fetchFromClashAPI(`/clans/${formattedTag}/currentwar`, apiKey, env);
  
  // Cache for 2 minutes (wars are dynamic)
  await setCachedData(env, cacheKey, data, 120);
  
  return data;
}

/**
 * Get war log
 */
async function getWarLog(tag, apiKey, env, limit = 10) {
  const formattedTag = formatTag(tag);
  if (!formattedTag) {
    throw new Error('Invalid clan tag');
  }

  const cacheKey = `warlog:${formattedTag}:${limit}`;
  
  // Check cache first
  const cached = await getCachedData(env, cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const data = await fetchFromClashAPI(`/clans/${formattedTag}/warlog?limit=${limit}`, apiKey, env);
  
  // Cache for 30 minutes
  await setCachedData(env, cacheKey, data, 1800);
  
  return data;
}

/**
 * Get clan war league group
 */
async function getClanWarLeagueGroup(tag, apiKey, env) {
  const formattedTag = formatTag(tag);
  if (!formattedTag) {
    throw new Error('Invalid clan tag');
  }

  const cacheKey = `cwl:${formattedTag}`;
  
  // Check cache first
  const cached = await getCachedData(env, cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const data = await fetchFromClashAPI(`/clans/${formattedTag}/currentwar/leaguegroup`, apiKey, env);
  
  // Cache for 1 hour
  await setCachedData(env, cacheKey, data, 3600);
  
  return data;
}

/**
 * Get clan war league war
 */
async function getClanWarLeagueWar(warTag, apiKey, env) {
  const formattedTag = formatTag(warTag);
  if (!formattedTag) {
    throw new Error('Invalid war tag');
  }

  const cacheKey = `cwlwar:${formattedTag}`;
  
  // Check cache first
  const cached = await getCachedData(env, cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const data = await fetchFromClashAPI(`/clanwarleagues/wars/${formattedTag}`, apiKey, env);
  
  // Cache for 1 hour
  await setCachedData(env, cacheKey, data, 3600);
  
  return data;
}

/**
 * Get clan war league war by round (helper logic)
 */
async function getClanWarLeagueWarByRound(clanTag, round, apiKey, env) {
  // 1. Get the league group
  const group = await getClanWarLeagueGroup(clanTag, apiKey, env);
  
  // 2. Validate round
  const roundIndex = round - 1;
  if (!group.rounds || !group.rounds[roundIndex]) {
    throw new Error(`Round ${round} not found`);
  }

  const warTags = group.rounds[roundIndex].warTags;
  if (!warTags || warTags.length === 0) {
    throw new Error(`No wars found for round ${round}`);
  }

  // 3. Find the war involving our clan
  const targetTagEncoded = formatTag(clanTag);
  
  for (const tag of warTags) {
    if (tag === '#0') continue;
    try {
      // Reuse existing function (which handles caching)
      const war = await getClanWarLeagueWar(tag, apiKey, env);
      
      // Check if this war involves our clan
      if (formatTag(war.clan.tag) === targetTagEncoded || 
          formatTag(war.opponent.tag) === targetTagEncoded) {
        return war;
      }
    } catch (e) {
      // Continue searching if one war fetch fails
    }
  }
  
  throw new Error('Clan war not found in this round');
}

/**
 * Get capital raid seasons
 */
async function getCapitalRaidSeasons(tag, apiKey, env, limit = 10, before = null, after = null) {
  const formattedTag = formatTag(tag);
  if (!formattedTag) {
    throw new Error('Invalid clan tag');
  }

  const cacheKey = `raids:${formattedTag}:${limit}:${before || ''}:${after || ''}`;
  
  // Check cache first
  const cached = await getCachedData(env, cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  let query = `limit=${limit}`;
  if (before) query += `&before=${encodeURIComponent(before)}`;
  if (after) query += `&after=${encodeURIComponent(after)}`;

  const data = await fetchFromClashAPI(`/clans/${formattedTag}/capitalraidseasons?${query}`, apiKey, env);
  
  // Cache for 1 hour
  await setCachedData(env, cacheKey, data, 3600);
  
  return data;
}

/**
 * Analyze current war using LLM
 * Requires [ai] binding in wrangler.toml
 */
async function analyzeCurrentWar(tag, apiKey, env) {
  if (!env.AI) {
    throw new Error('Cloudflare AI binding (env.AI) not configured');
  }

  const warData = await getCurrentWar(tag, apiKey, env);

  const prompt = `Please analyze the current clan war for clan ${tag}. Include:

1. War overview (clan vs opponent, size, start/end time)
2. Current war status (preparation, in war, ended)
3. Current score comparison (stars and destruction percentage)
4. Attack statistics for both clans (attacks used, average stars)
5. Remaining attacks and potential maximum stars
6. Best performing members so far
7. Town Hall level distribution comparison
8. Strategic recommendations based on the current situation

If the war is in preparation phase, focus on the matchup analysis and strategic recommendations based on the lineup.

War Data:
${JSON.stringify(warData)}`;

  return await env.AI.run('@cf/meta/llama-3-8b-instruct', {
    messages: [
      { role: 'system', content: 'You are a Clash of Clans expert assistant.' },
      { role: 'user', content: prompt }
    ]
  });
}

/**
 * Helper to summarize player data to reduce token count
 */
function summarizePlayer(data) {
  if (!data) return null;
  return {
    name: data.name,
    tag: data.tag,
    townHallLevel: data.townHallLevel,
    expLevel: data.expLevel,
    trophies: data.trophies,
    bestTrophies: data.bestTrophies,
    warStars: data.warStars,
    attackWins: data.attackWins,
    defenseWins: data.defenseWins,
    clan: data.clan ? { name: data.clan.name, tag: data.clan.tag, level: data.clan.clanLevel } : null,
    league: data.league ? { name: data.league.name } : null,
    heroes: data.heroes?.map(h => ({ name: h.name, level: h.level, maxLevel: h.maxLevel })),
    troops: data.troops?.filter(t => t.village === 'home').map(t => ({ name: t.name, level: t.level, maxLevel: t.maxLevel })),
    spells: data.spells?.map(s => ({ name: s.name, level: s.level, maxLevel: s.maxLevel }))
  };
}

/**
 * Helper to summarize clan data to reduce token count
 */
function summarizeClan(data) {
  if (!data) return null;
  return {
    name: data.name,
    tag: data.tag,
    clanLevel: data.clanLevel,
    members: data.members, // Just the count
    type: data.type,
    warWins: data.warWins,
    warLosses: data.warLosses,
    warTies: data.warTies,
    isWarLogPublic: data.isWarLogPublic,
    description: data.description
  };
}

/**
 * Helper to summarize war data to reduce token count
 */
function summarizeWar(data) {
  if (!data || data.state === 'notInWar') return { state: 'notInWar' };
  return {
    state: data.state,
    teamSize: data.teamSize,
    startTime: data.startTime,
    endTime: data.endTime,
    clan: {
      name: data.clan.name,
      tag: data.clan.tag,
      stars: data.clan.stars,
      destructionPercentage: data.clan.destructionPercentage,
      attacks: data.clan.attacks
    },
    opponent: {
      name: data.opponent.name,
      tag: data.opponent.tag,
      stars: data.opponent.stars,
      destructionPercentage: data.opponent.destructionPercentage
    }
  };
}

/**
 * Call Anthropic Claude API
 */
async function callClaude(messages, systemPrompt, env) {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured in worker environment');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API Error: ${errText}`);
  }

  const data = await response.json();
  return { response: data.content[0].text };
}

/**
 * Handle specific analysis requests using Claude
 */
async function handleAnalysisRequest(body, apiKey, env, ctx) {
  const { action, playerTag, clanTag, messages } = body;
  let systemPrompt = "You are a Clash of Clans expert assistant. Use Markdown to format your response.";
  let userContent = "";
  
  // 1. Handle specific analysis actions (Ported from index.js)
  if (action === 'analyze-player') {
    const data = await getPlayer(playerTag, apiKey, env, ctx);
    const summary = summarizePlayer(data);
    userContent = `Please analyze the Clash of Clans player with tag ${playerTag}. Include their town hall level, trophies, and notable achievements. Suggest potential areas for improvement based on their stats.\n\nPlayer Data:\n${JSON.stringify(summary, null, 2)}`;
  
  } else if (action === 'analyze-clan') {
    const data = await getClan(clanTag, apiKey, env);
    const summary = summarizeClan(data);
    userContent = `Please analyze the Clash of Clans clan with tag ${clanTag}. Include information about:
1. Basic clan stats (level, members, war record)
2. Leadership composition and activity
3. Member breakdown by Town Hall levels
4. Trophy range and league standings
5. Clan Capital development
6. War performance indicators
7. Overall clan activity (donations, etc.)
8. Recommendations for potential applicants
9. Comparison to typical clans of similar level

Based on this data, provide an overall assessment of the clan's strengths and potential areas for improvement.\n\nClan Data:\n${JSON.stringify(summary, null, 2)}`;

  } else if (action === 'analyze-current-war') {
    const data = await getCurrentWar(clanTag, apiKey, env);
    const summary = summarizeWar(data);
    userContent = `Please analyze the current clan war for clan ${clanTag}. Include:
1. War overview (clan vs opponent, size, start/end time)
2. Current war status (preparation, in war, ended)
3. Current score comparison (stars and destruction percentage)
4. Attack statistics for both clans (attacks used, average stars)
5. Remaining attacks and potential maximum stars
6. Best performing members so far
7. Town Hall level distribution comparison
8. Strategic recommendations based on the current situation

If the war is in preparation phase, focus on the matchup analysis and strategic recommendations based on the lineup.\n\nWar Data:\n${JSON.stringify(summary, null, 2)}`;

  } else if (action === 'analyze-war-log') {
    const data = await getWarLog(clanTag, apiKey, env, 10);
    userContent = `Please analyze the war log for clan ${clanTag} using the last 10 wars. Include:
1. Overall win-loss record and win percentage
2. Average stars per war
3. Average destruction percentage
4. Performance trends
5. Recommendations for improving war performance\n\nWar Log Data:\n${JSON.stringify(data, null, 2)}`;

  } else {
    // Default Chat Mode
    // If it's a general chat, we pass the conversation history
    // We can optionally inject a small player summary for context if available
    if (playerTag) {
      try {
        const p = await getPlayer(playerTag, apiKey, env, ctx);
        systemPrompt += `\n\nCurrent User Context: ${p.name} (TH${p.townHallLevel})`;
      } catch (e) {}
    }
    return await callClaude(messages, systemPrompt, env);
  }

  // For specific actions, we start a fresh conversation with the specific prompt
  return await callClaude([{ role: 'user', content: userContent }], systemPrompt, env);
}

/**
 * Main request handler
 */
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const apiKey = env.CLASH_API_KEY;

  if (!apiKey) {
    return errorResponse('API key not configured', 500);
  }

  // Health check endpoint
  if (path === '/health') {
    return jsonResponse({
      status: 'ok',
      message: 'Clash of Clans MCP Server',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    // Get player
    if (path === '/chat' && request.method === 'POST') {
      const body = await request.json();
      const { messages, action } = body;
      
      if (!action && (!messages || !Array.isArray(messages))) {
        return errorResponse('Messages array is required', 400);
      }

      const response = await handleAnalysisRequest(body, apiKey, env, ctx);
      return jsonResponse(response);
    }

    // Get player (GET)
    if (path === '/get-player') {
      const tag = url.searchParams.get('tag');
      if (!tag) {
        return errorResponse('Player tag is required', 400);
      }
      const data = await getPlayer(tag, apiKey, env, ctx);
      return jsonResponse(data);
    }

    // Get player history
    if (path === '/get-player-history') {
      const tag = url.searchParams.get('tag');
      if (!tag) {
        return errorResponse('Player tag is required', 400);
      }
      const data = await getPlayerHistory(tag, env);
      return jsonResponse(data);
    }

    // Get clan
    if (path === '/get-clan') {
      const tag = url.searchParams.get('tag');
      if (!tag) {
        return errorResponse('Clan tag is required', 400);
      }
      const data = await getClan(tag, apiKey, env);
      return jsonResponse(data);
    }

    // Get current war
    if (path === '/get-current-war') {
      const tag = url.searchParams.get('tag');
      if (!tag) {
        return errorResponse('Clan tag is required', 400);
      }
      const data = await getCurrentWar(tag, apiKey, env);
      return jsonResponse(data);
    }

    // Get war log
    if (path === '/get-war-log') {
      const tag = url.searchParams.get('tag');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      if (!tag) {
        return errorResponse('Clan tag is required', 400);
      }
      const data = await getWarLog(tag, apiKey, env, limit);
      return jsonResponse(data);
    }

    // Get CWL group
    if (path === '/clan-war-league-info') {
      const tag = url.searchParams.get('tag');
      if (!tag) {
        return errorResponse('Clan tag is required', 400);
      }
      const data = await getClanWarLeagueGroup(tag, apiKey, env);
      return jsonResponse(data);
    }

    // Get CWL war
    if (path === '/clan-war-league-war') {
      const warTag = url.searchParams.get('warTag');
      const clanTag = url.searchParams.get('clanTag');
      const round = url.searchParams.get('round');

      if (warTag) {
        const data = await getClanWarLeagueWar(warTag, apiKey, env);
        return jsonResponse(data);
      }
      if (clanTag && round) {
        const data = await getClanWarLeagueWarByRound(clanTag, parseInt(round), apiKey, env);
        return jsonResponse(data);
      }
      return errorResponse('War tag OR (clanTag and round) is required', 400);
    }

    // Get capital raids
    if (path === '/get-capital-raids') {
      const tag = url.searchParams.get('tag');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const before = url.searchParams.get('before');
      const after = url.searchParams.get('after');

      if (!tag) {
        return errorResponse('Clan tag is required', 400);
      }
      const data = await getCapitalRaidSeasons(tag, apiKey, env, limit, before, after);
      return jsonResponse(data);
    }

    // Analyze current war
    if (path === '/analyze-current-war') {
      const tag = url.searchParams.get('tag');
      if (!tag) {
        return errorResponse('Clan tag is required', 400);
      }
      const data = await analyzeCurrentWar(tag, apiKey, env);
      return jsonResponse(data);
    }

    // load the dashboard static assets if no path matched
    return env.ASSETS.fetch(request);

  } catch (error) {
    console.error('Request error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

/**
 * Worker export - ES Module format
 */
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // Handle actual request
    return handleRequest(request, env, ctx);
  },
};