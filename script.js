const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ব্যাকগ্রাউন্ড ছবি লোড করা (আপনার দেওয়া গ্রামীণ ম্যাপটি)
const bgImage = new Image();
bgImage.src = 'https://i.ibb.co/6RF1j7W/image-0.png'; // গিটহাবে ব্যবহারের জন্য অনলাইন লিংক দেওয়া হলো

// ৫ জন প্লেয়ারের তথ্য (১ জন চোর বা Seeker, ৪ জন বন্ধু যারা লুকাবে)
let players = {
    seeker: { x: 420, y: 310, radius: 12, speed: 4, color: '#ff3f34', name: 'চোর (তুমি)', isHiding: false },
    friend1: { x: 120, y: 150, radius: 11, speed: 3.5, color: '#00d2d3', name: 'কামাল', isHiding: false },
    friend2: { x: 550, y: 440, radius: 11, speed: 3.5, color: '#feca57', name: 'জামাল', isHiding: false },
    friend3: { x: 650, y: 150, radius: 11, speed: 3.5, color: '#1dd1a1', name: 'রফিক', isHiding: false },
    friend4: { x: 230, y: 500, radius: 11, speed: 3.5, color: '#ff9ff3', name: 'সজীব', isHiding: false }
};

// ম্যাপে লুকানোর জায়গা ও বাধার কোঅর্ডিনেটস (Collision & Hide detection)
const hideSpots = [
    { x: 50, y: 30, w: 180, h: 180, type: 'bamboo' },   // বাশঝাড় (বাম-উপরে)
    { x: 570, y: 480, w: 180, h: 120, type: 'bamboo2' }, // বাশঝাড় (ডান-নিচে)
    { x: 580, y: 140, w: 100, h: 160, type: 'haystack' }, // খড়ের গাদা ও চালা
    { x: 40, y: 550, w: 140, h: 50, type: 'bush' }      // নিচের ঝোপ
];

const obstacles = [
    { x: 92, y: 172, w: 355, h: 250, type: 'pond' },    // পুকুর
    { x: 682, y: 162, w: 185, h: 228, type: 'house' },   // টিনের ঘর ১ (ডান-উপরে)
    { x: 724, y: 488, w: 185, h: 215, type: 'house2' },  // টিনের ঘর ২ (ডান-নিচে)
    { x: 173, y: 490, w: 185, h: 165, type: 'mud_house' }, // মাটির ঘর (বাম-নিচে)
    { x: 34, y: 555, w: 175, h: 175, type: 'mud_house2' }  // মাটির ঘর ২
];

let keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

// মোবাইল ও কিবোর্ড ইনপুট ইভেন্ট
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

const setupTouch = (id, key) => {
    const btn = document.getElementById(id);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[key] = true; }, {passive: false});
    btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[key] = false; }, {passive: false});
};
setupTouch('up', 'ArrowUp');
setupTouch('down', 'ArrowDown');
setupTouch('left', 'ArrowLeft');
setupTouch('right', 'ArrowRight');

// বাধা চেক (প্লেয়ার যেন ঘর বা পুকুরের ভেতর না যায়)
function checkCollision(nx, ny, radius) {
    if (nx - radius < 0 || nx + radius > canvas.width || 
        ny - radius < 0 || ny + radius > canvas.height) return true;
        
    for (let obs of obstacles) {
        if (nx + radius > obs.x && nx - radius < obs.x + obs.w &&
            ny + radius > obs.y && ny - radius < obs.y + obs.h) {
            return true;
        }
    }
    return false;
}

// কোনো বন্ধু বাঁশঝাড় বা আড়ালে আছে কিনা চেক করা
function checkHiding(player) {
    player.isHiding = false;
    for (let spot of hideSpots) {
        if (player.x > spot.x && player.x < spot.x + spot.w &&
            player.y > spot.y && player.y < spot.y + spot.h) {
            player.isHiding = true;
            break;
        }
    }
}

// আপডেট পজিশন
function update() {
    let nextX = players.seeker.x;
    let nextY = players.seeker.y;

    if (keys['ArrowUp']) nextY -= players.seeker.speed;
    if (keys['ArrowDown']) nextY += players.seeker.speed;
    if (keys['ArrowLeft']) nextX -= players.seeker.speed;
    if (keys['ArrowRight']) nextX += players.seeker.speed;

    if (!checkCollision(nextX, nextY, players.seeker.radius)) {
        players.seeker.x = nextX;
        players.seeker.y = nextY;
    }

    // বন্ধুদের এআই (AI) মুভমেন্ট এবং হাইড লজিক (পরীক্ষামূলক)
    for (let key in players) {
        if (key !== 'seeker') {
            checkHiding(players[key]);
        }
    }
}

// রেন্ডার বা ড্রয়িং
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ১. ব্যাকগ্রাউন্ড ইমেজ আঁকা (গ্রামীণ ম্যাপ)
    if (bgImage.complete) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#5c804c'; // ছবি লোড না হওয়া পর্যন্ত ঘাসের সবুজ রঙ
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // ২. বন্ধুদের আঁকা (কামাল, জামাল, রফিক, সজীব)
    for (let key in players) {
        let p = players[key];
        
        // যদি বন্ধু আড়ালে থাকে, তবে সে ঝাপসা (লুকানো) দেখাবে
        if (p.isHiding) {
            ctx.globalAlpha = 0.15; // লুকিয়ে গেলে হালকা দেখাবে (শুধু দেখার জন্য)
        } else {
            ctx.globalAlpha = 1.0;
        }

        // ক্যারেক্টার ড্রয়িং (সুন্দর রাউন্ড বাবল বা ক্যারেক্টার)
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // ক্যারেক্টারের বর্ডার
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // নাম লেখা
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, p.x, p.y - p.radius - 4);
    }

    // আলফা লেভেল স্বাভাবিক করা
    ctx.globalAlpha = 1.0;

    // ৩. অন্ধকার ইফেক্ট (Night & Flashlight)
    // এটি কেবল চোর ক্যারেক্টারের দৃষ্টিসীমায় খেলবে
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.82)'; // আংশিক অন্ধকার
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // চোরের জন্য টর্চলাইট ইফেক্ট
    ctx.globalCompositeOperation = 'destination-out';
    let gradient = ctx.createRadialGradient(
        players.seeker.x, players.seeker.y, 10, 
        players.seeker.x, players.seeker.y, 160
    );
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(players.seeker.x, players.seeker.y, 160, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ছবি পুরোপুরি লোড হওয়ার পর গেম স্টার্ট হবে
bgImage.onload = () => {
    gameLoop();
};
