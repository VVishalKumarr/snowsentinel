// mapLayers.ts — map layer toggle types/defaults, kept separate from
// HazardMap.tsx (which imports leaflet). Anything that statically imports
// from HazardMap.tsx pulls leaflet into that bundle too — leaflet touches
// `window` at module load, which crashes server-side rendering. Components
// that only need the toggle shape (not the map itself) should import from
// here instead.

export interface MapLayerToggles {
  hazard: boolean;
  priority: boolean;
  shelters: boolean;
  hospitals: boolean;
  police: boolean;
  fire: boolean;
  ambulances: boolean;
  safeZones: boolean;
  roads: boolean;
}

export const DEFAULT_LAYERS: MapLayerToggles = {
  hazard: true,
  priority: false,
  shelters: false,
  hospitals: false,
  police: false,
  fire: false,
  ambulances: false,
  safeZones: false,
  roads: true,
};
