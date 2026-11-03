export class WorldState {
  constructor() { this.worldId = 'world_' + Date.now().toString(36); this.rooms = []; this.player = { roomId: null, position: [0,0,0], health: 100 }; }
  setRooms(rooms) { this.rooms = rooms; if (!this.player.roomId && rooms.length) this.player.roomId = rooms[0].roomId; }
  toJSON() { return { schemaVersion: '1.0.0', worldId: this.worldId, player: this.player, rooms: this.rooms }; }
  download() {
    const blob = new Blob([JSON.stringify(this.toJSON(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${this.worldId}.json`; a.click();
    URL.revokeObjectURL(url);
  }
  static fromJSON(data) {
    if (!data || !Array.isArray(data.rooms)) throw new Error('Invalid world JSON: expected a rooms array.');
    const state = new WorldState(); state.worldId = data.worldId || state.worldId;
    state.player = data.player || state.player; state.rooms = data.rooms; return state;
  }
}