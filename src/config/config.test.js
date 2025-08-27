import config from './index';

describe('Configuration', () => {
  test('should use HTTP instead of HTTPS for chat server', () => {
    expect(config.chat.server).toBe('http://vimmcore.webhop.me');
    expect(config.chat.server).not.toContain('https://');
    expect(config.chat.server).not.toContain(':4443');
  });

  test('should use HTTP instead of HTTPS for core server', () => {
    expect(config.core.server).toBe('http://vimmcore.webhop.me');
    expect(config.core.server).not.toContain('https://');
  });

  test('should generate proper URLs for player and chat', () => {
    const username = 'testuser';
    
    // Test player URL generation (as used in WatchPage.js and MainContent.js)
    const playerUrl = `${config.core.server}/player.html?user=${encodeURIComponent(username)}`;
    expect(playerUrl).toBe('http://vimmcore.webhop.me/player.html?user=testuser');
    
    // Test chat URL generation (as used in WatchPage.js)
    const chatUrl = `${config.chat.server}${config.chat.embedPath.replace(':hiveAccount', encodeURIComponent(username))}`;
    expect(chatUrl).toBe('http://vimmcore.webhop.me/chat/testuser');
  });

  test('should generate proper API endpoint URLs', () => {
    // Test streams endpoint (as used in App.js)
    const streamsUrl = config.core.server + config.core.endpoints.streams;
    expect(streamsUrl).toBe('http://vimmcore.webhop.me/api/streams');
  });
});