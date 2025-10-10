function getBaseUrl() {
    return window.location.protocol + '//' + window.location.host;
}

// Existing code...

const baseUrl = getBaseUrl();

// Replace all hardcoded URLs
const tokenUrl = `${baseUrl}/api/hls/token/${streamIdToFetch}`;
const refreshTokenUrl = `${baseUrl}/api/hls/refresh-token`;
const streamsPathUrl = `${baseUrl}/api/streams/path/${encodeURIComponent(username)}?type=hiveAccount`;
const liveStreamUrl = `${baseUrl}/live/${data.streamId}/master.m3u8`;

// Continue with the rest of the code...