/* eslint-disable no-unused-vars */

// modèles utilisés :
// https://threejs.org/examples/#webgl_materials_cubemap_refraction
// https://threejs.org/examples/#webgl_points_sprites

import * as ThreeCanvas from "@/ThreeJS/BasicAndMouse" ;
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';


export function initAndBuildThree(container) {

    ThreeCanvas.initThreeJSBase(container, true) ;

    let containerBox, stats;

    let camera, scene, renderer, parameters;
    const materials = [];

    let mouseX = 0, mouseY = 0;

    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    init();
    animate();

    function init() {

        containerBox = document.createElement( 'div' );
        container.appendChild( containerBox );

        camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 100000 );
        camera.position.z = - 2500;

        const r = '/texture/Park3Med/';

        const urls = [
            r + 'px.jpg', r + 'nx.jpg',
            r + 'py.jpg', r + 'ny.jpg',
            r + 'pz.jpg', r + 'nz.jpg'
        ];

        const textureCube = new THREE.CubeTextureLoader().load( urls );
        textureCube.mapping = THREE.CubeRefractionMapping;

        scene = new THREE.Scene();
        scene.background = textureCube;

        // LIGHTS

        const ambient = new THREE.AmbientLight( 0xffffff, 3.5 );
        scene.add( ambient );

        // material samples

        const cubeMaterial3 = new THREE.MeshPhongMaterial( { color: 0xccddff, envMap: textureCube, refractionRatio: 0.98, reflectivity: 0.9} );
        const cubeMaterial1 = new THREE.MeshPhongMaterial( { color: 0xffffff, envMap: textureCube, refractionRatio: 0.7 } );
        const cubeMaterial2 = new THREE.MeshPhongMaterial( { color: 0xccfffd, envMap: textureCube, refractionRatio: 0.985 } );

        //

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        containerBox.appendChild( renderer.domElement );

        stats = new Stats();
        containerBox.appendChild( stats.dom );

        // load des flocons

        const geometryBuffer = new THREE.BufferGeometry();
        const textureLoader = new THREE.TextureLoader();
        const assignSRGB = ( texture ) => {

            texture.colorSpace = THREE.SRGBColorSpace;

        };

        const sprite1 = textureLoader.load( '/texture/sprites/snowflake1.png', assignSRGB );
        const sprite2 = textureLoader.load( '/texture/sprites/snowflake2.png', assignSRGB );
        const sprite3 = textureLoader.load( '/texture/sprites/snowflake3.png', assignSRGB );
        const sprite4 = textureLoader.load( '/texture/sprites/snowflake4.png', assignSRGB );
        const sprite5 = textureLoader.load( '/texture/sprites/snowflake5.png', assignSRGB );



        const loader = new PLYLoader();
        loader.load( '/models/Lucy100k.ply', function ( geometry ) {

            createScene( geometry, geometryBuffer, cubeMaterial1, cubeMaterial2, cubeMaterial3, sprite1, sprite2, sprite3, sprite4, sprite5 );

        } );

        document.addEventListener( 'mousemove', onDocumentMouseMove );

        window.addEventListener( 'resize', onWindowResize );

    }

    function onWindowResize() {

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    function createScene( geometry, geometryBuffer, m1, m2, m3, sprite1, sprite2, sprite3, sprite4, sprite5 ) {

        geometry.computeVertexNormals();

        const vertices = [];

        const s = 1;

        let mesh = new THREE.Mesh( geometry, m2 );
        mesh.position.x = - s * 1000;
        mesh.scale.x = mesh.scale.y = mesh.scale.z = s;
        scene.add( mesh );

        mesh = new THREE.Mesh( geometry, m1 );
        mesh.scale.x = mesh.scale.y = mesh.scale.z = s;
        scene.add( mesh );

        mesh = new THREE.Mesh( geometry, m3 );
        mesh.position.x = s * 1000;
        mesh.scale.x = mesh.scale.y = mesh.scale.z = s;
        scene.add( mesh );

        // ajout des flocons

        for ( let i = 0; i < 5000; i ++ ) {

            const x = Math.random() * 5000 - 2500;
            const y = Math.random() * 5000 - 2500;
            const z = Math.random() * 5000 - 2500;

            vertices.push( x, y, z );
        }

        geometryBuffer.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

        parameters = [
            [[ 1.0, 0.2, 0.5 ], sprite2, 20 ],
            [[ 0.95, 0.1, 0.5 ], sprite3, 15 ],
            [[ 0.90, 0.05, 0.5 ], sprite1, 10 ],
            [[ 0.85, 0, 0.5 ], sprite5, 8 ],
            [[ 0.80, 0, 0.5 ], sprite4, 5 ]
        ];

        for ( let i = 0; i < parameters.length; i ++ ) {

            const color = parameters[ i ][ 0 ];
            const sprite = parameters[ i ][ 1 ];
            const size = parameters[ i ][ 2 ];

            materials[ i ] = new THREE.PointsMaterial( { size: size * 1.5, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true } );
            materials[ i ].color.setHSL( color[ 0 ], color[ 1 ], color[ 2 ], THREE.SRGBColorSpace );

            const particles = new THREE.Points( geometryBuffer, materials[ i ] );

            particles.rotation.x = Math.random() * 6;
            particles.rotation.y = Math.random() * 6;
            particles.rotation.z = Math.random() * 6;

            scene.add( particles );
        }

    }

    function onDocumentMouseMove( event ) {

        mouseX = ( event.clientX - windowHalfX ) * -4;
        mouseY = ( event.clientY - windowHalfY ) * -4;

    }

    //

    function animate() {

        requestAnimationFrame( animate );

        render();
        stats.update();

    }

    function render() {

        camera.position.x += ( mouseX - camera.position.x ) * .05;
        camera.position.y += ( - mouseY - camera.position.y ) * .05;

        camera.lookAt( scene.position );

        renderer.render( scene, camera );

    }


}