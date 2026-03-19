// === HR07 AI Skin Analysis v2 — Bug-fixed version ===
// Fixed 12 issues from code review on 2026-03-19

const API_URL = 'https://rho.zeabur.app/webhook/skin-test';

// --- State ---
let currentLang = 'vi';
let capturedImage = null;
let progressTimers = []; // Bug #5: track timers to cancel

// --- i18n ---
const i18n = {
  vi: {
    title: 'Phan Tich Da Bang AI',
    subtitle: 'Kham pha tuoi da cua ban trong 60 giay',
    desc: 'Phan tich da bang AI mien phi boi HR07 Beauty Clinic.\nNhan khuyen nghi cham soc da ca nhan hoa.',
    start: 'Bat Dau Phan Tich Mien Phi',
    trust: '🔒 Anh cua ban duoc phan tich ngay lap tuc va khong bao gio duoc luu tru',
    selfie: 'Chup Anh Selfie',
    align: 'Dat khuon mat vao khung oval',
    cameraError: 'Vui long tai len anh selfie ro rang', // Bug #2
    light: '💡 Anh sang tot', face: '👤 Nhin thang', nofilter: '🚫 Khong filter',
    upload: '📁 Tai len',
    retake: 'Chup lai', analyze: 'Phan Tich Da →',
    name: 'Ten cua ban (tuy chon)', age: 'Tuoi cua ban',
    analyzing: 'Dang Phan Tich Da...',
    steps: ['✓ Nhan dien loai da', '⏳ Phan tich nep nhan', '⏳ Kiem tra lo chan long', '⏳ Danh gia dom sac to', '⏳ Tinh tuoi da', '⏳ Tao khuyen nghi'],
    yourAnalysis: 'Phan Tich Da Cua Ban',
    actualAge: 'Tuoi That', skinAge: 'Tuoi Da',
    younger: '🎉 Da ban tre hon tuoi that! Tiep tuc phat huy!',
    same: '👍 Da ban dung tuoi. Cham soc tot de duy tri!',
    older: '⚠️ Da ban co dau hieu lao hoa som. Hay bat dau cham soc ngay!',
    scores: 'Diem Suc Khoe Da', issues: 'Van De Phat Hien',
    noIssues: 'Khong phat hien van de lon ✨', // Bug #9
    report: '📋 Bao Cao Ca Nhan Hoa',
    recommended: '💎 Duoc Khuyen Nghi Cho Ban',
    readyTitle: 'San sang thay doi lan da?',
    readyDesc: 'Dat lich tu van mien phi tai HR07 Beauty Clinic',
    zalo: '💬 Chat tren Zalo', line: '💚 Them LINE',
    shareTitle: 'Chia se ket qua', shareDesc: 'Thach thuc ban be kham pha tuoi da!',
    share: '📤 Chia Se Ket Qua', retry: '🔄 Thu Lai',
    disclaimer: '⚠️ Phan tich nay chi mang tinh tham khao va khong phai la chan doan y te.',
    moisture: 'Do Am', smoothness: 'Do Min', wrinkles: 'Nep Nhan', spots: 'Dom', pores: 'Lo Chan Long', firmness: 'Do San Chac',
    photoFirst: 'Vui long chup hoac tai len anh truoc', // Bug #1
    cameraNotReady: 'Camera chua san sang, vui long doi', // Bug #7
    serverError: 'Loi may chu', // Bug #4
    copied: 'Da sao chep!'
  },
  zh: {
    title: 'AI 智能測膚',
    subtitle: '60 秒發現你的肌膚年齡',
    desc: 'HR07 Beauty Clinic 免費 AI 測膚分析。\n獲取個人化護膚建議。',
    start: '開始免費測膚',
    trust: '🔒 你的照片即時分析，絕不儲存',
    selfie: '拍一張自拍',
    align: '請將臉部對準橢圓框',
    cameraError: '請上傳一張清晰的自拍照',
    light: '💡 光線充足', face: '👤 正面直視', nofilter: '🚫 不加濾鏡',
    upload: '📁 上傳照片',
    retake: '重拍', analyze: '分析我的皮膚 →',
    name: '你的名字（選填）', age: '你的年齡',
    analyzing: '正在分析你的皮膚...',
    steps: ['✓ 偵測膚質類型', '⏳ 分析皺紋與細紋', '⏳ 檢查毛孔與紋理', '⏳ 評估色斑與色素', '⏳ 計算肌膚年齡', '⏳ 生成個人化建議'],
    yourAnalysis: '你的測膚報告',
    actualAge: '實際年齡', skinAge: '肌膚年齡',
    younger: '🎉 你的皮膚比實際年齡年輕！繼續保持！',
    same: '👍 你的皮膚狀態跟年齡相符。好好保養維持！',
    older: '⚠️ 你的皮膚有提前老化的跡象。建議開始積極保養！',
    scores: '肌膚健康分數', issues: '偵測到的問題',
    noIssues: '未偵測到重大問題 ✨',
    report: '📋 個人化報告',
    recommended: '💎 推薦給你的療程',
    readyTitle: '準備好改變你的肌膚了嗎？',
    readyDesc: '預約 HR07 Beauty Clinic 免費諮詢',
    zalo: '💬 Zalo 諮詢', line: '💚 加 LINE',
    shareTitle: '分享你的結果', shareDesc: '挑戰朋友來測測肌膚年齡！',
    share: '📤 分享結果', retry: '🔄 再測一次',
    disclaimer: '⚠️ 本分析僅供參考，不構成醫療診斷。如需專業建議請諮詢皮膚科醫師。',
    moisture: '保濕度', smoothness: '光滑度', wrinkles: '皺紋', spots: '色斑', pores: '毛孔', firmness: '緊緻度',
    photoFirst: '請先拍照或上傳照片',
    cameraNotReady: '相機還沒準備好，請稍等',
    serverError: '伺服器錯誤',
    copied: '已複製到剪貼簿！'
  },
  en: {
    title: 'AI Skin Analysis',
    subtitle: 'Discover your skin age in 60 seconds',
    desc: 'Free AI-powered skin analysis by HR07 Beauty Clinic.\nGet personalized skincare recommendations.',
    start: 'Start Free Analysis',
    trust: '🔒 Your photo is analyzed instantly and never stored',
    selfie: 'Take a Selfie',
    align: 'Align your face within the oval',
    cameraError: 'Please upload a clear selfie photo',
    light: '💡 Good lighting', face: '👤 Face forward', nofilter: '🚫 No filters',
    upload: '📁 Upload',
    retake: 'Retake', analyze: 'Analyze My Skin →',
    name: 'Your name (optional)', age: 'Your age',
    analyzing: 'Analyzing Your Skin...',
    steps: ['✓ Detecting skin type', '⏳ Analyzing wrinkles', '⏳ Checking pores', '⏳ Evaluating spots', '⏳ Calculating skin age', '⏳ Generating recommendations'],
    yourAnalysis: 'Your Skin Analysis',
    actualAge: 'Actual Age', skinAge: 'Skin Age',
    younger: '🎉 Your skin looks younger than your age! Keep it up!',
    same: '👍 Your skin matches your age. Maintain your routine!',
    older: '⚠️ Your skin shows signs of premature aging. Start caring now!',
    scores: 'Skin Health Scores', issues: 'Issues Detected',
    noIssues: 'No major issues detected ✨',
    report: '📋 Personalized Report',
    recommended: '💎 Recommended for You',
    readyTitle: 'Ready to transform your skin?',
    readyDesc: 'Book a free consultation at HR07 Beauty Clinic',
    zalo: '💬 Chat on Zalo', line: '💚 Add LINE',
    shareTitle: 'Share your results', shareDesc: 'Challenge friends to discover their skin age!',
    share: '📤 Share Result', retry: '🔄 Try Again',
    disclaimer: '⚠️ This analysis is for reference only and does not constitute medical diagnosis.',
    moisture: 'Moisture', smoothness: 'Smoothness', wrinkles: 'Wrinkles', spots: 'Spots', pores: 'Pores', firmness: 'Firmness',
    photoFirst: 'Please take or upload a photo first',
    cameraNotReady: 'Camera not ready, please wait a moment',
    serverError: 'Server error',
    copied: 'Copied to clipboard!'
  }
};

// --- Navigation ---
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// --- Language --- Bug #3 fixed: no more innerHTML replacement for upload button
function setLang(lang) {
  currentLang = lang;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  const t = i18n[lang];
  document.querySelector('.hero h1').textContent = t.title;
  document.querySelector('.subtitle').textContent = t.subtitle;
  document.querySelector('.desc').textContent = t.desc;
  document.getElementById('btn-start').textContent = t.start;
  document.querySelector('.trust').textContent = t.trust;
  document.querySelector('.camera-header h2').textContent = t.selfie;
  document.querySelector('.guide-text').textContent = t.align;
  const tips = document.querySelectorAll('.camera-tips span');
  tips[0].textContent = t.light;
  tips[1].textContent = t.face;
  tips[2].textContent = t.nofilter;
  // Bug #3 fix: only update the text node, not innerHTML
  document.getElementById('upload-text').textContent = t.upload;
  document.getElementById('btn-retake').textContent = t.retake;
  document.getElementById('btn-analyze').textContent = t.analyze;
  document.getElementById('input-name').placeholder = t.name;
  document.getElementById('input-age').placeholder = t.age;
  // Show LINE for zh, Zalo for vi/en
  document.getElementById('btn-zalo').style.display = lang === 'zh' ? 'none' : 'inline-block';
  document.getElementById('btn-line').style.display = lang === 'zh' ? 'inline-block' : 'none';
}

// --- Camera ---
let stream = null;

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1440 } }
    });
    const video = document.getElementById('camera-video');
    video.srcObject = stream;
    video.style.display = 'block';
    document.getElementById('preview-img').style.display = 'none';
    document.querySelector('.face-guide').style.display = 'flex';
    document.querySelector('.camera-actions').style.display = 'flex';
    document.getElementById('retake-actions').style.display = 'none';
  } catch (err) {
    document.getElementById('camera-video').style.display = 'none';
    document.getElementById('btn-capture').style.display = 'none';
    // Bug #2 fix: use translated text
    document.querySelector('.guide-text').textContent = i18n[currentLang].cameraError;
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
}

function capturePhoto() {
  const video = document.getElementById('camera-video');
  // Bug #7 fix: check video is ready
  if (!video.videoWidth || !video.videoHeight) {
    alert(i18n[currentLang].cameraNotReady);
    return;
  }
  const canvas = document.getElementById('camera-canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  capturedImage = canvas.toDataURL('image/jpeg', 0.85);
  showPreview(capturedImage);
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    capturedImage = ev.target.result;
    showPreview(capturedImage);
  };
  reader.readAsDataURL(file);
}

function showPreview(dataUrl) {
  stopCamera();
  const preview = document.getElementById('preview-img');
  preview.src = dataUrl;
  preview.style.display = 'block';
  document.getElementById('camera-video').style.display = 'none';
  document.querySelector('.face-guide').style.display = 'none';
  document.querySelector('.camera-actions').style.display = 'none';
  document.getElementById('retake-actions').style.display = 'flex';
}

// --- Analysis ---
async function analyzeImage() {
  // Bug #1 fix: guard against null capturedImage
  if (!capturedImage) {
    alert(i18n[currentLang].photoFirst);
    return;
  }

  const userName = document.getElementById('input-name').value || 'Guest';
  const age = parseInt(document.getElementById('input-age').value) || 30;
  const birthYear = new Date().getFullYear() - age;

  showScreen('screen-analyzing');
  animateProgress();

  const base64 = capturedImage.split(',')[1];

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_base64: base64,
        language: currentLang === 'zh' ? 'zh-TW' : currentLang,
        birth_year: birthYear,
        age: age,
        sender: { display_name: userName }
      })
    });

    // Bug #4 fix: check response.ok
    if (!response.ok) {
      throw new Error(`${i18n[currentLang].serverError}: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) throw new Error(data.message || 'Analysis failed');
    showResults(data, userName, age);
  } catch (err) {
    // Bug #5: cancel progress timers on error
    progressTimers.forEach(t => clearTimeout(t));
    progressTimers = [];
    alert(err.message + '\n' + (currentLang === 'zh' ? '請重試' : 'Please try again'));
    showScreen('screen-camera');
    startCamera();
  }
}

// Bug #5 fix: track and cancel timers
function animateProgress() {
  progressTimers.forEach(t => clearTimeout(t));
  progressTimers = [];

  const fill = document.getElementById('progress-fill');
  fill.style.width = '0%';
  const t = i18n[currentLang];
  const steps = t.steps;
  const durations = [15, 25, 40, 55, 70, 85];

  // Reset all steps
  for (let i = 1; i <= 6; i++) {
    const stepEl = document.getElementById('step-' + i);
    stepEl.textContent = steps[i - 1];
    stepEl.classList.remove('done', 'active');
  }
  document.getElementById('step-1').classList.add('active');

  durations.forEach((pct, i) => {
    const timer = setTimeout(() => {
      fill.style.width = pct + '%';
      for (let j = 0; j <= i; j++) {
        const stepEl = document.getElementById('step-' + (j + 1));
        stepEl.textContent = steps[j].replace('⏳', '✓');
        stepEl.classList.add('done');
        stepEl.classList.remove('active');
      }
      if (i + 1 < steps.length) {
        document.getElementById('step-' + (i + 2)).classList.add('active');
      }
    }, (i + 1) * 1500);
    progressTimers.push(timer);
  });
}

// --- Results ---
function showResults(data, userName, actualAge) {
  // Bug #5: cancel progress timers
  progressTimers.forEach(t => clearTimeout(t));
  progressTimers = [];

  const t = i18n[currentLang];
  const sa = data.skin_analysis || {};

  document.getElementById('result-name').textContent = userName !== 'Guest' ? userName : '';
  document.querySelector('.results-header h2').textContent = t.yourAnalysis;

  const skinAge = sa.skin_age || actualAge;
  document.getElementById('actual-age').textContent = actualAge;
  document.getElementById('skin-age').textContent = skinAge;

  const skinAgeBox = document.getElementById('skin-age-box');
  skinAgeBox.classList.remove('younger', 'older');
  const verdictEl = document.getElementById('age-verdict');

  if (skinAge < actualAge - 1) {
    skinAgeBox.classList.add('younger');
    verdictEl.textContent = t.younger;
    verdictEl.style.color = 'var(--success)';
  } else if (skinAge > actualAge + 1) {
    skinAgeBox.classList.add('older');
    verdictEl.textContent = t.older;
    verdictEl.style.color = 'var(--danger)';
  } else {
    verdictEl.textContent = t.same;
    verdictEl.style.color = 'var(--warning)';
  }

  document.querySelector('.skin-age-card .age-box.actual .age-label').textContent = t.actualAge;
  document.querySelector('.skin-age-card .age-box.skin .age-label').textContent = t.skinAge;

  const scores = {
    moisture: sa.moisture || 70,
    smoothness: sa.smoothness || 70,
    wrinkles: sa.wrinkle_score || 70,
    spots: sa.spot_score || 70,
    pores: sa.pore_score || 70,
    firmness: sa.firmness || 70
  };

  drawRadarChart(scores);

  const legendEl = document.getElementById('score-legend');
  legendEl.innerHTML = '';
  document.querySelector('.chart-card h3').textContent = t.scores;
  Object.entries(scores).forEach(([key, val]) => {
    const cls = val >= 75 ? 'good' : val >= 55 ? 'ok' : 'bad';
    legendEl.innerHTML += `<div class="legend-item"><span class="legend-label">${t[key] || key}</span><span class="legend-value ${cls}">${val}/100</span></div>`;
  });

  const issuesEl = document.getElementById('issue-tags');
  issuesEl.innerHTML = '';
  document.querySelector('.issues-card h3').textContent = t.issues;
  const issueMap = {
    dark_circle: { vi: 'Quang tham', zh: '黑眼圈', en: 'Dark Circles' },
    eye_pouch: { vi: 'Bong mat', zh: '眼袋', en: 'Eye Bags' },
    acne: { vi: 'Mun', zh: '痘痘', en: 'Acne' },
    blackhead: { vi: 'Mun dau den', zh: '黑頭', en: 'Blackheads' },
    skin_spot: { vi: 'Dom nau', zh: '色斑', en: 'Spots' },
    forehead_wrinkle: { vi: 'Nhan tran', zh: '額頭皺紋', en: 'Forehead Wrinkles' },
    crows_feet: { vi: 'Chan chim', zh: '魚尾紋', en: "Crow's Feet" },
    nasolabial_fold: { vi: 'Ranh mui ma', zh: '法令紋', en: 'Nasolabial Folds' },
    eye_finelines: { vi: 'Nep nhan mat', zh: '眼周細紋', en: 'Eye Fine Lines' }
  };

  const detectedIssues = [];
  Object.entries(issueMap).forEach(([key, labels]) => {
    if (sa[key]) {
      const conf = sa[key + '_conf'] || 50;
      const severity = conf > 80 ? 'high' : conf > 50 ? 'medium' : 'low';
      issuesEl.innerHTML += `<span class="issue-tag ${severity}">${labels[currentLang] || labels.en} ${conf}%</span>`;
      detectedIssues.push({ key, label: labels[currentLang] || labels.en, conf, severity });
    }
  });

  // Bug #9 fix: translated "no issues" message
  if (detectedIssues.length === 0) {
    issuesEl.innerHTML = `<span class="issue-tag low">${t.noIssues}</span>`;
  }

  document.querySelector('.report-card h3').textContent = t.report;
  document.getElementById('report-text').textContent = data.report || '';

  document.querySelector('.treatments-card h3').textContent = t.recommended;
  const treatmentsEl = document.getElementById('treatments-list');
  treatmentsEl.innerHTML = '';

  const treatments = getTreatments(detectedIssues, currentLang);
  treatments.forEach(tr => {
    treatmentsEl.innerHTML += `
      <div class="treatment-item">
        <div class="treatment-icon">${tr.icon}</div>
        <div class="treatment-info">
          <div class="treatment-name">${tr.name}</div>
          <div class="treatment-desc">${tr.desc}</div>
          <div class="treatment-price">${tr.price}</div>
        </div>
      </div>`;
  });

  document.querySelector('.cta-card h3').textContent = t.readyTitle;
  document.querySelector('.cta-card p').textContent = t.readyDesc;
  document.getElementById('btn-zalo').textContent = t.zalo;
  document.getElementById('btn-line').textContent = t.line;
  document.querySelector('.share-card h3').textContent = t.shareTitle;
  document.querySelector('.share-card p').textContent = t.shareDesc;
  document.getElementById('btn-share').textContent = t.share;
  document.getElementById('btn-retry').textContent = t.retry;
  document.querySelector('.disclaimer').textContent = t.disclaimer;

  // Set progress to 100% before showing results
  document.getElementById('progress-fill').style.width = '100%';
  showScreen('screen-results');
}

// Bug #10 fix: safe lang fallback
function getTreatments(issues, lang) {
  const treatmentDB = {
    wrinkle: {
      icon: '💉', name: { vi: 'Botox', zh: 'Botox 除皺', en: 'Botox' },
      desc: { vi: 'Giam nep nhan hieu qua', zh: '有效減少動態紋路', en: 'Effective wrinkle reduction' },
      price: '3,000,000 - 8,000,000 VND',
      triggers: ['forehead_wrinkle', 'crows_feet', 'glabella_wrinkle']
    },
    filler: {
      icon: '✨', name: { vi: 'Filler', zh: 'Filler 填充', en: 'Dermal Filler' },
      desc: { vi: 'Lam day ranh, tre hoa khuon mat', zh: '填充凹陷、年輕化臉型', en: 'Fill lines, rejuvenate face' },
      price: '5,000,000 - 15,000,000 VND',
      triggers: ['nasolabial_fold', 'eye_pouch']
    },
    laser: {
      icon: '⚡', name: { vi: 'Pico Laser', zh: 'Pico 皮秒雷射', en: 'Pico Laser' },
      desc: { vi: 'Tri nam, dom nau, lam sang da', zh: '改善色斑、亮白膚色', en: 'Treat spots, brighten skin' },
      price: '3,000,000 - 10,000,000 VND',
      triggers: ['skin_spot']
    },
    skinbooster: {
      icon: '💧', name: { vi: 'Skinbooster', zh: 'Skinbooster 水光針', en: 'Skinbooster' },
      desc: { vi: 'Cap am sau, cang bong da', zh: '深層補水、光澤亮膚', en: 'Deep hydration, glowing skin' },
      price: '4,000,000 - 12,000,000 VND',
      triggers: ['eye_finelines', 'dark_circle']
    },
    peel: {
      icon: '🧴', name: { vi: 'Bio Peel', zh: 'Bio Peel 煥膚', en: 'Bio Peel' },
      desc: { vi: 'Tri mun, se khit lo chan long', zh: '改善痘痘、縮小毛孔', en: 'Treat acne, minimize pores' },
      price: '2,000,000 - 5,000,000 VND',
      triggers: ['acne', 'blackhead']
    },
    thread: {
      icon: '🧵', name: { vi: 'Chi Collagen', zh: '膠原蛋白線雕', en: 'Collagen Threads' },
      desc: { vi: 'Nang co, dinh hinh khuon mat', zh: '提拉緊緻、重塑臉型', en: 'Lift and contour face' },
      price: '8,000,000 - 25,000,000 VND',
      triggers: ['nasolabial_fold', 'eye_pouch']
    }
  };

  const issueKeys = issues.map(i => i.key);
  const matched = [];
  const seen = new Set();

  Object.entries(treatmentDB).forEach(([id, tr]) => {
    if (seen.has(id)) return;
    const hasMatch = tr.triggers.some(t => issueKeys.includes(t));
    if (hasMatch) {
      seen.add(id);
      matched.push({
        icon: tr.icon,
        name: tr.name[lang] || tr.name.en, // Bug #10: fallback to English
        desc: tr.desc[lang] || tr.desc.en,
        price: tr.price
      });
    }
  });

  if (matched.length === 0) {
    const sb = treatmentDB.skinbooster;
    matched.push({ icon: sb.icon, name: sb.name[lang] || sb.name.en, desc: sb.desc[lang] || sb.desc.en, price: sb.price });
  }

  return matched.slice(0, 3);
}

// --- Radar Chart --- Bug #12 fix: responsive maxR
function drawRadarChart(scores) {
  const canvas = document.getElementById('radar-chart');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = Math.min(300, window.innerWidth - 80); // Bug #12: responsive
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  const cx = size / 2, cy = size / 2;
  const maxR = size / 2 - 35; // Bug #12: dynamic maxR with padding for labels
  const values = Object.values(scores);
  const n = values.length;
  const angleStep = (2 * Math.PI) / n;

  // Background rings
  [0.25, 0.5, 0.75, 1].forEach(pct => {
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + Math.cos(angle) * maxR * pct;
      const y = cy + Math.sin(angle) * maxR * pct;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.stroke();
  });

  // Axis lines
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.stroke();
  }

  // Data polygon
  ctx.beginPath();
  values.forEach((val, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (val / 100) * maxR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(201, 169, 110, 0.2)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(201, 169, 110, 0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Data points
  values.forEach((val, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (val / 100) * maxR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = val >= 75 ? '#4ade80' : val >= 55 ? '#fbbf24' : '#f87171';
    ctx.fill();
  });

  // Labels
  const t = i18n[currentLang];
  const labelKeys = ['moisture', 'smoothness', 'wrinkles', 'spots', 'pores', 'firmness'];
  const fontSize = size < 260 ? 10 : 11;
  ctx.font = `${fontSize}px Inter, sans-serif`;
  ctx.fillStyle = '#999';
  ctx.textAlign = 'center';
  labelKeys.forEach((key, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const lx = cx + Math.cos(angle) * (maxR + 18);
    const ly = cy + Math.sin(angle) * (maxR + 18);
    ctx.fillText(t[key] || key, lx, ly + 4);
  });
}

// --- Share ---
function shareResults() {
  const skinAge = document.getElementById('skin-age').textContent;
  const t = i18n[currentLang];
  const text = currentLang === 'vi'
    ? `Tuoi da cua toi la ${skinAge}! 🔬 Thu phan tich da mien phi: `
    : currentLang === 'zh'
    ? `我的肌膚年齡是 ${skinAge} 歲！🔬 免費 AI 測膚：`
    : `My skin age is ${skinAge}! 🔬 Try free AI skin analysis: `;

  const url = window.location.href;

  if (navigator.share) {
    navigator.share({ title: 'AI Skin Analysis', text: text, url: url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text + url).then(() => {
      alert(t.copied);
    }).catch(() => {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text + url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert(t.copied);
    });
  }
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  document.getElementById('btn-start').addEventListener('click', () => {
    showScreen('screen-camera');
    startCamera();
  });

  document.getElementById('btn-back').addEventListener('click', () => {
    stopCamera();
    showScreen('screen-landing');
  });

  document.getElementById('btn-capture').addEventListener('click', capturePhoto);

  // Bug #3 fix: single event listener, never re-attached
  document.getElementById('file-input').addEventListener('change', handleFileUpload);

  document.getElementById('btn-retake').addEventListener('click', () => {
    capturedImage = null;
    startCamera();
  });

  document.getElementById('btn-analyze').addEventListener('click', analyzeImage);
  document.getElementById('btn-share').addEventListener('click', shareResults);

  document.getElementById('btn-retry').addEventListener('click', () => {
    capturedImage = null;
    showScreen('screen-landing');
  });

  setLang('vi');
});
