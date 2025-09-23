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
    }, {once:true});
}

// =======================
// 四象限视频绘制函数
// =======================
function playVids(vidA, vidB, vidC, vidD, canvas) {
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
        const bcr = canvas.getBoundingClientRect();
        posX = ((e.touches[0].pageX - bcr.x) / bcr.width).clamp(0.0, 1.0);
        posY = ((e.touches[0].pageY - bcr.y) / bcr.height).clamp(0.0, 1.0);
    }

    canvas.addEventListener("mousemove", trackMouse);
    canvas.addEventListener("touchstart", trackTouch);
    canvas.addEventListener("touchmove", trackTouch);

    function drawLoop() {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const splitX = w * posX;
        const splitY = h * posY;
        const circleRadius = Math.max(8, h * 0.12);

        // 绘制四象限视频
        [[0,0,splitX,splitY,vidA],[splitX,0,w-splitX,splitY,vidB],
         [0,splitY,splitX,h-splitY,vidC],[splitX,splitY,w-splitX,h-splitY,vidD]]
        .forEach(([x,y,wid,hei,vid])=>{
            ctx.save();
            ctx.beginPath();
            ctx.rect(x,y,wid,hei);
            ctx.clip();
            ctx.drawImage(vid,0,0);
            ctx.restore();
        });

        // 分割线
        ctx.beginPath();
        ctx.moveTo(splitX, 0); ctx.lineTo(splitX, h);
        ctx.moveTo(0, splitY); ctx.lineTo(w, splitY);
        ctx.strokeStyle = "#AAAAAA";
        ctx.lineWidth = Math.max(2, h * 0.012);
        ctx.stroke();

        // 半透明圆圈
        ctx.beginPath();
        ctx.arc(splitX, splitY, circleRadius, 0, Math.PI*2);
        ctx.fillStyle = "rgba(255,215,147,0.25)";
        ctx.fill();

        // 箭头绘制
        function drawArrow(x1,y1,x2,y2){
            const angle=Math.atan2(y2-y1,x2-x1);
            const length=Math.max(10,h*0.05);
            const headLength=Math.max(5,h*0.04);

            ctx.beginPath();
            ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
            ctx.strokeStyle="#AAAAAA";
            ctx.lineWidth=Math.max(2,h*0.008);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x2,y2);
            ctx.lineTo(x2-headLength*Math.cos(angle-Math.PI/6),
                        y2-headLength*Math.sin(angle-Math.PI/6));
            ctx.lineTo(x2-headLength*Math.cos(angle+Math.PI/6),
                        y2-headLength*Math.sin(angle+Math.PI/6));
            ctx.closePath();
            ctx.fillStyle="#AAAAAA"; ctx.fill();
        }

        drawArrow(splitX-circleRadius*0.8,splitY,splitX-circleRadius,splitY);
        drawArrow(splitX+circleRadius*0.8,splitY,splitX+circleRadius,splitY);
        drawArrow(splitX,splitY-circleRadius*0.8,splitX,splitY-circleRadius);
        drawArrow(splitX,splitY+circleRadius*0.8,splitX,splitY+circleRadius);

        // 四象限文字
        const fontSize=Math.max(12,h*0.08);
        ctx.font=`bold ${fontSize}px sans-serif`;
        ctx.textAlign="center";
        ctx.textBaseline="middle";
        const glowColor="rgba(0,0,0,1)";

        [[labels[0],0,0,splitX,splitY,"#FFFFFF"],
        [labels[1],splitX,0,w-splitX,splitY,"#FFFFFF"],
        [labels[2],0,splitY,splitX,h-splitY,"#FFFFFF"],
        [labels[3],splitX,splitY,w-splitX,h-splitY,"#FF0000"]]
        .forEach(([text, x0, y0, wid, hei, color])=>{
            ctx.save();
            ctx.beginPath();
            ctx.rect(x0, y0, wid, hei); // 裁剪到象限范围
            ctx.clip();

            ctx.fillStyle=color;
            ctx.shadowColor=glowColor;
            ctx.shadowBlur=fontSize*0.8;
            ctx.textAlign="center";
            ctx.textBaseline="middle";

            const drawX = x0 + wid/2;
            const drawY = y0 + hei/2;

            ctx.fillText(text, drawX, drawY);
            ctx.restore();
        });

        ctx.shadowBlur=0;
        requestAnimationFrame(drawLoop);
    }

    requestAnimationFrame(drawLoop);
}

// =======================
// 视频加载并启动播放
// =======================
function resizeAndPlay(el) {
    const canvas = document.getElementById("xyaliasMerge");
    const vidA = document.getElementById("xyaliasA");
    const vidB = document.getElementById("xyaliasB");
    const vidC = document.getElementById("xyaliasC");
    const vidD = document.getElementById("xyaliasD");

    vidA.style.height = vidB.style.height = vidC.style.height = vidD.style.height = '0';

    function startAll() {
        canvas.width = vidA.videoWidth;
        canvas.height = vidA.videoHeight;
        vidA.play(); vidB.play(); vidC.play(); vidD.play();
        playVids(vidA, vidB, vidC, vidD, canvas);

        drawRGBLabel(); // 左侧 RGB 文字
    }

    if (vidA.videoWidth && vidA.videoHeight) {
        startAll();
    } else {
        vidA.addEventListener('loadedmetadata', startAll, {once:true});
    }
}
