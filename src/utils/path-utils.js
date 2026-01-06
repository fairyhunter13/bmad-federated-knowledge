const os = require('os');
const path = require('path');

/**
 * Path utilities for BMAD Federated Knowledge System
 * Provides tilde (~) and environment variable expansion for paths
 */

/**
 * Expand tilde (~) and $HOME in a path string
 * Supports:
 * - ~/path -> /home/user/path
 * - ~user/path -> /home/user/path (on Unix systems)
 * - $HOME/path -> /home/user/path
 * - ${HOME}/path -> /home/user/path
 *
 * @param {string} inputPath - Path string that may contain tilde or $HOME
 * @returns {string} Expanded path
 */
function expandPath(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') {
    return inputPath;
  }

  let expandedPath = inputPath;
  const homeDir = os.homedir();

  // Expand ~ at the start of the path
  if (expandedPath.startsWith('~/')) {
    expandedPath = path.join(homeDir, expandedPath.slice(2));
  } else if (expandedPath === '~') {
    expandedPath = homeDir;
  } else if (expandedPath.startsWith('~')) {
    // Handle ~username format (Unix-like systems)
    // Extract username between ~ and /
    const match = expandedPath.match(/^~([^/]+)(\/.*)?$/);
    if (match) {
      const username = match[1];
      const rest = match[2] || '';

      // On Unix-like systems, try to get user's home directory
      if (process.platform !== 'win32') {
        try {
          const userHome = require('child_process')
            .execSync(`echo ~${username}`, { encoding: 'utf8' })
            .trim();
          if (userHome && !userHome.startsWith('~')) {
            expandedPath = userHome + rest;
          }
        } catch (e) {
          // If we can't resolve the username, leave it as is
        }
      }
    }
  }

  // Expand $HOME environment variable
  expandedPath = expandedPath.replace(/\$HOME\b/g, homeDir);

  // Expand ${HOME} environment variable
  expandedPath = expandedPath.replace(/\$\{HOME\}/g, homeDir);

  // Expand any other environment variables in the format $VAR or ${VAR}
  expandedPath = expandedPath.replace(/\$\{([^}]+)\}/g, (match, varName) => {
    return process.env[varName] || match;
  });

  expandedPath = expandedPath.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (match, varName) => {
    return process.env[varName] || match;
  });

  return expandedPath;
}

/**
 * Expand paths in an object recursively
 * Useful for expanding paths in configuration objects
 *
 * @param {Object} obj - Object containing path strings
 * @param {string[]} pathKeys - Array of key names that should be treated as paths
 * @returns {Object} Object with expanded paths
 */
function expandPathsInObject(obj, pathKeys = ['path', 'local_cache', 'cache_root', 'cacheDir', 'configPath', 'logDir', 'core_data', 'templates', 'workflows']) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => expandPathsInObject(item, pathKeys));
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && pathKeys.includes(key)) {
      result[key] = expandPath(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = expandPathsInObject(value, pathKeys);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Resolve a path with tilde expansion and make it absolute
 *
 * @param {string} inputPath - Path that may contain tilde
 * @returns {string} Absolute path with tilde expanded
 */
function resolveExpandedPath(inputPath) {
  const expanded = expandPath(inputPath);
  return path.resolve(expanded);
}

/**
 * Check if a path contains unexpanded tilde or environment variables
 *
 * @param {string} inputPath - Path to check
 * @returns {boolean} True if path contains unexpanded variables
 */
function hasUnexpandedVariables(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') {
    return false;
  }
  return inputPath.includes('~') || inputPath.includes('$');
}

module.exports = {
  expandPath,
  expandPathsInObject,
  resolveExpandedPath,
  hasUnexpandedVariables
};
