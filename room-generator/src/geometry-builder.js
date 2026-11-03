import * as THREE from 'three';

const palette = {
  industrial: { floor: 0x293640, wall: 0x52616a, accent: 0x087ca5 },
  research: { floor: 0x34444a, wall: 0x84959b, accent: 0x00a6c9 },
  concrete: { floor: 0x343a3e, wall: 0x62686b, accent: 0x356d83 },
  hangar: { floor: 0x202d36, wall: 0x46545d, accent: 0x9b713d }
};
const opposite = { east: 'west', west: 'east', north: 'south', south: 'north' };

export function buildRoom(room, position = [0, 0, 0]) {
  const group = new THREE.Group();
  group.name = room.roomId;
  const { width, depth, height } = room.dimensions;
  const colors = palette[room.environment?.style] || palette.industrial;
  const floorMat = new THREE.MeshStandardMaterial({ color: colors.floor, roughness: 0.88 });
  const wallMat = new THREE.MeshStandardMaterial({ color: colors.wall, roughness: 0.72 });
  const trimMat = new THREE.MeshStandardMaterial({ color: colors.accent, metalness: 0.45, roughness: 0.4 });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(width, 0.35, depth), floorMat);
  floor.position.y = -0.175; floor.receiveShadow = true; group.add(floor);
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(width, 0.25, depth), wallMat);
  ceil.position.y = height + 0.125; group.add(ceil);
  const doors = new Set(room.connections.map(c => c.direction));
  const t = 0.45, doorW = Math.min(3.6, width * 0.32, depth * 0.32), doorH = Math.min(4.2, height * 0.72);
  const addWall = (dir) => {
    const horizontal = dir === 'north' || dir === 'south';
    const length = horizontal ? width : depth;
    const wallZ = dir === 'north' ? -depth/2 : depth/2;
    const wallX = dir === 'west' ? -width/2 : width/2;
    const hasDoor = doors.has(dir);
    if (!hasDoor) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(horizontal ? length : t, height, horizontal ? t : length), wallMat);
      mesh.position.set(horizontal ? 0 : wallX, height/2, horizontal ? wallZ : 0);
      mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh);
    } else {
      const side = (length - doorW) / 2;
      const make = (w, x, z) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(horizontal ? w : t, height, horizontal ? t : w), wallMat);
        mesh.position.set(horizontal ? x : wallX, height/2, horizontal ? wallZ : z);
        mesh.castShadow = true; group.add(mesh);
      };
      make(side, -(doorW + side)/2, (doorW + side)/2);
      make(side, (doorW + side)/2, -(doorW + side)/2);
      const header = new THREE.Mesh(new THREE.BoxGeometry(horizontal ? doorW : t, height-doorH, horizontal ? t : doorW), wallMat);
      header.position.set(horizontal ? 0 : wallX, doorH+(height-doorH)/2, horizontal ? wallZ : 0); group.add(header);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(horizontal ? doorW+0.35 : t+0.35, 0.16, horizontal ? t+0.35 : doorW+0.35), trimMat);
      frame.position.set(horizontal ? 0 : wallX, doorH, horizontal ? wallZ : 0); group.add(frame);
    }
  };
  ['north','south','east','west'].forEach(addWall);
  // Corner posts make room boundaries legible.
  for (const x of [-width/2, width/2]) for (const z of [-depth/2, depth/2]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.65, height, 0.65), trimMat);
    post.position.set(x, height/2, z); group.add(post);
  }
  // Simple deterministic floor markings.
  const lineMat = new THREE.MeshStandardMaterial({ color: colors.accent, emissive: colors.accent, emissiveIntensity: 0.18 });
  const line = new THREE.Mesh(new THREE.BoxGeometry(width*0.72, 0.025, 0.08), lineMat);
  line.position.set(0, 0.012, 0); group.add(line);
  group.position.set(position[0], position[1], position[2]);
  group.userData.roomId = room.roomId;
  return group;
}
export function directionVector(direction) {
  return ({ east: [1,0,0], west: [-1,0,0], north: [0,0,-1], south: [0,0,1] })[direction] || [1,0,0];
}
export function oppositeDirection(direction) { return opposite[direction]; }