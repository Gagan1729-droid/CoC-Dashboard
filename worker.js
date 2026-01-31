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
async function fetchFromClashAPI(endpoint, apiKey) {
  const response = await fetch(`${COC_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
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
 * Get player information
 */
async function getPlayer(tag, apiKey, env) {
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
  const data = await fetchFromClashAPI(`/players/${formattedTag}`, apiKey);
  
  // Cache for 5 minutes
  await setCachedData(env, cacheKey, data, 300);
  
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
  const data = await fetchFromClashAPI(`/clans/${formattedTag}`, apiKey);
  
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
  const data = await fetchFromClashAPI(`/clans/${formattedTag}/currentwar`, apiKey);
  
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
  const data = await fetchFromClashAPI(`/clans/${formattedTag}/warlog?limit=${limit}`, apiKey);
  
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
  const data = await fetchFromClashAPI(`/clans/${formattedTag}/currentwar/leaguegroup`, apiKey);
  
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
  const data = await fetchFromClashAPI(`/clanwarleagues/wars/${formattedTag}`, apiKey);
  
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

  const data = await fetchFromClashAPI(`/clans/${formattedTag}/capitalraidseasons?${query}`, apiKey);
  
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
 * Main request handler
 */
async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const apiKey = env.CLASH_API_KEY;

  if (!apiKey) {
    return errorResponse('API key not configured', 500);
  }

  // Health check endpoint
  if (path === '/health' || path === '/') {
    return jsonResponse({
      status: 'ok',
      message: 'Clash of Clans MCP Server',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    // Get player
    if (path === '/get-player') {
      const tag = url.searchParams.get('tag');
      if (!tag) {
        return errorResponse('Player tag is required', 400);
      }
      const data = await getPlayer(tag, apiKey, env);
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

    // Route not found
    return errorResponse('Endpoint not found', 404);

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
    return handleRequest(request, env);
  },
};