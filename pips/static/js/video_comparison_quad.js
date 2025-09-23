function playVids(vidA, vidB, vidC, vidD, canvas) {
  const ctx = canvas.getContext("2d");
  let posX = 0.5;
  let posY = 0.5;

  const labels = ["AIR", "NP", "PS", "PIPS"]; // 左上, 右上, 左下, 右下

  // 鼠标 & 触摸控制
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

      // 绘制四个象限视频 (裁剪对应区域)
      // 左上 A
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, splitY);
      ctx.clip();
      ctx.drawImage(vidA, 0, 0);
      ctx.restore();

      // 右上 B
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, w - splitX, splitY);
      ctx.clip();
      ctx.drawImage(vidB, 0, 0);
      ctx.restore();

      // 左下 C
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, splitY, splitX, h - splitY);
      ctx.clip();
      ctx.drawImage(vidC, 0, 0);
      ctx.restore();

      // 右下 D
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, splitY, w - splitX, h - splitY);
      ctx.clip();
      ctx.drawImage(vidD, 0, 0);
      ctx.restore();

      // 分割线
      ctx.beginPath();
      ctx.moveTo(splitX, 0); ctx.lineTo(splitX, h);
      ctx.moveTo(0, splitY); ctx.lineTo(w, splitY);
      ctx.strokeStyle = "#AAAAAA";
      ctx.lineWidth = Math.max(2, h * 0.012);
      ctx.stroke();

      // 半透明圆圈
      ctx.beginPath();
      ctx.arc(splitX, splitY, circleRadius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 215, 147, 0.25)";
      ctx.fill();

      // 箭头绘制
      function drawArrow(x1, y1, x2, y2) {
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const length = Math.max(10, h * 0.05);
          const headLength = Math.max(5, h * 0.04);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
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
          ctx.fillStyle = "#AAAAAA";
          ctx.fill();
      }

      drawArrow(splitX - circleRadius * 0.8, splitY, splitX - circleRadius, splitY);
      drawArrow(splitX + circleRadius * 0.8, splitY, splitX + circleRadius, splitY);
      drawArrow(splitX, splitY - circleRadius * 0.8, splitX, splitY - circleRadius);
      drawArrow(splitX, splitY + circleRadius * 0.8, splitX, splitY + circleRadius);

      // 绘制四象限文字
      const fontSize = Math.max(12, h * 0.08);
      ctx.font = `bold ${fontSize}px sans-serif`; // 加粗
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const glowColor = "rgba(0,0,0,1.0)";

      // 左上
      ctx.save();
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = fontSize * 0.8;
      ctx.fillText(labels[0], splitX * 0.5, splitY * 0.5);
      ctx.restore();

      // 右上
      ctx.save();
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = fontSize * 0.8;
      ctx.fillText(labels[1], splitX + (w - splitX) * 0.5, splitY * 0.5);
      ctx.restore();

      // 左下
      ctx.save();
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = fontSize * 0.8;
      ctx.fillText(labels[2], splitX * 0.5, splitY + (h - splitY) * 0.5);
      ctx.restore();

      // 右下 PIPS
      ctx.save();
      ctx.fillStyle = "#FF0000";
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = fontSize * 0.8;
      ctx.fillText(labels[3], splitX + (w - splitX) * 0.5, splitY + (h - splitY) * 0.5);
      ctx.restore();

      ctx.shadowBlur = 0;

      requestAnimationFrame(drawLoop);
  }

  requestAnimationFrame(drawLoop);
}

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

function resizeAndPlay(el) {
  const canvas = document.getElementById("xyaliasMerge");
  const vidA = document.getElementById("xyaliasA");
  const vidB = document.getElementById("xyaliasB");
  const vidC = document.getElementById("xyaliasC");
  const vidD = document.getElementById("xyaliasD");

  vidA.style.height = vidB.style.height = vidC.style.height = vidD.style.height = '0';

  if (vidA.videoWidth && vidA.videoHeight) {
      canvas.width = vidA.videoWidth;
      canvas.height = vidA.videoHeight;
      vidA.play(); vidB.play(); vidC.play(); vidD.play();
      playVids(vidA, vidB, vidC, vidD, canvas);
      return;
  }

  vidA.addEventListener('loadedmetadata', () => {
      canvas.width = vidA.videoWidth;
      canvas.height = vidA.videoHeight;
      vidA.play(); vidB.play(); vidC.play(); vidD.play();
      playVids(vidA, vidB, vidC, vidD, canvas);
  }, {once:true});
}
