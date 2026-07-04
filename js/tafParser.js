/**
 * TAF Decoder Parser Utility
 * Parses a TAF string and splits it into base conditions and change groups
 */

export function parseTAF(raw) {
  if (!raw) return null;

  const clean = raw.trim().replace(/\s+/g, ' ');
  const parts = clean.split(' ');

  const result = {
    raw: clean,
    stationId: 'Unknown',
    issueTime: null,
    validity: null,
    baseForecast: [],
    changeGroups: []
  };

  let index = 0;
  
  if (parts[index] === 'TAF' || parts[index] === 'AMD' || parts[index] === 'COR') {
    result.type = parts[index];
    index++;
  }
  
  // Station ID
  if (index < parts.length && /^[A-Z]{4}$/i.test(parts[index])) {
    result.stationId = parts[index].toUpperCase();
    index++;
  }

  // Issue Time (e.g., 040900Z)
  if (index < parts.length && /^\d{6}Z$/i.test(parts[index])) {
    result.issueTime = parts[index];
    index++;
  }

  // Validity (e.g., 0412/0518)
  if (index < parts.length && /^\d{4}\/\d{4}$/.test(parts[index])) {
    result.validity = parts[index];
    index++;
  }

  // Group tokens by base vs change groups
  let currentGroup = { type: 'BASE', tokens: [] };
  
  for (let i = index; i < parts.length; i++) {
    const token = parts[i];
    const upper = token.toUpperCase();

    // Check for change group indicators
    const isFM = /^FM\d{6}$/.test(upper);
    const isBECMG = upper === 'BECMG';
    const isTEMPO = upper === 'TEMPO';
    const isPROB = /^PROB(30|40)$/.test(upper);

    if (isFM || isBECMG || isTEMPO || isPROB) {
      if (currentGroup.tokens.length > 0) {
        if (currentGroup.type === 'BASE') {
          result.baseForecast = [...currentGroup.tokens];
        } else {
          result.changeGroups.push(currentGroup);
        }
      }
      currentGroup = { type: isPROB ? upper : upper, indicator: upper, tokens: [] };
    } else {
      currentGroup.tokens.push(token);
    }
  }

  if (currentGroup.tokens.length > 0) {
    if (currentGroup.type === 'BASE') {
      result.baseForecast = [...currentGroup.tokens];
    } else {
      result.changeGroups.push(currentGroup);
    }
  }

  return result;
}

export function decodeTAFGroup(tokens) {
  // Returns simple key value breakdown of a change group
  const decoded = {
    wind: 'Normal',
    visibility: 'Normal',
    clouds: [],
    weather: []
  };

  tokens.forEach(tok => {
    const p = tok.toUpperCase();

    // Wind
    const windMatch = p.match(/^(\d{3}|VRB)(\d{2,3})(G\d{2,3})?(KT|MPS)$/);
    if (windMatch) {
      const dir = windMatch[1] === 'VRB' ? 'Variable' : `${windMatch[1]}°`;
      const speed = parseInt(windMatch[2], 10);
      const gust = windMatch[3] ? ` (gusting to ${windMatch[3].slice(1)} ${windMatch[4]})` : '';
      decoded.wind = `Wind from ${dir} at ${speed} ${windMatch[4]}${gust}`;
    }

    // Visibility
    if (p.endsWith('SM')) {
      decoded.visibility = `${p.replace('SM', '')} SM`;
    } else if (/^\d{4}$/.test(p)) {
      const m = parseInt(p, 10);
      decoded.visibility = m === 9999 ? '10+ km' : `${(m/1000).toFixed(1)} km`;
    } else if (p === 'CAVOK') {
      decoded.visibility = '10+ km (CAVOK)';
      decoded.clouds.push('Sky clear below 5,000 ft');
    }

    // Clouds
    const cloudMatch = p.match(/^(FEW|SCT|BKN|OVC|VV)(\d{3})(CB|TCU)?$/);
    if (cloudMatch) {
      const typeMap = { FEW: 'Few', SCT: 'Scattered', BKN: 'Broken', OVC: 'Overcast', VV: 'Vertical Visibility' };
      const height = parseInt(cloudMatch[2], 10) * 100;
      decoded.clouds.push(`${typeMap[cloudMatch[1]]} clouds at ${height.toLocaleString()} ft${cloudMatch[3] ? ` (${cloudMatch[3]})` : ''}`);
    }

    // Common Weather Phenomena
    if (p === 'FG') decoded.weather.push('Fog');
    if (p === 'BR') decoded.weather.push('Mist');
    if (p === 'HZ') decoded.weather.push('Haze');
    if (p === 'RA') decoded.weather.push('Rain');
    if (p === '-RA') decoded.weather.push('Light rain');
    if (p === 'TSRA') decoded.weather.push('Thunderstorm with rain');
    if (p === 'DZ') decoded.weather.push('Drizzle');
  });

  return decoded;
}
