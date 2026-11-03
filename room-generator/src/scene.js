import * as THREE from 'three';

export class SceneView {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070c12);
    this.scene.fog = new THREE.Fog(0x070c12, 100, 260);
    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 1000);
    this.camera.position.set(42, 38, 48);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    this.scene.add(new THREE.HemisphereLight(0x9bbbd0, 0x18212b, 2.0));
    const key = new THREE.DirectionalLight(0xb7dcf2, 2.2);
    key.position.set(25, 45, 20);
    key.castShadow = true;
    this.scene.add(key);
    this.grid = new THREE.GridHelper(240, 60, 0x17445a, 0x142632);
    this.scene.add(this.grid);
    this.worldRoot = new THREE.Group();
    this.scene.add(this.worldRoot);
    this.target = new THREE.Vector3(0, 0, 0);
    this.drag = false;
    this.last = { x: 0, y: 0 };
    this.spherical = new THREE.Spherical(72, Math.PI / 3.1, Math.PI / 4);
    this.bindControls();
    this.resize();
    this.animate();
    window.addEventListener('resize', () => this.resize());
  }
  bindControls() {
    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', e => { this.drag = true; this.last = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointerup', () => this.drag = false);
    el.addEventListener('pointermove', e => {
      if (!this.drag) return;
      const dx = e.clientX - this.last.x, dy = e.clientY - this.last.y;
      this.last = { x: e.clientX, y: e.clientY };
      this.spherical.theta -= dx * 0.006;
      this.spherical.phi = THREE.MathUtils.clamp(this.spherical.phi + dy * 0.006, 0.15, Math.PI / 2.05);
      this.updateCamera();
    });
    el.addEventListener('wheel', e => {
      this.spherical.radius = THREE.MathUtils.clamp(this.spherical.radius + e.deltaY * 0.045, 12, 220);
      this.updateCamera();
    }, { passive: true });
    el.addEventListener('contextmenu', e => e.preventDefault());
  }
  updateCamera() {
    const offset = new THREE.Vector3().setFromSpherical(this.spherical);
    this.camera.position.copy(this.target).add(offset);
    this.camera.lookAt(this.target);
  }
  resize() {
    const w = Math.max(1, this.container.clientWidth), h = Math.max(1, this.container.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
  reset() {
    this.spherical.set(72, Math.PI / 3.1, Math.PI / 4);
    this.target.set(0, 0, 0);
    this.updateCamera();
  }
  animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}