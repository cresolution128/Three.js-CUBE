import*as THREE from "https://threejs.org/build/three.module.js";
import {OrbitControls} from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from "https://threejs.org/examples/jsm/loaders/GLTFLoader.js";

import Qube from "./qube.js";

const camera = new THREE.PerspectiveCamera(60,window.innerWidth / window.innerHeight,0.1,1000);
camera.position.set(1, 1, 1).multiplyScalar(8);

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera,renderer.domElement);
//controls.autoRotate= true
controls.autoRotateSpeed = 1;
controls.enablePan = false;
const clock = new THREE.Clock();

onWindowResize();
window.addEventListener("resize", onWindowResize, false);

const lights = new THREE.Object3D();

let light = new THREE.DirectionalLight("white",1.1);
light.shadow.enabled = true;
light.position.set(1, 1, 1).multiplyScalar(100);
lights.add(light);
//Set up shadow properties for the light
light.shadow.mapSize.width = 512;
light.shadow.mapSize.height = 512;
light.shadow.radius = 4;
let lc = light.shadow.camera;
lc.near = 0.5;
lc.far = 500;
lc.left = lc.bottom = -120;
lc.right = lc.top = 120;
lc.updateProjectionMatrix();
light.shadow.bias = -0.0005;

let dirLight = light;
dirLight.castShadow = true;

let light1 = new THREE.PointLight(0xffffff);
light1.position.set(5, 9, -5).multiplyScalar(100);

let light2 = new THREE.PointLight(0xffffff);
light2.position.set(-1, -1, -1).multiplyScalar(100);
light2.position.set(0, 0, 1)
camera.add(light2)
scene.add(lights);
scene.add(camera);

let qube = new Qube(THREE,scene,GLTFLoader)

function render() {
    controls.update();
    renderer.render(scene, camera);
    qube.update()
}

document.addEventListener("keydown", qube.handleKey)

function onWindowResize(event) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

animate();
