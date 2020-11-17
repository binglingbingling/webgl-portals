import { Controls } from '/examples/js/Controls.js';
import { PortalMaterial } from '/src/PortalMaterial.js';
import { PortalMesh } from '/src/PortalMesh.js';


var MainScene = function () {

  this.init = function () {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x222222, 1);

    var width = 1024;
    var height = 1024;
    this.renderer.setSize(width, height);
    document.body.appendChild(this.renderer.domElement);

    var scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xfff));

    var camera = new THREE.OrthographicCamera(width / -80, width / 80, height / 80, height / -80, 1, 1000);
    camera.position.set(11, 11, 11);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.controls = new Controls(camera, this.renderer.domElement);
    this.controls.addListeners();

    var miniscene = new THREE.Scene();
    var dummy_geo = new THREE.DodecahedronGeometry(3);
    var dummy_mat = new THREE.MeshPhongMaterial({ color: new THREE.Color("hsl(220, 100%, 50%)") });
    var dummy_mesh = new THREE.Mesh(dummy_geo, dummy_mat);
    miniscene.add(dummy_mesh)

    var light_color = 0xffffff;
    var light_intensity = 1;
    var light = new THREE.PointLight(light_color, light_intensity);
    light.position.set(0, 3, 15);
    miniscene.add(light);

    var portal_geo = new THREE.PlaneGeometry(10, 10, 1);
    var portal_mat = new PortalMaterial(miniscene, camera, this.renderer);
    var portal = new PortalMesh(portal_geo, portal_mat, { "debug_width": 256, "debug_height": 256 });
    var test = new THREE.Mesh(portal_geo);
    portal.renderDebugUVs(true);
    scene.add(portal);

    var test = new THREE.Mesh(new THREE.CubeGeometry(3, 3, 3));
    scene.add(test);

    this.camera = camera;
    this.scene = scene;
  }

  this.animate = function () {
    var renderer = this.renderer;
    var scene = this.scene;
    var camera = this.camera;
    function render_loop() {
      requestAnimationFrame(render_loop);
      renderer.render(scene, camera);
    }
    render_loop();
  }
}

var scene = new MainScene();
scene.init();
scene.animate();