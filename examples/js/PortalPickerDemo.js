import { ObjectPicker, Controls } from '/examples/js/utils/Controls.js';
import { CubePortalLayout } from '/src/layouts/CubePortalLayout.js';
import { PortalMesh } from '/src/PortalMesh.js';
import { PortalMaterial } from '/src/PortalMaterial.js';


class PortalPickerDemo {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x222222, 1);

    var show_uv_debug = true;

    var width = window.innerWidth;
    var height = window.innerHeight;
    this.renderer.setSize(width, height);
    document.body.appendChild(this.renderer.domElement);

    var scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0x888888));
    scene.add(new THREE.DirectionalLight(0xffffff, 1));
    this.scene = scene;

    var camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(11, 11, 11);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera = camera;

    this.controls = new Controls(camera, this.renderer);
    this.controls.addListeners();

    this.obj_picker = new ObjectPicker(this.renderer.domElement);

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    function rand(min, max) {
      if (max === undefined) {
        max = min;
        min = 0;
      }
      return min + (max - min) * Math.random();
    }

    function randomColor(min_hue = 0, max_hue = 360) {
      return `hsl(${rand(min_hue, max_hue) | 0}, ${rand(50, 100) | 0}%, 50%)`;
    }

    function randomGray(min_lum = 0, max_lum = 100) {
      return `hsl(180, 0%, ${rand(min_lum, max_lum) | 0}%)`;
    }

    for (let i = 0; i < 20; ++i) {
      const material = new THREE.MeshPhongMaterial({
        color: randomGray(20, 60),
      });

      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(rand(-25, 25), rand(-25, 25), rand(-25, 25));
      cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
      cube.scale.set(rand(2, 6), rand(2, 6), rand(2, 6));
      scene.add(cube);
    }

    var cube_scenes = [];
    for (var i = 0; i < CubePortalLayout.maxScenes(); i++) {
      var miniscene = new THREE.Scene();
      miniscene.add(new THREE.AmbientLight(0x888888));
      miniscene.add(new THREE.DirectionalLight(0xffffff, 1));
      const numObjects = 50;
      for (let j = 0; j < numObjects; ++j) {
        const material = new THREE.MeshPhongMaterial({
          color: randomColor(i * 80, i * 80 + 30),
        });

        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(rand(-10, 10), rand(-10, 10), rand(-2, -20));
        cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
        cube.scale.set(rand(1, 3), rand(1, 3), rand(1, 3));
        miniscene.add(cube);
      }
      cube_scenes.push(miniscene);
    }

    var portal_geo = new THREE.CircleGeometry(5, 64);
    portal_geo.scale(1, 2, 1);
    var portal_mat = new PortalMaterial(cube_scenes[2], camera, this.renderer);
    this.portal = new PortalMesh(portal_geo, portal_mat, { debug_height: 256, debug_width: 256 });
    scene.add(this.portal);

    var ring_geo = new THREE.RingGeometry(4.9, 5, 128);
    ring_geo.scale(1, 2, 1);
    var ring_mat = new THREE.MeshBasicMaterial({ color: 0xff8800, side: THREE.DoubleSide });
    var ring = new THREE.Mesh(ring_geo, ring_mat);
    // prevent z-fighting.
    ring.position.set(0, 0, 0.001);
    scene.add(ring);

    if (show_uv_debug) {
      this.portal.renderDebugUVs(true);
    }
  }
  render() {
    var camera = this.camera;
    var renderer = this.renderer;
    var controls = this.controls;
    var scene = this.scene;
    var portal = this.portal;
    var obj_picker = this.obj_picker;
    var time = 0.0;
    function render_loop() {
      time += 0.0001;
      controls.update();
      requestAnimationFrame(render_loop)

      portal.onBeforeRender();
      obj_picker.pick(scene, camera, time);
      renderer.render(scene, camera);
    }
    render_loop();
  }
}

export { PortalPickerDemo }