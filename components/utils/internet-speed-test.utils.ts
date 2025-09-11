// Import types but avoid importing the main module for better testability

export interface SpeedTestResult {
  download?: number;
  upload?: number;
  latency?: number;
  jitter?: number;
  downLoadedLatency?: number;
  downLoadedJitter?: number;
  upLoadedLatency?: number;
  upLoadedJitter?: number;
  packetLoss?: number;
}

export interface SpeedTestStatus {
  isRunning: boolean;
  isFinished: boolean;
  currentResults?: SpeedTestResult;
  error?: string;
}

export function formatSpeed(bps?: number): string {
  if (typeof bps !== 'number' || bps <= 0) {
    return '0 Mbps';
  }

  const mbps = bps / 1_000_000;
  
  if (mbps >= 1000) {
    return `${(mbps / 1000).toFixed(1)} Gbps`;
  } else if (mbps >= 1) {
    return `${mbps.toFixed(1)} Mbps`;
  } else {
    return `${(bps / 1000).toFixed(0)} Kbps`;
  }
}

export function formatLatency(ms?: number): string {
  if (typeof ms !== 'number' || ms <= 0) {
    return '0 ms';
  }

  return `${ms.toFixed(0)} ms`;
}

export function formatPacketLoss(ratio?: number): string {
  if (typeof ratio !== 'number' || ratio <= 0) {
    return '0%';
  }

  return `${(ratio * 100).toFixed(1)}%`;
}

export async function createSpeedTest() {
  // Dynamic import to avoid issues in Jest environment
  const { default: SpeedTestEngine } = await import('@cloudflare/speedtest');
  
  return new SpeedTestEngine({
    autoStart: false,
    // Use a simplified measurement set for faster testing while still being comprehensive
    measurements: [
      { type: 'latency', numPackets: 1 }, // initial latency estimation
      { type: 'download', bytes: 1e5, count: 1, bypassMinDuration: true }, // initial download estimation
      { type: 'latency', numPackets: 10 }, // reduced from 20
      { type: 'download', bytes: 1e5, count: 4 }, // reduced from 9
      { type: 'download', bytes: 1e6, count: 4 }, // reduced from 8
      { type: 'upload', bytes: 1e5, count: 4 }, // reduced from 8
      { type: 'upload', bytes: 1e6, count: 3 }, // reduced from 6
      { type: 'download', bytes: 1e7, count: 3 }, // reduced from 6
      { type: 'upload', bytes: 1e7, count: 2 }, // reduced from 4
      { type: 'download', bytes: 2.5e7, count: 2 }, // reduced from 4
    ],
  });
}

export function getSpeedCategory(mbps: number): {
  category: string;
  color: string;
  description: string;
} {
  if (mbps >= 100) {
    return {
      category: 'Excellent',
      color: 'text-green-600',
      description: 'Perfect for streaming 4K, gaming, and large downloads'
    };
  } else if (mbps >= 50) {
    return {
      category: 'Very Good',
      color: 'text-blue-600',
      description: 'Great for HD streaming and video calls'
    };
  } else if (mbps >= 25) {
    return {
      category: 'Good',
      color: 'text-yellow-600',
      description: 'Suitable for streaming and web browsing'
    };
  } else if (mbps >= 5) {
    return {
      category: 'Fair',
      color: 'text-orange-600',
      description: 'Basic web browsing and standard video'
    };
  } else {
    return {
      category: 'Poor',
      color: 'text-red-600',
      description: 'Limited to basic web browsing'
    };
  }
}