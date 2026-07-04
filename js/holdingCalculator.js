/**
 * Holding Pattern Calculator Utility
 * Calculates the correct entry sector and speeds for holding patterns
 */

export function calculateHoldingPattern(inbound, heading, isLeftTurn, altitude) {
  // Normalize angles to [0, 360)
  const normInbound = (inbound % 360 + 360) % 360;
  const normHeading = (heading % 360 + 360) % 360;
  
  // Reciprocal of heading (where aircraft is coming from)
  const reciprocal = (normHeading + 180) % 360;
  
  // Angle of approach relative to inbound course
  const approach = (reciprocal - normInbound + 360) % 360;
  
  let entryType = 'Direct Entry';
  let description = '';
  let sectorClass = 'direct';

  if (!isLeftTurn) {
    // Standard Right-Hand Hold
    if (approach >= 0 && approach <= 70) {
      entryType = 'Teardrop Entry';
      sectorClass = 'teardrop';
      description = 'Cross the fix and turn right onto a heading 30° offset from the outbound course, on the holding side. Hold for one leg (1 min ≤ 14,000 ft, 1.5 min above), then turn right to intercept the inbound course back to the fix.';
    } else if (approach >= 250 && approach < 360) {
      entryType = 'Parallel Entry';
      sectorClass = 'parallel';
      description = 'Cross the fix and turn left to match the outbound course on the non-holding side. Fly outbound for one leg, then turn left to intercept the inbound track and return to the fix.';
    } else {
      entryType = 'Direct Entry';
      sectorClass = 'direct';
      description = 'Fly directly to the fix. Upon crossing the fix, immediately turn right to follow the holding pattern.';
    }
  } else {
    // Non-Standard Left-Hand Hold
    if (approach >= 290 && approach < 360) {
      entryType = 'Teardrop Entry';
      sectorClass = 'teardrop';
      description = 'Cross the fix and turn left onto a heading 30° offset from the outbound course, on the holding side. Hold for one leg (1 min ≤ 14,000 ft, 1.5 min above), then turn left to intercept the inbound course back to the fix.';
    } else if (approach >= 0 && approach <= 110) {
      entryType = 'Parallel Entry';
      sectorClass = 'parallel';
      description = 'Cross the fix and turn right to match the outbound course on the non-holding side. Fly outbound for one leg, then turn right to intercept the inbound track and return to the fix.';
    } else {
      entryType = 'Direct Entry';
      sectorClass = 'direct';
      description = 'Fly directly to the fix. Upon crossing the fix, immediately turn left to follow the holding pattern.';
    }
  }

  // Leg Time: 1 minute at or below 14,000 ft, 1.5 minutes above 14,000 ft MSL
  const legTime = altitude <= 14000 ? '1 min' : '1.5 min';

  // Max Speeds (ICAO vs FAA)
  // ICAO:
  // - Up to 14,000 ft: 230 KIAS
  // - 14,000 to 20,000 ft: 240 KIAS
  // - 20,000 to 34,000 ft: 265 KIAS
  // FAA:
  // - Up to 6,000 ft: 200 KIAS
  // - 6,000 to 14,000 ft: 230 KIAS
  // - Above 14,000 ft: 265 KIAS
  let icaoSpeed = '230';
  let faaSpeed = '230';

  if (altitude <= 6000) {
    icaoSpeed = '230';
    faaSpeed = '200';
  } else if (altitude <= 14000) {
    icaoSpeed = '230';
    faaSpeed = '230';
  } else if (altitude <= 20000) {
    icaoSpeed = '240';
    faaSpeed = '265';
  } else {
    icaoSpeed = '265';
    faaSpeed = '265';
  }

  return {
    entryType,
    description,
    sectorClass,
    legTime,
    icaoSpeed,
    faaSpeed,
    approachAngle: approach
  };
}
