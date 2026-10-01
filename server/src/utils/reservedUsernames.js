// List of system-reserved usernames that cannot be registered
const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'root',
  'system',
  'skillx',
  'skillx_admin',
  'support',
  'moderator',
  'mod',
  'security',
  'help',
  'official',
  'team',
  'staff',
  'billing',
  'bot',
  'api',
  'graphql',
  'settings',
  'dashboard',
  'explore',
  'discover',
  'passport',
  'studio',
  'privacy',
  'terms',
  'auth',
  'login',
  'register'
]);

function isUsernameReserved(username) {
  if (!username) return true;
  const clean = username.toLowerCase().trim().replace(/^@/, '');
  return RESERVED_USERNAMES.has(clean);
}

module.exports = {
  RESERVED_USERNAMES,
  isUsernameReserved
};
