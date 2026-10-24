const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// প্লেয়ার (চোর)
let seeker = { x: 400, y: 300, radius: 15, speed: 5, color: '#e74c3c' };

// গ্রামীণ পরিবেশের বস্তুসমূহ (পুকুর, ঘর, বাঁশঝাড়)
const villageMap = {
    ponds: [{ x: 100, y: 100, w: 150, h: 100, color: '#3498db' }], // পুকুর
    houses: [{ x: 500, y: 400, w: 120, h: 90, color: '#8e44ad' }], // মাটির ঘর
    bushes: [{ x: 600, y: 100, w: 100, h: 150, color: '#27ae60' }]  // বাঁশঝাড় (লুকানোর জায়গা)
};

// বাটন কন্ট্রোল স্টেট
let keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

// কীবোর্ড কন্ট্রোল
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// মোবাইলের টাচ কন্ট্রোল
const setupTouch = (id, key) => {
    const btn = document.getElementById(id);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[key] = true; });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[key] = false; });
};
setupTouch('up', 'ArrowUp');
setupTouch('down', 'ArrowDown');
setupTouch('left', 'ArrowLeft');
setupTouch('right', 'ArrowRight');

// বস্তুর সাথে ধাক্কা লাগার চেক (Collision)
function checkCollision(nx, ny) {
    // ক্যানভাসের বাইরে যাওয়া ঠেকানো
    if (nx - seeker.radius < 0 || nx + seeker.radius > canvas.width || 
        ny - seeker.radius < 0 || ny + seeker.radius > canvas.height) return true;
        
    // ঘরের ভেতর দিয়ে যাওয়া ঠেকানো
    for (let house of villageMap.houses) {
        if (nx + seeker.radius > house.x && nx - seeker.radius < house.x + house.w &&
            ny + seeker.radius > house.y && ny - seeker.radius < house.y + house.h) {
            return true;
        }
    }
    // পুকুরে পড়া ঠেকানো
    for (let pond of villageMap.ponds) {
        if (nx + seeker.radius > pond.x && nx - seeker.radius < pond.x + pond.w &&
            ny + seeker.radius > pond.y && ny - seeker.radius < pond.y + pond.h) {
            return true;
        }
    }
    return false;
}

// গেম আপডেট ফাংশন
function update() {
    let nextX = seeker.x;
    let nextY = seeker.y;

    if (keys['ArrowUp']) nextY -= seeker.speed;
    if (keys['ArrowDown']) nextY += seeker.speed;
    if (keys['ArrowLeft']) nextX -= seeker.speed;
    if (keys['ArrowRight']) nextX += seeker.speed;

    if (!checkCollision(nextX, nextY)) {
        seeker.x = nextX;
        seeker.y = nextY;
    }
}

// গেম ড্রয়িং (গ্রাফিক্স)
function draw() {
    // ১. ব্যাকগ্রাউন্ড ক্লিয়ার করা
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ২. ম্যাপের জিনিস আঁকা
    villageMap.ponds.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(p.x + p.w/2, p.y + p.h/2, p.w/2, p.h/2, 0, 0, Math.PI*2);
        ctx.fill();
    });

    villageMap.bushes.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
    });

    villageMap.houses.forEach(h => {
        ctx.fillStyle = '#8B4513'; // মাটির রঙ
        ctx.fillRect(h.x, h.y, h.w, h.h);
        ctx.fillStyle = '#D2B48C'; // খড়ের চাল
        ctx.beginPath();
        ctx.moveTo(h.x - 10, h.y);
        ctx.lineTo(h.x + h.w / 2, h.y - 40);
        ctx.lineTo(h.x + h.w + 10, h.y);
        ctx.fill();
    });

    // ৩. প্লেয়ার (চোর) আঁকা
    ctx.fillStyle = seeker.color;
    ctx.beginPath();
    ctx.arc(seeker.x, seeker.y, seeker.radius, 0, Math.PI * 2);
    ctx.fill();

    // ৪. অন্ধকার ইফেক্ট (Night/Fog of War)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'; // ৯০০% অন্ধকার
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ৫. চোরের চারপাশ আলোকিত করা (Flashlight effect)
    ctx.globalCompositeOperation = 'destination-out';
    let gradient = ctx.createRadialGradient(seeker.x, seeker.y, 0, seeker.x, seeker.y, 150);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(seeker.x, seeker.y, 150, 0, Math.PI * 2);
    ctx.fill();

    // পূর্বের মোডে ফেরত আসা
    ctx.globalCompositeOperation = 'source-over';
}

// গেম লুপ
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// গেম শুরু
gameLoop();
