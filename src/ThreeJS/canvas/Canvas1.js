import * as ThreeCanvas from "@/ThreeJS/BasicAndMouse" ;
import * as THREE from "three";
import {OBJLoader} from "three/addons/loaders/OBJLoader";

import CandlestickModel from "@/assets/models/candle/candlestick.obj";
import ProperCandleModel from "@/assets/models/candle/proper_candle.obj";
import WishingTreeModel from "@/assets/models/wishingTree/tree.obj";
import WoodenSignModel from "@/assets/models/woodenSign/woodenSign.obj";

import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";


// objects
let plane;
let origin;
let candles = [];
let candlesMaterials = [];
let candleSticks = [];
let woodenSign;

// user information
const userHeight = 1.8;
const userWeight = 80;

// directions for camera move (forward, backward, left, right)
let moveDir = [false, false, false, false];

// speed for camera move
const cameraSpeed = 1;

// jumping information
let jumping = false;
let velocity;
const gravity = 10;

// bloom effect
let renderScene;
let composer;

// game infos
const candlePlacement = [
    {x: 0.25, y:1, z:-0.35},
    {x: 0.35, y:1.3, z:0.45},
    {x: 0, y:1.65, z:0.95},
    {x: -0.5, y:1.65, z:-0.3},
    {x: -0.1, y:2, z:-1},
    {x: -0.75, y:2.25, z:0.75},
    {x: 0.9, y:2.1, z:-0.2},
    {x: 0.35, y:2.5, z:0.95},
    {x: -0.75, y:2.7, z:-0.6},
    {x: -0.25, y:3.1, z:0.85},
    {x: 0, y:3.1, z:-0.75},
    {x: 0.5, y:3.15, z:0.2},
    {x: -0.5, y:3.15, z:0.1},
    {x: 0.6, y:2.90, z:0.1},
    {x: 0, y:3.85, z:0}
];

const raycaster = new THREE.Raycaster();

export function initAndBuildThree(container) {

    function init() {

        ThreeCanvas.initThreeJSBase(container, false, userHeight, candles);

        const objLoader = new OBJLoader();
        const loader = new THREE.TextureLoader();

        ThreeCanvas.setCounter(0);

        //--------------------------- LIGHTS ---------------------------
        let directionalLight ;
        directionalLight = new THREE.DirectionalLight('white', 0.8);
        directionalLight.position.set(4, 10, 4); // Position the light
        directionalLight.castShadow = true;
        ThreeCanvas.getScene().add(directionalLight) ;

        const ambientLight = new THREE.AmbientLight( 0xeeeeee, 0.25 );
        ThreeCanvas.getScene().add(ambientLight);

        ThreeCanvas.toggleShadows() ;

        //--------------------------- BLOOM EFFECT ---------------------------
        renderScene = new RenderPass(ThreeCanvas.getScene(), ThreeCanvas.getCamera());
        composer = new EffectComposer(ThreeCanvas.getRenderer());
        composer.addPass(renderScene);


        //--------------------------- GEOMETRIES ---------------------------
        const planeGeo = new THREE.PlaneGeometry(40, 40);
        const pointGeo = new THREE.BoxGeometry(0, 0, 0);


        //--------------------------- TEXTURES ---------------------------
        // PLANE
        const grassTexturePath = '/texture/grass/' ;
        const grassTexture = new THREE.TextureLoader().load(grassTexturePath + 'grass.jpg');
        const grassNormalMap = new THREE.TextureLoader().load(grassTexturePath + 'normal.png');
        const grassMaterial = new THREE.MeshStandardMaterial({
            map: grassTexture,
            normalMap: grassNormalMap
        }) ;


        // CANDLE
        const candleTexturePath = '/texture/candle/';
        const candleTexture = new THREE.TextureLoader().load(candleTexturePath + 'candleMaterial.jpg');
        const candleHighlightTexture = new THREE.TextureLoader().load(candleTexturePath + 'candleHighlightMaterial.jpg');
        const candleNormalMap = new THREE.TextureLoader().load(candleTexturePath + 'normal.jpg');
        const candleMaterial = new THREE.MeshStandardMaterial({
            map: candleTexture,
            normalMap: candleNormalMap
        }) ;
        const candleHighlightMaterial = new THREE.MeshStandardMaterial({
            map: candleHighlightTexture,
            normalMap: candleNormalMap,
        }) ;


        // CANDLE FLAME
        let candlelight = loader.load( '/texture/sprites/candle/candleFlame.png' );
        candlelight.magFilter = THREE.NearestFilter;
        let candleFlameMaterial = new THREE.SpriteMaterial( { map: candlelight } );


        // TREE
        const treeTexturePath = '/texture/wishingTree/' ;
        const treeTexture = new THREE.TextureLoader().load(treeTexturePath + 'wishingTreeMaterial.jpg');
        const wishingTreeTexture = new THREE.MeshStandardMaterial({
            map: treeTexture,
        }) ;


        // WOODEN SIGN
        const woodenSignTexturePath = '/texture/woodenSign/';
        const woodenSignTexture = new THREE.TextureLoader().load(woodenSignTexturePath + 'woodenSignTexture.jpg');
        const woodenSignNormalMap = new THREE.TextureLoader().load(woodenSignTexturePath + 'normal.png');
        const woodenSignMaterial = new THREE.MeshStandardMaterial({
            map: woodenSignTexture,
            normalMap: woodenSignNormalMap
        }) ;



        //--------------------------- PLANE ---------------------------
        plane = new THREE.Mesh(planeGeo);
        plane.material = grassMaterial;

        plane.receiveShadow = true;

        plane.rotation.x = -Math.PI / 2;
        plane.position.y = 0;
        plane.position.x = -10;
        ThreeCanvas.getScene().add(plane);

        ThreeCanvas.setCameraPosition( 5, plane.position.y + userHeight, 0 );


        //--------------------------- ORIGIN ---------------------------
        origin = new THREE.Mesh(pointGeo);
        origin.position.set(0, plane.position.y + userHeight, 0);
        ThreeCanvas.getScene().add(origin);

        ThreeCanvas.lookAtIm(origin);


        //--------------------------- WISHING TREE ---------------------------
        objLoader.load(
            WishingTreeModel,
            (tree) => {

                tree.traverse((child) => {
                    if (child.isMesh) {
                        child.material = wishingTreeTexture;
                        child.material.needsUpdate = true;
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                ThreeCanvas.getScene().add(tree);
            },
            // onProgress callback
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            // onError callback
            (error) => {
                console.log('An error happened', error);
            }
        );


        //--------------------------- WOODEN SIGN ---------------------------
        objLoader.load(
            WoodenSignModel,
            (sign) => {

                sign.traverse((child) => {
                    if (child.isMesh) {
                        child.material = woodenSignMaterial;
                        child.rotation.z = -Math.PI / 2;
                        child.position.y = 1;
                        child.position.x = 0.25;
                        child.position.z = 0.15;
                        child.scale.set(0.2, 0.2, 0.2);

                        child.material.needsUpdate = true;
                        child.castShadow = true;
                        child.receiveShadow = true;

                        ThreeCanvas.getScene().add(child);
                        child.visible = false;

                        woodenSign = child;
                        ThreeCanvas.setWoodenSign(woodenSign);
                    }
                });

            },
            // onProgress callback
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            // onError callback
            (error) => {
                console.log('An error happened', error);
            }
        );


        //--------------------------- CANDLESTICK ---------------------------
        for (let i = 0; i < 15; i++) {
            objLoader.load(
                CandlestickModel,
                (candleStick) => {
                    const material = loadCandlestickTexture();
                    candleStick.traverse((child) => {
                        if (child.isMesh) {
                            candleSticks.push(child);
                            child.material = material;
                            child.material.needsUpdate = true;
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    candleStick.position.set(candlePlacement[i].x, candlePlacement[i].y, candlePlacement[i].z);
                    candleStick.scale.set(0.1, 0.1, 0.1);
                    const candlestickBoundingBox = new THREE.Box3().setFromObject(candleStick);


                    //--------------------------- PROPER CANDLE ---------------------------
                    objLoader.load(
                        ProperCandleModel,
                        (proper_candle) => {


                            proper_candle.position.set(candlePlacement[i].x, candlestickBoundingBox.max.y, candlePlacement[i].z);
                            proper_candle.scale.set(0.1, 0.1, 0.1);
                            ThreeCanvas.getScene().add(candleStick);
                            ThreeCanvas.getScene().add(proper_candle);

                            candlesMaterials.push(candleMaterial);

                            const properCandleBoundingBox = new THREE.Box3().setFromObject(proper_candle);


                            proper_candle.traverse((child) => {
                                if (child.isMesh) {


                                    //--------------------------- FLAME (SPRITE) ---------------------------
                                    const candleFlameSprite = new THREE.Sprite( candleFlameMaterial );

                                    candleFlameSprite.scale.set( 0.03, 0.075, 0.03);
                                    candleFlameSprite.position.set(candlePlacement[i].x, properCandleBoundingBox.max.y + 0.025, candlePlacement[i].z);
                                    ThreeCanvas.getScene().add(candleFlameSprite);


                                    //--------------------------- LIGHT (POINT LIGHT) ---------------------------
                                    const pointLight = new THREE.PointLight('#E09D37', 0.15, 0.35);
                                    pointLight.position.set(candlePlacement[i].x, properCandleBoundingBox.max.y + 0.025, candlePlacement[i].z);
                                    ThreeCanvas.getScene().add(pointLight);


                                    
                                    child.userData.group = [child, candleFlameSprite, pointLight];
                                    child.userData.visible = true;
                                    child.material.needsUpdate = true;
                                    child.castShadow = true;
                                    child.receiveShadow = true;

                                    candles.push(child);
                                }
                            });


                        },
                        // onProgress callback
                        (xhr) => {
                            console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
                        },
                        // onError callback
                        (error) => {
                            console.log('An error happened', error);
                        }
                    );
                },
                // onProgress callback
                (xhr) => {
                    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
                },
                // onError callback
                (error) => {
                    console.log('An error happened', error);
                }
            );
        }



        //--------------------------- RENDER FUNCTION ---------------------------
        ThreeCanvas.setCustomRenderFunction((delta) => {


            //--------------------------- MOVE CAMERA WITH ZQSD ---------------------------
            // FORWARD
            if(moveDir[0]) ThreeCanvas.setCameraPosition(ThreeCanvas.getCamera().position.x - cameraSpeed * delta, ThreeCanvas.getCamera().position.y, ThreeCanvas.getCamera().position.z)
            // BACKWARDS
            if(moveDir[1]) ThreeCanvas.setCameraPosition(ThreeCanvas.getCamera().position.x + cameraSpeed * delta, ThreeCanvas.getCamera().position.y, ThreeCanvas.getCamera().position.z)
            // LEFT
            if(moveDir[2]) ThreeCanvas.setCameraPosition(ThreeCanvas.getCamera().position.x, ThreeCanvas.getCamera().position.y, ThreeCanvas.getCamera().position.z + cameraSpeed * delta)
            // RIGHT
            if(moveDir[3]) ThreeCanvas.setCameraPosition(ThreeCanvas.getCamera().position.x, ThreeCanvas.getCamera().position.y, ThreeCanvas.getCamera().position.z - cameraSpeed * delta)



            //--------------------------- JUMPING ---------------------------
            if (jumping) {
                ThreeCanvas.setCameraPosition(ThreeCanvas.getCamera().position.x, ThreeCanvas.getCamera().position.y + velocity * delta, ThreeCanvas.getCamera().position.z);
                velocity -= gravity * delta * (userWeight / 100);
                if (ThreeCanvas.getCamera().position.y <= plane.position.y + userHeight) {
                    ThreeCanvas.setCameraPosition(ThreeCanvas.getCamera().position.x, plane.position.y + userHeight, ThreeCanvas.getCamera().position.z);
                    jumping = false;
                }
            }


            //--------------------------- RAY CASTING ---------------------------
            raycaster.setFromCamera(ThreeCanvas.getMouse2D(), ThreeCanvas.getCamera());
            const intersects = raycaster.intersectObjects(candles);

            // Apply in all cases the original texture
            for (let i = 0; i < candles.length; i++) {
                    candles[i].material = candleMaterial;
            }

            // If intersection, apply intersection texture
            for (let i = 0; i < intersects.length; i++) {
                intersects[i].object.material = candleHighlightMaterial;
            }


        });

        ThreeCanvas.setBackgroundColor("#87CEEB");

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        window.addEventListener('mousedown', onDocumentMouseDown, false);
    }


    function animate(){
        composer.render();
        requestAnimationFrame(animate);
    }


    function onDocumentMouseDown(event) {
        event.preventDefault();

        raycaster.setFromCamera(ThreeCanvas.getMouse2D(), ThreeCanvas.getCamera());
        const intersects = raycaster.intersectObjects(candles);

        if (intersects.length > 0) {
            // Le premier bloc qui intersect avec mon rayon
            let intersect = intersects[0].object ;

            try{
                if(intersect.userData.visible){
                    ThreeCanvas.setCounter(ThreeCanvas.getCounter() + 1);
                    console.log(ThreeCanvas.getCounter());
                }
                // Si toutes les bougies ont été éteintes, alors le jeu est remporté
                if(ThreeCanvas.getCounter() === 15)
                    woodenSign.visible = true;

                intersect.userData.group.forEach((object) => {
                        object.visible = false;
                });
                intersect.userData.visible = false;
            }
            catch(e){
                console.error(e)
            }
        }
    }


    function onKeyDown(event) {
        switch (event.key) {
            case "z":
                moveDir[0] = true;
                break;
            case "s":
                moveDir[1] = true;
                break;
            case "q":
                moveDir[2] = true;
                break;
            case "d":
                moveDir[3] = true;
                break;
            case " ":
                if (!jumping) {
                    jumping = true;
                    velocity = 2.5;
                }
                break;
            default:
                break;
        }
    }

    function onKeyUp(event) {
        switch (event.key) {
            case "z":
                moveDir[0] = false;
                break;
            case "s":
                moveDir[1] = false;
                break;
            case "q":
                moveDir[2] = false;
                break;
            case "d":
                moveDir[3] = false;
                break;
            default:
                break;
        }
    }

    function loadCandlestickTexture() {
        const texturePath = "/texture/MetalSteelBrushed" ;
        // Load textures
        const textureLoader = new THREE.TextureLoader();
        const aoMap = textureLoader.load(texturePath + '/MetalSteelBrushed_DISP_2K_METALNESS.png');
        const colorMap = textureLoader.load(texturePath + '/MetalSteelBrushed_COL_2K_METALNESS.png');
        const metalnessMap = textureLoader.load(texturePath + '/MetalSteelBrushed_METALNESS_2K_METALNESS.png');
        const normalMap = textureLoader.load(texturePath + '/MetalSteelBrushed_NRM_2K_METALNESS.png');
        const roughnessMap = textureLoader.load(texturePath + '/MetalSteelBrushed_ROUGHNESS_2K_METALNESS.png');

        const material = new THREE.MeshStandardMaterial({
            map: colorMap,
            aoMap: aoMap,
            metalnessMap: metalnessMap,
            normalMap: normalMap,
            roughnessMap: roughnessMap,
            metalness: 0.7,
            roughness: 2
        });

        return material ;
    }

    init();
    animate();

}