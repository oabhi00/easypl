/**
 * METAR Decoder Parser Utility
 * Decodes standard raw METAR strings into structured plain English.
 */

export function parseMETAR(raw) {
  if (!raw) return null;
  
  // Clean raw input
  const clean = raw.trim().replace(/\s+/g, ' ');
  const parts = clean.split(' ');
  
  const result = {
    raw: clean,
    type: 'METAR',
    stationId: 'Unknown',
    time: null,
    wind: { direction: 'Variable', speed: 0, gust: null, unit: 'KT' },
    visibility: { value: 'Unknown', unit: 'SM' },
    clouds: [],
    tempDewpoint: { temp: null, dewpoint: null },
    altimeter: { value: null, unit: 'inHg' },
    flightCategory: 'VFR',
    remarks: []
  };

  let index = 0;
  
  // 1. Report Type
  if (parts[index] === 'METAR' || parts[index] === 'SPECI') {
    result.type = parts[index];
    index++;
  }
  
  // 2. Station ID (4 letters)
  if (index < parts.length && /^[A-Z]{4}$/i.test(parts[index])) {
    result.stationId = parts[index].toUpperCase();
    index++;
  }
  
  // 3. Date / Time (e.g. 301200Z)
  if (index < parts.length && /^\d{6}Z$/i.test(parts[index])) {
    const timeStr = parts[index];
    const day = parseInt(timeStr.slice(0, 2), 10);
    const hour = timeStr.slice(2, 4);
    const min = timeStr.slice(4, 6);
    result.time = { day, hour, min, zulu: timeStr };
    index++;
  }

  // 4. AUTO / COR modifiers
  if (index < parts.length && (parts[index] === 'AUTO' || parts[index] === 'COR')) {
    result.modifier = parts[index];
    index++;
  }

  // Loop through remaining parts
  let remarksMode = false;

  for (let i = index; i < parts.length; i++) {
    const p = parts[i].toUpperCase();
    
    // Check if remarks section starts
    if (p === 'RMK') {
      remarksMode = true;
      continue;
    }
    
    if (remarksMode) {
      result.remarks.push(parts[i]);
      continue;
    }

    // 5. Wind Group (e.g., 20004KT, 18512G18KT, VRB02KT)
    const windMatch = p.match(/^(\d{3}|VRB)(\d{2,3})(G\d{2,3})?(KT|MPS)$/);
    if (windMatch) {
      result.wind.direction = windMatch[1] === 'VRB' ? 'Variable' : `${windMatch[1]}°`;
      result.wind.speed = parseInt(windMatch[2], 10);
      if (windMatch[3]) {
        result.wind.gust = parseInt(windMatch[3].slice(1), 10);
      }
      result.wind.unit = windMatch[4];
      continue;
    }

    // 6. Wind Variability Group (e.g. 180V240)
    if (/^\d{3}V\d{3}$/.test(p)) {
      result.wind.variability = p.replace('V', ' to ');
      continue;
    }

    // 7. Visibility Group (e.g., 15SM, 10SM, 2 1/2SM, 9999, 5000)
    if (p.endsWith('SM')) {
      result.visibility.value = p.replace('SM', '');
      result.visibility.unit = 'SM';
      continue;
    }
    
    if (/^\d{4}$/.test(p)) {
      const meters = parseInt(p, 10);
      if (meters === 9999) {
        result.visibility.value = '10+';
        result.visibility.unit = 'km';
      } else {
        result.visibility.value = (meters / 1000).toFixed(1);
        result.visibility.unit = 'km';
      }
      continue;
    }

    // 8. Sky Condition / Clouds (e.g. FEW240, SCT025, BKN015, OVC110)
    const cloudMatch = p.match(/^(FEW|SCT|BKN|OVC|VV)(\d{3})(CB|TCU)?$/);
    if (cloudMatch) {
      const typeMap = {
        FEW: 'Few',
        SCT: 'Scattered',
        BKN: 'Broken',
        OVC: 'Overcast',
        VV: 'Vertical Visibility'
      };
      const type = typeMap[cloudMatch[1]];
      const height = parseInt(cloudMatch[2], 10) * 100;
      const typeAddon = cloudMatch[3] ? ` (${cloudMatch[3]})` : '';
      result.clouds.push({ type, height, label: `${type} at ${height.toLocaleString()} ft${typeAddon}` });
      continue;
    }

    if (p === 'CLR' || p === 'SKC' || p === 'NSC') {
      result.clouds.push({ type: 'Clear', height: 0, label: 'Sky clear' });
      continue;
    }

    // 9. Temperature / Dewpoint (e.g. 15/10, M03/M04)
    const tempMatch = p.match(/^(M?\d{2})\/(M?\d{2})$/);
    if (tempMatch) {
      const parseTemp = (s) => s.startsWith('M') ? -parseInt(s.slice(1), 10) : parseInt(s, 10);
      result.tempDewpoint.temp = parseTemp(tempMatch[1]);
      result.tempDewpoint.dewpoint = parseTemp(tempMatch[2]);
      continue;
    }

    // 10. Altimeter Setting (e.g. A3018, Q1013)
    const altMatch = p.match(/^(A|Q)(\d{4})$/);
    if (altMatch) {
      if (altMatch[1] === 'A') {
        result.altimeter.value = (parseInt(altMatch[2], 10) / 100).toFixed(2);
        result.altimeter.unit = 'inHg';
      } else {
        result.altimeter.value = parseInt(altMatch[2], 10);
        result.altimeter.unit = 'hPa';
      }
      continue;
    }
  }

  // 11. Calculate Flight Category (VFR, MVFR, IFR, LIFR)
  // Determine visibility in SM for comparison
  let visInSM = 10;
  if (result.visibility.unit === 'SM') {
    visInSM = parseFloat(result.visibility.value) || 10;
  } else if (result.visibility.unit === 'km') {
    const val = result.visibility.value === '10+' ? 10 : parseFloat(result.visibility.value);
    visInSM = val * 0.621371;
  }

  // Find lowest ceiling (height of Broken/BKN or Overcast/OVC or Vertical Visibility/VV)
  let lowestCeiling = Infinity;
  result.clouds.forEach(layer => {
    if (layer.type === 'Broken' || layer.type === 'Overcast' || layer.type === 'Vertical Visibility') {
      if (layer.height < lowestCeiling) {
        lowestCeiling = layer.height;
      }
    }
  });

  if (lowestCeiling < 500 || visInSM < 1) {
    result.flightCategory = 'LIFR';
  } else if (lowestCeiling < 1000 || visInSM < 3) {
    result.flightCategory = 'IFR';
  } else if (lowestCeiling <= 3000 || visInSM <= 5) {
    result.flightCategory = 'MVFR';
  } else {
    result.flightCategory = 'VFR';
  }

  return result;
}
