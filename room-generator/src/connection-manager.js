import { directionVector, oppositeDirection } from './geometry-builder.js';

export class ConnectionManager {
  constructor(roomManager) { this.roomManager = roomManager; }
  connect(roomAId, roomBId, direction) {
    const a = this.roomManager.get(roomAId), b = this.roomManager.get(roomBId);
    if (!a || !b) throw new Error('Both rooms must exist before connecting.');
    if (a.roomId === b.roomId) throw new Error('A room cannot connect to itself.');
    const reverse = oppositeDirection(direction);
    const duplicate = a.connections.some(c => c.targetRoom === b.roomId);
    if (duplicate) throw new Error('These rooms are already connected.');
    const va = directionVector(direction), vb = directionVector(reverse);
    const pa = this.roomManager.position(a.roomId), da = a.dimensions;
    const gap = 0.6;
    const offset = [
      va[0] * (da.width/2 + b.dimensions.width/2 + gap),
      0,
      va[2] * (da.depth/2 + b.dimensions.depth/2 + gap)
    ];
    const pb = [pa[0]+offset[0], pa[1], pa[2]+offset[2]];
    const aPos = edgePosition(a, direction), bPos = edgePosition(b, reverse);
    a.connections.push({ id: `${a.roomId}_${direction}`, targetRoom: b.roomId, type: 'door', direction, position: aPos, targetSpawn: 'default_spawn' });
    b.connections.push({ id: `${b.roomId}_${reverse}`, targetRoom: a.roomId, type: 'door', direction: reverse, position: bPos, targetSpawn: 'default_spawn' });
    this.roomManager.add(a, pa);
    this.roomManager.add(b, pb);
    return { a, b, position: pb };
  }
}
function edgePosition(room, dir) {
  const { width, depth } = room.dimensions;
  return dir === 'east' ? [width/2,0,0] : dir === 'west' ? [-width/2,0,0] :
    dir === 'north' ? [0,0,-depth/2] : [0,0,depth/2];
}