import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { Controls } from './Controls.js';
import { GLTFLoader } from 'https://threejs.org/examples/jsm/loaders/GLTFLoader.js';

function main() {
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor( 0x222222, 1 );
  var width = 1024; //window.innerWidth;
  var height = 1024;// window.innerHeight;
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  var scene = new THREE.Scene();

  //var camera = new THREE.PerspectiveCamera(45, 1, 1, 100); // width / height, 1, 100);
  var camera = new THREE.OrthographicCamera(width / -80, width / 80, height / 80, height / -80, 1, 1000);
  camera.position.set(11,11,11);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  var miniscene_camera = camera; //new THREE.PerspectiveCamera(45, 1, 1, 100);
  // miniscene_camera.position.y = 15;
  // miniscene_camera.position.z = 15;
  // miniscene_camera.lookAt(new THREE.Vector3(0, 0, 0));

  // var gridXZ = new THREE.GridHelper(100, 10, new THREE.Color(0x880000), new THREE.Color(0x333333));
  // scene.add(gridXZ);

  var bufferScene = new THREE.Scene();
  var bufferScene2 = new THREE.Scene();

  var width = 1024;
  var height = 1024;
  var controls = new Controls(camera, renderer.domElement);
  controls.addListeners();

  ////// Listeners

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

  }

  window.addEventListener( 'resize', onWindowResize, false );

  var show_debug_uvs = false;

  $(document).keydown(function (event) {
    if (event.which == 32) {
      $('#debug_uvs').show();
      show_debug_uvs = true;
    }
  });

  $(document).keyup(function (event) {
    if (event.which == 32) {
      $('#debug_uvs').hide();
      show_debug_uvs = false;
    }
  });

  function drawTriangle(canvas, a, b, c) {
    if (!canvas.getContext) {
      console.error("cannot get context for ", canvas);
      return;
    }

    var ctx = canvas.getContext('2d');
    ctx.strokeStyle = "#FF0000";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(a.x, a.y);
    ctx.stroke();
  }

  var light_color = 0xffffff;
  var light_intensity = 1;

  // Size of dummy objects
  var size = 5;

  var renderers = []
  var canvas2ds = []
  var buffer_textures = []
  var buffer_scenes = []
  var dummy_geos = [new THREE.BoxGeometry(size,size,size), new THREE.ConeGeometry(size,size, 6), new THREE.DodecahedronGeometry(size/2), new THREE.IcosahedronBufferGeometry(size/2), new THREE.TetrahedronBufferGeometry(size/2), new THREE.TorusGeometry(size/2, size/4, 10, 10)];
  var dummy_objs = [];
  var dummy_bg_materials = []
  var dummy_bgs = []
  var live_materials = []
  for (var i = 0; i < 6; i++) {
    var miniscene_renderer = new THREE.WebGLRenderer({ antialias: true });
    miniscene_renderer.setSize(width / 4, height / 4);
    renderers.push(miniscene_renderer);

    var div = $('<div>');
    div.append(miniscene_renderer.domElement);

    var canvas2d = $(`<canvas height=${height / 4} width=${width / 4} class="overlay"></canvas>`);
    div.append(canvas2d)

    canvas2ds.push(canvas2d[0]);

    $("#debug_uvs").append(div);

    var buffer_texture = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter });
    buffer_textures.push(buffer_texture)

    var buffer_scene = new THREE.Scene();
    buffer_scenes.push(buffer_scene)

    var light = new THREE.PointLight(light_color, light_intensity);
    light.position.set(0, 3, 15);
    buffer_scene.add(light);

    buffer_scene.add( new THREE.AmbientLight(0xfff));

    var hue = Math.random() * 360
    var dummy_material = new THREE.MeshPhongMaterial({ color: new THREE.Color("hsl(" + hue + ", 100%, 50%)") });
    var dummy_geometry = dummy_geos[i]
    var dummy_obj = new THREE.Mesh(dummy_geometry, dummy_material);
    dummy_obj.position.z = -1;
    buffer_scene.add(dummy_obj);
    dummy_objs.push(dummy_obj);


    var room = new THREE.BoxGeometry(10, 10, 10);
    var hue = Math.random() * 360
    var dummy_bg_mat = new THREE.MeshPhongMaterial({ color: new THREE.Color("hsl(" + hue + ", 100%, 50%)") })
    dummy_bg_mat.side = THREE.BackSide
    dummy_bg_materials.push(dummy_bg_mat)
    var dummy_bg = new THREE.Mesh(room, dummy_bg_mat);
    dummy_bgs.push(dummy_bg)
    buffer_scene.add(dummy_bg);

    var live_material = new THREE.MeshBasicMaterial({ map: buffer_texture.texture });
    live_materials.push(live_material)
  }

  // Clear first scene for cornell box
  var cur_scene = buffer_scenes[4];
  cur_scene.remove.apply(cur_scene, cur_scene.children);
  const loader = new GLTFLoader();

  loader.load( 'rsc/models/cornell-box.glb', function ( gltf ) {
    cur_scene.add( gltf.scene );
  }, undefined, function ( error ) {
    console.error( error );
  } );


  // Set Scenes to correct orientation

  //        .----------------.
  //      / |               /
  //     /  |              / |                  Y  Z
  //    /   |     2       /  |  << 5 (back)     | /
  //   /    |            /   |                  |/
  //  .----------------.     |                   ----- X
  //  |  1             |  0  |
  //  |    /           |    /
  //  |   /    4       |   /
  //  |  /             |  /
  //  | /              | /   << 3 (under)
  //  . -------------- .
  //

  buffer_scenes[0].setRotationFromEuler(new THREE.Euler(0, Math.PI / 2, 0))
  buffer_scenes[1].setRotationFromEuler(new THREE.Euler(0, - Math.PI / 2, 0))
  buffer_scenes[2].setRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
  buffer_scenes[3].setRotationFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))
  buffer_scenes[4].setRotationFromEuler(new THREE.Euler(0, 0, 0))
  buffer_scenes[5].setRotationFromEuler(new THREE.Euler(Math.PI, 0, 0))

  // Forward render result to output texture.
  var mainBoxGeo = new THREE.BoxGeometry(10,10,10);
  var mainBoxObject = new THREE.Mesh(mainBoxGeo, live_materials);
  scene.add(mainBoxObject);
  
  // var wireframe = new THREE.WireframeGeometry(mainBoxGeo);

  // var line = new THREE.LineSegments(wireframe);
  // line.material.depthTest = true;
  // line.material.opacity = 0.5;
  // line.material.color = new THREE.Color(0x0088ff)
  // line.material.transparent = true;

  // scene.add(line);

  loader.load( 'rsc/models/frame.glb', function ( gltf ) {
    gltf.scene.scale.set(1.1,1.1,1.1);
    scene.add( gltf.scene );

    var light = new THREE.PointLight(0xffffff, 1);
    light.position.set(0, 3, 15);
    scene.add(light);

  }, undefined, function ( error ) {
    console.error( error );
  } );


  function toScreenXY(pos, canvas) {
    var width = canvas.width, height = canvas.height;

    var p = new THREE.Vector3(pos.x, pos.y, pos.z);
    var vector = p.project(camera);

    vector.x = (vector.x + 1) / 2 * width;
    vector.y = -(vector.y - 1) / 2 * height;

    return vector;
  }


  function render() {

    controls.update();
    // miniscene_camera.position.set(camera.position);
    // miniscene_camera.lookAt(new THREE.Vector3(0, 0, 0));
    requestAnimationFrame(render);

    //Make the box rotate on box axises
    // boxObject.rotation.y += 0.01;
    // boxObject.rotation.x += 0.02;
    // boxObject2.rotation.y += 0.03;
    // boxObject2.rotation.x += 0.01;
    //Rotate the main box too
    // mainBoxObject.rotation.y -= 0.01;
    // mainBoxObject.rotation.x -= 0.01;

    if (controls.show_debug_uvs) {
      for (var i = 0; i < renderers.length; i++) {
        var r = renderers[i];
        var miniscene = buffer_scenes[i];
        r.render(miniscene, miniscene_camera);
      }
    }

    camera.updateProjectionMatrix();
    var face_uvs = mainBoxObject.geometry.faceVertexUvs[0];
    var face_idx = mainBoxObject.geometry.faces;
    var vertices = mainBoxObject.geometry.vertices;


    for (var idx in canvas2ds) {
      var canvas = canvas2ds[idx];
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    for (var i = 0; i < face_uvs.length; i++) {
      // per tri
      var tri_uvs = face_uvs[i];
      var tri_vertices = face_idx[i];
      var tri_geometry = [vertices[tri_vertices['a']], vertices[tri_vertices['b']], vertices[tri_vertices['c']]]


      var canvas = canvas2ds[Math.floor(i / 2)];
      var context = canvas.getContext('2d');



      var uvs = [];
      for (var j = 0; j < tri_uvs.length; j++) {
        // per vertex

        // project to camera
        var vertex = tri_geometry[j];
        var projected = vertex.clone().project(miniscene_camera);
        projected.x = (projected.x+ 1) / 2; 
        projected.y = -(projected.y - 1) / 2; 


        // For drawing UVs in debugger tools.
        uvs.push({ x: projected.x * width / 4, y: projected.y * height / 4 });


        // Set the UVs.
        var uv = tri_uvs[j];
        uv.x = projected.x;
        uv.y = 1-projected.y;

        
      }
      drawTriangle(canvas, uvs[0], uvs[1], uvs[2]);

    }
    mainBoxObject.geometry.uvsNeedUpdate = true;

    for (var i = 0; i < 6; i++) {
      renderer.setRenderTarget(buffer_textures[i])
      renderer.render(buffer_scenes[i], miniscene_camera);
    }

    renderer.setRenderTarget(null)
    renderer.render(scene, camera);

  }
  render();
}

main();