(() => {
  'use strict';

  const kingImg = new Image();
  kingImg.src = 'king.png';

  const king3Img = new Image();
  king3Img.src = 'king3.png';

  const MODES = {
    WARMUP: {
      key: 'WARMUP',
      name: '準備運動',
      playerHp: Infinity,
      barrierMaxHp: 1200,
      baseBonus: 3000,
      parTime: 95,
      speedScale: 0.9,
      desc: '【準備運動】障壁：無制限 ／ 耐久：1,200 ／ まずは攻撃を見極める練習モード'
    },
    NORMAL: {
      key: 'NORMAL',
      name: '通常訓練',
      playerHp: 5,
      barrierMaxHp: 1200,
      baseBonus: 5000,
      parTime: 95,
      speedScale: 1.0,
      desc: '【通常訓練】障壁：5枚 ／ 耐久：1,200 ／ 準備の後に行う標準的な試練'
    },
    INTENSE: {
      key: 'INTENSE',
      name: '猛特訓',
      playerHp: 3,
      barrierMaxHp: 1800,
      baseBonus: 8000,
      parTime: 140,
      speedScale: 1.18,
      desc: '【猛特訓】障壁：3枚 ／ 耐久：1,800 ／ 攻撃が激化する高難易度'
    },
    SPECIAL: {
      key: 'SPECIAL',
      name: '特別指導',
      playerHp: 1,
      barrierMaxHp: 2400,
      baseBonus: 12000,
      parTime: 185,
      speedScale: 1.32,
      desc: '【特別指導】障壁：1枚 ／ 耐久：2,400 ／ 一発の被弾も許されない究極の試練'
    },
    ENDLESS: {
      key: 'ENDLESS',
      name: '無限試練',
      playerHp: 1,
      barrierMaxHp: Infinity,
      baseBonus: 0,
      parTime: 0,
      speedScale: 1.32,
      desc: '【無限試練】障壁：1枚 ／ 魔法弾なし ／ 限界まで攻撃を避け続ける特別試練'
    }
  };

  const STORAGE_KEY_V11 = 'zmtq_guardian_trial_best_v1_1';
  const SPECIAL_CLEAR_KEY = 'zmtq_guardian_special_clears_v1_2';

  const STORAGE_KEY_G3_BEST = 'zmtq_guardian3_trial_best_v1_3';
  const G3_UNLOCK_KEY = 'zmtq_guardian3_unlocked_v1_3';
  const G3_EVENT_SHOWN_KEY = 'zmtq_guardian3_event_shown_v1_3';

  let WORLD_W = 1120;
  let WORLD_H = 630;
  let STAGE_BOUNDS = { left: 100, right: 1020, top: 225, bottom: 585 };
  let BOSS_POS = { x: 560, y: 118 };
  let BARRIER_RADIUS = 86;

  function updateWorldDimensions() {
    const isLandscapeViewport = window.innerWidth >= 768 && (window.innerWidth / window.innerHeight) > 1.05;
    if (isLandscapeViewport) {
      WORLD_W = 1120;
      WORLD_H = 630;
      STAGE_BOUNDS = { left: 100, right: 1020, top: 225, bottom: 585 };
      BOSS_POS = { x: 560, y: 118 };
      BARRIER_RADIUS = 86;
    } else {
      WORLD_W = 720;
      WORLD_H = 920;
      STAGE_BOUNDS = { left: 55, right: 665, top: 285, bottom: 860 };
      BOSS_POS = { x: 360, y: 150 };
      BARRIER_RADIUS = 90;
    }
  }

  const appRoot = document.getElementById('appRoot');
  const routeTransitionOverlay = document.getElementById('routeTransitionOverlay');
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const canvasFrame = document.getElementById('canvasFrame');

  const titleTopBar = document.getElementById('titleTopBar');
  const btnReturnGuardian1 = document.getElementById('btnReturnGuardian1');
  const battleHud = document.getElementById('battleHud');
  const hudBossName = document.getElementById('hudBossName');
  const barrierHudContainer = document.getElementById('barrierHudContainer');
  const footerLinkBar = document.getElementById('footerLinkBar');
  const touchControlsBar = document.getElementById('touchControlsBar');
  const attackTouchWrap = document.getElementById('attackTouchWrap');

  const titleOverlay = document.getElementById('titleOverlay');
  const storyIntroParagraph = document.getElementById('storyIntroParagraph');
  const resultOverlay = document.getElementById('resultOverlay');
  const resultSpeakerName = document.getElementById('resultSpeakerName');
  const countdownOverlay = document.getElementById('countdownOverlay');
  const countdownText = document.getElementById('countdownText');
  const countdownModeLabel = document.getElementById('countdownModeLabel');

  const hudModeBadge = document.getElementById('hudModeBadge');
  const phaseBadge = document.getElementById('phaseBadge');
  const hpBox = document.getElementById('hpBox');
  const hpPips = document.getElementById('hpPips');
  const hudTime = document.getElementById('hudTime');
  const hudHits = document.getElementById('hudHits');
  const barrierBarFill = document.getElementById('barrierBarFill');
  const barrierPercentText = document.getElementById('barrierPercentText');

  const bestModeLabel = document.getElementById('bestModeLabel');
  const bestTimeHeaderLabel = document.getElementById('bestTimeHeaderLabel');
  const bestRankText = document.getElementById('bestRankText');
  const bestTimeText = document.getElementById('bestTimeText');
  const bestHitsText = document.getElementById('bestHitsText');
  const bestScoreText = document.getElementById('bestScoreText');
  const modeDescText = document.getElementById('modeDescText');
  const btnEndlessMode = document.getElementById('btnEndlessMode');

  const btnAnomalyPortal = document.getElementById('btnAnomalyPortal');
  const anomalyHoldFill = document.getElementById('anomalyHoldFill');
  const modalUnlockEvent = document.getElementById('modalUnlockEvent');
  const btnConfirmUnlockEvent = document.getElementById('btnConfirmUnlockEvent');

  const modalMenu = document.getElementById('modalMenu');
  const menuTabButtons = document.querySelectorAll('.menu-tab-btn');
  const menuTabControls = document.getElementById('menuTabControls');
  const menuTabUpdates = document.getElementById('menuTabUpdates');
  const menuTabTransfer = document.getElementById('menuTabTransfer');
  const btnExportData = document.getElementById('btnExportData');
  const btnTriggerImport = document.getElementById('btnTriggerImport');
  const inputImportFile = document.getElementById('inputImportFile');
  const transferStatusMsg = document.getElementById('transferStatusMsg');

  document.getElementById('btnOpenMenu').addEventListener('click', () => {
    transferStatusMsg.textContent = '';
    modalMenu.classList.add('open');
  });

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-close-modal');
      document.getElementById(targetId).classList.remove('open');
    });
  });

  modalMenu.addEventListener('click', (e) => {
    if (e.target === modalMenu) modalMenu.classList.remove('open');
  });

  menuTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-menu-tab');
      menuTabButtons.forEach(b => b.classList.remove('mode-active'));
      btn.classList.add('mode-active');

      menuTabControls.classList.add('hidden');
      menuTabUpdates.classList.add('hidden');
      menuTabTransfer.classList.add('hidden');

      if (tab === 'controls') menuTabControls.classList.remove('hidden');
      else if (tab === 'updates') menuTabUpdates.classList.remove('hidden');
      else if (tab === 'transfer') menuTabTransfer.classList.remove('hidden');
    });
  });

  let currentRoute = 'GUARDIAN_1';
  let gameState = 'TITLE';
  let currentModeKey = 'NORMAL';
  let isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  let elapsedTime = 0;
  let hitCount = 0;
  let currentPhase = 1;
  let barrierMaxHp = 1200;
  let barrierHp = 1200;
  let barrierFlash = 0;
  let screenShake = 0;
  let clearAnimTimer = 0;
  let countdownTimer = 0;
  let lastCountdownStep = -1;

  let memorabiliaState = {
    phase: 'INACTIVE',
    timer: 0,
    cooldown: 9.0
  };

  let anomalyHoldState = {
    active: false,
    progress: 0,
    duration: 3.0,
    transitioning: false
  };

  let lastResultSummary = {
    route: 'GUARDIAN_1',
    modeKey: 'NORMAL',
    modeName: '通常訓練',
    score: 0,
    rank: 'C',
    timeSec: 0,
    cleared: false
  };

  const player = {
    x: 560,
    y: 480,
    radius: 11,
    speed: 330,
    hp: 5,
    maxHp: 5,
    invulnTimer: 0,
    shootCooldown: 0,
    trail: []
  };

  let playerBullets = [];
  let bossAttacks = [];
  let particles = [];
  let floatingRings = [];

  let attackDirector = {
    cooldown: 1.0,
    patternIndex: 0,
    rhythmStep: 0
  };

  const keys = {};
  let mouseAttackHeld = false;
  let touchAttackHeld = false;
  let joyVector = { x: 0, y: 0 };
  let joyTouchId = null;

  let canvasDragTouchId = null;
  let canvasDragLastPos = { x: 0, y: 0 };

  function getSpecialClearCount() {
    try {
      return parseInt(localStorage.getItem(SPECIAL_CLEAR_KEY) || '0', 10) || 0;
    } catch (e) {
      return 0;
    }
  }

  function incrementSpecialClearCount() {
    try {
      const next = getSpecialClearCount() + 1;
      localStorage.setItem(SPECIAL_CLEAR_KEY, String(next));
      return next;
    } catch (e) {
      return 1;
    }
  }

  function isEndlessUnlocked() {
    return getSpecialClearCount() >= 5;
  }

  function isGuardian3UnlockedInStorage() {
    try {
      return localStorage.getItem(G3_UNLOCK_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function hasGuardian3UnlockEventBeenShown() {
    try {
      return localStorage.getItem(G3_EVENT_SHOWN_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function markGuardian3Unlocked() {
    try {
      localStorage.setItem(G3_UNLOCK_KEY, 'true');
    } catch (e) {}
  }

  function markGuardian3EventShown() {
    try {
      localStorage.setItem(G3_EVENT_SHOWN_KEY, 'true');
    } catch (e) {}
  }

  function checkAllFourStagesSRank() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_V11);
      if (!raw) return false;
      const all = JSON.parse(raw);
      const required = ['WARMUP', 'NORMAL', 'INTENSE', 'SPECIAL'];
      return required.every(k => all[k] && all[k].bestRank === 'S');
    } catch (e) {
      return false;
    }
  }

  function evaluateGuardian3UnlockAndTrigger() {
    if (!isGuardian3UnlockedInStorage() && checkAllFourStagesSRank()) {
      markGuardian3Unlocked();
    }
    updateRouteSwitchButtonsVisibility();
    if (isGuardian3UnlockedInStorage() && !hasGuardian3UnlockEventBeenShown()) {
      markGuardian3EventShown();
      modalUnlockEvent.classList.add('open');
      return true;
    }
    return false;
  }

  function updateRouteSwitchButtonsVisibility() {
    if (currentRoute === 'GUARDIAN_1') {
      btnReturnGuardian1.classList.add('hidden');
      btnReturnGuardian1.classList.remove('flex');
      if (isGuardian3UnlockedInStorage()) {
        btnAnomalyPortal.classList.remove('hidden');
        btnAnomalyPortal.classList.add('flex');
      } else {
        btnAnomalyPortal.classList.add('hidden');
        btnAnomalyPortal.classList.remove('flex');
      }
    } else {
      btnAnomalyPortal.classList.add('hidden');
      btnAnomalyPortal.classList.remove('flex');
      btnReturnGuardian1.classList.remove('hidden');
      btnReturnGuardian1.classList.add('flex');
    }
  }

  btnConfirmUnlockEvent.addEventListener('click', () => {
    modalUnlockEvent.classList.remove('open');
    if (gameState === 'RESULT') {
      backToTitleScreen();
    } else {
      updateRouteSwitchButtonsVisibility();
    }
  });

  function applyRouteThemeUI() {
    const modeButtons = document.querySelectorAll('.mode-btn');
    if (currentRoute === 'GUARDIAN_3') {
      document.body.classList.add('route-guardian3');
      hudBossName.textContent = '參ノ護王';
      resultSpeakerName.textContent = '參ノ護王';
      storyIntroParagraph.innerHTML =
        'あなたの前に立ちはだかるのは、魔族の始祖・<span class="accent-highlight text-[#e87a82] font-bold">參ノ護王</span>。<br />' +
        '闇と炎を自在に操り、永い時を生きるその力はまさに規格外。<br />' +
        'その<span class="accent-highlight text-[#e87a82] font-bold">圧倒的な力</span>を前に、あなたはどこまで立ち向かえるだろうか。';

      btnEndlessMode.classList.remove('show');
      if (currentModeKey === 'ENDLESS') {
        currentModeKey = 'SPECIAL';
        modeButtons.forEach(b => {
          if (b.getAttribute('data-mode') === 'SPECIAL') b.classList.add('mode-active');
          else b.classList.remove('mode-active');
        });
      }
    } else {
      document.body.classList.remove('route-guardian3');
      hudBossName.textContent = '壱ノ護王';
      resultSpeakerName.textContent = '壱ノ護王';
      storyIntroParagraph.innerHTML =
        '舞台は王都バネッサ。<br />' +
        'もふもふペンギンの王様・<span class="accent-highlight text-[#e4c580] font-bold">壱ノ護王</span>が、あなたの訓練に付き合ってくれることになりました。<br />' +
        '雷と光の攻撃を回避し、魔法弾を撃ち込んで<span class="accent-highlight text-[#e4c580] font-bold">護王を守る結界</span>を破りましょう！';
    }

    modeDescText.textContent = MODES[currentModeKey].desc;
    updateRouteSwitchButtonsVisibility();
    renderBestRecordUI();
  }

  function triggerRouteTransition(targetRoute) {
    if (anomalyHoldState.transitioning) return;
    anomalyHoldState.transitioning = true;
    anomalyHoldState.active = false;
    anomalyHoldState.progress = 0;
    anomalyHoldFill.style.width = '0%';

    if (targetRoute === 'GUARDIAN_3') {
      appRoot.classList.add('screen-glitch-active');
      setTimeout(() => {
        routeTransitionOverlay.style.transition = 'opacity 0.55s ease-in';
        routeTransitionOverlay.style.backgroundColor = '#ffffff';
        routeTransitionOverlay.style.opacity = '1';
      }, 420);

      setTimeout(() => {
        appRoot.classList.remove('screen-glitch-active');
        currentRoute = 'GUARDIAN_3';
        applyRouteThemeUI();
        routeTransitionOverlay.style.transition = 'opacity 0.85s ease-out';
        routeTransitionOverlay.style.opacity = '0';
      }, 1050);

      setTimeout(() => {
        anomalyHoldState.transitioning = false;
      }, 1950);
    } else {
      routeTransitionOverlay.style.transition = 'opacity 0.35s ease-in';
      routeTransitionOverlay.style.backgroundColor = '#ffffff';
      routeTransitionOverlay.style.opacity = '1';

      setTimeout(() => {
        currentRoute = 'GUARDIAN_1';
        applyRouteThemeUI();
        if ((currentModeKey === 'SPECIAL' || currentModeKey === 'ENDLESS') && isEndlessUnlocked()) {
          btnEndlessMode.classList.add('show');
        }
        routeTransitionOverlay.style.transition = 'opacity 0.55s ease-out';
        routeTransitionOverlay.style.opacity = '0';
      }, 380);

      setTimeout(() => {
        anomalyHoldState.transitioning = false;
      }, 950);
    }
  }

  function startAnomalyHold(e) {
    if (e.cancelable) e.preventDefault();
    if (anomalyHoldState.transitioning || currentRoute !== 'GUARDIAN_1') return;
    anomalyHoldState.active = true;
  }

  function stopAnomalyHold() {
    if (!anomalyHoldState.active) return;
    anomalyHoldState.active = false;
    anomalyHoldState.progress = 0;
    anomalyHoldFill.style.width = '0%';
  }

  btnAnomalyPortal.addEventListener('mousedown', startAnomalyHold);
  btnAnomalyPortal.addEventListener('touchstart', startAnomalyHold, { passive: false });
  window.addEventListener('mouseup', stopAnomalyHold);
  window.addEventListener('touchend', stopAnomalyHold);
  window.addEventListener('touchcancel', stopAnomalyHold);
  btnAnomalyPortal.addEventListener('mouseleave', stopAnomalyHold);

  btnReturnGuardian1.addEventListener('click', () => {
    triggerRouteTransition('GUARDIAN_1');
  });

  function sanitizeStageRecords(obj) {
    if (!obj || typeof obj !== 'object') return {};
    const validKeys = ['WARMUP', 'NORMAL', 'INTENSE', 'SPECIAL', 'ENDLESS'];
    const validRanks = ['S', 'A', 'B', 'C', 'D'];
    const result = {};
    for (const k of validKeys) {
      if (obj[k] && typeof obj[k] === 'object') {
        const item = obj[k];
        result[k] = {
          bestScore: typeof item.bestScore === 'number' && Number.isFinite(item.bestScore) ? Math.max(0, Math.floor(item.bestScore)) : 0,
          bestTime: typeof item.bestTime === 'number' && Number.isFinite(item.bestTime) ? Math.max(0, item.bestTime) : null,
          bestHits: typeof item.bestHits === 'number' && Number.isFinite(item.bestHits) ? Math.max(0, Math.floor(item.bestHits)) : null,
          bestRank: validRanks.includes(item.bestRank) ? item.bestRank : null
        };
      }
    }
    return result;
  }

  btnExportData.addEventListener('click', () => {
    try {
      const g1Raw = localStorage.getItem(STORAGE_KEY_V11);
      const g3Raw = localStorage.getItem(STORAGE_KEY_G3_BEST);
      const exportPayload = {
        app: 'TRIAL_OF_THE_GUARDIAN',
        version: '1.3.0',
        guardian1Best: g1Raw ? sanitizeStageRecords(JSON.parse(g1Raw)) : {},
        guardian3Best: g3Raw ? sanitizeStageRecords(JSON.parse(g3Raw)) : {},
        specialClearCount: getSpecialClearCount(),
        guardian3Unlocked: isGuardian3UnlockedInStorage(),
        guardian3EventShown: hasGuardian3UnlockEventBeenShown()
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'trial_of_the_guardian_save.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      transferStatusMsg.textContent = 'JSONファイルをエクスポートしました。';
    } catch (e) {
      transferStatusMsg.textContent = 'エクスポートに失敗しました。';
    }
  });

  btnTriggerImport.addEventListener('click', () => {
    inputImportFile.value = '';
    inputImportFile.click();
  });

  inputImportFile.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || typeof parsed !== 'object' || parsed.app !== 'TRIAL_OF_THE_GUARDIAN') {
          transferStatusMsg.textContent = '有効なセーブデータファイルではありません。';
          return;
        }

        if (parsed.guardian1Best) {
          const cleanG1 = sanitizeStageRecords(parsed.guardian1Best);
          localStorage.setItem(STORAGE_KEY_V11, JSON.stringify(cleanG1));
        }
        if (parsed.guardian3Best) {
          const cleanG3 = sanitizeStageRecords(parsed.guardian3Best);
          localStorage.setItem(STORAGE_KEY_G3_BEST, JSON.stringify(cleanG3));
        }
        if (typeof parsed.specialClearCount === 'number' && Number.isFinite(parsed.specialClearCount)) {
          localStorage.setItem(SPECIAL_CLEAR_KEY, String(Math.max(0, Math.floor(parsed.specialClearCount))));
        }
        if (parsed.guardian3Unlocked === true || checkAllFourStagesSRank()) {
          markGuardian3Unlocked();
        }
        if (parsed.guardian3EventShown === true) {
          markGuardian3EventShown();
        }

        applyRouteThemeUI();
        if (currentRoute === 'GUARDIAN_1' && (currentModeKey === 'SPECIAL' || currentModeKey === 'ENDLESS') && isEndlessUnlocked()) {
          btnEndlessMode.classList.add('show');
        }
        evaluateGuardian3UnlockAndTrigger();
        transferStatusMsg.textContent = 'データを正常にインポートしました。';
      } catch (err) {
        transferStatusMsg.textContent = 'ファイルの読み込みに失敗しました。';
      }
    };
    reader.readAsText(file);
  });

  function resizeCanvas() {
    const prevW = WORLD_W;
    const prevH = WORLD_H;
    updateWorldDimensions();

    canvas.width = WORLD_W;
    canvas.height = WORLD_H;

    if (prevW !== WORLD_W || prevH !== WORLD_H) {
      player.x = Math.max(STAGE_BOUNDS.left + 20, Math.min(STAGE_BOUNDS.right - 20, (player.x / prevW) * WORLD_W));
      player.y = Math.max(STAGE_BOUNDS.top + 20, Math.min(STAGE_BOUNDS.bottom - 20, (player.y / prevH) * WORLD_H));
    }

    const rect = canvasFrame.getBoundingClientRect();
    const availW = Math.max(260, rect.width - 4);
    const availH = Math.max(240, rect.height - 4);
    const aspect = WORLD_W / WORLD_H;

    let displayW = availW;
    let displayH = displayW / aspect;
    if (displayH > availH) {
      displayH = availH;
      displayW = displayH * aspect;
    }

    canvas.style.width = `${Math.floor(displayW)}px`;
    canvas.style.height = `${Math.floor(displayH)}px`;
  }

  window.addEventListener('resize', resizeCanvas);

  function updateFooterControlsVisibility() {
    const showPad = (gameState === 'PLAYING' || gameState === 'COUNTDOWN') && (isTouchDevice || window.innerWidth < 768);
    if (showPad) {
      touchControlsBar.classList.remove('hidden');
      touchControlsBar.classList.add('flex');
      footerLinkBar.classList.add('hidden');
      if (currentModeKey === 'ENDLESS') {
        attackTouchWrap.classList.add('hidden');
      } else {
        attackTouchWrap.classList.remove('hidden');
      }
    } else {
      touchControlsBar.classList.add('hidden');
      touchControlsBar.classList.remove('flex');
      footerLinkBar.classList.remove('hidden');
    }
    requestAnimationFrame(resizeCanvas);
  }

  function getActiveBestStorageKey() {
    return currentRoute === 'GUARDIAN_3' ? STORAGE_KEY_G3_BEST : STORAGE_KEY_V11;
  }

  function loadAllBestRecords() {
    try {
      const raw = localStorage.getItem(getActiveBestStorageKey());
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  }

  function saveBestRecordForMode(modeKey, newRec) {
    try {
      const storageKey = getActiveBestStorageKey();
      const all = loadAllBestRecords();
      const current = all[modeKey] || {
        bestScore: 0,
        bestTime: null,
        bestHits: null,
        bestRank: null
      };
      const rankOrder = { 'S': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
      let updated = false;

      if (newRec.score > current.bestScore) {
        current.bestScore = newRec.score;
        updated = true;
      }
      if (modeKey === 'ENDLESS') {
        if (current.bestTime === null || newRec.time > current.bestTime) {
          current.bestTime = newRec.time;
          updated = true;
        }
      } else {
        if (current.bestTime === null || newRec.time < current.bestTime) {
          current.bestTime = newRec.time;
          updated = true;
        }
      }
      if (current.bestHits === null || newRec.hits < current.bestHits) {
        current.bestHits = newRec.hits;
        updated = true;
      }
      if (!current.bestRank || (rankOrder[newRec.rank] || 0) > (rankOrder[current.bestRank] || 0)) {
        current.bestRank = newRec.rank;
        updated = true;
      }

      all[modeKey] = current;
      localStorage.setItem(storageKey, JSON.stringify(all));
      renderBestRecordUI();
      return updated;
    } catch (e) {
      return false;
    }
  }

  function formatTime(sec) {
    const totalMs = Math.max(0, Math.floor(sec * 100));
    const minutes = Math.floor(totalMs / 6000);
    const seconds = Math.floor((totalMs % 6000) / 100);
    const centis = totalMs % 100;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
  }

  function renderBestRecordUI() {
    const modeObj = MODES[currentModeKey];
    bestModeLabel.textContent = modeObj.name;
    bestTimeHeaderLabel.textContent = currentModeKey === 'ENDLESS' ? '最長タイム' : '最速タイム';

    const all = loadAllBestRecords();
    const rec = all[currentModeKey];

    if (!rec || rec.bestScore === 0) {
      bestRankText.textContent = '—';
      bestTimeText.textContent = '--:--.--';
      bestHitsText.textContent = '—';
      bestScoreText.textContent = '0';
      return;
    }
    bestRankText.textContent = rec.bestRank;
    bestTimeText.textContent = rec.bestTime !== null ? formatTime(rec.bestTime) : '--:--.--';
    bestHitsText.textContent = rec.bestHits !== null ? `${rec.bestHits} 回` : '—';
    bestScoreText.textContent = rec.bestScore.toLocaleString();
  }

  function renderHpPips() {
    if (!Number.isFinite(player.maxHp)) {
      hpBox.classList.add('hidden');
      return;
    }
    hpBox.classList.remove('hidden');
    hpPips.innerHTML = '';
    for (let i = 0; i < player.maxHp; i++) {
      const pip = document.createElement('span');
      const active = i < player.hp;
      if (currentRoute === 'GUARDIAN_3') {
        pip.className = `inline-block w-2.5 h-2.5 rotate-45 border transition-all duration-200 ${
          active
            ? 'bg-[#dfe6f0] border-[#f4efe6] shadow-[0_0_6px_rgba(223,230,240,0.8)]'
            : 'bg-[#19070c] border-[#7d6d75]/40'
        }`;
      } else {
        pip.className = `inline-block w-2.5 h-2.5 rotate-45 border transition-all duration-200 ${
          active
            ? 'bg-[#e4c580] border-[#f4efe6] shadow-[0_0_6px_rgba(228,197,128,0.8)]'
            : 'bg-[#091024] border-[#7e796a]/40'
        }`;
      }
      hpPips.appendChild(pip);
    }
  }

  function updateBarrierHud() {
    if (currentModeKey === 'ENDLESS') {
      barrierHudContainer.classList.add('hidden');
      if (currentPhase === 1) {
        phaseBadge.textContent = '第1段階';
      } else if (currentPhase === 2) {
        phaseBadge.textContent = '第2段階';
      } else {
        phaseBadge.textContent = '最終段階';
      }
      return;
    }

    barrierHudContainer.classList.remove('hidden');
    const ratio = Math.max(0, barrierHp / barrierMaxHp);
    const pct = (ratio * 100).toFixed(1);
    barrierBarFill.style.width = `${pct}%`;
    barrierPercentText.textContent = `${pct}%`;

    if (currentRoute === 'GUARDIAN_3') {
      if (currentPhase === 1) {
        barrierBarFill.style.background = 'linear-gradient(90deg, #3b121d 0%, #802032 55%, #c4cdd8 100%)';
        phaseBadge.textContent = '第1段階';
      } else if (currentPhase === 2) {
        barrierBarFill.style.background = 'linear-gradient(90deg, #4f120d 0%, #a83219 55%, #dfe6f0 100%)';
        phaseBadge.textContent = '第2段階';
      } else {
        barrierBarFill.style.background = 'linear-gradient(90deg, #2e0610 0%, #c92424 50%, #f2eef0 100%)';
        phaseBadge.textContent = '最終段階';
      }
    } else {
      if (currentPhase === 1) {
        barrierBarFill.style.background = 'linear-gradient(90deg, #1f4670 0%, #4b82b8 55%, #c5a059 100%)';
        phaseBadge.textContent = '第1段階';
      } else if (currentPhase === 2) {
        barrierBarFill.style.background = 'linear-gradient(90deg, #523478 0%, #8e62c2 55%, #e4c580 100%)';
        phaseBadge.textContent = '第2段階';
      } else {
        barrierBarFill.style.background = 'linear-gradient(90deg, #782222 0%, #b83b3b 55%, #e4c580 100%)';
        phaseBadge.textContent = '最終段階';
      }
    }
  }

  function startCountdownAndTrial() {
    const modeObj = MODES[currentModeKey];
    updateWorldDimensions();
    resizeCanvas();

    gameState = 'COUNTDOWN';
    countdownTimer = 2.6;
    lastCountdownStep = -1;

    elapsedTime = 0;
    hitCount = 0;
    currentPhase = 1;
    barrierMaxHp = modeObj.barrierMaxHp;
    barrierHp = barrierMaxHp;
    barrierFlash = 0;
    screenShake = 0;
    clearAnimTimer = 0;

    memorabiliaState.phase = 'INACTIVE';
    memorabiliaState.timer = 0;
    memorabiliaState.cooldown = 8.5;

    player.x = WORLD_W / 2;
    player.y = STAGE_BOUNDS.bottom - Math.min(95, (STAGE_BOUNDS.bottom - STAGE_BOUNDS.top) * 0.22);
    player.maxHp = modeObj.playerHp;
    player.hp = modeObj.playerHp;
    player.invulnTimer = 0;
    player.shootCooldown = 0;
    player.trail = [];

    playerBullets = [];
    bossAttacks = [];
    particles = [];
    floatingRings = [];

    attackDirector.cooldown = 0.85;
    attackDirector.patternIndex = 0;
    attackDirector.rhythmStep = 0;

    hudModeBadge.textContent = modeObj.name;
    countdownModeLabel.textContent = modeObj.name;

    titleOverlay.classList.add('hidden');
    resultOverlay.classList.add('hidden');
    titleTopBar.classList.add('hidden');
    battleHud.classList.remove('hidden');
    battleHud.classList.add('flex');
    countdownOverlay.classList.remove('hidden');

    hudTime.textContent = '00:00.00';
    hudHits.textContent = '0';
    renderHpPips();
    updateBarrierHud();
    updateFooterControlsVisibility();
  }

  function getSpeedScale() {
    return MODES[currentModeKey].speedScale;
  }

  function spawnPatternA_LightningSpear(aimOffsetAngle = 0, customWarn = null) {
    const scale = getSpeedScale();
    const baseWarn = currentPhase === 1 ? 0.92 : currentPhase === 2 ? 0.78 : 0.68;
    const warnTime = Math.max(0.48, (customWarn || baseWarn) / Math.pow(scale, 0.65));

    const baseAngle = Math.atan2(player.y - BOSS_POS.y, player.x - BOSS_POS.x) + aimOffsetAngle;
    const len = Math.hypot(WORLD_W, WORLD_H);
    const endX = BOSS_POS.x + Math.cos(baseAngle) * len;
    const endY = BOSS_POS.y + Math.sin(baseAngle) * len;

    bossAttacks.push({
      type: 'SPEAR',
      state: 'WARN',
      timer: 0,
      warnDuration: warnTime,
      activeDuration: 0.34,
      x1: BOSS_POS.x,
      y1: BOSS_POS.y,
      x2: endX,
      y2: endY,
      width: currentPhase === 3 ? 34 : 28,
      hasHitPlayer: false,
      boltNodes: []
    });
  }

  function spawnPatternB_LightCircle(targetX, targetY, radius = 78, customWarn = null) {
    const scale = getSpeedScale();
    const baseWarn = currentPhase === 1 ? 1.15 : currentPhase === 2 ? 0.98 : 0.85;
    const warnTime = Math.max(0.55, (customWarn || baseWarn) / Math.pow(scale, 0.65));

    const clampedX = Math.max(STAGE_BOUNDS.left + 45, Math.min(STAGE_BOUNDS.right - 45, targetX));
    const clampedY = Math.max(STAGE_BOUNDS.top + 45, Math.min(STAGE_BOUNDS.bottom - 45, targetY));

    bossAttacks.push({
      type: 'LIGHT_CIRCLE',
      state: 'WARN',
      timer: 0,
      warnDuration: warnTime,
      activeDuration: 0.42,
      x: clampedX,
      y: clampedY,
      radius: radius,
      hasHitPlayer: false
    });
  }

  function spawnPatternC_ComboBarrage() {
    const scale = getSpeedScale();
    const isHard = (currentModeKey === 'INTENSE' || currentModeKey === 'SPECIAL' || currentModeKey === 'ENDLESS');
    const count = (currentPhase === 3 || isHard) ? 4 : 3;
    const stepDelay = Math.max(0.22, 0.32 / scale);

    for (let i = 0; i < count; i++) {
      bossAttacks.push({
        type: 'DELAYED_SPAWNER',
        state: 'WAIT',
        timer: 0,
        delay: i * stepDelay,
        callback: () => {
          const spread = (i - (count - 1) / 2) * 0.14;
          spawnPatternA_LightningSpear(spread, 0.72);
          if (i % 2 === 1 || isHard) {
            const ox = (Math.random() - 0.5) * 210;
            const oy = (Math.random() - 0.5) * 140;
            spawnPatternB_LightCircle(player.x + ox, player.y + oy, isHard ? 76 : 68);
          }
        }
      });
    }
  }

  function spawnPatternD_HorizontalWave(customY = null) {
    const scale = getSpeedScale();
    const isHard = (currentModeKey === 'INTENSE' || currentModeKey === 'SPECIAL' || currentModeKey === 'ENDLESS');
    const baseWarn = currentPhase === 1 ? 1.28 : currentPhase === 2 ? 1.12 : 0.98;
    const warnTime = Math.max(0.62, baseWarn / Math.pow(scale, 0.6));

    const stageSpanW = STAGE_BOUNDS.right - STAGE_BOUNDS.left;
    const widthFactor = isHard ? 0.16 : (currentPhase === 3 ? 0.18 : 0.22);
    const safeWidth = Math.max(125, stageSpanW * widthFactor);

    const minSafeX = STAGE_BOUNDS.left + safeWidth / 2 + 25;
    const maxSafeX = STAGE_BOUNDS.right - safeWidth / 2 - 25;
    const safeCenterX = minSafeX + Math.random() * (maxSafeX - minSafeX);

    const minY = STAGE_BOUNDS.top + 55;
    const maxY = STAGE_BOUNDS.bottom - 55;
    const bandY = customY !== null
      ? Math.max(minY, Math.min(maxY, customY))
      : Math.max(minY, Math.min(maxY, player.y + (Math.random() - 0.5) * 90));
    const bandHeight = currentPhase === 3 ? 112 : 96;

    bossAttacks.push({
      type: 'HORIZ_WAVE',
      state: 'WARN',
      timer: 0,
      warnDuration: warnTime,
      activeDuration: 0.48,
      y: bandY,
      height: bandHeight,
      safeX: safeCenterX,
      safeW: safeWidth,
      hasHitPlayer: false
    });
  }

  function spawnPatternE_CrossThunderGrid(offsetShift = 0) {
    const angles = [-0.36 + offsetShift, -0.18 + offsetShift, offsetShift, 0.18 + offsetShift, 0.36 + offsetShift];
    for (const ang of angles) {
      spawnPatternA_LightningSpear(ang, 0.78);
    }
    spawnPatternB_LightCircle(player.x, player.y, 82, 0.9);
  }

  function spawnG3_DarkClaws(targetX, targetY, baseAngle = null) {
    const scale = getSpeedScale();
    const warnTime = Math.max(0.46, (currentPhase === 1 ? 0.82 : currentPhase === 2 ? 0.72 : 0.62) / Math.pow(scale, 0.6));
    const cx = Math.max(STAGE_BOUNDS.left + 80, Math.min(STAGE_BOUNDS.right - 80, targetX));
    const cy = Math.max(STAGE_BOUNDS.top + 65, Math.min(STAGE_BOUNDS.bottom - 65, targetY));
    const angle = baseAngle !== null ? baseAngle : Math.atan2(cy - BOSS_POS.y, cx - BOSS_POS.x);
    const perpX = -Math.sin(angle);
    const perpY = Math.cos(angle);
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    const clawLength = currentPhase === 3 ? 310 : 275;
    const spacing = 44;

    const lines = [-1, 0, 1].map(offsetIdx => {
      const midX = cx + perpX * (offsetIdx * spacing);
      const midY = cy + perpY * (offsetIdx * spacing);
      const halfLen = clawLength * (offsetIdx === 0 ? 0.58 : 0.5);
      return {
        x1: midX - dirX * halfLen,
        y1: midY - dirY * halfLen,
        x2: midX + dirX * halfLen,
        y2: midY + dirY * halfLen,
        width: 26
      };
    });

    bossAttacks.push({
      type: 'G3_DARK_CLAWS',
      state: 'WARN',
      timer: 0,
      warnDuration: warnTime,
      activeDuration: 0.48,
      lines,
      hasHitPlayer: false
    });
  }

  function spawnG3_ShadowCage(sideMode = null) {
    const scale = getSpeedScale();
    const warnTime = Math.max(0.56, (currentPhase === 1 ? 0.96 : 0.84) / Math.pow(scale, 0.55));
    const activeDuration = currentPhase === 3 ? 2.8 : 2.35;
    const stageW = STAGE_BOUNDS.right - STAGE_BOUNDS.left;
    const stageH = STAGE_BOUNDS.bottom - STAGE_BOUNDS.top;
    const mode = sideMode || (Math.random() < 0.5 ? 'LEFT_RIGHT' : 'TOP_BOTTOM');
    const rects = [];

    if (mode === 'LEFT_RIGHT') {
      const wallW = stageW * (currentPhase === 3 ? 0.29 : 0.25);
      rects.push({ x: STAGE_BOUNDS.left, y: STAGE_BOUNDS.top, w: wallW, h: stageH });
      rects.push({ x: STAGE_BOUNDS.right - wallW, y: STAGE_BOUNDS.top, w: wallW, h: stageH });
    } else {
      const wallH = stageH * (currentPhase === 3 ? 0.30 : 0.26);
      rects.push({ x: STAGE_BOUNDS.left, y: STAGE_BOUNDS.top, w: stageW, h: wallH });
      rects.push({ x: STAGE_BOUNDS.left, y: STAGE_BOUNDS.bottom - wallH, w: stageW, h: wallH });
    }

    bossAttacks.push({
      type: 'G3_SHADOW_CAGE',
      state: 'WARN',
      timer: 0,
      warnDuration: warnTime,
      activeDuration,
      rects,
      hasHitPlayer: false
    });
  }

  function spawnG3_FlameWave(direction = 'DOWN', customY = null) {
    const scale = getSpeedScale();
    const isHard = (currentModeKey === 'INTENSE' || currentModeKey === 'SPECIAL');
    const warnTime = Math.max(0.54, (currentPhase === 1 ? 1.02 : currentPhase === 2 ? 0.90 : 0.80) / Math.pow(scale, 0.6));
    const stageW = STAGE_BOUNDS.right - STAGE_BOUNDS.left;
    const safeW = Math.max(115, stageW * (isHard ? 0.15 : 0.18));
    const safeX = STAGE_BOUNDS.left + safeW / 2 + 25 + Math.random() * (stageW - safeW - 50);
    const defaultY = direction === 'DOWN'
      ? Math.max(STAGE_BOUNDS.top + 60, Math.min(STAGE_BOUNDS.bottom - 60, player.y - 25))
      : Math.max(STAGE_BOUNDS.top + 60, Math.min(STAGE_BOUNDS.bottom - 60, player.y + 25));
    const bandY = customY !== null
      ? Math.max(STAGE_BOUNDS.top + 60, Math.min(STAGE_BOUNDS.bottom - 60, customY))
      : defaultY;

    bossAttacks.push({
      type: 'G3_FLAME_WAVE',
      state: 'WARN',
      timer: 0,
      warnDuration: warnTime,
      activeDuration: 0.68,
      y: bandY,
      height: currentPhase === 3 ? 118 : 104,
      safeX,
      safeW,
      hasHitPlayer: false
    });
  }

  function spawnG3_LingeringFire(targetX, targetY, radius = 82) {
    const scale = getSpeedScale();
    const warnTime = Math.max(0.50, (currentPhase === 1 ? 0.92 : 0.78) / Math.pow(scale, 0.6));
    const cx = Math.max(STAGE_BOUNDS.left + 55, Math.min(STAGE_BOUNDS.right - 55, targetX));
    const cy = Math.max(STAGE_BOUNDS.top + 55, Math.min(STAGE_BOUNDS.bottom - 55, targetY));

    bossAttacks.push({
      type: 'G3_LINGERING_FIRE',
      state: 'WARN',
      timer: 0,
      warnDuration: warnTime,
      activeDuration: currentPhase === 3 ? 3.2 : 2.6,
      x: cx,
      y: cy,
      radius,
      hasHitPlayer: false
    });
  }

  function triggerMemorabiliaIfEligible() {
    if (currentRoute !== 'GUARDIAN_3') return;
    if (currentModeKey !== 'INTENSE' && currentModeKey !== 'SPECIAL') return;
    if (memorabiliaState.phase !== 'INACTIVE') return;

    memorabiliaState.phase = 'CUE';
    memorabiliaState.timer = 0;
    spawnShockwaveRing(BOSS_POS.x, BOSS_POS.y, 340, '#dfe6f0', 0.55);
    spawnShockwaveRing(BOSS_POS.x, BOSS_POS.y, 200, '#c93434', 0.45);
  }

  function updateMemorabilia(dt) {
    if (currentRoute !== 'GUARDIAN_3') return;
    if (currentModeKey !== 'INTENSE' && currentModeKey !== 'SPECIAL') return;

    if (memorabiliaState.phase === 'INACTIVE') {
      memorabiliaState.cooldown -= dt;
      if (memorabiliaState.cooldown <= 0) {
        triggerMemorabiliaIfEligible();
      }
      return;
    }

    memorabiliaState.timer += dt;
    if (memorabiliaState.phase === 'CUE') {
      if (memorabiliaState.timer >= 0.55) {
        memorabiliaState.phase = 'GRAY';
        memorabiliaState.timer = 0;
      }
    } else if (memorabiliaState.phase === 'GRAY') {
      if (memorabiliaState.timer >= 3.0) {
        memorabiliaState.phase = 'INACTIVE';
        memorabiliaState.timer = 0;
        memorabiliaState.cooldown = currentModeKey === 'SPECIAL' ? 9.5 : 12.0;
        spawnShockwaveRing(player.x, player.y, 120, '#f4efe6', 0.45);
        spawnParticles(player.x, player.y, 24, '#dfe6f0', 50, 220, 4, 0.45);
      }
    }
  }

  function updateGuardian3Director(dt) {
    updateMemorabilia(dt);

    attackDirector.cooldown -= dt;
    if (attackDirector.cooldown > 0) return;

    const scale = getSpeedScale();
    const isHard = (currentModeKey === 'INTENSE' || currentModeKey === 'SPECIAL');
    const pat = attackDirector.patternIndex;
    attackDirector.patternIndex = (attackDirector.patternIndex + 1) % 6;

    if (currentPhase === 1 && !isHard) {
      if (pat === 0) {
        spawnG3_DarkClaws(player.x, player.y);
        spawnG3_LingeringFire(player.x + (Math.random() - 0.5) * 140, player.y, 76);
        attackDirector.cooldown = 1.15 / scale;
      } else if (pat === 1) {
        spawnG3_FlameWave('DOWN');
        spawnG3_LingeringFire(player.x, player.y, 76);
        attackDirector.cooldown = 1.25 / scale;
      } else if (pat === 2) {
        spawnG3_ShadowCage('LEFT_RIGHT');
        spawnG3_DarkClaws(player.x, player.y);
        attackDirector.cooldown = 1.35 / scale;
      } else if (pat === 3) {
        spawnG3_DarkClaws(player.x, player.y, 0.32);
        spawnG3_DarkClaws(player.x, player.y, -0.32);
        attackDirector.cooldown = 1.18 / scale;
      } else if (pat === 4) {
        spawnG3_LingeringFire(player.x - 95, player.y, 76);
        spawnG3_LingeringFire(player.x + 95, player.y, 76);
        spawnG3_FlameWave('UP');
        attackDirector.cooldown = 1.3 / scale;
      } else {
        spawnG3_ShadowCage('TOP_BOTTOM');
        spawnG3_DarkClaws(player.x, player.y);
        attackDirector.cooldown = 1.3 / scale;
      }
    } else if (currentPhase <= 2) {
      if (pat === 0) {
        spawnG3_ShadowCage('LEFT_RIGHT');
        spawnG3_DarkClaws(player.x, player.y, 0.25);
        spawnG3_DarkClaws(player.x, player.y, -0.25);
        attackDirector.cooldown = 1.32 / scale;
      } else if (pat === 1) {
        spawnG3_LingeringFire(player.x - 105, player.y, 80);
        spawnG3_LingeringFire(player.x + 105, player.y, 80);
        spawnG3_FlameWave('DOWN');
        attackDirector.cooldown = 1.25 / scale;
      } else if (pat === 2) {
        spawnG3_FlameWave('DOWN', player.y - 50);
        spawnG3_DarkClaws(player.x, player.y);
        spawnG3_LingeringFire(player.x, player.y, 78);
        attackDirector.cooldown = 1.22 / scale;
      } else if (pat === 3) {
        spawnG3_DarkClaws(player.x, player.y, 0.4);
        spawnG3_DarkClaws(player.x, player.y, -0.4);
        spawnG3_LingeringFire(player.x, player.y, 82);
        attackDirector.cooldown = 1.15 / scale;
      } else if (pat === 4) {
        spawnG3_ShadowCage('TOP_BOTTOM');
        spawnG3_FlameWave('UP');
        spawnG3_DarkClaws(player.x, player.y);
        attackDirector.cooldown = 1.35 / scale;
      } else {
        if (isHard && memorabiliaState.phase === 'INACTIVE' && memorabiliaState.cooldown <= 2.5) {
          triggerMemorabiliaIfEligible();
        }
        for (let k = 0; k < 2; k++) {
          const rx = STAGE_BOUNDS.left + 90 + Math.random() * (STAGE_BOUNDS.right - STAGE_BOUNDS.left - 180);
          const ry = STAGE_BOUNDS.top + 70 + Math.random() * (STAGE_BOUNDS.bottom - STAGE_BOUNDS.top - 140);
          spawnG3_LingeringFire(rx, ry, 78);
        }
        spawnG3_DarkClaws(player.x, player.y);
        attackDirector.cooldown = 1.2 / scale;
      }
    } else {
      if (pat === 0) {
        if (isHard && memorabiliaState.phase === 'INACTIVE') {
          triggerMemorabiliaIfEligible();
        }
        spawnG3_ShadowCage('LEFT_RIGHT');
        spawnG3_DarkClaws(player.x, player.y, 0.3);
        spawnG3_DarkClaws(player.x, player.y, -0.3);
        attackDirector.cooldown = 1.2 / scale;
      } else if (pat === 1) {
        spawnG3_FlameWave('DOWN', player.y - 55);
        spawnG3_FlameWave('UP', player.y + 60);
        spawnG3_LingeringFire(player.x, player.y, 82);
        attackDirector.cooldown = 1.28 / scale;
      } else if (pat === 2) {
        spawnG3_DarkClaws(player.x, player.y, 0.45);
        spawnG3_DarkClaws(player.x, player.y, 0);
        spawnG3_DarkClaws(player.x, player.y, -0.45);
        attackDirector.cooldown = 1.12 / scale;
      } else if (pat === 3) {
        spawnG3_ShadowCage('TOP_BOTTOM');
        spawnG3_DarkClaws(player.x, player.y);
        spawnG3_LingeringFire(player.x - 100, player.y, 80);
        spawnG3_LingeringFire(player.x + 100, player.y, 80);
        attackDirector.cooldown = 1.25 / scale;
      } else if (pat === 4) {
        for (let k = 0; k < 3; k++) {
          const rx = STAGE_BOUNDS.left + 85 + Math.random() * (STAGE_BOUNDS.right - STAGE_BOUNDS.left - 170);
          const ry = STAGE_BOUNDS.top + 65 + Math.random() * (STAGE_BOUNDS.bottom - STAGE_BOUNDS.top - 130);
          spawnG3_LingeringFire(rx, ry, 82);
        }
        spawnG3_FlameWave('UP');
        spawnG3_DarkClaws(player.x, player.y);
        attackDirector.cooldown = 1.22 / scale;
      } else {
        spawnG3_DarkClaws(player.x, player.y, 0.22);
        spawnG3_DarkClaws(player.x, player.y, -0.22);
        spawnG3_FlameWave('DOWN');
        attackDirector.cooldown = 1.15 / scale;
      }
    }
  }

  function updateBossDirector(dt) {
    if (currentRoute === 'GUARDIAN_3') {
      updateGuardian3Director(dt);
      return;
    }

    attackDirector.cooldown -= dt;
    if (attackDirector.cooldown > 0) return;

    const scale = getSpeedScale();
    const isHard = (currentModeKey === 'INTENSE' || currentModeKey === 'SPECIAL' || currentModeKey === 'ENDLESS');
    const isEndless = (currentModeKey === 'ENDLESS');

    let pat = attackDirector.patternIndex;
    if (isEndless && currentPhase === 3) {
      const jump = (attackDirector.rhythmStep % 3 === 1) ? 2 : 1;
      attackDirector.patternIndex = (attackDirector.patternIndex + jump) % 6;
    } else {
      attackDirector.patternIndex = (attackDirector.patternIndex + 1) % 6;
    }
    attackDirector.rhythmStep++;

    const rhythmFactors = [0.92, 1.06, 0.88, 1.12, 0.95, 1.04];
    const rhythmMod = isEndless ? rhythmFactors[attackDirector.rhythmStep % rhythmFactors.length] : 1.0;

    if (currentPhase === 1 && !isHard) {
      if (pat % 3 === 0) {
        spawnPatternA_LightningSpear(0);
        attackDirector.cooldown = (1.25 / scale) * rhythmMod;
      } else if (pat % 3 === 1) {
        spawnPatternB_LightCircle(player.x, player.y, 78);
        attackDirector.cooldown = (1.35 / scale) * rhythmMod;
      } else {
        spawnPatternA_LightningSpear(-0.17);
        spawnPatternA_LightningSpear(0.17);
        attackDirector.cooldown = (1.48 / scale) * rhythmMod;
      }
    } else if (currentPhase <= 2) {
      if (pat === 0) {
        spawnPatternC_ComboBarrage();
        attackDirector.cooldown = (1.85 / scale) * rhythmMod;
      } else if (pat === 1) {
        spawnPatternD_HorizontalWave();
        spawnPatternB_LightCircle(player.x, player.y, 76);
        attackDirector.cooldown = (1.6 / scale) * rhythmMod;
      } else if (pat === 2) {
        const shift = isEndless ? ((attackDirector.rhythmStep % 2 === 0) ? 0.05 : -0.05) : 0;
        spawnPatternA_LightningSpear(-0.2 + shift);
        spawnPatternA_LightningSpear(shift);
        spawnPatternA_LightningSpear(0.2 + shift);
        attackDirector.cooldown = (1.38 / scale) * rhythmMod;
      } else if (pat === 3) {
        spawnPatternB_LightCircle(player.x - 105, player.y, 74);
        spawnPatternB_LightCircle(player.x + 105, player.y, 74);
        spawnPatternA_LightningSpear(0);
        attackDirector.cooldown = (1.5 / scale) * rhythmMod;
      } else if (pat === 4) {
        if (isHard) {
          spawnPatternE_CrossThunderGrid();
        } else {
          spawnPatternD_HorizontalWave();
        }
        attackDirector.cooldown = (1.45 / scale) * rhythmMod;
      } else {
        spawnPatternC_ComboBarrage();
        attackDirector.cooldown = (1.8 / scale) * rhythmMod;
      }
    } else {
      if (pat === 0) {
        spawnPatternC_ComboBarrage();
        spawnPatternD_HorizontalWave();
        attackDirector.cooldown = (1.7 / scale) * rhythmMod;
      } else if (pat === 1) {
        const shift = isEndless ? ((attackDirector.rhythmStep % 2 === 0) ? 0.06 : -0.06) : 0;
        spawnPatternE_CrossThunderGrid(shift);
        attackDirector.cooldown = (1.3 / scale) * rhythmMod;
      } else if (pat === 2) {
        spawnPatternD_HorizontalWave(player.y - 55);
        if (isHard) {
          spawnPatternD_HorizontalWave(player.y + 65);
        }
        spawnPatternA_LightningSpear(0);
        attackDirector.cooldown = (1.5 / scale) * rhythmMod;
      } else if (pat === 3) {
        const circleCount = isHard ? 4 : 3;
        for (let k = 0; k < circleCount; k++) {
          const rx = STAGE_BOUNDS.left + 75 + Math.random() * (STAGE_BOUNDS.right - STAGE_BOUNDS.left - 150);
          const ry = STAGE_BOUNDS.top + 55 + Math.random() * (STAGE_BOUNDS.bottom - STAGE_BOUNDS.top - 110);
          spawnPatternB_LightCircle(rx, ry, 78);
        }
        spawnPatternB_LightCircle(player.x, player.y, 78);
        attackDirector.cooldown = (1.35 / scale) * rhythmMod;
      } else if (pat === 4) {
        spawnPatternC_ComboBarrage();
        attackDirector.cooldown = (1.6 / scale) * rhythmMod;
      } else {
        spawnPatternD_HorizontalWave();
        const spread = isEndless && (attackDirector.rhythmStep % 2 === 0) ? 0.18 : 0.14;
        spawnPatternA_LightningSpear(-spread);
        spawnPatternA_LightningSpear(spread);
        attackDirector.cooldown = (1.4 / scale) * rhythmMod;
      }
    }
  }

  function spawnParticles(x, y, count, color, speedMin = 40, speedMax = 210, size = 3.5, life = 0.5) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = speedMin + Math.random() * (speedMax - speedMin);
      particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color,
        size: size * (0.6 + Math.random() * 0.7),
        life,
        maxLife: life
      });
    }
  }

  function spawnShockwaveRing(x, y, maxRadius, color, duration = 0.45) {
    floatingRings.push({
      x,
      y,
      radius: 8,
      maxRadius,
      color,
      timer: 0,
      duration
    });
  }

  function buildLightningBoltNodes(x1, y1, x2, y2, segments = 16) {
    const nodes = [{ x: x1, y: y1 }];
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const bx = x1 + (x2 - x1) * t;
      const by = y1 + (y2 - y1) * t;
      const jitter = (Math.random() - 0.5) * 26;
      nodes.push({ x: bx + jitter, y: by + jitter * 0.4 });
    }
    nodes.push({ x: x2, y: y2 });
    return nodes;
  }

  function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    return Math.hypot(px - projX, py - projY);
  }

  function onPlayerDamaged() {
    if (player.invulnTimer > 0 || gameState !== 'PLAYING') return;

    hitCount++;
    hudHits.textContent = String(hitCount);
    player.invulnTimer = 1.15;
    screenShake = 13;

    spawnParticles(player.x, player.y, 26, '#d9534f', 70, 260, 4.5, 0.55);
    spawnShockwaveRing(player.x, player.y, 85, '#d9534f', 0.4);

    if (Number.isFinite(player.maxHp)) {
      player.hp = Math.max(0, player.hp - 1);
      renderHpPips();
      if (player.hp <= 0) {
        if (currentModeKey === 'ENDLESS') {
          finishTrial(true);
        } else {
          finishTrial(false);
        }
      }
    }
  }

  function triggerBarrierBreakClear() {
    gameState = 'CLEAR_ANIM';
    clearAnimTimer = 0;
    bossAttacks = [];
    playerBullets = [];
    memorabiliaState.phase = 'INACTIVE';
    screenShake = 22;

    const pColor1 = currentRoute === 'GUARDIAN_3' ? '#dfe6f0' : '#e4c580';
    const pColor2 = currentRoute === 'GUARDIAN_3' ? '#c93434' : '#f4efe6';
    spawnParticles(BOSS_POS.x, BOSS_POS.y, 90, pColor1, 80, 400, 5.5, 1.15);
    spawnParticles(BOSS_POS.x, BOSS_POS.y, 70, pColor2, 60, 320, 4.5, 1.0);
    spawnShockwaveRing(BOSS_POS.x, BOSS_POS.y, 380, pColor1, 0.85);
    spawnShockwaveRing(BOSS_POS.x, BOSS_POS.y, 240, pColor2, 0.6);
  }

  function calculateScoreAndRank(clearSuccess, specialClearCountNow = 0) {
    const modeObj = MODES[currentModeKey];

    if (currentModeKey === 'ENDLESS') {
      const timeScore = Math.floor(elapsedTime * 1200);
      let phaseBonus = 0;
      if (elapsedTime >= 60) {
        phaseBonus = 30000;
      } else if (elapsedTime >= 40) {
        phaseBonus = 20000;
      } else if (elapsedTime >= 20) {
        phaseBonus = 10000;
      } else if (elapsedTime >= 10) {
        phaseBonus = 3000;
      }
      const totalScore = timeScore + phaseBonus;

      let rank = 'D';
      if (elapsedTime >= 60) {
        rank = 'S';
      } else if (elapsedTime >= 40) {
        rank = 'A';
      } else if (elapsedTime >= 25) {
        rank = 'B';
      } else if (elapsedTime >= 12) {
        rank = 'C';
      }

      return {
        score: totalScore,
        baseBonus: timeScore,
        timeBonus: phaseBonus,
        avoidBonus: 0,
        rank,
        quote: '「お見事です！ここまで凌ぎ続けるとは……！あなたならまだまだ先へ進めそうですね。次の挑戦も楽しみにしていますよ。」'
      };
    }

    if (!clearSuccess) {
      const failQuote = currentRoute === 'GUARDIAN_3'
        ? '「……なんだ、もう終わりか？まだまだ鍛え甲斐がありそうだな、次はもう少し長く楽しませてくれ。」'
        : '「お怪我はありませんか？ 焦らずとも大丈夫ですよ。まずは雷と光の予兆をゆっくり見極めて、またいつでも挑みに来てくださいね。」';

      return {
        score: 0,
        baseBonus: 0,
        timeBonus: 0,
        avoidBonus: 0,
        rank: 'D',
        quote: failQuote
      };
    }

    const baseBonus = modeObj.baseBonus;
    const timeBonus = Math.max(0, Math.round((modeObj.parTime - elapsedTime) * 90));
    const noHitBonus = hitCount === 0 ? 2500 : 0;
    const hitPenalty = hitCount * 600;
    const avoidBonus = noHitBonus - hitPenalty;

    const totalScore = Math.max(500, baseBonus + timeBonus + avoidBonus);

    const sThreshold = baseBonus + 5200;
    const aThreshold = baseBonus + 3000;
    const bThreshold = baseBonus + 1000;

    let rank = 'C';
    let quote = '';

    if (currentRoute === 'GUARDIAN_3') {
      quote = '「…少々無理をしすぎたようだな。力任せではこの先の試練は越えられぬぞ、まずは己の足元を見つめ直すことだ。」';
      if (totalScore >= sThreshold && hitCount <= 1) {
        rank = 'S';
        if (currentModeKey === 'SPECIAL') {
          quote = '「……そうか、その魂、お前も……。運命は巡るものだな、そうは思わないか？勇者よ」';
        } else {
          quote = '「……ほう！まさか余の力を前に、ここまで鮮やかに立ち回るとは……よいぞ。その力、まだまだ見せてもらおう！」';
        }
      } else if (totalScore >= aThreshold) {
        rank = 'A';
        quote = '「なかなかやるではないか。最後までよく食らいついた、次はさらに上を目指してみるがよい。」';
      } else if (totalScore >= bThreshold) {
        rank = 'B';
        quote = '「悪くない。だが、まだ余の攻撃に翻弄されているようだな。己の動きを見直し、もう一度挑んでみるがよい。」';
      }
    } else {
      quote = '「結界の突破、おめでとうございます！ 苦しい場面でも最後まで諦めずに魔弾を撃ち抜く姿勢、とても頼もしかったですよ。」';
      if (totalScore >= sThreshold && hitCount <= 1) {
        rank = 'S';
        if (currentModeKey === 'SPECIAL') {
          quote = '「…素晴らしい…！まさか、ここまで見事に乗り越えられるとは……！あなたの努力が実を結んだこと、心から嬉しく思います。もはや私が教えられることはありません…！」';
        } else {
          quote = '「お見事です！ 電光石火の身のこなしと魔力制御、立派になりましたね。これほど鮮やかに私の結界を破るとは、本当に誇らしい限りです。」';
        }
      } else if (totalScore >= aThreshold) {
        rank = 'A';
        quote = '「素晴らしい戦いぶりでした！ 激しい雷光の隙間を冷静に見極め、的確に魔弾を届けてくれましたね。さらなる高みもきっと目指せますよ。」';
      } else if (totalScore >= bThreshold) {
        rank = 'B';
        quote = '「よく頑張りましたね！ 結界を破る力は十分に備わっています。次は攻撃の予兆をもう一歩早く捉えると、さらに美しく立ち回れますよ。」';
      }

      if (currentModeKey === 'SPECIAL' && specialClearCountNow === 5) {
        quote = '「……素晴らしい。本当に、素晴らしいです。あなたの実力には感動いたします。……ですが、あなたはまだ、先を望んでいらっしゃるのでしょうか？」';
      }
    }

    return {
      score: totalScore,
      baseBonus,
      timeBonus,
      avoidBonus,
      rank,
      quote
    };
  }

  function finishTrial(clearSuccess) {
    gameState = 'RESULT';
    memorabiliaState.phase = 'INACTIVE';
    updateFooterControlsVisibility();
    const modeObj = MODES[currentModeKey];

    let specialClearCountNow = getSpecialClearCount();
    if (clearSuccess && currentRoute === 'GUARDIAN_1' && currentModeKey === 'SPECIAL') {
      specialClearCountNow = incrementSpecialClearCount();
    }

    const res = calculateScoreAndRank(clearSuccess, specialClearCountNow);

    lastResultSummary = {
      route: currentRoute,
      modeKey: currentModeKey,
      modeName: modeObj.name,
      score: res.score,
      rank: res.rank,
      timeSec: elapsedTime,
      cleared: clearSuccess
    };

    const resultMainTitle = document.getElementById('resultMainTitle');
    const resultModeBadge = document.getElementById('resultModeBadge');
    const newRecordBadge = document.getElementById('newRecordBadge');
    const resultTimeLabel = document.getElementById('resultTimeLabel');
    const breakdownBaseLabel = document.getElementById('breakdownBaseLabel');
    const breakdownTimeLabel = document.getElementById('breakdownTimeLabel');
    const breakdownNoHitLabel = document.getElementById('breakdownNoHitLabel');

    resultModeBadge.textContent = modeObj.name;

    if (currentModeKey === 'ENDLESS') {
      resultTimeLabel.textContent = '耐えたタイム';
      breakdownBaseLabel.textContent = '耐久時間スコア';
      breakdownTimeLabel.textContent = '段階到達ボーナス';
      breakdownNoHitLabel.textContent = '回避ボーナス';
    } else {
      resultTimeLabel.textContent = 'クリアタイム';
      breakdownBaseLabel.textContent = 'クリアボーナス';
      breakdownTimeLabel.textContent = 'タイムボーナス';
      breakdownNoHitLabel.textContent = '回避ボーナス';
    }

    if (clearSuccess) {
      resultMainTitle.textContent = currentModeKey === 'ENDLESS' ? '試練終了' : '試練突破！';
      resultMainTitle.className = 'text-2xl sm:text-3xl font-bold tracking-widest text-[#f4efe6]';
      const isNewBest = saveBestRecordForMode(currentModeKey, {
        score: res.score,
        time: elapsedTime,
        hits: hitCount,
        rank: res.rank
      });
      if (isNewBest) {
        newRecordBadge.classList.remove('hidden');
      } else {
        newRecordBadge.classList.add('hidden');
      }
    } else {
      resultMainTitle.textContent = '試練失敗…';
      resultMainTitle.className = 'text-2xl sm:text-3xl font-bold tracking-widest text-[#d9534f]';
      newRecordBadge.classList.add('hidden');
    }

    document.getElementById('resultRankChar').textContent = res.rank;
    document.getElementById('resultTime').textContent = formatTime(elapsedTime);
    document.getElementById('resultHits').textContent = `${hitCount} 回`;
    document.getElementById('resultScore').textContent = res.score.toLocaleString();

    document.getElementById('breakdownBase').textContent = `+${res.baseBonus.toLocaleString()}`;
    document.getElementById('breakdownTime').textContent = `+${res.timeBonus.toLocaleString()}`;
    document.getElementById('breakdownNoHit').textContent =
      res.avoidBonus >= 0 ? `+${res.avoidBonus.toLocaleString()}` : `${res.avoidBonus.toLocaleString()}`;

    document.getElementById('kingQuoteText').textContent = res.quote;

    resultOverlay.classList.remove('hidden');

    if (clearSuccess && currentRoute === 'GUARDIAN_1') {
      evaluateGuardian3UnlockAndTrigger();
    }
  }

  document.getElementById('btnShareX').addEventListener('click', () => {
    const bossTitle = lastResultSummary.route === 'GUARDIAN_3' ? '參ノ護王' : '壱ノ護王';
    let firstLine = `${bossTitle}との${lastResultSummary.modeName}をクリアした！`;
    if (lastResultSummary.modeKey === 'ENDLESS') {
      const secStr = lastResultSummary.timeSec.toFixed(2);
      firstLine = `壱ノ護王との無限試練で${secStr}秒耐えた！`;
    }

    const postText =
`${firstLine}
スコア：${lastResultSummary.score}(${lastResultSummary.rank})

#護王の試練
https://fubuki-zmtq.github.io/TrialoftheGuardian/`;

    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  });

  function updateGame(dt) {
    if (gameState === 'TITLE' && anomalyHoldState.active && !anomalyHoldState.transitioning) {
      anomalyHoldState.progress = Math.min(anomalyHoldState.duration, anomalyHoldState.progress + dt);
      const pct = (anomalyHoldState.progress / anomalyHoldState.duration) * 100;
      anomalyHoldFill.style.width = `${pct}%`;
      if (anomalyHoldState.progress >= anomalyHoldState.duration) {
        triggerRouteTransition('GUARDIAN_3');
      }
    }

    if (screenShake > 0) {
      screenShake = Math.max(0, screenShake - dt * 32);
    }
    if (barrierFlash > 0) {
      barrierFlash = Math.max(0, barrierFlash - dt * 5);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = floatingRings.length - 1; i >= 0; i--) {
      const r = floatingRings[i];
      r.timer += dt;
      const progress = Math.min(1, r.timer / r.duration);
      r.radius = r.maxRadius * (1 - Math.pow(1 - progress, 3));
      if (r.timer >= r.duration) floatingRings.splice(i, 1);
    }

    if (gameState === 'COUNTDOWN') {
      countdownTimer -= dt;
      let step = Math.ceil(countdownTimer);
      if (step !== lastCountdownStep) {
        lastCountdownStep = step;
        countdownText.classList.remove('animate-countdown');
        void countdownText.offsetWidth;
        countdownText.classList.add('animate-countdown');

        if (step >= 3) {
          countdownText.textContent = '3';
        } else if (step === 2) {
          countdownText.textContent = '2';
        } else if (step === 1) {
          countdownText.textContent = '1';
        } else if (step <= 0) {
          countdownText.textContent = '開始';
        }
      }

      if (countdownTimer <= -0.35) {
        countdownOverlay.classList.add('hidden');
        gameState = 'PLAYING';
      }
      return;
    }

    if (gameState === 'CLEAR_ANIM') {
      clearAnimTimer += dt;
      if (clearAnimTimer >= 1.55) {
        finishTrial(true);
      }
      return;
    }

    if (gameState !== 'PLAYING') return;

    elapsedTime += dt;
    hudTime.textContent = formatTime(elapsedTime);

    if (currentModeKey === 'ENDLESS') {
      if (currentPhase === 1 && elapsedTime >= 10) {
        currentPhase = 2;
        spawnShockwaveRing(BOSS_POS.x, BOSS_POS.y, 240, '#a77de8', 0.6);
        updateBarrierHud();
      } else if (currentPhase === 2 && elapsedTime >= 20) {
        currentPhase = 3;
        spawnShockwaveRing(BOSS_POS.x, BOSS_POS.y, 280, '#d9534f', 0.65);
        updateBarrierHud();
      }
    }

    let moveX = 0;
    let moveY = 0;
    if (keys['KeyW'] || keys['ArrowUp']) moveY -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveY += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

    if (Math.hypot(joyVector.x, joyVector.y) > 0.05) {
      moveX = joyVector.x;
      moveY = joyVector.y;
    } else if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      moveX /= len;
      moveY /= len;
    }

    player.x += moveX * player.speed * dt;
    player.y += moveY * player.speed * dt;

    player.x = Math.max(STAGE_BOUNDS.left + player.radius, Math.min(STAGE_BOUNDS.right - player.radius, player.x));
    player.y = Math.max(STAGE_BOUNDS.top + player.radius, Math.min(STAGE_BOUNDS.bottom - player.radius, player.y));

    player.trail.push({ x: player.x, y: player.y, alpha: 0.55 });
    if (player.trail.length > 7) player.trail.shift();
    for (const t of player.trail) t.alpha *= 0.86;

    if (player.invulnTimer > 0) {
      player.invulnTimer = Math.max(0, player.invulnTimer - dt);
    }

    if (currentModeKey !== 'ENDLESS') {
      player.shootCooldown = Math.max(0, player.shootCooldown - dt);
      const wantsAttack = keys['Space'] || mouseAttackHeld || touchAttackHeld || (canvasDragTouchId !== null);
      if (wantsAttack && player.shootCooldown <= 0) {
        player.shootCooldown = 0.125;

        const dx = BOSS_POS.x - player.x;
        const dy = BOSS_POS.y - player.y;
        const baseAng = Math.atan2(dy, dx);
        const spread = (Math.random() - 0.5) * 0.05;
        const speed = 780;

        playerBullets.push({
          x: player.x,
          y: player.y - 10,
          vx: Math.cos(baseAng + spread) * speed,
          vy: Math.sin(baseAng + spread) * speed,
          radius: 6,
          damage: 16
        });
        if (!(currentRoute === 'GUARDIAN_3' && memorabiliaState.phase === 'GRAY')) {
          const pCol = currentRoute === 'GUARDIAN_3' ? '#dfe6f0' : '#e4c580';
          spawnParticles(player.x, player.y - 12, 3, pCol, 25, 80, 2.5, 0.16);
        }
      }

      for (let i = playerBullets.length - 1; i >= 0; i--) {
        const b = playerBullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        const distToBarrier = Math.hypot(b.x - BOSS_POS.x, b.y - BOSS_POS.y);
        if (distToBarrier <= BARRIER_RADIUS + b.radius) {
          barrierHp = Math.max(0, barrierHp - b.damage);
          barrierFlash = 1.0;
          const hitCol = currentRoute === 'GUARDIAN_3' ? '#dfe6f0' : '#e4c580';
          spawnParticles(b.x, b.y, 7, hitCol, 45, 165, 3, 0.28);
          spawnShockwaveRing(b.x, b.y, 26, '#f4efe6', 0.2);
          playerBullets.splice(i, 1);

          const ratio = barrierHp / barrierMaxHp;
          if (currentPhase === 1 && ratio <= 0.69) {
            currentPhase = 2;
            spawnShockwaveRing(BOSS_POS.x, BOSS_POS.y, 240, currentRoute === 'GUARDIAN_3' ? '#d94826' : '#a77de8', 0.6);
          } else if (currentPhase === 2 && ratio <= 0.34) {
            currentPhase = 3;
            spawnShockwaveRing(BOSS_POS.x, BOSS_POS.y, 280, '#d9534f', 0.65);
          }

          updateBarrierHud();

          if (barrierHp <= 0) {
            triggerBarrierBreakClear();
            return;
          }
          continue;
        }

        if (b.x < -50 || b.x > WORLD_W + 50 || b.y < -50 || b.y > WORLD_H + 50) {
          playerBullets.splice(i, 1);
        }
      }
    }

    updateBossDirector(dt);

    for (let i = bossAttacks.length - 1; i >= 0; i--) {
      const atk = bossAttacks[i];
      atk.timer += dt;

      if (atk.type === 'DELAYED_SPAWNER') {
        if (atk.timer >= atk.delay) {
          atk.callback();
          bossAttacks.splice(i, 1);
        }
        continue;
      }

      if (atk.state === 'WARN') {
        if (atk.timer >= atk.warnDuration) {
          atk.state = 'ACTIVE';
          atk.timer = 0;

          if (atk.type === 'SPEAR') {
            screenShake = Math.max(screenShake, 5);
            atk.boltNodes = buildLightningBoltNodes(atk.x1, atk.y1, atk.x2, atk.y2, 18);
          } else if (atk.type === 'LIGHT_CIRCLE') {
            screenShake = Math.max(screenShake, 4);
            spawnParticles(atk.x, atk.y, 20, '#e4c580', 55, 220, 3.8, 0.42);
            spawnShockwaveRing(atk.x, atk.y, atk.radius * 1.2, '#e4c580', 0.34);
          } else if (atk.type === 'HORIZ_WAVE') {
            screenShake = Math.max(screenShake, 6);
          } else if (atk.type === 'G3_DARK_CLAWS') {
            screenShake = Math.max(screenShake, 6);
          } else if (atk.type === 'G3_SHADOW_CAGE') {
            screenShake = Math.max(screenShake, 5);
          } else if (atk.type === 'G3_FLAME_WAVE') {
            screenShake = Math.max(screenShake, 6);
          } else if (atk.type === 'G3_LINGERING_FIRE') {
            screenShake = Math.max(screenShake, 4);
            spawnParticles(atk.x, atk.y, 18, '#e85d2a', 45, 190, 3.6, 0.4);
          }
        }
      } else if (atk.state === 'ACTIVE') {
        if (!atk.hasHitPlayer && player.invulnTimer <= 0) {
          if (atk.type === 'SPEAR') {
            const dist = pointToSegmentDistance(player.x, player.y, atk.x1, atk.y1, atk.x2, atk.y2);
            if (dist <= (atk.width * 0.45) + player.radius * 0.78) {
              atk.hasHitPlayer = true;
              onPlayerDamaged();
            }
          } else if (atk.type === 'LIGHT_CIRCLE') {
            const dist = Math.hypot(player.x - atk.x, player.y - atk.y);
            if (dist <= atk.radius * 0.9 + player.radius * 0.75) {
              atk.hasHitPlayer = true;
              onPlayerDamaged();
            }
          } else if (atk.type === 'HORIZ_WAVE' || atk.type === 'G3_FLAME_WAVE') {
            const inBandY = Math.abs(player.y - atk.y) <= (atk.height * 0.46 + player.radius * 0.7);
            const inSafeX = Math.abs(player.x - atk.safeX) <= (atk.safeW * 0.48);
            if (inBandY && !inSafeX) {
              atk.hasHitPlayer = true;
              onPlayerDamaged();
            }
          } else if (atk.type === 'G3_DARK_CLAWS') {
            for (const ln of atk.lines) {
              const dist = pointToSegmentDistance(player.x, player.y, ln.x1, ln.y1, ln.x2, ln.y2);
              if (dist <= (ln.width * 0.44) + player.radius * 0.75) {
                atk.hasHitPlayer = true;
                onPlayerDamaged();
                break;
              }
            }
          } else if (atk.type === 'G3_SHADOW_CAGE') {
            for (const r of atk.rects) {
              if (
                player.x + player.radius * 0.65 >= r.x &&
                player.x - player.radius * 0.65 <= r.x + r.w &&
                player.y + player.radius * 0.65 >= r.y &&
                player.y - player.radius * 0.65 <= r.y + r.h
              ) {
                onPlayerDamaged();
                break;
              }
            }
          } else if (atk.type === 'G3_LINGERING_FIRE') {
            const dist = Math.hypot(player.x - atk.x, player.y - atk.y);
            if (dist <= atk.radius * 0.88 + player.radius * 0.7) {
              onPlayerDamaged();
            }
          }
        }

        if (atk.type === 'SPEAR' && Math.random() < 0.5) {
          atk.boltNodes = buildLightningBoltNodes(atk.x1, atk.y1, atk.x2, atk.y2, 16);
        }

        if (atk.timer >= atk.activeDuration) {
          bossAttacks.splice(i, 1);
        }
      }
    }
  }

  function drawStageBackground(timeSec) {
    const isG3 = currentRoute === 'GUARDIAN_3';
    const isGrayStage = isG3 && memorabiliaState.phase === 'GRAY';

    const skyGrad = ctx.createLinearGradient(0, 0, 0, WORLD_H);
    if (isGrayStage) {
      skyGrad.addColorStop(0, '#18181b');
      skyGrad.addColorStop(0.35, '#27272c');
      skyGrad.addColorStop(1, '#121215');
    } else if (isG3) {
      skyGrad.addColorStop(0, '#0a0204');
      skyGrad.addColorStop(0.35, '#1c060c');
      skyGrad.addColorStop(1, '#080204');
    } else {
      skyGrad.addColorStop(0, '#040814');
      skyGrad.addColorStop(0.35, '#091229');
      skyGrad.addColorStop(1, '#050916');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    const haloGrad = ctx.createRadialGradient(BOSS_POS.x, BOSS_POS.y, 12, BOSS_POS.x, BOSS_POS.y, WORLD_W * 0.42);
    if (isGrayStage) {
      haloGrad.addColorStop(0, 'rgba(180, 180, 190, 0.2)');
      haloGrad.addColorStop(0.5, 'rgba(90, 90, 100, 0.1)');
      haloGrad.addColorStop(1, 'rgba(20, 20, 24, 0)');
    } else if (isG3) {
      haloGrad.addColorStop(0, 'rgba(201, 52, 52, 0.25)');
      haloGrad.addColorStop(0.5, 'rgba(120, 20, 35, 0.14)');
      haloGrad.addColorStop(1, 'rgba(10, 2, 4, 0)');
    } else {
      haloGrad.addColorStop(0, 'rgba(197, 160, 89, 0.22)');
      haloGrad.addColorStop(0.5, 'rgba(35, 58, 112, 0.12)');
      haloGrad.addColorStop(1, 'rgba(4, 8, 20, 0)');
    }
    ctx.fillStyle = haloGrad;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H * 0.65);

    const topLeftX = STAGE_BOUNDS.left + (WORLD_W * 0.09);
    const topRightX = STAGE_BOUNDS.right - (WORLD_W * 0.09);
    const bottomLeftX = STAGE_BOUNDS.left - 24;
    const bottomRightX = STAGE_BOUNDS.right + 24;
    const topY = STAGE_BOUNDS.top - 55;
    const bottomY = STAGE_BOUNDS.bottom + 25;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(topLeftX, topY);
    ctx.lineTo(topRightX, topY);
    ctx.lineTo(bottomRightX, bottomY);
    ctx.lineTo(bottomLeftX, bottomY);
    ctx.closePath();
    const stairGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
    if (isGrayStage) {
      stairGrad.addColorStop(0, '#2c2c32');
      stairGrad.addColorStop(0.5, '#222227');
      stairGrad.addColorStop(1, '#16161a');
    } else if (isG3) {
      stairGrad.addColorStop(0, '#240710');
      stairGrad.addColorStop(0.5, '#19050b');
      stairGrad.addColorStop(1, '#0e0206');
    } else {
      stairGrad.addColorStop(0, '#0d1733');
      stairGrad.addColorStop(0.5, '#0a1228');
      stairGrad.addColorStop(1, '#060b18');
    }
    ctx.fillStyle = stairGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isGrayStage
      ? 'rgba(180, 180, 190, 0.45)'
      : isG3
      ? 'rgba(166, 176, 190, 0.45)'
      : 'rgba(197, 160, 89, 0.45)';
    ctx.stroke();

    const stepCount = 20;
    for (let i = 1; i < stepCount; i++) {
      const t = Math.pow(i / stepCount, 1.15);
      const y = topY + (bottomY - topY) * t;
      const lx = topLeftX + (bottomLeftX - topLeftX) * t;
      const rx = topRightX + (bottomRightX - topRightX) * t;

      ctx.beginPath();
      ctx.moveTo(lx, y);
      ctx.lineTo(rx, y);
      ctx.strokeStyle = i % 2 === 0
        ? (isG3 ? 'rgba(166, 176, 190, 0.18)' : 'rgba(197, 160, 89, 0.18)')
        : 'rgba(244, 239, 230, 0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    const carpetTopW = (topRightX - topLeftX) * 0.34;
    const carpetBotW = (bottomRightX - bottomLeftX) * 0.36;
    ctx.beginPath();
    ctx.moveTo(BOSS_POS.x - carpetTopW / 2, topY);
    ctx.lineTo(BOSS_POS.x + carpetTopW / 2, topY);
    ctx.lineTo(BOSS_POS.x + carpetBotW / 2, bottomY);
    ctx.lineTo(BOSS_POS.x - carpetBotW / 2, bottomY);
    ctx.closePath();
    const carpetGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
    if (isGrayStage) {
      carpetGrad.addColorStop(0, 'rgba(70, 70, 78, 0.55)');
      carpetGrad.addColorStop(1, 'rgba(42, 42, 48, 0.65)');
    } else if (isG3) {
      carpetGrad.addColorStop(0, 'rgba(82, 12, 24, 0.6)');
      carpetGrad.addColorStop(1, 'rgba(42, 6, 14, 0.7)');
    } else {
      carpetGrad.addColorStop(0, 'rgba(28, 45, 92, 0.55)');
      carpetGrad.addColorStop(1, 'rgba(14, 24, 52, 0.65)');
    }
    ctx.fillStyle = carpetGrad;
    ctx.fill();
    ctx.strokeStyle = isG3 ? 'rgba(166, 176, 190, 0.35)' : 'rgba(197, 160, 89, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.strokeStyle = isG3 ? 'rgba(166, 176, 190, 0.45)' : 'rgba(197, 160, 89, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(
      STAGE_BOUNDS.left,
      STAGE_BOUNDS.top,
      STAGE_BOUNDS.right - STAGE_BOUNDS.left,
      STAGE_BOUNDS.bottom - STAGE_BOUNDS.top
    );

    const corners = [
      [STAGE_BOUNDS.left, STAGE_BOUNDS.top],
      [STAGE_BOUNDS.right, STAGE_BOUNDS.top],
      [STAGE_BOUNDS.left, STAGE_BOUNDS.bottom],
      [STAGE_BOUNDS.right, STAGE_BOUNDS.bottom]
    ];
    ctx.fillStyle = isG3 ? '#a6b0be' : '#c5a059';
    for (const [cx, cy] of corners) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-4, -4, 8, 8);
      ctx.restore();
    }

    for (let p = 0; p < 4; p++) {
      const ratio = (p + 0.5) / 4;
      const py = STAGE_BOUNDS.top + (STAGE_BOUNDS.bottom - STAGE_BOUNDS.top) * ratio;
      const pulse = Math.sin(timeSec * 3 + p) * 2;
      [STAGE_BOUNDS.left - 18, STAGE_BOUNDS.right + 18].forEach(px => {
        ctx.fillStyle = isG3 ? '#a6b0be' : '#c5a059';
        ctx.fillRect(px - 4, py - 4, 8, 8);
        ctx.beginPath();
        ctx.arc(px, py, 9 + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = isG3 ? 'rgba(223, 230, 240, 0.35)' : 'rgba(228, 197, 128, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }
    ctx.restore();
  }

  function drawGuardian3Figure(timeSec) {
    ctx.save();
    ctx.rotate(-timeSec * 0.55);
    ctx.strokeStyle = currentPhase === 3 ? 'rgba(225, 65, 65, 0.7)' : 'rgba(185, 196, 212, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 58, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 48, Math.sin(a) * 48);
      ctx.lineTo(Math.cos(a) * 68, Math.sin(a) * 68);
      ctx.stroke();
    }
    ctx.restore();

    const imgSize = 140;
    if (king3Img.complete && king3Img.naturalWidth > 0) {
      ctx.drawImage(king3Img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
      return;
    }

    ctx.fillStyle = '#24050c';
    ctx.strokeStyle = '#a6b0be';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-28, -14);
    ctx.quadraticCurveTo(-54, 16, -42, 44);
    ctx.lineTo(42, 44);
    ctx.quadraticCurveTo(54, 16, 28, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#140409';
    ctx.strokeStyle = '#dfe6f0';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(0, 5, 25, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#dfe6f0';
    ctx.strokeStyle = '#58616e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-14, -26);
    ctx.lineTo(-26, -48);
    ctx.lineTo(-6, -32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(14, -26);
    ctx.lineTo(26, -48);
    ctx.lineTo(6, -32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ff3b3b';
    ctx.beginPath();
    ctx.arc(-8, -15, 3, 0, Math.PI * 2);
    ctx.arc(8, -15, 3, 0, Math.PI * 2);
    ctx.fill();

    const flamePulse = Math.sin(timeSec * 6) * 3;
    ctx.fillStyle = 'rgba(225, 65, 45, 0.85)';
    ctx.beginPath();
    ctx.arc(36, -18, 9 + flamePulse, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGuardianKingAndBarrier(timeSec) {
    const bx = BOSS_POS.x;
    const by = BOSS_POS.y;
    const hoverY = Math.sin(timeSec * 2.4) * 4;

    ctx.save();
    ctx.translate(bx, by + hoverY);

    if (currentRoute === 'GUARDIAN_3') {
      drawGuardian3Figure(timeSec);
    } else {
      ctx.save();
      ctx.rotate(timeSec * 0.45);
      ctx.strokeStyle = currentPhase === 3 ? 'rgba(217, 83, 79, 0.5)' : 'rgba(197, 160, 89, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 56, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 48, Math.sin(a) * 48);
        ctx.lineTo(Math.cos(a) * 66, Math.sin(a) * 66);
        ctx.stroke();
      }
      ctx.restore();

      const imgSize = 140;
      if (kingImg.complete && kingImg.naturalWidth > 0) {
        ctx.drawImage(kingImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
      }
    }

    ctx.restore();

    if (currentModeKey !== 'ENDLESS' && barrierHp > 0) {
      const hpRatio = barrierHp / barrierMaxHp;
      let barrierColor = 'rgba(120, 175, 235, ';
      let strokeHex = '#78afeb';

      if (currentRoute === 'GUARDIAN_3') {
        if (currentPhase === 1) {
          barrierColor = 'rgba(166, 176, 190, ';
          strokeHex = '#c4cdd8';
        } else if (currentPhase === 2) {
          barrierColor = 'rgba(220, 95, 55, ';
          strokeHex = '#e66c40';
        } else {
          barrierColor = 'rgba(220, 45, 65, ';
          strokeHex = '#e63946';
        }
      } else {
        if (currentPhase === 2) {
          barrierColor = 'rgba(180, 140, 240, ';
          strokeHex = '#b48cf0';
        } else if (currentPhase === 3) {
          barrierColor = 'rgba(225, 105, 105, ';
          strokeHex = '#e16969';
        }
      }

      ctx.save();
      ctx.translate(bx, by);

      const shieldGrad = ctx.createRadialGradient(0, 0, BARRIER_RADIUS * 0.25, 0, 0, BARRIER_RADIUS);
      const alphaBoost = barrierFlash * 0.35;
      shieldGrad.addColorStop(0, `${barrierColor}${0.04 + alphaBoost})`);
      shieldGrad.addColorStop(0.75, `${barrierColor}${0.16 + alphaBoost})`);
      shieldGrad.addColorStop(1, `${barrierColor}${0.42 + alphaBoost})`);

      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.arc(0, 0, BARRIER_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.rotate(timeSec * 0.5);
      ctx.strokeStyle = barrierFlash > 0.1 ? '#f4efe6' : strokeHex;
      ctx.lineWidth = 2.5 + barrierFlash * 2;
      ctx.beginPath();
      const sides = 8;
      for (let i = 0; i <= sides; i++) {
        const a = (i * Math.PI * 2) / sides;
        const rx = Math.cos(a) * BARRIER_RADIUS;
        const ry = Math.sin(a) * BARRIER_RADIUS;
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.stroke();
      ctx.restore();

      const crackCount = hpRatio < 0.35 ? 9 : hpRatio < 0.7 ? 5 : 0;
      if (crackCount > 0) {
        ctx.strokeStyle = '#f4efe6';
        ctx.lineWidth = 1.6;
        for (let c = 0; c < crackCount; c++) {
          const baseA = (c * Math.PI * 2) / crackCount + 0.3;
          ctx.beginPath();
          ctx.moveTo(Math.cos(baseA) * BARRIER_RADIUS, Math.sin(baseA) * BARRIER_RADIUS);
          ctx.lineTo(Math.cos(baseA + 0.12) * (BARRIER_RADIUS * 0.68), Math.sin(baseA + 0.12) * (BARRIER_RADIUS * 0.68));
          ctx.lineTo(Math.cos(baseA - 0.07) * (BARRIER_RADIUS * 0.42), Math.sin(baseA - 0.07) * (BARRIER_RADIUS * 0.42));
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }

  function drawBossAttacks(timeSec) {
    for (const atk of bossAttacks) {
      if (atk.type === 'DELAYED_SPAWNER') continue;

      if (atk.type === 'SPEAR') {
        if (atk.state === 'WARN') {
          const progress = Math.min(1, atk.timer / atk.warnDuration);
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(atk.x1, atk.y1);
          ctx.lineTo(atk.x2, atk.y2);
          ctx.strokeStyle = `rgba(228, 197, 128, ${0.15 + progress * 0.28})`;
          ctx.lineWidth = atk.width * (1 - progress * 0.3);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(atk.x1, atk.y1);
          ctx.lineTo(atk.x2, atk.y2);
          ctx.strokeStyle = progress > 0.75 ? '#f4efe6' : '#e4c580';
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 6]);
          ctx.stroke();
          ctx.restore();
        } else if (atk.state === 'ACTIVE') {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(atk.x1, atk.y1);
          ctx.lineTo(atk.x2, atk.y2);
          ctx.strokeStyle = 'rgba(130, 195, 255, 0.5)';
          ctx.lineWidth = atk.width * 1.35;
          ctx.stroke();

          if (atk.boltNodes.length > 1) {
            ctx.beginPath();
            ctx.moveTo(atk.boltNodes[0].x, atk.boltNodes[0].y);
            for (let i = 1; i < atk.boltNodes.length; i++) {
              ctx.lineTo(atk.boltNodes[i].x, atk.boltNodes[i].y);
            }
            ctx.strokeStyle = '#f4efe6';
            ctx.lineWidth = 4;
            ctx.stroke();
          }
          ctx.restore();
        }
      } else if (atk.type === 'LIGHT_CIRCLE') {
        if (atk.state === 'WARN') {
          const progress = Math.min(1, atk.timer / atk.warnDuration);
          ctx.save();
          ctx.beginPath();
          ctx.arc(atk.x, atk.y, atk.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(197, 160, 89, ${0.1 + progress * 0.22})`;
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = progress > 0.8 ? '#f4efe6' : 'rgba(228, 197, 128, 0.85)';
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(atk.x, atk.y, atk.radius * progress, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(244, 239, 230, 0.65)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        } else if (atk.state === 'ACTIVE') {
          const fade = 1 - atk.timer / atk.activeDuration;
          ctx.save();
          const grad = ctx.createRadialGradient(atk.x, atk.y, 8, atk.x, atk.y, atk.radius);
          grad.addColorStop(0, `rgba(255, 255, 255, ${fade})`);
          grad.addColorStop(0.6, `rgba(228, 197, 128, ${fade * 0.85})`);
          grad.addColorStop(1, 'rgba(197, 160, 89, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(atk.x, atk.y, atk.radius * 1.06, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else if (atk.type === 'HORIZ_WAVE') {
        const topY = atk.y - atk.height / 2;
        const leftEnd = atk.safeX - atk.safeW / 2;
        const rightStart = atk.safeX + atk.safeW / 2;

        if (atk.state === 'WARN') {
          const progress = Math.min(1, atk.timer / atk.warnDuration);
          ctx.save();
          ctx.fillStyle = `rgba(197, 160, 89, ${0.12 + progress * 0.24})`;
          ctx.strokeStyle = 'rgba(228, 197, 128, 0.85)';
          ctx.lineWidth = 2;

          if (leftEnd > STAGE_BOUNDS.left) {
            ctx.fillRect(STAGE_BOUNDS.left, topY, leftEnd - STAGE_BOUNDS.left, atk.height);
            ctx.strokeRect(STAGE_BOUNDS.left, topY, leftEnd - STAGE_BOUNDS.left, atk.height);
          }
          if (STAGE_BOUNDS.right > rightStart) {
            ctx.fillRect(rightStart, topY, STAGE_BOUNDS.right - rightStart, atk.height);
            ctx.strokeRect(rightStart, topY, STAGE_BOUNDS.right - rightStart, atk.height);
          }

          ctx.strokeStyle = 'rgba(120, 210, 165, 0.85)';
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(leftEnd, topY, atk.safeW, atk.height);
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(120, 210, 165, 0.9)';
          ctx.font = 'bold 12px "Shippori Mincho", serif';
          ctx.textAlign = 'center';
          ctx.fillText('安全地帯', atk.safeX, atk.y + 4);
          ctx.restore();
        } else if (atk.state === 'ACTIVE') {
          const fade = 1 - atk.timer / atk.activeDuration;
          ctx.save();
          ctx.fillStyle = `rgba(244, 239, 230, ${fade * 0.9})`;
          if (leftEnd > STAGE_BOUNDS.left) {
            ctx.fillRect(STAGE_BOUNDS.left, topY, leftEnd - STAGE_BOUNDS.left, atk.height);
          }
          if (STAGE_BOUNDS.right > rightStart) {
            ctx.fillRect(rightStart, topY, STAGE_BOUNDS.right - rightStart, atk.height);
          }
          ctx.restore();
        }
      } else if (atk.type === 'G3_DARK_CLAWS') {
        if (atk.state === 'WARN') {
          const progress = Math.min(1, atk.timer / atk.warnDuration);
          ctx.save();
          for (const ln of atk.lines) {
            ctx.beginPath();
            ctx.moveTo(ln.x1, ln.y1);
            ctx.lineTo(ln.x2, ln.y2);
            ctx.strokeStyle = `rgba(180, 45, 75, ${0.18 + progress * 0.35})`;
            ctx.lineWidth = ln.width * (1 - progress * 0.25);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(ln.x1, ln.y1);
            ctx.lineTo(ln.x2, ln.y2);
            ctx.strokeStyle = progress > 0.78 ? '#f4efe6' : '#e05368';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          ctx.restore();
        } else if (atk.state === 'ACTIVE') {
          const fade = 1 - atk.timer / atk.activeDuration;
          ctx.save();
          for (const ln of atk.lines) {
            ctx.beginPath();
            ctx.moveTo(ln.x1, ln.y1);
            ctx.lineTo(ln.x2, ln.y2);
            ctx.strokeStyle = `rgba(20, 4, 12, ${fade * 0.95})`;
            ctx.lineWidth = ln.width * 1.25;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(ln.x1, ln.y1);
            ctx.lineTo(ln.x2, ln.y2);
            ctx.strokeStyle = `rgba(225, 55, 80, ${fade})`;
            ctx.lineWidth = 5;
            ctx.stroke();
          }
          ctx.restore();
        }
      } else if (atk.type === 'G3_SHADOW_CAGE') {
        if (atk.state === 'WARN') {
          const progress = Math.min(1, atk.timer / atk.warnDuration);
          ctx.save();
          ctx.fillStyle = `rgba(95, 18, 42, ${0.14 + progress * 0.28})`;
          ctx.strokeStyle = progress > 0.8 ? '#dfe6f0' : 'rgba(215, 70, 95, 0.85)';
          ctx.lineWidth = 2;
          for (const r of atk.rects) {
            ctx.fillRect(r.x, r.y, r.w, r.h);
            ctx.strokeRect(r.x, r.y, r.w, r.h);
          }
          ctx.restore();
        } else if (atk.state === 'ACTIVE') {
          const pulse = 0.72 + Math.sin(timeSec * 12) * 0.14;
          ctx.save();
          ctx.fillStyle = `rgba(18, 3, 10, ${pulse})`;
          ctx.strokeStyle = '#d93850';
          ctx.lineWidth = 2.5;
          for (const r of atk.rects) {
            ctx.fillRect(r.x, r.y, r.w, r.h);
            ctx.strokeRect(r.x, r.y, r.w, r.h);
          }
          ctx.restore();
        }
      } else if (atk.type === 'G3_FLAME_WAVE') {
        const topY = atk.y - atk.height / 2;
        const leftEnd = atk.safeX - atk.safeW / 2;
        const rightStart = atk.safeX + atk.safeW / 2;

        if (atk.state === 'WARN') {
          const progress = Math.min(1, atk.timer / atk.warnDuration);
          ctx.save();
          ctx.fillStyle = `rgba(225, 80, 35, ${0.14 + progress * 0.26})`;
          ctx.strokeStyle = 'rgba(245, 130, 65, 0.9)';
          ctx.lineWidth = 2;

          if (leftEnd > STAGE_BOUNDS.left) {
            ctx.fillRect(STAGE_BOUNDS.left, topY, leftEnd - STAGE_BOUNDS.left, atk.height);
            ctx.strokeRect(STAGE_BOUNDS.left, topY, leftEnd - STAGE_BOUNDS.left, atk.height);
          }
          if (STAGE_BOUNDS.right > rightStart) {
            ctx.fillRect(rightStart, topY, STAGE_BOUNDS.right - rightStart, atk.height);
            ctx.strokeRect(rightStart, topY, STAGE_BOUNDS.right - rightStart, atk.height);
          }

          ctx.strokeStyle = 'rgba(120, 210, 165, 0.85)';
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(leftEnd, topY, atk.safeW, atk.height);
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(120, 210, 165, 0.9)';
          ctx.font = 'bold 12px "Shippori Mincho", serif';
          ctx.textAlign = 'center';
          ctx.fillText('安全地帯', atk.safeX, atk.y + 4);
          ctx.restore();
        } else if (atk.state === 'ACTIVE') {
          const fade = 1 - atk.timer / atk.activeDuration;
          ctx.save();
          ctx.fillStyle = `rgba(235, 75, 28, ${fade * 0.9})`;
          if (leftEnd > STAGE_BOUNDS.left) {
            ctx.fillRect(STAGE_BOUNDS.left, topY, leftEnd - STAGE_BOUNDS.left, atk.height);
          }
          if (STAGE_BOUNDS.right > rightStart) {
            ctx.fillRect(rightStart, topY, STAGE_BOUNDS.right - rightStart, atk.height);
          }
          ctx.restore();
        }
      } else if (atk.type === 'G3_LINGERING_FIRE') {
        if (atk.state === 'WARN') {
          const progress = Math.min(1, atk.timer / atk.warnDuration);
          ctx.save();
          ctx.beginPath();
          ctx.arc(atk.x, atk.y, atk.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(225, 85, 35, ${0.12 + progress * 0.25})`;
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = progress > 0.8 ? '#f4efe6' : 'rgba(245, 125, 60, 0.9)';
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(atk.x, atk.y, atk.radius * progress, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 200, 150, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        } else if (atk.state === 'ACTIVE') {
          const remRatio = Math.max(0, 1 - atk.timer / atk.activeDuration);
          const flicker = 0.85 + Math.sin(timeSec * 18 + atk.x) * 0.12;
          ctx.save();
          const grad = ctx.createRadialGradient(atk.x, atk.y, 6, atk.x, atk.y, atk.radius);
          grad.addColorStop(0, `rgba(255, 220, 130, ${remRatio * flicker})`);
          grad.addColorStop(0.55, `rgba(235, 75, 25, ${remRatio * 0.85})`);
          grad.addColorStop(1, 'rgba(140, 20, 10, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(atk.x, atk.y, atk.radius * 1.04, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(255, 140, 65, ${remRatio * 0.8})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(atk.x, atk.y, atk.radius * 0.9, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function drawPlayerAndBullets(timeSec) {
    const isG3 = currentRoute === 'GUARDIAN_3';

    if (isG3 && memorabiliaState.phase === 'GRAY') {
      if (memorabiliaState.timer >= 2.0) {
        const gatherProgress = Math.min(1, (memorabiliaState.timer - 2.0) / 1.0);
        const outerRadius = 72 * (1 - gatherProgress * 0.78);
        ctx.save();
        ctx.translate(player.x, player.y);

        const glowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, outerRadius);
        glowGrad.addColorStop(0, `rgba(255, 255, 255, ${0.25 + gatherProgress * 0.65})`);
        glowGrad.addColorStop(0.6, `rgba(223, 230, 240, ${0.15 + gatherProgress * 0.4})`);
        glowGrad.addColorStop(1, 'rgba(223, 230, 240, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + gatherProgress * 0.7})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, outerRadius * 0.75, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      return;
    }

    for (const b of playerBullets) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#f4efe6';
      ctx.strokeStyle = isG3 ? '#dfe6f0' : '#e4c580';
      ctx.lineWidth = 2;
      ctx.fillRect(-5, -5, 10, 10);
      ctx.strokeRect(-5, -5, 10, 10);
      ctx.restore();
    }

    if (isG3 && memorabiliaState.phase === 'GRAY') {
      if (memorabiliaState.timer >= 2.0) {
        const gatherProgress = Math.min(1, (memorabiliaState.timer - 2.0) / 1.0);
        const outerRadius = 72 * (1 - gatherProgress * 0.78);
        ctx.save();
        ctx.translate(player.x, player.y);

        const glowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, outerRadius);
        glowGrad.addColorStop(0, `rgba(255, 255, 255, ${0.25 + gatherProgress * 0.65})`);
        glowGrad.addColorStop(0.6, `rgba(223, 230, 240, ${0.15 + gatherProgress * 0.4})`);
        glowGrad.addColorStop(1, 'rgba(223, 230, 240, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + gatherProgress * 0.7})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, outerRadius * 0.75, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      return;
    }

    for (let i = 0; i < player.trail.length; i++) {
      const t = player.trail[i];
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = isG3
        ? `rgba(185, 196, 212, ${t.alpha * 0.3})`
        : `rgba(197, 160, 89, ${t.alpha * 0.3})`;
      const sz = (i + 2) * 1.6;
      ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
      ctx.restore();
    }

    if (player.invulnTimer > 0 && Math.floor(player.invulnTimer * 18) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(player.x, player.y);

    ctx.save();
    ctx.rotate(-timeSec * 2.0);
    ctx.strokeStyle = isG3 ? 'rgba(223, 230, 240, 0.75)' : 'rgba(228, 197, 128, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-13, -13, 26, 26);
    ctx.restore();

    ctx.fillStyle = isG3 ? '#2b0c14' : '#162344';
    ctx.strokeStyle = isG3 ? '#dfe6f0' : '#e4c580';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(13, 12);
    ctx.lineTo(0, 7);
    ctx.lineTo(-13, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f4efe6';
    ctx.save();
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-3.5, -3.5, 7, 7);
    ctx.restore();

    ctx.restore();
  }

  function drawMemorabiliaCueOverlay() {
    if (currentRoute !== 'GUARDIAN_3') return;
    if (memorabiliaState.phase === 'CUE') {
      const p = Math.min(1, memorabiliaState.timer / 0.55);
      const alpha = Math.sin(p * Math.PI) * 0.45;
      ctx.save();
      ctx.strokeStyle = `rgba(223, 230, 240, ${alpha + 0.25})`;
      ctx.lineWidth = 4;
      ctx.strokeRect(
        STAGE_BOUNDS.left + 4,
        STAGE_BOUNDS.top + 4,
        STAGE_BOUNDS.right - STAGE_BOUNDS.left - 8,
        STAGE_BOUNDS.bottom - STAGE_BOUNDS.top - 8
      );
      ctx.fillStyle = `rgba(223, 230, 240, ${alpha * 0.4})`;
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);
      ctx.restore();
    }
  }

  function drawEffects() {
    for (const r of floatingRings) {
      const alpha = Math.max(0, 1 - r.timer / r.duration);
      ctx.save();
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }

    for (const p of particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
  }

  function renderGame(timeSec) {
    ctx.save();
    const isMobileView = window.innerWidth < 768 || isTouchDevice;
    const effectiveShake = isMobileView ? (screenShake > 8 ? screenShake * 0.35 : 0) : screenShake;
    if (effectiveShake > 0) {
      const sx = (Math.random() - 0.5) * effectiveShake;
      const sy = (Math.random() - 0.5) * effectiveShake;
      ctx.translate(sx, sy);
    }

    drawStageBackground(timeSec);
    drawBossAttacks(timeSec);
    drawGuardianKingAndBarrier(timeSec);
    drawPlayerAndBullets(timeSec);
    drawEffects();
    drawMemorabiliaCueOverlay();

    ctx.restore();
  }

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    keys[e.code] = true;

    if (e.code === 'KeyR' && (gameState === 'PLAYING' || gameState === 'RESULT')) {
      startCountdownAndTrial();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0 && gameState === 'PLAYING') {
      mouseAttackHeld = true;
    }
  });
  window.addEventListener('mouseup', () => {
    mouseAttackHeld = false;
  });

  canvas.addEventListener('touchstart', (e) => {
    if (gameState !== 'PLAYING') return;
    e.preventDefault();
    isTouchDevice = true;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (canvasDragTouchId === null) {
        canvasDragTouchId = t.identifier;
        canvasDragLastPos.x = t.clientX;
        canvasDragLastPos.y = t.clientY;
        break;
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (gameState !== 'PLAYING') return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = WORLD_W / Math.max(1, rect.width);
    const scaleY = WORLD_H / Math.max(1, rect.height);

    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === canvasDragTouchId) {
        const dx = (t.clientX - canvasDragLastPos.x) * scaleX * 1.15;
        const dy = (t.clientY - canvasDragLastPos.y) * scaleY * 1.15;
        canvasDragLastPos.x = t.clientX;
        canvasDragLastPos.y = t.clientY;

        player.x = Math.max(STAGE_BOUNDS.left + player.radius, Math.min(STAGE_BOUNDS.right - player.radius, player.x + dx));
        player.y = Math.max(STAGE_BOUNDS.top + player.radius, Math.min(STAGE_BOUNDS.bottom - player.radius, player.y + dy));
        break;
      }
    }
  }, { passive: false });

  function endCanvasDrag(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === canvasDragTouchId) {
        canvasDragTouchId = null;
        break;
      }
    }
  }
  canvas.addEventListener('touchend', endCanvasDrag, { passive: false });
  canvas.addEventListener('touchcancel', () => { canvasDragTouchId = null; }, { passive: false });

  const joystickZone = document.getElementById('joystickZone');
  const joystickKnob = document.getElementById('joystickKnob');
  let joyOrigin = { x: 0, y: 0 };

  function handleJoystickMove(clientX, clientY) {
    const rect = joystickZone.getBoundingClientRect();
    const maxDist = rect.width * 0.32;

    let dx = clientX - joyOrigin.x;
    let dy = clientY - joyOrigin.y;
    const dist = Math.hypot(dx, dy);

    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }

    joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
    const normX = dx / maxDist;
    const normY = dy / maxDist;
    const mag = Math.hypot(normX, normY);
    if (mag > 0.08) {
      const boosted = Math.min(1, mag * 1.25);
      joyVector.x = (normX / mag) * boosted;
      joyVector.y = (normY / mag) * boosted;
    } else {
      joyVector.x = 0;
      joyVector.y = 0;
    }
  }

  function resetJoystick() {
    joyTouchId = null;
    joyVector.x = 0;
    joyVector.y = 0;
    joystickKnob.style.transform = 'translate(0px, 0px)';
  }

  joystickZone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isTouchDevice = true;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (joyTouchId === null) {
        joyTouchId = t.identifier;
        joyOrigin.x = t.clientX;
        joyOrigin.y = t.clientY;
        handleJoystickMove(t.clientX, t.clientY);
        break;
      }
    }
  }, { passive: false });

  joystickZone.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === joyTouchId) {
        handleJoystickMove(t.clientX, t.clientY);
        break;
      }
    }
  }, { passive: false });

  joystickZone.addEventListener('touchend', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joyTouchId) {
        resetJoystick();
        break;
      }
    }
  }, { passive: false });

  joystickZone.addEventListener('touchcancel', resetJoystick, { passive: false });

  const attackTouchBtn = document.getElementById('attackTouchBtn');
  attackTouchBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isTouchDevice = true;
    touchAttackHeld = true;
  }, { passive: false });
  attackTouchBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchAttackHeld = false;
  }, { passive: false });
  attackTouchBtn.addEventListener('touchcancel', () => {
    touchAttackHeld = false;
  });

  const modeButtons = document.querySelectorAll('.mode-btn');
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.getAttribute('data-mode');
      if (!MODES[selected]) return;
      if (currentRoute === 'GUARDIAN_3' && selected === 'ENDLESS') return;

      currentModeKey = selected;
      modeButtons.forEach(b => b.classList.remove('mode-active'));
      btn.classList.add('mode-active');
      modeDescText.textContent = MODES[selected].desc;

      if (currentRoute === 'GUARDIAN_1' && (selected === 'SPECIAL' || selected === 'ENDLESS')) {
        if (isEndlessUnlocked()) {
          btnEndlessMode.classList.add('show');
        }
      } else {
        btnEndlessMode.classList.remove('show');
      }

      renderBestRecordUI();
    });
  });

  document.getElementById('btnStartGame').addEventListener('click', startCountdownAndTrial);
  document.getElementById('btnRetryResult').addEventListener('click', startCountdownAndTrial);
  document.getElementById('btnQuickRetry').addEventListener('click', startCountdownAndTrial);

  function backToTitleScreen() {
    gameState = 'TITLE';
    resultOverlay.classList.add('hidden');
    countdownOverlay.classList.add('hidden');
    battleHud.classList.add('hidden');
    battleHud.classList.remove('flex');
    titleTopBar.classList.remove('hidden');
    titleOverlay.classList.remove('hidden');

    btnEndlessMode.classList.remove('show');
    if (currentRoute === 'GUARDIAN_1' && (currentModeKey === 'SPECIAL' || currentModeKey === 'ENDLESS') && isEndlessUnlocked()) {
      setTimeout(() => {
        if (gameState === 'TITLE' && currentRoute === 'GUARDIAN_1' && (currentModeKey === 'SPECIAL' || currentModeKey === 'ENDLESS')) {
          btnEndlessMode.classList.add('show');
        }
      }, 350);
    }

    renderBestRecordUI();
    updateFooterControlsVisibility();
    evaluateGuardian3UnlockAndTrigger();
  }

  document.getElementById('btnBackToTitle').addEventListener('click', backToTitleScreen);
  document.getElementById('btnHudTitle').addEventListener('click', backToTitleScreen);

  document.getElementById('btnResetBest').addEventListener('click', () => {
    const storageKey = getActiveBestStorageKey();
    const all = loadAllBestRecords();
    delete all[currentModeKey];
    localStorage.setItem(storageKey, JSON.stringify(all));
    renderBestRecordUI();
  });

  applyRouteThemeUI();
  resizeCanvas();
  evaluateGuardian3UnlockAndTrigger();

  let lastFrameTime = performance.now();
  function mainLoop(now) {
    const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
    lastFrameTime = now;

    updateGame(dt);
    renderGame(now / 1000);

    requestAnimationFrame(mainLoop);
  }
  requestAnimationFrame(mainLoop);
})();