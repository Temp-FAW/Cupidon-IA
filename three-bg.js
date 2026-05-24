let scene, camera, renderer, spriteGroup;
let mouseX = 0;
let mouseY = 0;

function createEmojiTexture(emoji) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    context.font = '96px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Some emojis look better with a slight shadow to detach from background
    context.shadowColor = "rgba(0, 0, 0, 0.4)";
    context.shadowBlur = 10;
    
    context.fillText(emoji, 64, 64 + 8); // +8 for vertical alignment adjustment on some fonts
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function initWebGL() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    spriteGroup = new THREE.Group();
    scene.add(spriteGroup);

    // Initial default emojis
    buildSprites(['❤️', '💖', '✨', '💕', '🥰', '👼']);

    document.addEventListener('mousemove', animateParticles);
    window.addEventListener('resize', onWindowResize);
    
    // Accéléromètre / Gyroscope pour mobile
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleOrientation);
        
        // iOS 13+ requiert une permission explicite sur un geste utilisateur
        document.body.addEventListener('click', () => {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                    .then(response => {
                        if (response === 'granted') {
                            window.addEventListener('deviceorientation', handleOrientation);
                        }
                    })
                    .catch(console.error);
            }
        }, { once: true });
    }

    animate();
}

function buildSprites(emojisList) {
    // Retirer les anciens sprites
    while(spriteGroup.children.length > 0){ 
        const child = spriteGroup.children[0];
        spriteGroup.remove(child); 
        if(child.material && child.material.map) {
            child.material.map.dispose();
            child.material.dispose();
        }
    }

    const textures = emojisList.map(emoji => createEmojiTexture(emoji));
    const particlesCount = 40; // On génère 40 emojis 3D dynamiques
    
    for(let i = 0; i < particlesCount; i++) {
        const texture = textures[Math.floor(Math.random() * textures.length)];
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.9 });
        const sprite = new THREE.Sprite(material);
        
        sprite.position.x = (Math.random() - 0.5) * 250;
        sprite.position.y = (Math.random() - 0.5) * 200;
        sprite.position.z = (Math.random() - 0.5) * 150;
        
        const scale = Math.random() * 8 + 6; // Taille aléatoire
        sprite.scale.set(scale, scale, 1);
        
        sprite.userData = {
            baseX: sprite.position.x,
            baseY: sprite.position.y,
            speedY: Math.random() * 0.1 + 0.02,
            floatSpeed: Math.random() * 0.02 + 0.01,
            phase: Math.random() * Math.PI * 2
        };
        
        spriteGroup.add(sprite);
    }
}

function animateParticles(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

let gyroBaselineX = null;
let gyroBaselineY = null;

function handleOrientation(event) {
    if (event.gamma === null || event.beta === null) return;
    
    let x = event.gamma; // Inclinaison gauche/droite [-90, 90]
    let y = event.beta;  // Inclinaison avant/arrière [-180, 180]

    // Dynamic auto-calibration for background particles
    if (gyroBaselineX === null) {
        gyroBaselineX = x;
        gyroBaselineY = y;
    } else {
        // Slowly adjust background baseline towards current posture (0.8% drift)
        gyroBaselineX = gyroBaselineX * 0.992 + x * 0.008;
        gyroBaselineY = gyroBaselineY * 0.992 + y * 0.008;
    }

    let dx = x - gyroBaselineX;
    let dy = y - gyroBaselineY;

    // Limiter les valeurs pour un effet plus subtil
    dx = Math.max(-15, Math.min(15, dx));
    dy = Math.max(-15, Math.min(15, dy));

    // Normaliser entre -1 et 1
    mouseX = dx / 15;
    mouseY = -(dy / 15); // Inverser pour correspondre au comportement logique
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    if (spriteGroup) {
        spriteGroup.children.forEach(sprite => {
            // Mouvement fluide permanent de type "flottement"
            sprite.position.y += sprite.userData.speedY;
            sprite.position.x = sprite.userData.baseX + Math.sin(elapsedTime * sprite.userData.floatSpeed + sprite.userData.phase) * 10;
            
            // Réinitialisation si l'emoji monte trop haut hors écran
            if (sprite.position.y > 150) {
                sprite.position.y = -150;
                sprite.position.x = (Math.random() - 0.5) * 250;
                sprite.userData.baseX = sprite.position.x;
            }
        });
        
        // Parallaxe selon la souris ou gyroscope
        camera.position.x += (mouseX * 15 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 15 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
    }
    
    renderer.render(scene, camera);
}

// Mise à jour magique de tous les emojis depuis script.js !
function updateWebGLEmojis(emojisList) {
    if (spriteGroup && emojisList && emojisList.length > 0) {
        buildSprites(emojisList);
    }
}

// Init when DOM is ready
document.addEventListener('DOMContentLoaded', initWebGL);
