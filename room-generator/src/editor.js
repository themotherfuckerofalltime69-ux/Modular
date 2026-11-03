export class EditorUI {
  constructor(app) { this.app = app; }
  renderRoomList() {
    const el = document.querySelector('#room-list'); el.innerHTML = '';
    this.app.state.rooms.forEach(room => {
      const b = document.createElement('button'); b.className = 'room-item' + (room.roomId === this.app.selectedId ? ' active' : '');
      b.innerHTML = `${escapeHtml(room.name)}<small>${room.dimensions.width} × ${room.dimensions.depth} · ${room.connections.length} CONNECTIONS</small>`;
      b.addEventListener('click', () => this.app.selectRoom(room.roomId)); el.appendChild(b);
    });
    document.querySelector('#room-count').textContent = `${String(this.app.state.rooms.length).padStart(2,'0')} ROOM${this.app.state.rooms.length === 1 ? '' : 'S'}`;
    const target = document.querySelector('#target-room'); const old = target.value;
    target.innerHTML = '<option value="">Choose room</option>' + this.app.state.rooms.filter(r => r.roomId !== this.app.selectedId).map(r => `<option value="${escapeAttr(r.roomId)}">${escapeHtml(r.name)}</option>`).join('');
    if ([...target.options].some(o => o.value === old)) target.value = old;
  }
  renderInspector() {
    const room = this.app.roomManager.get(this.app.selectedId);
    const el = document.querySelector('#inspector-content');
    if (!room) { el.innerHTML = '<div class="empty-state">Select a room to inspect its properties.</div>'; return; }
    const rows = [
      ['ROOM ID', room.roomId], ['WIDTH', `${room.dimensions.width} units`], ['DEPTH', `${room.dimensions.depth} units`],
      ['HEIGHT', `${room.dimensions.height} units`], ['STYLE', room.environment.style], ['SEED', room.seed],
      ['CONNECTIONS', room.connections.length], ['ENTITIES', room.entities.length]
    ];
    el.innerHTML = rows.map(([k,v]) => `<div class="inspector-row"><span>${k}</span><span>${escapeHtml(String(v))}</span></div>`).join('');
  }
  renderSummary() {
    const rooms = this.app.state.rooms;
    document.querySelector('#world-summary').textContent = JSON.stringify({
      worldId: this.app.state.worldId, roomCount: rooms.length,
      connectionCount: rooms.reduce((n,r) => n + r.connections.length, 0) / 2,
      selectedRoom: this.app.selectedId
    }, null, 2);
  }
  render() { this.renderRoomList(); this.renderInspector(); this.renderSummary(); }
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function escapeAttr(s) { return escapeHtml(s); }