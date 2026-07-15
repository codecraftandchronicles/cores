/**
 * Supabase client for Paint Recipes voting.
 *
 * The anon key below is intentionally public -- safe to expose in client-side
 * code. Access is enforced by Row Level Security (RLS) on the Supabase side.
 *
 * Required table (run once in Supabase SQL Editor):
 *
 *   -- Drop old table if migrating
 *   -- drop table if exists paint_votes;
 *
 *   create table paint_votes (
 *     id          uuid primary key default gen_random_uuid(),
 *     paint_code  text not null,
 *     vote_type   text not null check (vote_type in ('like', 'dislike')),
 *     session_id  text not null,
 *     voter_ip    text default '',
 *     created_at  timestamptz default now()
 *   );
 *   create index on paint_votes (paint_code);
 *   alter table paint_votes enable row level security;
 *   create policy "Allow public read" on paint_votes for select using (true);
 *
 *   Writes (insert/delete) go through SECURITY DEFINER functions instead of
 *   permissive RLS policies -- see sql/paint_votes_rls_hardening.sql.
 *   Direct INSERT/DELETE are revoked from the anon role; the anon key can only
 *   SELECT the table and EXECUTE cast_vote / retract_vote.
 */

const SUPABASE_URL  = 'https://jhuvfnczlnlgkpdqkwau.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodXZmbmN6bG5sZ2twZHFrd2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTc1MzEsImV4cCI6MjA5NzE5MzUzMX0._Kq-XDW2j1HZ0jKv-fYYVt3tIuiGdHQlpLrpfElP0sw';

const _HEADERS = {
    'apikey':        SUPABASE_ANON,
    'Authorization': `Bearer ${SUPABASE_ANON}`,
    'Content-Type':  'application/json'
};

// -- Session ID (stable per browser tab) -----------------------------------

function _getSessionId() {
    let id = sessionStorage.getItem('cores_vote_sid');
    if (!id) {
        id = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem('cores_vote_sid', id);
    }
    return id;
}

// -- Public IP (best-effort, cached) ----------------------------------------

let _cachedIP = '';

async function _getPublicIP() {
    if (_cachedIP) return _cachedIP;
    try {
        const res = await fetch('https://api.ipify.org?format=text');
        if (res.ok) _cachedIP = (await res.text()).trim();
    } catch { /* ignore -- IP will be empty */ }
    return _cachedIP;
}

// -- Supabase REST API ------------------------------------------------------

/**
 * Fetches aggregated vote counts for an array of paint codes.
 * Returns { [paintCode]: { likes: N, dislikes: N } }.
 */
async function getVoteCounts(paintCodes) {
    if (!paintCodes || paintCodes.length === 0) return {};
    const encodedCodes = paintCodes.map(code => encodeURIComponent(code)).join(',');
    const url   = `${SUPABASE_URL}/rest/v1/paint_votes?paint_code=in.(${encodedCodes})&select=paint_code,vote_type`;
    const response = await fetch(url, { headers: _HEADERS });
    if (!response.ok) throw new Error(`getVoteCounts HTTP ${response.status}`);
    const rows   = await response.json();
    const counts = {};
    for (const row of rows) {
        if (!counts[row.paint_code]) counts[row.paint_code] = { likes: 0, dislikes: 0 };
        if (row.vote_type === 'like')    counts[row.paint_code].likes++;
        if (row.vote_type === 'dislike') counts[row.paint_code].dislikes++;
    }
    return counts;
}

/**
 * Registers a single vote via the cast_vote RPC. The function validates the
 * payload and enforces one vote per session/paint. Includes voter_ip for
 * anti-spam analysis.
 */
async function registerVote(paintCode, voteType) {
    const ip  = await _getPublicIP();
    const url = `${SUPABASE_URL}/rest/v1/rpc/cast_vote`;
    const response = await fetch(url, {
        method:  'POST',
        headers: { ..._HEADERS, 'Prefer': 'return=minimal' },
        body:    JSON.stringify({
            p_paint_code: paintCode,
            p_vote_type:  voteType,
            p_session_id: _getSessionId(),
            p_voter_ip:   ip
        })
    });
    if (!response.ok) throw new Error(`registerVote HTTP ${response.status}`);
    return true;
}

/**
 * Removes this session's vote for a given paint code (un-vote) via the
 * retract_vote RPC, which is scoped to the caller's session_id.
 */
async function deleteVote(paintCode) {
    const url = `${SUPABASE_URL}/rest/v1/rpc/retract_vote`;
    const response = await fetch(url, {
        method:  'POST',
        headers: { ..._HEADERS, 'Prefer': 'return=minimal' },
        body:    JSON.stringify({
            p_paint_code: paintCode,
            p_session_id: _getSessionId()
        })
    });
    if (!response.ok) throw new Error(`deleteVote HTTP ${response.status}`);
    return true;
}
