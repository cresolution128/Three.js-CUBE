import*as THREE from "https://threejs.org/build/three.module.js";
import {OrbitControls} from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from "https://threejs.org/examples/jsm/loaders/GLTFLoader.js";

import Qube from "./qube.js";
import MouseRaycaster from "../core/js/rendering/MouseRaycaster.js";
import ZoomToCursorBehavior from "../core/js/rendering/ZoomToCursorBehavior.js";

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
//controls.enablePan = false;


new ZoomToCursorBehavior({THREE,controls,camera});

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

let mouseRaycaster = new MouseRaycaster(THREE)

let hitIndicator = new THREE.Mesh(new THREE.SphereGeometry(.1),new THREE.MeshBasicMaterial())
let hi1=hitIndicator.clone()
hitIndicator.scale.set(1,1,1)
hitIndicator.add(hi1)
hi1.material=hi1.material.clone()
hi1.material.color.set('black')
hi1.renderOrder = 2;
hi1.material.depthFunc=THREE.GreaterDepth;
hi1.scale.multiplyScalar(.5)
hitIndicator.onBeforeRender=function(){
    hitIndicator.scale.multiplyScalar(.98)
    if(hitIndicator.scale.x<.001)hitIndicator.parent.remove(hitIndicator);
}
let showHit=(obj,point)=>{
    if(obj!=hitIndicator){
        hitIndicator.scale.set(1,1,1)
        obj.add(hitIndicator)
        hitIndicator.position.copy(point)
    }
}


document.addEventListener('mousedown',function(event){
    let hits = mouseRaycaster.raycast({
        event,
        camera,
        root:qube.root,
        recursive:true})
    console.log(hits)
    if(hits.length){
        let h=hits[0];
        showHit(h.object,h.object.worldToLocal(h.point))
    }
})

animate();
