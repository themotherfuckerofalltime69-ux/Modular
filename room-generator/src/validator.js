export function validateWorld(rooms) {
  const errors = [], warnings = [];
  const ids = new Set(rooms.map(r => r.roomId));
  if (!rooms.length) errors.push('World contains no rooms.');
  if (ids.size !== rooms.length) errors.push('Duplicate room IDs detected.');
  for (const room of rooms) {
    const d = room.dimensions || {};
    if (!(d.width >= 8 && d.depth >= 8 && d.height >= 3)) errors.push(`${room.name}: invalid room dimensions.`);
    const seen = new Set();
    for (const c of room.connections || []) {
      if (!ids.has(c.targetRoom)) errors.push(`${room.name}: connection points to missing room ${c.targetRoom}.`);
      if (seen.has(c.direction)) warnings.push(`${room.name}: multiple connections share ${c.direction} side.`);
      seen.add(c.direction);
      const target = rooms.find(r => r.roomId === c.targetRoom);
      if (target && !(target.connections || []).some(back => back.targetRoom === room.roomId)) {
        errors.push(`${room.name}: connection to ${target.name} is not reciprocal.`);
      }
    }
    if (!(room.spawnPoints || []).length) warnings.push(`${room.name}: no spawn point defined.`);
  }
  const connected = new Set();
  if (rooms.length) {
    const queue = [rooms[0].roomId];
    while (queue.length) {
      const id = queue.shift(); if (connected.has(id)) continue; connected.add(id);
      const room = rooms.find(r => r.roomId === id);
      (room?.connections || []).forEach(c => { if (!connected.has(c.targetRoom)) queue.push(c.targetRoom); });
    }
    if (connected.size !== rooms.length) errors.push(`${rooms.length-connected.size} room(s) are unreachable from ${rooms[0].name}.`);
  }
  return { valid: errors.length === 0, errors, warnings, connected: connected.size, total: rooms.length };
}