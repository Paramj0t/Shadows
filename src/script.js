import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

// console.log(THREE.PerspectiveCamera);

//Texture
const textureLoader = new THREE.TextureLoader();
const bakedShadow = textureLoader.load("/textures/bakedShadow.jpg");
const simpleShadow = textureLoader.load("/textures/simpleShadow.jpg");

//Debugger
const gui = new dat.GUI();

//Cursor
const cursor = {
	x: 0,
	y: 0,
};

window.addEventListener("mousemove", (event) => {
	cursor.x = event.clientX / sizes.width - 0.5;
	cursor.y = -(event.clientY / sizes.height - 0.5);
});

//Scene
const scene = new THREE.Scene();

//Material
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;

//Objects
const sphere = new THREE.Mesh(
	new THREE.SphereBufferGeometry(0.5, 32, 32),
	material
);
sphere.castShadow = true;

const plane = new THREE.Mesh(
	new THREE.PlaneBufferGeometry(5, 5),
	// new THREE.MeshBasicMaterial({ map: bakedShadow })
	material
);

plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.65;
plane.receiveShadow = true;

// scene.add(sphere, plane);

const sphereShadow = new THREE.Mesh(
	new THREE.PlaneBufferGeometry(1.5, 1.5),
	new THREE.MeshBasicMaterial({
		color: 0x000000,
		transparent: true,
		alphaMap: simpleShadow,
	})
);
sphereShadow.rotation.x = -Math.PI * 0.5;
sphereShadow.position.y = plane.position.y + 0.01;

scene.add(sphere, sphereShadow, plane);

//Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.3);
directionalLight.position.set(2, 2, -1);
gui.add(directionalLight, "intensity").min(0).max(1).step(0.001);
gui.add(directionalLight.position, "x").min(-5).max(5).step(0.001);
gui.add(directionalLight.position, "y").min(-5).max(5).step(0.001);
scene.add(directionalLight);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.left = -2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 6;
directionalLight.shadow.radius = 10;

const directionalLightCameraHelper = new THREE.CameraHelper(
	directionalLight.shadow.camera
);

// scene.add(directionalLightCameraHelper);

const spotLight = new THREE.SpotLight(0xffffff, 0.4, 10, Math.PI * 0.3);
spotLight.castShadow = true;

spotLight.position.set(0, 2, 2);
scene.add(spotLight);
scene.add(spotLight.target);

// const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);

// scene.add(spotLightCameraHelper);

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.fov = 20;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 6;

const pointLight = new THREE.PointLight(0xffffff, 0.3);
pointLight.castShadow = true;
pointLight.position.set(-1, 1, 0);
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 5;

scene.add(pointLight);

// const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);

// scene.add(pointLightCameraHelper);

//sizes
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	//Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	//Update Camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	//Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("dblclick", () => {
	if (!document.fullscreenElement) {
		canvas.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
});

//Camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	1,
	100
);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
// camera.lookAt(mesh.position);
scene.add(camera);

//Renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({
	// canvas: canvas
	canvas,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(sizes.width, sizes.height);
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = false;

//Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// //Clock
const clock = new THREE.Clock();

//Animation
const tick = () => {
	//clock sec
	const elapsedTime = clock.getElapsedTime();

	//Update shadows
	sphereShadow.position.x = sphere.position.x;
	sphereShadow.position.z = sphere.position.z;
	sphereShadow.material.opacity = (1 - Math.abs(sphere.position.y)) * 0.3;

	//Update Objects
	sphere.rotation.y = 0.1 * elapsedTime;
	sphere.rotation.x = 0.15 * elapsedTime;
	sphere.position.x = Math.cos(elapsedTime) * 1.5;
	sphere.position.z = Math.sin(elapsedTime) * 1.5;
	sphere.position.y = Math.abs(Math.sin(elapsedTime * 15));

	//Update controls
	controls.update();

	//Renderer
	renderer.render(scene, camera);

	window.requestAnimationFrame(tick);
};

tick();
