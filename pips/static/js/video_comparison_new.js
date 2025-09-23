// =======================
// 数字限制函数
// =======================
Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

// =======================
// 左侧 RGB 视频文字叠加
// =======================
function drawRGBLabel() {
    const video = document.getElementById("rgbVideo");
    const canvas = document.getElementById("rgbCanvas");
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const fontSize = Math.max(12, canvas.height * 0.08);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0,0,0,1)";
        ctx.shadowBlur = fontSize * 0.8;

        ctx.fillText("RGB\nReference", canvas.width * 0.5, canvas.height * 0.5);

        ctx.shadowBlur = 0;
        requestAnimationFrame(loop);
    }

    if (video.videoWidth && video.videoHeight) {
        resizeCanvas();
        loop();
        return;
    }

    video.addEventListener('loadedmetadata', () => {
        resizeCanvas();
        loop();
    }, { once: true });
}

// =======================
// 十字裁剪单个拼接视频（同步 RGB）
// =======================
function playSingleCompare(video, canvas, rgbVideo) {
    const ctx = canvas.getContext("2d");
    let posX = 0.5;
    let posY = 0.5;

    const labels = ["Airplanes", "NeuralPlane", "PlanarSplatting", "PIPS"]; // 左上, 右上, 左下, 右下

    function trackMouse(e) {
        const bcr = canvas.getBoundingClientRect();
        posX = ((e.pageX - bcr.x) / bcr.width).clamp(0.0, 1.0);
        posY = ((e.pageY - bcr.y) / bcr.height).clamp(0.0, 1.0);
    }

    function trackTouch(e) {
        e.preventDefault();
        const bcr = canvas.getBoundingClientRect();
        posX = ((e.touches[0].pageX - bcr.x) / bcr.width).clamp(0.0, 1.0);
        posY = ((e.touches[0].pageY - bcr.y) / bcr.height).clamp(0.0, 1.0);
    }

    canvas.addEventListener("mousemove", trackMouse);
    canvas.addEventListener("touchstart", trackTouch);
    canvas.addEventListener("touchmove", trackTouch);

    function drawLoop() {
        if (rgbVideo.paused || rgbVideo.ended) {
            requestAnimationFrame(drawLoop);
            return;
        }

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const halfVW = vw / 2;
        const halfVH = vh / 2;

        const splitX = w * posX;
        const splitY = h * posY;
        const circleRadius = Math.max(8, h * 0.12);

        // === 四象限绘制，每个象限显示对应子视频的一角 ===
        // 左上
        ctx.drawImage(video, 0, 0, halfVW * (splitX / w), halfVH * (splitY / h),
                      0, 0, splitX, splitY);
        // 右上
        ctx.drawImage(video, halfVW + halfVW * (1 - (w - splitX)/w), 0,
                      halfVW * ((w - splitX)/ w), halfVH * (splitY / h),
                      splitX, 0, w - splitX, splitY);
        // 左下
        ctx.drawImage(video, 0, halfVH + halfVH * (1 - (h - splitY)/h),
                      halfVW * (splitX / w), halfVH * ((h - splitY)/h),
                      0, splitY, splitX, h - splitY);
        // 右下
        ctx.drawImage(video, halfVW + halfVW * (1 - (w - splitX)/w),
                      halfVH + halfVH * (1 - (h - splitY)/h),
                      halfVW * ((w - splitX)/ w), halfVH * ((h - splitY)/h),
                      splitX, splitY, w - splitX, h - splitY);

        // === 分割线 ===
        ctx.beginPath();
        ctx.moveTo(splitX, 0); ctx.lineTo(splitX, h);
        ctx.moveTo(0, splitY); ctx.lineTo(w, splitY);
        ctx.strokeStyle = "#AAAAAA";
        ctx.lineWidth = Math.max(2, h * 0.012);
        ctx.stroke();

        // === 半透明圆圈 ===
        ctx.beginPath();
        ctx.arc(splitX, splitY, circleRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,215,147,0.25)";
        ctx.fill();

        // === 箭头函数 ===
        function drawArrow(x1, y1, x2, y2) {
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const headLength = Math.max(5, h * 0.04);

            ctx.beginPath();
            ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
            ctx.strokeStyle = "#AAAAAA";
            ctx.lineWidth = Math.max(2, h * 0.008);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6),
                        y2 - headLength * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6),
                        y2 - headLength * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fillStyle = "#AAAAAA"; ctx.fill();
        }

        drawArrow(splitX - circleRadius * 0.8, splitY, splitX - circleRadius, splitY);
        drawArrow(splitX + circleRadius * 0.8, splitY, splitX + circleRadius, splitY);
        drawArrow(splitX, splitY - circleRadius * 0.8, splitX, splitY - circleRadius);
        drawArrow(splitX, splitY + circleRadius * 0.8, splitX, splitY + circleRadius);

        // === 四象限文字 ===
        const fontSize = Math.max(12, h * 0.08);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const glowColor = "rgba(0,0,0,1)";

        [[labels[0], 0, 0, splitX, splitY, "#FFFFFF"],
         [labels[1], splitX, 0, w - splitX, splitY, "#FFFFFF"],
         [labels[2], 0, splitY, splitX, h - splitY, "#FFFFFF"],
         [labels[3], splitX, splitY, w - splitX, h - splitY, "#FF0000"]]
        .forEach(([text, x0, y0, wid, hei, color]) => {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x0, y0, wid, hei);
            ctx.clip();

            ctx.fillStyle = color;
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = fontSize * 0.8;

            ctx.fillText(text, x0 + wid/2, y0 + hei/2);
            ctx.restore();
        });

        ctx.shadowBlur = 0;
        requestAnimationFrame(drawLoop);
    }

    requestAnimationFrame(drawLoop);
}

// =======================
// 启动入口（同步 RGB）
// =======================
function resizeAndPlay(el) {
    const canvas = document.getElementById("xyaliasMerge");
    const rgbVideo = document.getElementById("rgbVideo");

    function start() {
        canvas.width = el.videoWidth;
        canvas.height = el.videoHeight;

        el.style.display = "none";       // 隐藏四象限视频
        // rgbVideo.style.display = "none"; // 隐藏 RGB 视频

        rgbVideo.play();
        el.play(); // 四象限视频继续播放，只作帧源

        playSingleCompare(el, canvas, rgbVideo);
        drawRGBLabel();
    }

    if (el.videoWidth && el.videoHeight) {
        start();
    } else {
        el.addEventListener('loadedmetadata', start, { once: true });
    }
}
