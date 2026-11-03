import './styles.css';
import { SceneView } from './scene.js';
import { makeRoom, cloneRoom } from './room-generator.js';
import { RoomManager } from './room-manager.js';
import { ConnectionManager } from './connection-manager.js';
import { WorldState } from './world-state.js';
import { validateWorld } from './validator.js';
import { EditorUI } from './editor.js';

const viewport = document.querySelector('#viewport');
const view = new SceneView(viewport);
const roomManager = new RoomManager(view.worldRoot);
const connectionManager = new ConnectionManager(roomManager);
const state = new WorldState();
let selectedId = null;
let roomCounter = 1;
const app = { view, roomManager, connectionManager, state, selectedId, selectRoom, sync };
const ui = new EditorUI(app);

function positionsForRooms() {
  // Connection manager positions connected rooms; disconnected rooms get a tidy row.
  const positions = new Map();
  const placed = new Set();
  if (state.rooms.length) { positions.set(state.rooms[0].roomId, [0,0,0]); placed.add(state.rooms[0].roomId); }
  let changed = true;
  while (changed) {
    changed = false;
    for (const room of state.rooms) {
      if (!placed.has(room.roomId)) continue;
      const base = positions.get(room.roomId);
      for (const c of room.connections) {
        if (placed.has(c.targetRoom)) continue;
        const target = state.rooms.find(r => r.roomId === c.targetRoom);
        if (!target) continue;
        const dir = c.direction;
        const p = dir === 'east' ? [base[0]+room.dimensions.width/2+target.dimensions.width/2+0.6,0,base[2]]
          : dir === 'west' ? [base[0]-room.dimensions.width/2-target.dimensions.width/2-0.6,0,base[2]]
          : dir === 'north' ? [base[0],0,base[2]-room.dimensions.depth/2-target.dimensions.depth/2-0.6]
          : [base[0],0,base[2]+room.dimensions.depth/2+target.dimensions.depth/2+0.6];
        positions.set(target.roomId,p); placed.add(target.roomId); changed = true;
      }
    }
  }
  let row = 0;
  state.rooms.forEach(room => { if (!positions.has(room.roomId)) { positions.set(room.roomId,[row*34,0,42]); row++; } });
  return positions;
}
function rebuildScene() {
  roomManager.clear();
  const positions = positionsForRooms();
  state.rooms.forEach(r => roomManager.add(r, positions.get(r.roomId)));
}
function sync() { state.setRooms(state.rooms); ui.render(); }
function selectRoom(id) {
  selectedId = id; app.selectedId = id;
  const r = roomManager.get(id);
  if (r) {
    document.querySelector('#room-name').value = r.name;
    document.querySelector('#room-width').value = r.dimensions.width;
    document.querySelector('#room-depth').value = r.dimensions.depth;
    document.querySelector('#room-height').value = r.dimensions.height;
    document.querySelector('#room-style').value = r.environment.style;
    document.querySelector('#room-seed').value = r.seed;
    document.querySelector('#selection-label').textContent = `SELECTED: ${r.name.toUpperCase()}`;
  }
  ui.render();
}
function setStatus(msg, good = true) {
  const el = document.querySelector('#status'); el.textContent = msg.toUpperCase();
  el.style.color = good ? '#58bca0' : '#e7b866';
}
function addRoom() {
  roomCounter++;
  const id = `room_${String(roomCounter).padStart(3,'0')}`;
  const room = makeRoom({ id, name: `Room ${String(roomCounter).padStart(2,'0')}`, seed: Math.floor(Math.random()*999999) });
  state.rooms.push(room); rebuildScene(); selectRoom(id); setStatus('ROOM ADDED');
}
function generateSelected() {
  const old = roomManager.get(selectedId);
  if (!old) return;
  const updated = makeRoom({
    id: old.roomId,
    name: document.querySelector('#room-name').value.trim() || old.name,
    width: document.querySelector('#room-width').value,
    depth: document.querySelector('#room-depth').value,
    height: document.querySelector('#room-height').value,
    style: document.querySelector('#room-style').value,
    seed: document.querySelector('#room-seed').value
  });
  updated.connections = old.connections;
  updated.entities = old.entities;
  updated.interactiveObjects = old.interactiveObjects;
  const idx = state.rooms.findIndex(r => r.roomId === old.roomId);
  state.rooms[idx] = updated; rebuildScene(); selectRoom(updated.roomId); setStatus('ROOM REBUILT');
}
function connectSelected() {
  const targetId = document.querySelector('#target-room').value;
  if (!selectedId || !targetId) { setStatus('SELECT A TARGET ROOM', false); return; }
  const direction = document.querySelector('#exit-direction').value;
  try {
    connectionManager.connect(selectedId, targetId, direction);
    rebuildScene(); sync(); selectRoom(selectedId); setStatus('ROOMS CONNECTED');
  } catch (e) { setStatus(e.message, false); }
}
function validate() {
  const result = validateWorld(state.rooms);
  const el = document.querySelector('#validation-output');
  el.innerHTML = `<strong class="${result.valid ? 'ok' : 'bad'}">${result.valid ? 'WORLD VALID' : 'VALIDATION FAILED'}</strong><br>${result.connected}/${result.total} rooms reachable` +
    [...result.errors, ...result.warnings].map(m => `<br>• ${escapeHtml(m)}`).join('') +
    (result.errors.length + result.warnings.length === 0 ? '<br>No issues detected.' : '');
  setStatus(result.valid ? 'VALIDATION PASSED' : 'VALIDATION ISSUES', result.valid);
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

document.querySelector('#add-room').addEventListener('click', addRoom);
document.querySelector('#generate-room').addEventListener('click', generateSelected);
document.querySelector('#connect-room').addEventListener('click', connectSelected);
document.querySelector('#validate-world').addEventListener('click', validate);
document.querySelector('#duplicate-room').addEventListener('click', () => {
  const room = roomManager.get(selectedId); if (!room) return;
  roomCounter++; const copy = cloneRoom(room, `room_${String(roomCounter).padStart(3,'0')}`, `${room.name} Copy`);
  state.rooms.push(copy); rebuildScene(); selectRoom(copy.roomId); setStatus('ROOM DUPLICATED');
});
document.querySelector('#export-btn').addEventListener('click', () => { state.setRooms(state.rooms); state.download(); setStatus('WORLD JSON EXPORTED'); });
document.querySelector('#reset-view').addEventListener('click', () => view.reset());
document.querySelector('#toggle-grid').addEventListener('click', e => { view.grid.visible = !view.grid.visible; e.currentTarget.textContent = `GRID: ${view.grid.visible ? 'ON' : 'OFF'}`; });
window.addEventListener('beforeunload', () => { /* no persistent storage by default */ });

const first = makeRoom({ id: 'room_001', name: 'Room 01', seed: 84219 });
state.rooms.push(first); roomCounter = 1;
rebuildScene(); selectRoom(first.roomId); validate();
