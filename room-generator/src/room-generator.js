export function makeRoom({ id, name, width = 24, depth = 24, height = 8, style = 'industrial', seed = 1 }) {
  return {
    schemaVersion: '1.0.0',
    roomId: id,
    name,
    seed: Number(seed) || 1,
    transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
    dimensions: { width: clamp(width, 8, 100), height: clamp(height, 3, 30), depth: clamp(depth, 8, 100) },
    environment: { style, floor: style === 'research' ? 'clean-composite' : 'concrete', walls: style, ceiling: 'structural' },
    connections: [],
    entities: [],
    interactiveObjects: [],
    spawnPoints: [{ id: 'default_spawn', position: [0, 0, 0], rotation: [0, 0, 0] }],
    metadata: { generated: true, generatorVersion: '1.0.0', createdAt: new Date().toISOString() }
  };
}
function clamp(v, min, max) { return Math.max(min, Math.min(max, Number(v) || min)); }
export function cloneRoom(room, newId, newName) {
  const copy = JSON.parse(JSON.stringify(room));
  copy.roomId = newId;
  copy.name = newName;
  copy.connections = [];
  copy.metadata.createdAt = new Date().toISOString();
  return copy;
}