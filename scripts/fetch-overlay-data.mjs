#!/usr/bin/env node

/**
 * Fetches overlay data from TeleGeography (submarine cables, landing points)
 * and PeeringDB (IXPs), processes and saves to public/data/.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'public', 'data');

mkdirSync(DATA_DIR, { recursive: true });

/** Douglas-Peucker line simplification */
function perpendicularDistance(point, lineStart, lineEnd) {
  const dx = lineEnd[0] - lineStart[0];
  const dy = lineEnd[1] - lineStart[1];
  const dMag = Math.sqrt(dx * dx + dy * dy);
  if (dMag === 0) return Math.sqrt((point[0] - lineStart[0]) ** 2 + (point[1] - lineStart[1]) ** 2);
  const u = ((point[0] - lineStart[0]) * dx + (point[1] - lineStart[1]) * dy) / (dMag * dMag);
  const ix = lineStart[0] + u * dx;
  const iy = lineStart[1] + u * dy;
  return Math.sqrt((point[0] - ix) ** 2 + (point[1] - iy) ** 2);
}

function simplifyLine(points, tolerance) {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIdx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (d > maxDist) {
      maxDist = d;
      maxIdx = i;
    }
  }

  if (maxDist > tolerance) {
    const left = simplifyLine(points.slice(0, maxIdx + 1), tolerance);
    const right = simplifyLine(points.slice(maxIdx), tolerance);
    return left.slice(0, -1).concat(right);
  }
  return [points[0], points[points.length - 1]];
}

function simplifyGeometry(geometry, tolerance) {
  if (!geometry) return geometry;
  if (geometry.type === 'LineString') {
    return { ...geometry, coordinates: simplifyLine(geometry.coordinates, tolerance) };
  }
  if (geometry.type === 'MultiLineString') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((line) => simplifyLine(line, tolerance)),
    };
  }
  return geometry;
}

async function fetchJSON(url, label) {
  console.log(`Fetching ${label}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${label}: HTTP ${res.status}`);
  return res.json();
}

async function fetchCables() {
  const [geoData, metaData] = await Promise.all([
    fetchJSON('https://www.submarinecablemap.com/api/v3/cable/cable-geo.json', 'cable geometry'),
    fetchJSON('https://www.submarinecablemap.com/api/v3/cable/all.json', 'cable metadata'),
  ]);

  // Process geometry - simplify coordinates
  const tolerance = 0.08;
  const simplifiedFeatures = geoData.features.map((f) => ({
    type: 'Feature',
    id: f.id,
    properties: {
      id: f.properties?.id || f.id,
      name: f.properties?.name || '',
      color: f.properties?.color || '#06b6d4',
    },
    geometry: simplifyGeometry(f.geometry, tolerance),
  }));

  const cablesGeo = {
    type: 'FeatureCollection',
    features: simplifiedFeatures,
  };

  // Process metadata
  const cablesMeta = metaData.map((c) => ({
    id: String(c.id),
    name: c.name || '',
    color: c.color || '#06b6d4',
    rfs: c.rfs || null,
    length_km: c.length ? parseFloat(c.length.replace(/,/g, '')) || null : null,
    owners: (c.owners || []).map((o) => o.name || o),
    landing_point_ids: (c.landing_points || []).map((lp) => String(lp.id || lp)),
  }));

  writeFileSync(join(DATA_DIR, 'submarine-cables.json'), JSON.stringify(cablesGeo));
  console.log(`  → submarine-cables.json (${simplifiedFeatures.length} cables)`);

  writeFileSync(join(DATA_DIR, 'submarine-cables-meta.json'), JSON.stringify(cablesMeta));
  console.log(`  → submarine-cables-meta.json (${cablesMeta.length} entries)`);
}

async function fetchLandingPoints() {
  const data = await fetchJSON(
    'https://www.submarinecablemap.com/api/v3/landing-point/landing-point-geo.json',
    'landing points'
  );

  const landingPoints = {
    type: 'FeatureCollection',
    features: data.features
      .filter(
        (f) => f.geometry && f.geometry.coordinates && f.geometry.coordinates.length === 2
      )
      .map((f) => ({
        type: 'Feature',
        id: f.id,
        properties: {
          id: String(f.properties?.id || f.id),
          name: f.properties?.name || '',
          country_code: f.properties?.country_code || f.properties?.country || '',
        },
        geometry: f.geometry,
      })),
  };

  writeFileSync(join(DATA_DIR, 'landing-points.json'), JSON.stringify(landingPoints));
  console.log(`  → landing-points.json (${landingPoints.features.length} points)`);
}

async function fetchIXPs() {
  // PeeringDB IX endpoint doesn't include coordinates directly.
  // We fetch IXPs and facilities separately, then link via ixfac relationships.
  const [ixData, facData, ixfacData] = await Promise.all([
    fetchJSON('https://www.peeringdb.com/api/ix', 'IXPs'),
    fetchJSON('https://www.peeringdb.com/api/fac', 'facilities'),
    fetchJSON('https://www.peeringdb.com/api/ixfac', 'IX-facility links'),
  ]);

  // Build facility lookup: id → { lat, lng }
  const facMap = new Map();
  for (const fac of facData.data || []) {
    if (fac.latitude && fac.longitude) {
      facMap.set(fac.id, { lat: fac.latitude, lng: fac.longitude });
    }
  }

  // Build IX → first facility coords lookup
  const ixCoords = new Map();
  for (const link of ixfacData.data || []) {
    if (!ixCoords.has(link.ix_id) && facMap.has(link.fac_id)) {
      ixCoords.set(link.ix_id, facMap.get(link.fac_id));
    }
  }

  const ixps = (ixData.data || [])
    .filter((ix) => ixCoords.has(ix.id))
    .map((ix) => {
      const coords = ixCoords.get(ix.id);
      return {
        id: String(ix.id),
        name: ix.name || '',
        city: ix.city || '',
        country_code: ix.country || '',
        lat: coords.lat,
        lng: coords.lng,
        participant_count: ix.net_count || 0,
      };
    });

  writeFileSync(join(DATA_DIR, 'ixps.json'), JSON.stringify(ixps));
  console.log(`  → ixps.json (${ixps.length} exchanges)`);
}

async function main() {
  console.log('Fetching overlay data...\n');

  const results = await Promise.allSettled([fetchCables(), fetchLandingPoints(), fetchIXPs()]);

  for (const result of results) {
    if (result.status === 'rejected') {
      console.error(`\nError: ${result.reason.message}`);
    }
  }

  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  console.log(`\nDone. ${succeeded}/${results.length} data sources fetched successfully.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
