export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // In a real production app, you must validate the Steam OpenID response
    // by making a POST request back to `https://steamcommunity.com/openid/login`
    // with `openid.mode=check_authentication` and the received parameters.
    // For this MVP, we will extract the SteamID64 directly from the claimed_id.

    const claimedId = body['openid.claimed_id'] || body.claimed_id;
    
    if (!claimedId) {
      return Response.json({ error: 'Invalid OpenID response from Steam' }, { status: 400 });
    }

    // Extract SteamID64 from the claimed_id URL
    // Format: https://steamcommunity.com/openid/id/765611980XXXXX
    const match = claimedId.match(/\/id\/(\d+)$/);
    if (!match || match.length < 2) {
      return Response.json({ error: 'Could not extract SteamID' }, { status: 400 });
    }

    const steamId64 = match[1];

    // Convert SteamID64 to 32-bit Account ID for OpenDota
    // account_id = steamid64 - 76561197960265728
    const accountId = BigInt(steamId64) - BigInt('76561197960265728');

    return Response.json({ 
      steamId64,
      accountId: accountId.toString()
    });
  } catch (error) {
    console.error('Steam Auth Error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
