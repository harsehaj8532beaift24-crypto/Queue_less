import os from 'os';

/**
 * Resolves the primary local IPv4 address for mobile/LAN access
 */
export function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  const candidateIps = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    const lowerName = name.toLowerCase();
    // Exclude virtual and pseudo adapters (WSL, Hyper-V, VirtualBox, VMware, Loopback)
    if (
      lowerName.includes('virtual') ||
      lowerName.includes('wsl') ||
      lowerName.includes('hyper-v') ||
      lowerName.includes('vethernet') ||
      lowerName.includes('vmware') ||
      lowerName.includes('vbox') ||
      lowerName.includes('pseudo')
    ) {
      continue;
    }

    for (const net of addrs) {
      if (net.family === 'IPv4' && !net.internal) {
        // Prioritize Wi-Fi and physical LAN adapters
        if (
          lowerName.includes('wi-fi') ||
          lowerName.includes('wireless') ||
          lowerName.includes('wlan') ||
          lowerName.includes('ethernet') ||
          lowerName.includes('eth')
        ) {
          return net.address;
        }
        candidateIps.push(net.address);
      }
    }
  }

  if (candidateIps.length > 0) {
    return candidateIps[0];
  }

  return 'localhost';
}

/**
 * Returns the configurable frontend base URL.
 * Prioritizes FRONTEND_URL or CLIENT_URL if it is an explicit HTTPS deployment or tunnel.
 * In local development, dynamically resolves the active local IPv4 address so it never becomes stale.
 */
export function getFrontendBaseUrl() {
  const configured = (process.env.FRONTEND_URL || process.env.CLIENT_URL || '').trim().replace(/\/+$/, '');

  // 1. If an explicit public HTTPS URL or tunnel is configured, use it directly
  if (configured && configured.startsWith('https://')) {
    return configured;
  }

  // 2. In local development, dynamically resolve the active local IPv4 address
  const localIp = getLocalIpAddress();
  const port = process.env.FRONTEND_PORT || 5173;

  if (localIp && localIp !== 'localhost') {
    return `http://${localIp}:${port}`;
  }

  if (configured) {
    return configured;
  }

  return `http://localhost:${port}`;
}

/**
 * Builds a mobile-scannable token details URL for QR code generation
 */
export function buildTokenUrl(tokenNumber, qrTokenHash) {
  const baseUrl = getFrontendBaseUrl();
  const tokenParam = encodeURIComponent(tokenNumber);
  const hashParam = qrTokenHash ? `?hash=${encodeURIComponent(qrTokenHash)}` : '';
  return `${baseUrl}/token/${tokenParam}${hashParam}`;
}
