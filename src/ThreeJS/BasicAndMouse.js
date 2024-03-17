
import * as THREE from "three";
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

let inDebuggingMode;
let frameId;

const mouse = {x: 0, y: 0};
let mouse3D = new THREE.Vector3();

let renderer;
let canvas ;
let camera;
let scene;
let container;
let canvasBounds;
let externalRenderFunction = null;
let externalMouseMovementFunction = null;
let controls ;

let counter = 0;
let userHeight;
let candles = [];
let woodenSign;


export function getRenderer()
{
    return renderer ;
}

export function getScene()
{
    return scene ;
}

function builtEventListener() {
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('scroll', updateCanvasBounds, false);
}

function onWindowResize() {
    if (!camera || !renderer || !container) return;


    const width = container.clientWidth;
    const height = container.clientHeight;

    if (inDebuggingMode) {
        console.log('Resizing to:', width, height);
    }

    // Update camera aspect ratio and renderer size
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    updateCanvasBounds();
}

function updateCanvasBounds() {
    if (renderer && renderer.domElement) {
        console.log('Updating canvas bounds to ' + renderer.domElement.getBoundingClientRect().width + 'x' + renderer.domElement.getBoundingClientRect().height + 'px');
        canvasBounds = renderer.domElement.getBoundingClientRect();
    } else {
        console.log('Unable to act on updateCanvasBounds(). No renderer or renderer.domElement found.')
    }
}

export function initThreeJSBase(isContainer, inDebug, userHeightValue, candlesArray) {

    container = isContainer;
    inDebuggingMode = inDebug ;
    userHeight = userHeightValue;
    candles = candlesArray;

    builtEventListener() ;

    if (!container) {
        console.error('No container element provided for Three.js initialization.');
        return;
    }

    canvas = container.querySelector('canvas');

    if (!canvas) {
        console.error('No canvas element found in the container.');
        return;
    }

    createRenderer(canvas, !inDebuggingMode);
    updateCanvasBounds();
    createCamera(container.clientWidth, container.clientHeight);

    scene = new THREE.Scene();

    if (inDebuggingMode) {
        setInDebug(true);
    }

    let firstRender = true;
    let lastRenderTime = 0;

    onWindowResize() ;

    function render(time) {

        makeRenderCheck() ;

        time *= 0.001;

        // Calculate the delta time
        const deltaTime = time - lastRenderTime;

        lastRenderTime = time;

        if (externalRenderFunction) {
            externalRenderFunction(deltaTime);
        }

        frameId = requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    function makeRenderCheck() {
        if (firstRender) {
            firstRender = false;
            container.style.display = 'flex'; // Show the canvas after the first render
        }
    }

    requestAnimationFrame(render);
}

export function setCustomRenderFunction(func) {
    externalRenderFunction = func;
}

export function toggleShadows() {
    renderer.shadowMap.enabled = !renderer.shadowMap.enabled;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: for softer shadows
}


function onMouseMove(event) {
    if (!camera || !canvasBounds) return;

    // Clamp the mouse position to the canvas bounds
    const clampedX = Math.min(Math.max(event.clientX, canvasBounds.left), canvasBounds.right);
    const clampedY = Math.min(Math.max(event.clientY, canvasBounds.top), canvasBounds.bottom);

    // Calculate mouse position relative to the canvas
    mouse.x = ((clampedX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
    mouse.y = -((clampedY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

    mouse3D.set(mouse.x, mouse.y, 0.0); // Set Z between -1 and 1

    if (externalMouseMovementFunction) {
        externalMouseMovementFunction(mouse);
    }
}

function createRenderer(canvas, isTransparent) {
    if (renderer) {
        renderer.dispose();
    }

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas,
        alpha: isTransparent
    });
}

function createCamera(width, height) {
    const fov = 50;
    const aspect = width / height; // Adjust for canvas size
    const near = 0.1;
    const far = 300;

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    resetCamera() ;
}

export function resetCamera() {
    camera.position.x = 5;
    camera.position.y = userHeight;
    camera.position.z = 0;
}

export function resetGame() {
    resetCamera();

    candles.forEach((candle) => {
        candle.userData.group.forEach((object) => {
                object.visible = true;
        });
        candle.userData.visible = true;
    })

    setCounter(0);
    woodenSign.visible = false;

}

export function setCameraPosition(x,y,z) {
    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;
}

export function getCamera() {
    return camera ;
}

export function setCamera(newCamera) {
    camera = newCamera
}

export function zoomInOrOut(isIn) {

    let cameraDirection = camera.position.clone().normalize();
    let zoomStep = 2;

    if (isIn) {
        camera.position.sub(cameraDirection.multiplyScalar(zoomStep));
    } else {
        camera.position.add(cameraDirection.multiplyScalar(zoomStep));
    }

}

// Debugging stuff
let line;
let axesHelper ;

export function setInDebug(setOrRemove) {

    if(!axesHelper || !line) {
        initDebug() ;
    }

    if(setOrRemove) {
        scene.add(axesHelper);
        scene.add(line);
        createRenderer(canvas,false) ;
    } else {
        scene.remove(axesHelper);
        scene.remove(line);
        createRenderer(canvas, true) ;
    }
}

export function getMouse2D() {
    return mouse ;
}

export function getNormalizedMouse() {

    if(mouse3D) {
        return mouse3D.clone().normalize() ;
    } else {
        console.log("PAS DE MOUSE 3D a NORMALISE")
        return null ;
    }

}

function initDebug() {
    // Create axis helper to display the center of the rendering
    axesHelper = new THREE.AxesHelper(10);

    // Create a line between the center and the mouse
    let lineMaterial = new THREE.LineBasicMaterial({color: 0x0000ff});
    let lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)]);
    line = new THREE.Line(lineGeometry, lineMaterial);
}

export function lookAtIm(element) {
    camera.lookAt(element.position) ;
}

export function add(element) {
    scene.add(element) ;
}

let directionalLight
let lightsAreOn ;

export function toggleLights() {
    initLight() ;
    if(lightsAreOn) {
        scene.remove(directionalLight);
    } else {
        scene.add(directionalLight);
    }

    return directionalLight ;
}

export function setLightPosition(x,y,z) {
    initLight() ;

    if(!x) {
        x = directionalLight.position.x ;
    }
    if(!y) {
        y = directionalLight.position.y ;
    }
    if(!z) {
        z = directionalLight.position.z ;
    }

    directionalLight.position.set(x, y, z);
}

export function initLightPrecise(x,y,z) {
    if(!directionalLight) {
        directionalLight = new THREE.DirectionalLight(0xffffff, 1);

        directionalLight.position.set(x,y,z);
        directionalLight.castShadow = true;

        // Better shadow quality
        directionalLight.shadow.mapSize.width = 1024;  // Default is 512
        directionalLight.shadow.mapSize.height = 1024; // Default is 512
        directionalLight.shadow.camera.near = 0.5;     // Default
        directionalLight.shadow.camera.far = 500;      // Default
    }

    return directionalLight ;
}

export function initLight() {
    return initLightPrecise(5, 10, 7.5) ;
}

export function removeEventListeners() {
    window.removeEventListener('mousemove', onMouseMove, false);
    window.removeEventListener('resize', onWindowResize, false);
    window.removeEventListener('scroll', updateCanvasBounds, false);
}

export function cleanupThreeJS() {
    cancelAnimationFrame(frameId);
    removeEventListeners() ;
 }

export function setBackgroundColor(color) {
    scene.background = new THREE.Color( color );
}
export function setControl_FirstPerson(setMovementSpeed = 1000, setLookSpeed = 0.125, setLookVertical =true) {
    controls = new FirstPersonControls( camera, renderer.domElement );

    controls.movementSpeed = setMovementSpeed;
    controls.lookSpeed = setLookSpeed;
    controls.lookVertical = setLookVertical;
}

export function getCounter(){
    return counter;
}

export function setCounter(counterValue){
    counter = counterValue;
}

export function setWoodenSign(woodenSignObject){
    woodenSign = woodenSignObject;
}