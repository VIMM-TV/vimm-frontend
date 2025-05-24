import defaultConfig from './default';
import environmentConfig from './environment';

/**
 * Merge default configuration with environment-specific overrides
 * @param {Object} defaultConfig - Default configuration object
 * @param {Object} overrideConfig - Configuration object with overrides
 * @returns {Object} - Merged configuration
 */
const mergeConfig = (defaultConfig, overrideConfig) => {
  const merged = { ...defaultConfig };
  
  // Only override with defined values (not undefined or null)
  Object.keys(overrideConfig).forEach(key => {
    if (typeof overrideConfig[key] === 'object' && overrideConfig[key] !== null) {
      merged[key] = mergeConfig(defaultConfig[key] || {}, overrideConfig[key]);
    } else if (overrideConfig[key] !== undefined && overrideConfig[key] !== null) {
      merged[key] = overrideConfig[key];
    }
  });
  
  return merged;
};

const config = mergeConfig(defaultConfig, environmentConfig);

export default config;