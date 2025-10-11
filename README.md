# VIMM Frontend

VIMM Frontend is a reference implementation of a streaming platform built on the VIMM ecosystem. It demonstrates the integration of VIMM Core streaming capabilities and VIMM Chat functionality while implementing core Hive social features.

## VIMM Ecosystem

VIMM Frontend is part of a larger ecosystem of components:

- [VIMM Core](https://github.com/VIMM-TV/vimm-core) - Core streaming server with multi-protocol support
- [VIMM Chat](https://github.com/VIMM-TV/vimm-chat) - Chat server and implementation for real-time stream interaction
- **VIMM Frontend** (this repository) - Reference frontend application integrating all VIMM components

## Planned Features

### Stream Viewer
- Multi-quality stream playback
- Adaptive bitrate selection
- Stream health indicators
- Viewer count and statistics
- Full-screen and theater modes

### Broadcaster Dashboard
- Stream key management
- Stream settings configuration
- Real-time stream statistics
- Quality profile selection

### Chat Integration
- Real-time chat interface
- Emote support
- User badges and roles
- Moderation actions
- Chat overlay for streams

### Hive Integration
- Hive authentication
- Profile management
- Content commenting
- Post upvoting/downvoting
- Wallet integration

### User Interface
- Responsive design
- Mobile-friendly interface

## Architecture

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.js       # Top navigation bar
│   ├── Sidebar.js      # Live streams sidebar
│   ├── MainContent.js  # Main content area with featured stream
│   ├── auth/           # Authentication and logged in components
│   │   ├── HiveLogin.js
│   │   └── FollowButton.js
│   └── CustomPlayer/   # Video player component
│       └── CustomPlayer.js
├── pages/              # Application pages
│   ├── Directory.js    # Stream directory/browse page
│   ├── Following.js    # Following page for logged-in users
│   ├── WatchPage.js    # Individual stream watch page
│   ├── StreamKeyGenerator.js  # Stream key management
│   ├── ChannelSettings.js     # Channel configuration
│   └── FAQ.js
├── services/           # API integration services
│   ├── hiveAuth.js
│   ├── followService.js
│   └── channelSettingsService.js
├── contexts/           # React context providers
│   └── AuthContext.js  # Authentication state management
└── config/             # Configuration files
    ├── default.js      # Default configuration
    ├── environment.js  # Environment-specific config
    └── index.js
```

## Development Status

This project is currently in early development. We are actively working on the core streaming interface and integration with VIMM Core and VIMM Chat components.

## Technology Stack

- React 19
- React Router v6
- HLS.js for video playback
- Axios for HTTP requests
- CSS3 for styling

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- [GitHub Issues](https://github.com/VIMM-TV/vimm-frontend/issues)

---

Powered by the Hive blockchain. Built by VIMM.
