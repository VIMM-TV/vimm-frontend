/**
 * Default configuration values for the application
 */
const defaultConfig = {
  // vimm-chat server configuration
  chat: {
    server: 'http://localhost:3001', // Default local development server
    endpoints: {
      socket: '/socket.io', // Socket.IO connection
      messages: '/api/chat/messages/:hiveAccount', // Get/post chat messages 
      config: '/api/chat/config/:hiveAccount'  // Get chat configuration
    },
    // Path for embedding the chat interface
    embedPath: '/chat/:hiveAccount'
  },
  
  // vimm-core server configuration
  core: {
    server: 'http://localhost:3000', // Default local development server
    endpoints: {
      streams: '/api/streams', // Get active streams
      streamDetails: '/api/streams/:streamId', // Get specific stream details
      auth: '/api/auth', // Authentication endpoints
      chat: '/api/chat/stream/:hiveAccount' // Chat settings for streams
    },
    // Media paths
    media: {
      hls: '/live/:streamId/index.m3u8' // HLS stream path
    }
  }
};

export default defaultConfig;