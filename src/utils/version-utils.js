/**
 * Version utilities for bmad-federated-knowledge CLI
 * Generates dynamic version string with package version, build date, and commit hash
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Get the current git commit hash (short)
 * @returns {string} Short commit hash or 'unknown' if not in a git repo
 */
function getCommitHash() {
  try {
    const hash = execSync('git rev-parse --short HEAD', {
      cwd: path.join(__dirname, '..', '..'),
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    return hash;
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Get the current git branch name
 * @returns {string} Branch name or 'unknown' if not in a git repo
 */
function getBranchName() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: path.join(__dirname, '..', '..'),
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    return branch;
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Get the package version from package.json
 * @returns {string} Package version
 */
function getPackageVersion() {
  try {
    const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    return '0.0.0';
  }
}

/**
 * Get the build date in YYYYMMDD format
 * @returns {string} Build date
 */
function getBuildDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Get the full version string with all metadata
 * Format: {version}+{date}.{commitHash}
 * Example: 1.0.4+20260119.7d70e17
 * @returns {string} Full version string
 */
function getFullVersion() {
  const version = getPackageVersion();
  const date = getBuildDate();
  const commit = getCommitHash();
  
  return `${version}+${date}.${commit}`;
}

/**
 * Get detailed version information object
 * @returns {object} Version details
 */
function getVersionInfo() {
  return {
    version: getPackageVersion(),
    buildDate: getBuildDate(),
    commitHash: getCommitHash(),
    branch: getBranchName(),
    fullVersion: getFullVersion()
  };
}

module.exports = {
  getCommitHash,
  getBranchName,
  getPackageVersion,
  getBuildDate,
  getFullVersion,
  getVersionInfo
};
