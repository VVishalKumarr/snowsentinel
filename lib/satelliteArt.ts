// satelliteArt.ts — deterministic generator for stylized "satellite-style"
// SVG imagery used by SatelliteViewer. This is NOT real satellite imagery;
// it is a synthetic visualization built for the demo. Seeded by scenario id
// so the same scenario always renders the same terrain/anomaly layout.

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}

export interface AnomalyBlob {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot: number;
  opacity: number;
}

export function generateAnomalies(scenarioId: string, changePct: number): AnomalyBlob[] {
  const rand = mulberry32(seedFromString(scenarioId));
  const count = Math.max(1, Math.round(changePct / 14));
  const blobs: AnomalyBlob[] = [];
  for (let i = 0; i < count; i++) {
    blobs.push({
      cx: 260 + rand() * 320,
      cy: 130 + rand() * 150,
      rx: 14 + rand() * 26,
      ry: 8 + rand() * 16,
      rot: rand() * 360,
      opacity: 0.35 + rand() * 0.35,
    });
  }
  return blobs;
}

export interface TerrainLayer {
  points: string;
  fill: string;
}

// Fixed ridge silhouettes (deterministic, hand-tuned for a Himalayan-style skyline).
export const RIDGE_BACK = "0,320 90,230 160,270 230,190 300,250 380,160 460,240 540,180 620,260 700,210 800,290 800,500 0,500";
export const RIDGE_MID = "0,360 70,300 150,330 240,260 320,320 400,240 480,310 560,250 650,320 720,280 800,340 800,500 0,500";
export const RIDGE_FRONT = "0,420 100,370 190,400 280,350 360,400 450,360 540,410 630,370 720,410 800,380 800,500 0,500";

// Snow cap silhouette at "full" extent (previous observation baseline).
export const SNOW_CAP_FULL =
  "160,270 230,190 300,250 380,160 460,240 540,180 620,260 560,300 500,270 440,300 380,260 320,300 260,270 200,300";
