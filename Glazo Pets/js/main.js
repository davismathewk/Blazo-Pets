// Milestone 2, 3 & 4: Dog walk, neon reveal, menu, sticky-note dialog, live hours, contact form

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     Single Settings Block: Opening Hours (Asia/Kolkata)
     ------------------------------------------------------------------------ */
  const SHOP_HOURS = {
    timeZone: 'Asia/Kolkata',
    schedule: {
      0: { open: '10:00', close: '14:00' }, // Sunday
      1: { open: '09:00', close: '20:00' }, // Monday
      2: { open: '09:00', close: '20:00' }, // Tuesday
      3: { open: '09:00', close: '20:00' }, // Wednesday
      4: { open: '09:00', close: '20:00' }, // Thursday
      5: { open: '09:00', close: '20:00' }, // Friday
      6: { open: '09:00', close: '20:00' }  // Saturday
    }
  };

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion) {
    document.documentElement.classList.add('js-anim');
  }

  /* ------------------------------------------------------------------------
     M2 & M3: Unified Zero-Layout-Thrash Scroll Engine (Cat Sprite + Neon)
     ------------------------------------------------------------------------ */
  const road = document.getElementById('road');
  const catCanvas = document.getElementById('cat-canvas');
  const catCurtain = document.getElementById('cat-reveal-curtain');
  const progressBar = document.getElementById('road-progress');

  const neonEl = document.getElementById('neon');
  const brandEl = document.getElementById('brand');

  const wideText = document.getElementById('neon-text-wide');
  const wideFillRect = document.getElementById('neon-rect-wide-fill');
  const wideEdgeRect = document.getElementById('neon-rect-wide-edge');
  const widePen = document.getElementById('neon-pen-wide');
  const wideFlourish = document.getElementById('neon-flourish-wide');

  const m1Text = document.getElementById('neon-text-m1');
  const m1FillRect = document.getElementById('neon-rect-m1-fill');
  const m1EdgeRect = document.getElementById('neon-rect-m1-edge');
  const m1Pen = document.getElementById('neon-pen-m1');

  const m2Text = document.getElementById('neon-text-m2');
  const m2FillRect = document.getElementById('neon-rect-m2-fill');
  const m2EdgeRect = document.getElementById('neon-rect-m2-edge');
  const m2Pen = document.getElementById('neon-pen-m2');
  const mobileFlourish = document.getElementById('neon-flourish-mobile');

  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const mapUnit = (v, min, max) => clamp01((v - min) / (max - min));

  // Tight-cropped Cat Sprite Atlases (140 native 24fps frames across 4 WebP sheets @ 576x324 stage)
  // Entry: [atlasIdx, sx, sy, w, h, dx, dy, revealPct]
  const FW = 576;
  const FH = 324;
  const ATLAS_COUNT = 4;
  const CAT_FRAMES = [
    [0,0,0,263,287,0,37,0.0],[0,265,0,263,287,0,37,1.1],[0,530,0,263,287,0,37,2.2],[0,795,0,296,287,0,37,3.3],[0,1093,0,263,286,0,38,4.4],[0,1358,0,270,286,0,38,5.5],[0,1630,0,270,286,0,38,6.6],[0,0,289,270,285,0,39,7.7],[0,272,289,270,285,0,39,8.8],[0,544,289,308,284,0,40,9.9],
    [0,854,289,312,283,0,41,11.0],[0,1168,289,311,282,0,42,12.1],[0,1481,289,308,281,0,43,13.2],[0,0,576,308,279,0,45,14.3],[0,310,576,308,277,0,47,14.5],[0,620,576,308,274,0,50,14.7],[0,930,576,311,273,0,51,14.9],[0,1243,576,333,271,0,53,15.1],[0,1578,576,342,271,0,53,15.3],[0,0,857,408,272,0,52,15.6],
    [0,410,857,351,272,0,52,15.7],[0,763,857,362,273,0,51,15.8],[0,1127,857,405,274,0,50,16.2],[0,1534,857,411,274,0,50,16.6],[0,0,1133,390,274,0,50,17.0],[0,392,1133,437,273,0,51,17.6],[0,831,1133,448,273,0,51,18.3],[0,1281,1133,453,273,0,51,18.8],[0,0,1409,453,273,0,51,19.5],[0,455,1409,453,274,0,50,20.1],
    [0,910,1409,464,274,0,50,20.7],[0,1376,1409,470,275,0,49,21.2],[0,0,1686,470,275,0,49,21.7],[0,472,1686,484,275,0,49,22.0],[0,958,1686,503,298,0,26,22.2],[0,1463,1686,503,302,0,22,22.6],[1,0,0,517,302,0,22,23.2],[1,519,0,506,304,0,20,23.8],[1,1027,0,541,308,0,16,24.3],[1,0,310,564,310,0,14,25.1],
    [1,566,310,564,310,0,14,25.8],[1,1132,310,552,312,0,12,26.4],[1,0,624,572,310,0,14,27.0],[1,574,624,576,309,0,15,27.9],[1,1152,624,576,307,0,17,29.0],[1,0,936,546,305,0,19,30.3],[1,548,936,541,302,4,22,31.7],[1,1091,936,555,300,8,24,33.3],[1,0,1243,562,300,10,24,34.9],[1,564,1243,550,300,14,24,36.5],
    [1,1116,1243,558,300,18,24,37.7],[1,0,1545,553,300,23,24,39.0],[1,555,1545,550,300,26,24,40.6],[1,1107,1545,544,298,32,26,42.1],[2,0,0,533,298,43,26,43.4],[2,535,0,526,298,50,26,44.8],[2,1063,0,519,298,57,26,46.1],[2,0,300,512,298,64,26,47.2],[2,514,300,500,296,76,28,48.2],[2,1016,300,494,296,82,28,49.4],
    [2,1512,300,490,295,86,29,50.5],[2,0,600,482,292,94,32,51.3],[2,484,600,474,290,102,34,52.1],[2,960,600,468,290,108,34,53.0],[2,1430,600,465,288,111,36,53.9],[2,0,894,459,285,117,39,54.8],[2,461,894,454,284,122,40,55.8],[2,917,894,450,286,126,38,56.7],[2,1369,894,446,286,130,38,57.6],[2,0,1182,440,287,136,37,58.4],
    [2,442,1182,431,290,145,34,59.2],[2,875,1182,425,291,151,33,60.2],[2,1302,1182,420,292,156,32,61.2],[2,0,1476,413,290,163,34,62.4],[2,415,1476,401,292,175,32,63.5],[2,818,1476,394,293,182,31,64.7],[2,1214,1476,387,294,189,30,65.9],[2,1603,1476,377,292,199,32,66.9],[3,0,0,367,292,209,32,67.7],[3,369,0,360,292,216,32,68.6],
    [3,731,0,353,290,223,34,69.5],[3,1086,0,346,288,230,36,70.3],[3,1434,0,335,285,241,39,71.1],[3,0,294,328,283,248,41,71.8],[3,330,294,322,282,254,42,72.6],[3,654,294,315,279,261,45,73.3],[3,971,294,305,278,271,46,74.0],[3,1278,294,299,277,277,47,74.8],[3,1579,294,295,278,281,46,75.8],[3,0,579,288,278,288,46,76.8],
    [3,290,579,274,286,302,38,77.7],[3,566,579,266,290,310,34,78.8],[3,834,579,258,293,318,31,79.8],[3,1094,579,250,296,326,28,80.7],[3,1346,579,236,298,340,26,81.4],[3,1584,579,230,298,346,26,82.1],[3,1816,579,224,298,352,26,82.7],[3,0,879,216,296,360,28,83.2],[3,218,879,208,294,368,30,83.6],[3,428,879,202,292,374,32,84.1],
    [3,632,879,199,290,377,34,84.6],[3,833,879,194,288,382,36,85.0],[3,1029,879,190,285,386,39,85.4],[3,1221,879,188,284,388,40,85.9],[3,1411,879,186,284,390,40,86.5],[3,1599,879,182,284,394,40,87.1],[3,1783,879,174,286,402,38,87.7],[3,0,1177,166,289,410,35,88.4],[3,168,1177,160,292,416,32,89.3],[3,330,1177,152,292,424,32,90.1],
    [3,484,1177,140,296,436,28,90.8],[3,626,1177,134,298,442,26,91.5],[3,762,1177,130,299,446,25,91.9],[3,894,1177,124,298,452,26,92.0],[3,1020,1177,115,298,461,26,92.0],[3,1137,1177,110,296,466,28,92.0],[3,1249,1177,107,295,469,29,92.0],[3,1358,1177,103,291,473,33,93.0],[3,1463,1177,99,286,477,38,94.0],[3,1564,1177,98,283,478,41,94.9],
    [3,1664,1177,96,281,480,43,95.9],[3,1762,1177,94,280,482,44,96.8],[3,1858,1177,91,278,485,46,97.8],[3,1951,1177,87,278,489,46,98.7],[3,0,1478,84,278,492,46,99.7],[3,86,1478,83,278,493,46,100.6],[3,171,1478,81,281,495,43,101.6],[3,254,1478,75,284,501,40,102.5],[3,331,1478,76,284,500,40,103.5],[3,409,1478,49,278,527,38,104.5],
    [3,460,1478,45,276,531,40,105.4],[3,507,1478,42,275,534,41,106.4],[3,551,1478,42,273,534,43,107.3],[3,595,1478,31,270,545,46,108.3],[3,628,1478,31,263,545,52,109.2],[3,661,1478,31,260,545,55,110.2],[3,694,1478,25,258,551,57,111.1],[3,721,1478,10,253,566,60,112.1],[0,0,0,0,0,0,0,113.0],[0,0,0,0,0,0,0,114.0]
  ];
  const FRAME_COUNT = CAT_FRAMES.length;

  const catCtx = catCanvas ? catCanvas.getContext('2d') : null;
  const atlases = new Array(ATLAS_COUNT);
  const atlasLoading = new Array(ATLAS_COUNT).fill(false);
  let targetFrame = 0;
  let currentFrame = 0;
  let lastDrawnIndex = -1;
  let lastClearRect = null;
  let lastRevealStr = '';
  let lastProgStr = '';

  const findNearestLoadedFrame = (idx) => {
    if (atlases[CAT_FRAMES[idx][0]]) return idx;
    for (let offset = 1; offset < FRAME_COUNT; offset += 1) {
      if (idx - offset >= 0 && atlases[CAT_FRAMES[idx - offset][0]]) return idx - offset;
      if (idx + offset < FRAME_COUNT && atlases[CAT_FRAMES[idx + offset][0]]) return idx + offset;
    }
    return -1;
  };

  const drawCatFrame = (idx, force) => {
    const safeIdx = idx < 0 ? 0 : idx >= FRAME_COUNT ? FRAME_COUNT - 1 : idx;
    if (!force && safeIdx === lastDrawnIndex) return;
    const loadedIdx = findNearestLoadedFrame(safeIdx);
    if (loadedIdx === -1 || !catCtx) return;
    if (!force && loadedIdx === lastDrawnIndex) return;

    if (lastClearRect) {
      catCtx.clearRect(lastClearRect[0], lastClearRect[1], lastClearRect[2], lastClearRect[3]);
    } else {
      catCtx.clearRect(0, 0, FW, FH);
    }

    const frame = CAT_FRAMES[loadedIdx];
    const aIdx = frame[0];
    const sx = frame[1];
    const sy = frame[2];
    const w = frame[3];
    const h = frame[4];
    const dx = frame[5];
    const dy = frame[6];

    if (w > 0 && h > 0) {
      catCtx.drawImage(atlases[aIdx], sx, sy, w, h, dx, dy, w, h);
      const cx = dx > 1 ? dx - 1 : 0;
      const cy = dy > 1 ? dy - 1 : 0;
      const cw = cx + w + 2 > FW ? FW - cx : w + 2;
      const ch = cy + h + 2 > FH ? FH - cy : h + 2;
      lastClearRect = [cx, cy, cw, ch];
    } else {
      lastClearRect = null;
    }

    lastDrawnIndex = loadedIdx;
  };

  const applyCatReveal = (frameFloat) => {
    const clamped = frameFloat < 0 ? 0 : frameFloat >= FRAME_COUNT - 1 ? FRAME_COUNT - 1 : frameFloat;
    const f0 = Math.floor(clamped);
    const f1 = f0 + 1 < FRAME_COUNT ? f0 + 1 : FRAME_COUNT - 1;
    const frac = clamped - f0;
    const pct = CAT_FRAMES[f0][7] + (CAT_FRAMES[f1][7] - CAT_FRAMES[f0][7]) * frac;

    if (catCurtain) {
      const pctStr = pct.toFixed(2);
      if (pctStr !== lastRevealStr) {
        catCurtain.style.transform = `translate3d(${pctStr}%, 0, 0)`;
        lastRevealStr = pctStr;
      }
    }
    if (progressBar) {
      const progStr = (clamped / (FRAME_COUNT - 1)).toFixed(4);
      if (progStr !== lastProgStr) {
        progressBar.style.transform = `scaleX(${progStr})`;
        lastProgStr = progStr;
      }
    }
  };

  const decodeAtlas = (aIdx, onReady, highPriority) => {
    if (atlases[aIdx] || atlasLoading[aIdx]) return;
    atlasLoading[aIdx] = true;
    const url = `images/cat-frames/atlas-${aIdx}.webp`;
    const finish = (bitmapOrImg) => {
      atlases[aIdx] = bitmapOrImg;
      if (onReady) onReady(aIdx);
    };

    if (window.location.protocol !== 'file:' && typeof createImageBitmap === 'function') {
      fetch(url, highPriority ? { priority: 'high' } : undefined)
        .then((res) => {
          if (!res.ok) throw new Error(res.status);
          return res.blob();
        })
        .then((blob) => createImageBitmap(blob))
        .then(finish)
        .catch(() => {
          const img = new Image();
          img.decoding = 'async';
          img.onload = () => finish(img);
          img.src = url;
        });
    } else {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => finish(img);
      img.src = url;
    }
  };

  // Neon Geometry & Dirty-Check Caches
  const safeMeasure = (el, fx, fw, fy) => {
    if (!el) return { x: fx, w: fw, y: fy };
    try {
      const box = el.getBBox();
      if (box && box.width > 10) {
        return { x: box.x - 10, w: box.width + 20, y: box.y + box.height * 0.54 };
      }
    } catch {
      // Hidden SVG at current breakpoint
    }
    return { x: fx, w: fw, y: fy };
  };

  let neonBoxes = {
    wide: { x: 70, w: 840, y: 86 },
    m1: { x: 45, w: 450, y: 66 },
    m2: { x: 40, w: 460, y: 140 }
  };

  const neonCache = {
    wFill: -1, wEdge: -1, wPen: -1, wFl: -1,
    m1Fill: -1, m1Edge: -1, m1Pen: -1,
    m2Fill: -1, m2Edge: -1, m2Pen: -1, mFl: -1
  };

  const updateLineAttrs = (fillRect, edgeRect, pen, box, t, kFill, kEdge, kPen) => {
    const c = clamp01(t);
    const fillW = +(box.w * c).toFixed(1);
    const edgeW = c > 0 ? +Math.min(box.w, fillW + 20).toFixed(1) : 0;

    if (fillRect && neonCache[kFill] !== fillW) {
      if (neonCache[kFill] === -1) fillRect.setAttribute('x', box.x.toFixed(1));
      fillRect.setAttribute('width', fillW);
      neonCache[kFill] = fillW;
    }
    if (edgeRect && neonCache[kEdge] !== edgeW) {
      if (neonCache[kEdge] === -1) edgeRect.setAttribute('x', box.x.toFixed(1));
      edgeRect.setAttribute('width', edgeW);
      neonCache[kEdge] = edgeW;
    }
    if (pen) {
      const active = c > 0.005 && c < 0.995 ? 1 : 0;
      if (neonCache[kPen] !== active) {
        pen.setAttribute('opacity', active);
        neonCache[kPen] = active;
      }
      if (active) {
        pen.setAttribute('cx', (box.x + fillW).toFixed(1));
        pen.setAttribute('cy', (box.y + Math.sin(c * 28) * 4.5).toFixed(1));
      }
    }
  };

  let geo = {
    vh: window.innerHeight,
    isWide: window.innerWidth >= 640,
    roadTop: 0,
    roadRange: 1,
    neonTop: 0,
    neonRange: 1
  };

  const measureGeo = () => {
    const sy = window.scrollY;
    const vh = window.innerHeight;
    geo.vh = vh;
    geo.isWide = window.innerWidth >= 640;

    if (road) {
      geo.roadTop = road.getBoundingClientRect().top + sy;
      geo.roadRange = Math.max(1, road.offsetHeight - vh);
    }
    if (neonEl) {
      geo.neonTop = neonEl.getBoundingClientRect().top + sy;
      geo.neonRange = Math.max(1, neonEl.offsetHeight - vh);
    }

    neonBoxes = {
      wide: safeMeasure(wideText, 70, 840, 86),
      m1: safeMeasure(m1Text, 45, 450, 66),
      m2: safeMeasure(m2Text, 40, 460, 140)
    };
    neonCache.wFill = neonCache.m1Fill = neonCache.m2Fill = -1;
    neonCache.wEdge = neonCache.m1Edge = neonCache.m2Edge = -1;
  };

  const applyNeonFrame = (p) => {
    if (geo.isWide) {
      updateLineAttrs(wideFillRect, wideEdgeRect, widePen, neonBoxes.wide, mapUnit(p, 0.04, 0.80), 'wFill', 'wEdge', 'wPen');
      if (wideFlourish) {
        const fl = +(960 * (1 - mapUnit(p, 0.74, 0.96))).toFixed(1);
        if (neonCache.wFl !== fl) {
          wideFlourish.style.strokeDashoffset = fl;
          neonCache.wFl = fl;
        }
      }
    } else {
      updateLineAttrs(m1FillRect, m1EdgeRect, m1Pen, neonBoxes.m1, mapUnit(p, 0.04, 0.42), 'm1Fill', 'm1Edge', 'm1Pen');
      updateLineAttrs(m2FillRect, m2EdgeRect, m2Pen, neonBoxes.m2, mapUnit(p, 0.42, 0.80), 'm2Fill', 'm2Edge', 'm2Pen');
      if (mobileFlourish) {
        const mFl = +(520 * (1 - mapUnit(p, 0.76, 0.96))).toFixed(1);
        if (neonCache.mFl !== mFl) {
          mobileFlourish.style.strokeDashoffset = mFl;
          neonCache.mFl = mFl;
        }
      }
    }
  };

  if (reducedMotion) {
    if (road && catCanvas) {
      const midIdx = Math.round((FRAME_COUNT - 1) * 0.42);
      decodeAtlas(CAT_FRAMES[midIdx][0], () => drawCatFrame(midIdx, true), true);
    }
    if (wideFillRect) wideFillRect.setAttribute('width', '980');
    if (wideEdgeRect) wideEdgeRect.setAttribute('width', '980');
    if (m1FillRect) m1FillRect.setAttribute('width', '540');
    if (m1EdgeRect) m1EdgeRect.setAttribute('width', '540');
    if (m2FillRect) m2FillRect.setAttribute('width', '540');
    if (m2EdgeRect) m2EdgeRect.setAttribute('width', '540');
    if (wideFlourish) wideFlourish.style.strokeDashoffset = '0';
    if (mobileFlourish) mobileFlourish.style.strokeDashoffset = '0';
  } else {
    let neonTarget = 0;
    let neonCurrent = 0;
    let scrollRaf = null;
    let resizeRaf = null;
    let lastTickTime = 0;

    const syncTargetsFromScrollY = () => {
      const sy = window.scrollY;
      if (road && sy <= geo.roadTop + geo.roadRange + geo.vh) {
        targetFrame = clamp01((sy - geo.roadTop) / geo.roadRange) * (FRAME_COUNT - 1);
      }
      if (neonEl && sy >= geo.neonTop - geo.vh && sy <= geo.neonTop + geo.neonRange + geo.vh) {
        neonTarget = clamp01((sy - geo.neonTop) / geo.neonRange);
      }
    };

    const tickAnim = (now) => {
      const dt = lastTickTime ? Math.min(0.05, (now - lastTickTime) / 1000) : 1 / 60;
      lastTickTime = now;
      let needMore = false;

      if (road && catCanvas) {
        const catAlpha = 1 - Math.exp(-dt * 20);
        currentFrame += (targetFrame - currentFrame) * catAlpha;
        if (Math.abs(targetFrame - currentFrame) < 0.04) {
          currentFrame = targetFrame;
        } else {
          needMore = true;
        }
        drawCatFrame(Math.round(currentFrame), false);
        applyCatReveal(currentFrame);
      }

      if (neonEl) {
        neonCurrent += (neonTarget - neonCurrent) * 0.24;
        if (Math.abs(neonTarget - neonCurrent) < 0.0005) {
          neonCurrent = neonTarget;
        } else {
          needMore = true;
        }
        applyNeonFrame(neonCurrent);
      }

      if (needMore) {
        scrollRaf = window.requestAnimationFrame(tickAnim);
      } else {
        lastTickTime = 0;
        scrollRaf = null;
      }
    };

    const onScrollAnim = () => {
      syncTargetsFromScrollY();
      if (!scrollRaf) {
        scrollRaf = window.requestAnimationFrame(tickAnim);
      }
    };

    measureGeo();
    syncTargetsFromScrollY();
    currentFrame = targetFrame;
    applyCatReveal(currentFrame);
    neonCurrent = neonTarget;
    applyNeonFrame(neonCurrent);

    // Load initial atlas first with high priority, then stream remaining atlases in parallel
    if (road && catCanvas) {
      const startAtlas = CAT_FRAMES[Math.round(targetFrame)][0];
      const onAtlasReady = (loadedAtlasIdx) => {
        const curIdx = Math.round(currentFrame);
        if (CAT_FRAMES[curIdx][0] === loadedAtlasIdx || lastDrawnIndex === -1) {
          drawCatFrame(curIdx, true);
        }
      };

      decodeAtlas(0, (idx) => {
        onAtlasReady(idx);
        for (let a = 1; a < ATLAS_COUNT; a += 1) {
          if (a !== startAtlas) {
            decodeAtlas(a, onAtlasReady, false);
          }
        }
      }, true);

      if (startAtlas !== 0) {
        decodeAtlas(startAtlas, onAtlasReady, true);
      }
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        measureGeo();
        applyNeonFrame(neonCurrent);
      });
    }

    window.addEventListener('scroll', onScrollAnim, { passive: true });
    window.addEventListener('resize', () => {
      if (!resizeRaf) {
        resizeRaf = window.requestAnimationFrame(() => {
          resizeRaf = null;
          measureGeo();
          onScrollAnim();
        });
      }
    }, { passive: true });
  }

  if (brandEl) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      brandEl.classList.add('is-visible');
    } else {
      const brandObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              brandEl.classList.add('is-visible');
              observer.unobserve(brandEl);
            }
          });
        },
        { threshold: 0.2 }
      );
      brandObserver.observe(brandEl);
    }

    const brandBand = document.getElementById('brand-word-band');
    if (brandBand && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
      let bandRect = null;
      let bandRaf = null;
      let mx = 0;
      let my = 0;

      const refreshBandRect = () => {
        bandRect = brandBand.getBoundingClientRect();
      };

      const applyTilt = () => {
        bandRaf = null;
        if (!bandRect || !bandRect.width) return;
        const nx = (mx - bandRect.left) / bandRect.width - 0.5;
        const ny = (my - bandRect.top) / bandRect.height - 0.5;
        brandBand.style.setProperty('--rx', `${(6 - ny * 12).toFixed(2)}deg`);
        brandBand.style.setProperty('--ry', `${(-4 + nx * 14).toFixed(2)}deg`);
        brandBand.style.setProperty('--bx', `${(-nx * 18).toFixed(1)}px`);
        brandBand.style.setProperty('--by', `${(-ny * 14).toFixed(1)}px`);
      };

      brandBand.addEventListener('mouseenter', refreshBandRect, { passive: true });
      brandBand.addEventListener('mousemove', (e) => {
        if (!bandRect) refreshBandRect();
        mx = e.clientX;
        my = e.clientY;
        if (!bandRaf) {
          bandRaf = window.requestAnimationFrame(applyTilt);
        }
      }, { passive: true });

      brandBand.addEventListener('mouseleave', () => {
        if (bandRaf) {
          window.cancelAnimationFrame(bandRaf);
          bandRaf = null;
        }
        brandBand.style.setProperty('--rx', '6deg');
        brandBand.style.setProperty('--ry', '-4deg');
        brandBand.style.setProperty('--bx', '0px');
        brandBand.style.setProperty('--by', '0px');
      });

      window.addEventListener('resize', () => { bandRect = null; }, { passive: true });
    }
  }

  /* ------------------------------------------------------------------------
     M4.1: Sticky Header Scroll State & Accessible Mobile Menu
     ------------------------------------------------------------------------ */
  const header = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const siteNav = document.getElementById('site-nav');

  const updateHeader = () => {
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 18);
    }
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const closeMenu = (restoreFocus = false) => {
    if (!menuToggle || !siteNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('is-open');
    if (restoreFocus) menuToggle.focus();
  };

  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
      const next = menuToggle.getAttribute('aria-expanded') !== 'true';
      menuToggle.setAttribute('aria-expanded', String(next));
      siteNav.classList.toggle('is-open', next);
      if (next) {
        const firstLink = siteNav.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });

    siteNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && siteNav.classList.contains('is-open')) {
        closeMenu(true);
      }
    });

    document.addEventListener('click', (e) => {
      if (
        siteNav.classList.contains('is-open') &&
        !siteNav.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        closeMenu(false);
      }
    });
  }

  /* ------------------------------------------------------------------------
     M4.2: Sticky-Note Gallery Pop-Up (<dialog>)
     ------------------------------------------------------------------------ */
  const noteButtons = Array.from(document.querySelectorAll('#notes .note'));
  const lightbox = document.getElementById('lightbox');
  const lightboxMedia = document.getElementById('lightbox-media');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCount = document.getElementById('lightbox-count');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let activeNoteIndex = 0;
  let lastTriggerNote = null;

  const renderNote = (index) => {
    if (!noteButtons.length) return;
    activeNoteIndex = (index + noteButtons.length) % noteButtons.length;
    const btn = noteButtons[activeNoteIndex];
    if (lightboxMedia) lightboxMedia.textContent = btn.dataset.label || 'PHOTO';
    if (lightboxCaption) lightboxCaption.textContent = btn.dataset.caption || '';
    if (lightboxCount) lightboxCount.textContent = `${activeNoteIndex + 1} / ${noteButtons.length}`;
  };

  if (lightbox && noteButtons.length) {
    noteButtons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        lastTriggerNote = btn;
        renderNote(idx);
        if (typeof lightbox.showModal === 'function') {
          lightbox.showModal();
        } else {
          lightbox.setAttribute('open', '');
        }
        if (lightboxClose) lightboxClose.focus();
      });
    });

    const closeLightbox = () => {
      if (typeof lightbox.close === 'function') {
        lightbox.close();
      } else {
        lightbox.removeAttribute('open');
      }
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => renderNote(activeNoteIndex - 1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => renderNote(activeNoteIndex + 1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        renderNote(activeNoteIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        renderNote(activeNoteIndex + 1);
      }
    });

    lightbox.addEventListener('close', () => {
      if (lastTriggerNote) {
        lastTriggerNote.focus();
        lastTriggerNote = null;
      }
    });
  }

  /* ------------------------------------------------------------------------
     M4.3: Live Opening Hours Badge (Asia/Kolkata) & Today Highlight
     ------------------------------------------------------------------------ */
  const openBadge = document.getElementById('open-badge');
  const hoursRows = Array.from(document.querySelectorAll('#hours tbody tr[data-day]'));
  const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  const getStoreTime = () => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: SHOP_HOURS.timeZone,
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).formatToParts(new Date());
      const map = {};
      parts.forEach((p) => { map[p.type] = p.value; });
      return {
        day: WEEKDAYS[map.weekday] ?? new Date().getDay(),
        minutes: (Number(map.hour) % 24) * 60 + Number(map.minute)
      };
    } catch {
      const now = new Date();
      return { day: now.getDay(), minutes: now.getHours() * 60 + now.getMinutes() };
    }
  };

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  const to12Hour = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  const updateOpeningStatus = () => {
    if (!openBadge || !hoursRows.length) return;
    const { day, minutes } = getStoreTime();
    const todayHours = SHOP_HOURS.schedule[day];

    hoursRows.forEach((row) => {
      const isToday = Number(row.dataset.day) === day;
      row.classList.toggle('is-today', isToday);
      const cell = row.querySelector('th');
      if (cell) {
        const existing = cell.querySelector('.today-tag');
        if (isToday && !existing) {
          const tag = document.createElement('span');
          tag.className = 'today-tag';
          tag.textContent = 'Today';
          cell.appendChild(tag);
        } else if (!isToday && existing) {
          existing.remove();
        }
      }
    });

    if (!todayHours) {
      openBadge.textContent = '[OPENING HOURS]';
      return;
    }

    const openMin = toMinutes(todayHours.open);
    const closeMin = toMinutes(todayHours.close);
    let openNow = false;
    let msg = '';

    if (minutes >= openMin && minutes < closeMin) {
      openNow = true;
      msg = `Open now · Closes at ${to12Hour(todayHours.close)}`;
    } else if (minutes < openMin) {
      msg = `Closed · Opens today at ${to12Hour(todayHours.open)}`;
    } else {
      const tomorrow = SHOP_HOURS.schedule[(day + 1) % 7];
      const nextLabel = (day + 1) % 7 === 0 ? 'Sunday' : 'tomorrow';
      msg = `Closed · Opens ${nextLabel} at ${to12Hour(tomorrow.open)}`;
    }

    openBadge.classList.toggle('is-open', openNow);
    openBadge.classList.toggle('is-closed', !openNow);
    openBadge.textContent = msg;
  };

  updateOpeningStatus();
  window.setInterval(updateOpeningStatus, 60000);

  /* ------------------------------------------------------------------------
     M4.4: Contact Form Validation & Netlify Submission
     ------------------------------------------------------------------------ */
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  const setError = (input, errId, text) => {
    const err = document.getElementById(errId);
    if (!input || !err) return;
    input.classList.toggle('is-invalid', Boolean(text));
    input.setAttribute('aria-invalid', text ? 'true' : 'false');
    err.textContent = text;
  };

  if (form) {
    const nameIn = document.getElementById('f-name');
    const phoneIn = document.getElementById('f-phone');
    const msgIn = document.getElementById('f-message');
    const botIn = form.querySelector('input[name="bot-field"]');
    const submitBtn = form.querySelector('button[type="submit"]');

    const validate = () => {
      let ok = true;
      const digits = phoneIn.value.replace(/\D/g, '');

      if (nameIn.value.trim().length < 2) {
        setError(nameIn, 'f-name-err', 'Please enter your name (at least 2 characters).');
        ok = false;
      } else {
        setError(nameIn, 'f-name-err', '');
      }

      if (digits.length < 7 || digits.length > 15) {
        setError(phoneIn, 'f-phone-err', 'Please enter a valid phone or WhatsApp number.');
        ok = false;
      } else {
        setError(phoneIn, 'f-phone-err', '');
      }

      if (msgIn.value.trim().length < 5) {
        setError(msgIn, 'f-message-err', 'Please write a short message (at least 5 characters).');
        ok = false;
      } else {
        setError(msgIn, 'f-message-err', '');
      }

      return ok;
    };

    [nameIn, phoneIn, msgIn].forEach((field) => {
      if (!field) return;
      field.addEventListener('input', () => {
        if (field.classList.contains('is-invalid')) validate();
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (botIn && botIn.value.trim() !== '') return;

      if (!validate()) {
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (formStatus) {
        formStatus.hidden = true;
        formStatus.className = 'form-status';
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      const encoded = new URLSearchParams(new FormData(form)).toString();

      try {
        if (window.location.protocol === 'file:') {
          throw new Error('LOCAL_PREVIEW');
        }

        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encoded
        });

        if (!res.ok && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          throw new Error('SUBMIT_FAIL');
        }

        if (formStatus) {
          formStatus.hidden = false;
          formStatus.classList.add('is-ok');
          formStatus.textContent = 'Thank you. Your message has been sent to Blazo Pets.';
        }
        form.reset();
      } catch (err) {
        if (formStatus) {
          formStatus.hidden = false;
          if (err.message === 'LOCAL_PREVIEW') {
            formStatus.classList.add('is-ok');
            formStatus.textContent = 'Validation passed. Once deployed on Netlify, messages go straight to Netlify Forms.';
            form.reset();
          } else {
            formStatus.classList.add('is-err');
            formStatus.textContent = 'Could not send right now. Please call or WhatsApp 9539939359.';
          }
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send message';
        }
      }
    });
  }

  /* ------------------------------------------------------------------------
     M5: Section Reveals & Active Nav Highlight
     ------------------------------------------------------------------------ */
  const sectionEls = ['manager', 'store', 'sell', 'reach', 'location', 'contact', 'customers']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = Array.from(document.querySelectorAll('#site-nav a[href^="#"]'));

  sectionEls.forEach((sec) => sec.classList.add('reveal'));

  if (reducedMotion || !('IntersectionObserver' in window)) {
    sectionEls.forEach((sec) => sec.classList.add('is-in'));
  } else {
    const revealObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    sectionEls.forEach((sec) => revealObs.observe(sec));

    const navObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targetHref = `#${entry.target.id}`;
            navLinks.forEach((a) => {
              a.classList.toggle('is-current', a.getAttribute('href') === targetHref);
            });
          }
        });
      },
      { rootMargin: '-35% 0px -55% 0px' }
    );
    sectionEls.forEach((sec) => navObs.observe(sec));
  }
})();
