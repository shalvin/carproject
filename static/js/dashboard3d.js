var FOV = 75;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

var redCube = cube();
scene.add(redCube);

camera.position.z = 5;

document.body.appendChild(renderer.domElement)

render();


function cube() {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    var cube = new THREE.Mesh(geometry, material);
    var box = new THREE.EdgesHelper(cube, 0xff0000);
    box.material.linewidth = 2;
    return cube;
}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);

    redCube.rotation.x += 0.01;
    redCube.rotation.y += 0.01;
}