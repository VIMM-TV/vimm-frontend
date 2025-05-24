/**
 * Environment-specific configuration that overrides defaults
 */
const environmentConfig = {
  chat: {
    server: process.env.REACT_APP_VIMM_CHAT_SERVER
  },
  core: {
    server: process.env.REACT_APP_VIMM_CORE_SERVER
  }
};

export default environmentConfig;