const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const pixelSize = 5;
let catPixels = [];
let namePixels = [];
let animationStartTime;
let sidebarOpen = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.6;
}

async function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

async function initPixels() {
    const catImage = await loadImage('images/cat1.png');
    const scaleFactor = Math.min(canvas.width / catImage.width, canvas.height / catImage.height) * 1.8;
    const scaledWidth = catImage.width * scaleFactor;
    const scaledHeight = catImage.height * scaleFactor;
    const startX = (canvas.width - scaledWidth) / 2;
    const startY = (canvas.height - scaledHeight) / 2 + 40;

    ctx.drawImage(catImage, startX, startY, scaledWidth, scaledHeight);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y += pixelSize) {
        for (let x = 0; x < canvas.width; x += pixelSize) {
            const i = (y * canvas.width + x) * 4;
            if (imageData.data[i + 3] > 0) {
                catPixels.push({
                    x,
                    y,
                    alpha: 0,
                    targetAlpha: Math.random() * 0.5 + 0.5,
                    flickerSpeed: Math.random() * 0.05 + 0.02
                });
            }
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const nameY = startY + 180;
    ctx.fillText('NICK MAXIMIANO', canvas.width / 2, nameY);

    const textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y += pixelSize) {
        for (let x = 0; x < canvas.width; x += pixelSize) {
            const i = (y * canvas.width + x) * 4;
            if (textImageData.data[i + 3] > 0) {
                namePixels.push({
                    x,
                    y,
                    alpha: 0,
                    targetAlpha: Math.random() * 0.5 + 0.5,
                    flickerSpeed: Math.random() * 0.05 + 0.02
                });
            }
        }
    }
}

function drawPixels(timestamp) {
    if (!animationStartTime) animationStartTime = timestamp;
    const elapsedTime = timestamp - animationStartTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const catFadeInDelay = 300;
    const nameFadeInDelay = 600;
    const buttonFadeInDelay = 900;

    // Cat pixels
    if (elapsedTime > catFadeInDelay) {
        const fadeInTime = 2000;
        const catAlpha = Math.min(1, (elapsedTime - catFadeInDelay) / fadeInTime);

        catPixels.forEach(pixel => {
            pixel.alpha += (pixel.targetAlpha - pixel.alpha) * 0.01;
            pixel.alpha += Math.sin(Date.now() * pixel.flickerSpeed) * 0.05;
            pixel.alpha = Math.max(0, Math.min(1, pixel.alpha));

            ctx.fillStyle = `rgba(255, 255, 255, ${pixel.alpha * catAlpha})`;
            ctx.fillRect(pixel.x, pixel.y, pixelSize, pixelSize);
        });
    }

    // Name pixels
    if (elapsedTime > nameFadeInDelay) {
        const fadeInTime = 2000;
        const nameAlpha = Math.min(1, (elapsedTime - nameFadeInDelay) / fadeInTime);

        namePixels.forEach(pixel => {
            pixel.alpha += (pixel.targetAlpha - pixel.alpha) * 0.01;
            pixel.alpha += Math.sin(Date.now() * pixel.flickerSpeed) * 0.05;
            pixel.alpha = Math.max(0, Math.min(1, pixel.alpha));

            ctx.fillStyle = `rgba(255, 255, 255, ${pixel.alpha * nameAlpha})`;
            ctx.fillRect(pixel.x, pixel.y, pixelSize, pixelSize);
        });
    }

    // Button fade-in
    if (elapsedTime > buttonFadeInDelay) {
        const fadeInTime = 1000;
        const buttonAlpha = Math.min(1, (elapsedTime - buttonFadeInDelay) / fadeInTime);
        
        document.getElementById('aboutButton').style.opacity = buttonAlpha;
        document.getElementById('projectsButton').style.opacity = buttonAlpha;
    }

    requestAnimationFrame(drawPixels);
}

function typeText(elementId, text, delay) {
    const element = document.getElementById(elementId);
    let index = 0;

    function type() {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
            setTimeout(type, 100); // Typing speed
        }
    }

    setTimeout(() => {
        document.getElementById("typingText").style.opacity = 1; // Fade in the text
        type();
    }, delay);
}

function toggleNav() {
    const sidebar = document.getElementById("sidebar");
    const aboutButton = document.getElementById("aboutButton");
    const sidebarContent = document.getElementById("sidebarContent");

    if (sidebarOpen) {
        sidebarContent.style.opacity = "0";
        setTimeout(() => {
            sidebar.style.width = "0";
            aboutButton.style.backgroundColor = "#1a1a1a";
            aboutButton.style.color = "#ffffff";
            document.body.style.overflow = "auto"; // Enable scrolling after sidebar closes
        }, 300); // Wait for content to fade out before closing sidebar
    } else {
        document.body.style.overflow = "hidden"; // Prevent scrolling while sidebar is opening
        sidebar.style.width = "300px";
        aboutButton.style.backgroundColor = "#ffffff";
        aboutButton.style.color = "#1a1a1a";
        setTimeout(() => {
            sidebarContent.style.opacity = "1";
        }, 500); // Wait for sidebar to open before fading in content
    }

    sidebarOpen = !sidebarOpen;
}

async function init() {
    resizeCanvas();
    await initPixels();
    animationStartTime = null;
    requestAnimationFrame(drawPixels);

    // Start typing effect after a delay
    setTimeout(() => {
        typeText("line1", "...", 1000);
        typeText("line2", "prioritizing design", 4500);
    }, 3000);

    // Initially hide buttons
    document.getElementById('aboutButton').style.opacity = 0;
    document.getElementById('projectsButton').style.opacity = 0;
}

window.addEventListener('resize', () => {
    resizeCanvas();
    catPixels = [];
    namePixels = [];
    init();
});

// Button functionality
document.getElementById('aboutButton').onclick = toggleNav;
document.getElementById('projectsButton').onclick = () => {
    window.location.href = 'projects.html';
};

// Close sidebar when clicking outside
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const aboutButton = document.getElementById('aboutButton');
    
    if (sidebarOpen && !sidebar.contains(event.target) && event.target !== aboutButton) {
        toggleNav();
    }
});

init();