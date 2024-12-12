// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 2, 5); // Set initial camera position
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Load environment map (equirectangular image or cube texture)
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
    'path/to/px.jpg', // Positive X
    'path/to/nx.jpg', // Negative X
    'path/to/py.jpg', // Positive Y
    'path/to/ny.jpg', // Negative Y
    'path/to/pz.jpg', // Positive Z
    'path/to/nz.jpg', // Negative Z
]);

// Set environment map as scene background and reflection
scene.background = texture;
scene.environment = texture;

// Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Sunlight (white light)
directionalLight.position.set(5, 10, 5); // Position the light higher up to simulate sunlight
directionalLight.castShadow = true; // Enable shadows for more realistic lighting
scene.add(directionalLight);

// Optional: Add a helper to visualize the light direction in the scene
// const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
// scene.add(lightHelper);

// Ambient light (soft overall illumination)
const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft ambient light
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xff9900, 1, 50);
pointLight.position.set(-3, 2, 3);
scene.add(pointLight);

// Metal Material with environment reflection
const metalMaterial = new THREE.MeshNormalMaterial({
    color: 0xffff,
    roughness: 0.3,
    metalness: 1,
    // wireframe: true,
    envMap: texture, // Use environment map for reflections
});

// Metal Box
const geometry = new THREE.TorusKnotGeometry(1, 0.4, 400,400,3);
const metalBox = new THREE.Mesh(geometry, metalMaterial);
scene.add(metalBox);

// Raindrop Particle System
const raindropGeometry = new THREE.BufferGeometry();
const raindropCount = 20000; // Number of raindrops

const positions = new Float32Array(raindropCount * 3); // Store positions of raindrops
for (let i = 0; i < raindropCount; i++) {
    positions[i * 3] = Math.random() * 100 - 50; // X position (random in range)
    positions[i * 3 + 1] = Math.random() * 100; // Y position (starting height)
    positions[i * 3 + 2] = Math.random() * 100 - 50; // Z position (random in range)
}

raindropGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const raindropMaterial = new THREE.PointsMaterial({
    color: 0x0fff99ee, // Blueish color for raindrops
    size: 0.2, // Size of each raindrop
    transparent: true,
    opacity: 0.8, // Slightly transparent
});

const raindrops = new THREE.Points(raindropGeometry, raindropMaterial);
scene.add(raindrops);

// Animation on Scroll
gsap.registerPlugin(ScrollTrigger);
gsap.to(metalBox.rotation, {
    x: Math.PI * 2,
    y: Math.PI * 2,
    scrollTrigger: {
        trigger: "#container",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
    },
});

// Handle Resize
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Camera Rotation Variables
let angle = 0; // Track the rotation angle for camera movement

// Raindrop Animation
var v = 0;
const raindropSpeed = 0.05; // Speed of rain falling
function animate() {
    requestAnimationFrame(animate);
    
    // raindropMaterial.size = Math.sin(Math.tan(Math.sin(v/10))) + 0.3;
    raindropMaterial.color = new THREE.Color().setRGB(Math.sin(v/100), 100, 100);;
    // Auto-rotation of the box
    // metalBox.rotation.x += 0.01; // Adjust speed of rotation
    // metalBox.rotation.y += 0.01; // Adjust speed of rotation

    // Rotate the camera around the box on X and Y axis
    angle += 0.01; // Adjust speed of camera rotation
    camera.position.x = 5 * Math.cos(angle); // Circle path on X-axis
    camera.position.z = 5 * Math.sin(angle); // Circle path on Z-axis
    camera.position.y = 5 + 10 * Math.tan(angle/Math.PI); // Smooth up-down motion on Y-axis
    camera.position.z = 2 + 2 * Math.tan(Math.cos(v / 100)); // Smooth up-down motion on Y-axis
    camera.lookAt(metalBox.position); // Keep camera looking at the box

    // Animate raindrops falling
    const positions = raindropGeometry.attributes.position.array;
    for (let i = 0; i < raindropCount; i++) {
        positions[i * 3 + 1] -= raindropSpeed; // Move each raindrop down
        // Reset raindrop to the top once it falls off the screen
        if (positions[i * 3 + 1] < -50) {
            positions[i * 3 + 1] = Math.random() * 100; // Reset to random height
        }
    }
    raindropGeometry.attributes.position.needsUpdate = true; // Update the positions

    renderer.render(scene, camera);
    v -= Math.sin(20 / 2); // Smooth up-down motion on Y-axis
}
animate();
