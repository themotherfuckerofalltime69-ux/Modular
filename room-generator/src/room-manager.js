import { buildRoom } from './geometry-builder.js';

export class RoomManager {
  constructor(root) { this.root = root; this.rooms = new Map(); this.positions = new Map(); this.groups = new Map(); }
  add(room, position) {
    if (this.groups.has(room.roomId)) this.remove(room.roomId);
    const group = buildRoom(room, position);
    this.root.add(group);
    this.rooms.set(room.roomId, room);
    this.positions.set(room.roomId, [...position]);
    this.groups.set(room.roomId, group);
  }
  remove(id) {
    const group = this.groups.get(id);
    if (group) {
      this.root.remove(group);
      group.traverse(obj => { if (obj.geometry) obj.geometry.dispose(); if (obj.material) (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => m.dispose()); });
    }
    this.groups.delete(id); this.rooms.delete(id); this.positions.delete(id);
  }
  get(id) { return this.rooms.get(id); }
  all() { return [...this.rooms.values()]; }
  position(id) { return this.positions.get(id) || [0,0,0]; }
  clear() { [...this.groups.keys()].forEach(id => this.remove(id)); }
}