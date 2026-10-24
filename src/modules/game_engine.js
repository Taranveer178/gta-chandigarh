// ============================================================================
// MODULE 5: MAIN GAME CONTROLLER, UI, MINIMAP, CHEATS & REACT/DOM SHELL
// ============================================================================
import {
  WORLD_CONFIG,
  LANDMARKS,
  SERVICE_STATIONS,
  VEHICLE_CATALOG,
  CORE_MISSIONS,
  MISSION_VARIATIONS,
  ALL_MISSIONS,
  CHEAT_CODES
} from './constants.js';
import { SoundEngine, loadGameState, saveGameState, DEFAULT_SAVE_STATE } from './audio_storage.js';
import { buildVehicleMesh, buildPlayerCharacterMesh, buildChandigarhWorld } from './world_builder.js';
import { TrafficAndPoliceManager } from './traffic_police.js';

export function bootGTAChandigarh() {
  const THREE = window.THREE;
  if (!THREE) {
    console.error('Three.js not loaded');
    return;
  }

  const saveState = loadGameState();
  const sound = new SoundEngine();
  sound.setVolume(saveState.settings.volume ?? 0.65);

  // Scene, Camera & Renderer
  const canvasContainer = document.getElementById('game-viewport');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#38bdf8');
  scene.fog = new THREE.FogExp2('#38bdf8', 0.0014);

  const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.4, 950);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvasContainer.innerHTML = '';
  canvasContainer.appendChild(renderer.domElement);

  // Lighting (Sun + Ambient + Hemisphere)
  const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.72);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.15);
  sunLight.position.set(220, 340, 180);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 900;
  const d = 260;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  scene.add(sunLight);

  // Build 3D Chandigarh Map
  const worldData = buildChandigarhWorld(THREE, scene);

  // Mark already collected trophies
  worldData.collectibles.forEach((t) => {
    if (saveState.collectedTrophies.includes(t.id)) {
      t.collected = true;
      t.mesh.visible = false;
    }
  });

  // Rain Particle System
  const rainCount = 1200;
  const rainGeo = new THREE.BufferGeometry();
  const rainPositions = new Float32Array(rainCount * 3);
  for (let i = 0; i < rainCount * 3; i += 3) {
    rainPositions[i] = (Math.random() - 0.5) * 180;
    rainPositions[i + 1] = Math.random() * 65;
    rainPositions[i + 2] = (Math.random() - 0.5) * 180;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
  const rainMat = new THREE.PointsMaterial({ color: 0xbae6fd, size: 0.35, transparent: true, opacity: 0.65 });
  const rainSystem = new THREE.Points(rainGeo, rainMat);
  rainSystem.visible = false;
  scene.add(rainSystem);

  // Mission Destination 3D Glowing Cylinder Beacon
  const beaconGeo = new THREE.CylinderGeometry(4.5, 4.5, 45, 24, 1, true);
  const beaconMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15,
    transparent: true,
    opacity: 0.38,
    side: THREE.DoubleSide
  });
  const missionBeacon = new THREE.Mesh(beaconGeo, beaconMat);
  missionBeacon.visible = false;
  scene.add(missionBeacon);

  // Mission Start Markers in 3D World
  const missionStartMeshes = [];
  const startRingGeo = new THREE.CylinderGeometry(3.5, 3.5, 1.5, 20, 1, true);
  const startRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
  CORE_MISSIONS.forEach((m) => {
    const firstStage = m.stages[0];
    const ring = new THREE.Mesh(startRingGeo, startRingMat);
    ring.position.set(firstStage.x, 0.8, firstStage.z);
    scene.add(ring);
    missionStartMeshes.push({ mission: m, mesh: ring, x: firstStage.x, z: firstStage.z });
  });

  // Player & Vehicle State
  const playerMesh = buildPlayerCharacterMesh(THREE);
  scene.add(playerMesh);

  const parkedVehicles = [];
  function spawnWorldVehicle(typeId, x, z, angle = 0, customColor = null) {
    const cust = saveState.vehicleCustomizations[typeId] || {};
    const color = customColor || cust.color || VEHICLE_CATALOG[typeId].defaultColor;
    const wheelColor = cust.wheelColor || '#cbd5e1';
    const mesh = buildVehicleMesh(THREE, typeId, color, wheelColor, typeId === 'police');
    mesh.position.set(x, 0, z);
    mesh.rotation.y = angle;
    scene.add(mesh);

    const spec = VEHICLE_CATALOG[typeId];
    const vObj = {
      type: typeId,
      spec,
      mesh,
      x,
      z,
      angle,
      speed: 0,
      damage: 0,
      fuel: 100,
      nos: 100,
      headlightsOn: false
    };
    parkedVehicles.push(vObj);
    return vObj;
  }

  // Spawn Player's Initial Selected Vehicle at Sector 17 / Sector 22
  const initialCar = spawnWorldVehicle(saveState.selectedVehicle || 'hatchback', -140, -75, 0);
  // Spawn extra signature vehicles near landmarks so player can switch anytime
  spawnWorldVehicle('autorickshaw', -122, -75, 0.4);
  spawnWorldVehicle('suv', -156, -75, -0.3);
  spawnWorldVehicle('bike', -132, -62, 1.2);
  spawnWorldVehicle('sports', 385, 120, 0);
  spawnWorldVehicle('bus', -120, 115, 0);
  spawnWorldVehicle('police', -110, -260, 0);
  spawnWorldVehicle('ambulance', -320, -180, 0);

  const playerState = {
    x: initialCar.x,
    z: initialCar.z,
    y: 0,
    vy: 0,
    angle: 0,
    speed: 0,
    inVehicle: true,
    currentVehicle: initialCar,
    health: saveState.health || 100,
    cameraMode: 0, // 0: Chase, 1: Far Chase, 2: Cockpit, 3: Top-Down
    superJump: false,
    slowMo: false,
    nosActive: false,
    waypoint: null
  };
  playerMesh.visible = false;

  // Traffic & Police Manager
  const trafficPolice = new TrafficAndPoliceManager(THREE, scene, worldData, sound);
  trafficPolice.initTraffic(32);

  // Weather & Time of Day State
  const envState = {
    timeHours: 10.5, // 0..24
    weather: 'sunny', // 'sunny', 'cloudy', 'rain', 'fog', 'sunset', 'night'
    autoCycle: true
  };

  // Active Mission State
  let activeMission = null;
  let missionStageIdx = 0;
  let missionTimer = 0;
  let missionStartDamage = 0;
  let missionUsedCheats = false;
  let taxiFareActive = null;

  // Keyboard & Touch Input State
  const keys = {};
  let gamePaused = false;
  let gameStarted = false;

  // Notification Toast Queue
  function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    const bg =
      type === 'success'
        ? 'bg-emerald-900/95 border-emerald-400 text-emerald-100'
        : type === 'warn'
        ? 'bg-rose-950/95 border-rose-500 text-rose-100'
        : 'bg-slate-900/95 border-amber-400 text-amber-100';
    el.className = `px-4 py-2.5 rounded-lg border-l-4 shadow-xl text-xs font-semibold tracking-wide transition-all duration-300 ${bg}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, 3600);
  }

  // Apply Weather & Time-of-Day Visuals
  function applyEnvironmentVisuals(dt) {
    if (envState.autoCycle && !gamePaused) {
      envState.timeHours = (envState.timeHours + dt * 0.04) % 24;
    }
    const h = envState.timeHours;
    const isNight = h < 6 || h >= 19.5 || envState.weather === 'night';
    const isSunset = (h >= 17.2 && h < 19.5) || envState.weather === 'sunset';

    let skyHex = '#38bdf8';
    let fogDensity = 0.0013;
    let sunIntensity = 1.15;

    if (envState.weather === 'rain') {
      skyHex = '#334155';
      fogDensity = 0.0032;
      sunIntensity = 0.55;
      rainSystem.visible = true;
    } else if (envState.weather === 'fog') {
      skyHex = '#94a3b8';
      fogDensity = 0.0065;
      sunIntensity = 0.5;
      rainSystem.visible = false;
    } else if (isNight) {
      skyHex = '#090d16';
      fogDensity = 0.0022;
      sunIntensity = 0.18;
      rainSystem.visible = false;
    } else if (isSunset) {
      skyHex = '#ea580c';
      fogDensity = 0.0018;
      sunIntensity = 0.78;
      rainSystem.visible = false;
    } else if (envState.weather === 'cloudy') {
      skyHex = '#64748b';
      fogDensity = 0.0022;
      sunIntensity = 0.72;
      rainSystem.visible = false;
    } else {
      skyHex = '#38bdf8';
      fogDensity = 0.0012;
      sunIntensity = 1.18;
      rainSystem.visible = false;
    }

    scene.background.set(skyHex);
    scene.fog.color.set(skyHex);
    scene.fog.density = fogDensity;
    sunLight.intensity = sunIntensity;
    hemiLight.intensity = isNight ? 0.28 : 0.72;

    // Animate Rain Particles around player
    if (rainSystem.visible) {
      rainSystem.position.set(playerState.x, 0, playerState.z);
      const pos = rainGeo.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= 42 * dt;
        if (pos[i] < 0) pos[i] = 62;
      }
      rainGeo.attributes.position.needsUpdate = true;
    }
  }

  // Mission System Execution
  function startMission(missionId) {
    const m = ALL_MISSIONS.find((item) => item.id === missionId);
    if (!m) return;

    activeMission = m;
    missionStageIdx = 0;
    missionTimer = m.timeLimit;
    missionUsedCheats = false;
    taxiFareActive = null;

    if (m.weather) {
      envState.weather = m.weather;
      if (m.weather === 'night') envState.timeHours = 23.0;
      else if (m.weather === 'sunset') envState.timeHours = 18.0;
      else envState.timeHours = 11.0;
    }

    if (m.spawnVehicle) {
      const sv = spawnWorldVehicle(m.spawnVehicle, playerState.x + 4, playerState.z + 4, playerState.angle);
      enterVehicle(sv);
    }

    if (m.startWanted) {
      trafficPolice.setWantedLevelDirect(m.startWanted);
    } else {
      trafficPolice.setWantedLevelDirect(0);
    }

    missionStartDamage = playerState.currentVehicle ? playerState.currentVehicle.damage : 0;
    sound.playChime('start');
    showToast(`🎯 Started ${m.title}`, 'info');
    closeAllModals();
    updateMissionHUD();
  }

  function failMission(reason) {
    if (!activeMission) return;
    const failedTitle = activeMission.title;
    activeMission = null;
    missionBeacon.visible = false;
    sound.playChime('fail');
    showToast(`❌ MISSION FAILED (${failedTitle}): ${reason}`, 'warn');
    updateMissionHUD();
  }

  function completeMission() {
    if (!activeMission) return;
    const m = activeMission;
    activeMission = null;
    missionBeacon.visible = false;

    saveState.money += m.reward;
    if (!saveState.completedMissions.includes(m.id)) {
      saveState.completedMissions.push(m.id);
    }
    saveState.stats.missionsCompleted = (saveState.stats.missionsCompleted || 0) + 1;
    saveGameState(saveState);

    sound.playChime('success');
    const cheatTag = missionUsedCheats ? ' (Cheat-Assisted Run)' : '';
    showToast(`🏆 MISSION PASSED: ${m.title}! Reward +₹${m.reward.toLocaleString()}${cheatTag}`, 'success');
    updateMissionHUD();
    updateEconomyHUD();
  }

  function updateMissionLogic(dt) {
    if (!activeMission) {
      missionBeacon.visible = false;
      return;
    }

    missionTimer -= dt;
    if (missionTimer <= 0) {
      failMission('Timer expired before objectives were completed!');
      return;
    }

    const rules = activeMission.rules || {};
    const curDamage = playerState.currentVehicle
      ? Math.max(0, playerState.currentVehicle.damage - missionStartDamage)
      : 0;

    if (rules.maxDamage !== undefined && curDamage > rules.maxDamage) {
      failMission(`Vehicle damage (${Math.round(curDamage)}%) exceeded limit (${rules.maxDamage}%)!`);
      return;
    }

    if (rules.speedLimit && Math.abs(playerState.speed) * 2.2 > rules.speedLimit + 4) {
      failMission(`Exceeded strict ${rules.speedLimit} km/h speed limit!`);
      return;
    }

    const stage = activeMission.stages[missionStageIdx];
    if (!stage) {
      completeMission();
      return;
    }

    // Position 3D glowing mission beacon at current stage target
    missionBeacon.visible = true;
    missionBeacon.position.set(stage.x, 22, stage.z);
    missionBeacon.rotation.y += dt * 1.5;

    const dist = Math.hypot(playerState.x - stage.x, playerState.z - stage.z);
    const speedKmh = Math.abs(playerState.speed) * 2.2;

    if (stage.type === 'goto' && dist <= stage.radius) {
      missionStageIdx++;
      sound.playChime('start');
      if (missionStageIdx >= activeMission.stages.length) completeMission();
      else showToast(`✅ Checkpoint Reached! Next: ${activeMission.stages[missionStageIdx].label}`, 'info');
    } else if (stage.type === 'park' && dist <= stage.radius && speedKmh < 4.5) {
      missionStageIdx++;
      sound.playChime('start');
      if (missionStageIdx >= activeMission.stages.length) completeMission();
      else showToast(`🅿️ Parked Cleanly! Proceed to next bay.`, 'info');
    } else if (stage.type === 'trigger_wanted' && dist <= stage.radius) {
      trafficPolice.setWantedLevelDirect(stage.wantedTarget || 2);
      missionStageIdx++;
      sound.playChime('start');
      showToast(`🚨 CCTV Red-Light Camera Triggered! Lose the police and reach the Safehouse!`, 'warn');
    } else if (stage.type === 'escape_and_goto' && dist <= stage.radius) {
      if (trafficPolice.wantedLevel > 0 && trafficPolice.lineOfSight) {
        // Must break line of sight or clear wanted
      } else {
        trafficPolice.setWantedLevelDirect(0);
        missionStageIdx++;
        if (missionStageIdx >= activeMission.stages.length) completeMission();
      }
    }

    updateMissionHUD();
  }

  // Enter / Exit Vehicle Logic
  function enterVehicle(vObj) {
    playerState.inVehicle = true;
    playerState.currentVehicle = vObj;
    playerState.x = vObj.x;
    playerState.z = vObj.z;
    playerState.angle = vObj.angle;
    playerState.speed = vObj.speed || 0;
    playerMesh.visible = false;
    showToast(`🚗 Entered ${vObj.spec.name}`, 'info');
  }

  function toggleEnterExitVehicle() {
    if (playerState.inVehicle && playerState.currentVehicle) {
      const v = playerState.currentVehicle;
      v.speed = 0;
      playerState.inVehicle = false;
      playerState.x = v.x - Math.cos(v.angle) * 2.4;
      playerState.z = v.z + Math.sin(v.angle) * 2.4;
      playerState.speed = 0;
      playerMesh.position.set(playerState.x, 0, playerState.z);
      playerMesh.visible = true;
      showToast(`🚶 Stepped out on foot. Press E near any vehicle to enter.`, 'info');
    } else {
      // Find nearest parked or AI vehicle within 6.5m
      let bestVeh = null;
      let bestDist = 7.0;
      for (const pv of parkedVehicles) {
        const d = Math.hypot(pv.x - playerState.x, pv.z - playerState.z);
        if (d < bestDist) {
          bestDist = d;
          bestVeh = pv;
        }
      }
      if (!bestVeh) {
        // Commandandeer nearest AI traffic vehicle
        for (const ai of trafficPolice.aiVehicles) {
          const d = Math.hypot(ai.x - playerState.x, ai.z - playerState.z);
          if (d < bestDist) {
            bestDist = d;
            bestVeh = spawnWorldVehicle(ai.type, ai.x, ai.z, ai.angle);
            ai.x += 120; // Move AI slot away
            break;
          }
        }
      }
      if (bestVeh) {
        enterVehicle(bestVeh);
      } else {
        showToast('No vehicle within reach! Walk closer or use SPAWNCAR in Cheat Console (`).', 'warn');
      }
    }
  }

  // Execute Cheat Code
  function executeCheatCode(rawInput) {
    const code = (rawInput || '').trim().toUpperCase();
    const feedbackEl = document.getElementById('cheat-feedback');
    if (!code) return;

    if (!CHEAT_CODES[code]) {
      if (feedbackEl) {
        feedbackEl.textContent = `❌ Invalid Cheat Code: "${code}". Try FULLHEALTH, REPAIRCAR, ADD5000, SPAWNSUV, NOS, CLEARCHASE...`;
        feedbackEl.className = 'text-xs mt-2 font-medium text-rose-400';
      }
      sound.playChime('fail');
      return;
    }

    missionUsedCheats = true;
    saveState.stats.cheatsUsed = (saveState.stats.cheatsUsed || 0) + 1;

    switch (code) {
      case 'FULLHEALTH':
        playerState.health = 100;
        break;
      case 'REPAIRCAR':
        if (playerState.currentVehicle) {
          playerState.currentVehicle.damage = 0;
          playerState.currentVehicle.fuel = 100;
          playerState.currentVehicle.nos = 100;
        }
        break;
      case 'ADD5000':
        saveState.money += 5000;
        saveGameState(saveState);
        break;
      case 'SPAWNCAR': {
        const sx = playerState.x + Math.sin(playerState.angle) * 6;
        const sz = playerState.z + Math.cos(playerState.angle) * 6;
        const v = spawnWorldVehicle('sedan', sx, sz, playerState.angle);
        enterVehicle(v);
        break;
      }
      case 'SPAWNSUV': {
        const sx = playerState.x + Math.sin(playerState.angle) * 6.5;
        const sz = playerState.z + Math.cos(playerState.angle) * 6.5;
        const v = spawnWorldVehicle('suv', sx, sz, playerState.angle);
        enterVehicle(v);
        break;
      }
      case 'SPAWNBIKE': {
        const sx = playerState.x + Math.sin(playerState.angle) * 5;
        const sz = playerState.z + Math.cos(playerState.angle) * 5;
        const v = spawnWorldVehicle('bike', sx, sz, playerState.angle);
        enterVehicle(v);
        break;
      }
      case 'NOS':
        if (playerState.currentVehicle) {
          playerState.currentVehicle.nos = 100;
          playerState.nosActive = true;
          playerState.speed = Math.max(playerState.speed, 48);
        }
        break;
      case 'CLEARCHASE':
        trafficPolice.setWantedLevelDirect(0);
        break;
      case 'WANTEDUP':
        trafficPolice.setWantedLevelDirect(trafficPolice.wantedLevel + 1);
        break;
      case 'WANTEDDOWN':
        trafficPolice.setWantedLevelDirect(trafficPolice.wantedLevel - 1);
        break;
      case 'SUNNYDAY':
        envState.weather = 'sunny';
        envState.timeHours = 11.5;
        break;
      case 'RAINMODE':
        envState.weather = 'rain';
        break;
      case 'MIDNIGHT':
        envState.weather = 'night';
        envState.timeHours = 0.0;
        break;
      case 'SUPERJUMP':
        playerState.superJump = !playerState.superJump;
        break;
      case 'SLOWMO':
        playerState.slowMo = !playerState.slowMo;
        break;
    }

    sound.playChime('success');
    const desc = CHEAT_CODES[code].desc;
    if (feedbackEl) {
      feedbackEl.textContent = `✅ CHEAT ACTIVATED [${code}]: ${desc}`;
      feedbackEl.className = 'text-xs mt-2 font-medium text-emerald-400';
    }
    showToast(`⚡ CHEAT ACTIVATED: ${code} — ${desc}`, 'success');
    updateEconomyHUD();
  }

  // Minimap & Full Map Canvas Rendering
  const minimapCanvas = document.getElementById('minimap-canvas');
  const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;
  const fullmapCanvas = document.getElementById('fullmap-canvas');
  const fullmapCtx = fullmapCanvas ? fullmapCanvas.getContext('2d') : null;

  function drawMinimap() {
    if (!minimapCtx) return;
    const w = minimapCanvas.width;
    const h = minimapCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = 0.34;

    minimapCtx.clearRect(0, 0, w, h);
    minimapCtx.save();

    // Circular clip
    minimapCtx.beginPath();
    minimapCtx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
    minimapCtx.clip();

    // Background lawn
    minimapCtx.fillStyle = '#0f291e';
    minimapCtx.fillRect(0, 0, w, h);

    // Rotate with player heading
    minimapCtx.translate(cx, cy);
    minimapCtx.rotate(playerState.angle - Math.PI);

    const toMapX = (wx) => (wx - playerState.x) * scale;
    const toMapY = (wz) => (wz - playerState.z) * scale;

    // Draw Roads
    minimapCtx.strokeStyle = '#334155';
    minimapCtx.lineWidth = WORLD_CONFIG.ROAD_WIDTH * scale;
    WORLD_CONFIG.ROADS_X.forEach((rx) => {
      minimapCtx.beginPath();
      minimapCtx.moveTo(toMapX(rx), toMapY(-800));
      minimapCtx.lineTo(toMapX(rx), toMapY(800));
      minimapCtx.stroke();
    });
    WORLD_CONFIG.ROADS_Z.forEach((rz) => {
      minimapCtx.beginPath();
      minimapCtx.moveTo(toMapX(-800), toMapY(rz));
      minimapCtx.lineTo(toMapX(800), toMapY(rz));
      minimapCtx.stroke();
    });

    // Draw Landmarks
    LANDMARKS.forEach((lm) => {
      minimapCtx.fillStyle = lm.color;
      minimapCtx.beginPath();
      minimapCtx.arc(toMapX(lm.x), toMapY(lm.z), 4.5, 0, Math.PI * 2);
      minimapCtx.fill();
    });

    // Draw AI Traffic dots
    minimapCtx.fillStyle = '#94a3b8';
    trafficPolice.aiVehicles.forEach((ai) => {
      minimapCtx.fillRect(toMapX(ai.x) - 1.5, toMapY(ai.z) - 1.5, 3, 3);
    });

    // Draw Police Units (Flashing Red/Blue)
    const copFlash = Math.floor(performance.now() / 200) % 2 === 0;
    trafficPolice.policeUnits.forEach((cop) => {
      minimapCtx.fillStyle = copFlash ? '#ef4444' : '#3b82f6';
      minimapCtx.beginPath();
      minimapCtx.arc(toMapX(cop.x), toMapY(cop.z), 4, 0, Math.PI * 2);
      minimapCtx.fill();
    });

    // Draw Active Mission Objective Target or Custom Waypoint
    const targetStage = activeMission ? activeMission.stages[missionStageIdx] : playerState.waypoint;
    if (targetStage) {
      const tx = toMapX(targetStage.x);
      const ty = toMapY(targetStage.z);
      minimapCtx.strokeStyle = '#facc15';
      minimapCtx.lineWidth = 2;
      minimapCtx.setLineDash([4, 4]);
      minimapCtx.beginPath();
      minimapCtx.moveTo(0, 0);
      minimapCtx.lineTo(tx, ty);
      minimapCtx.stroke();
      minimapCtx.setLineDash([]);

      minimapCtx.fillStyle = '#facc15';
      minimapCtx.beginPath();
      minimapCtx.arc(tx, ty, 6, 0, Math.PI * 2);
      minimapCtx.fill();
    }

    minimapCtx.restore();

    // Player Arrow in Center
    minimapCtx.save();
    minimapCtx.translate(cx, cy);
    minimapCtx.fillStyle = '#38bdf8';
    minimapCtx.strokeStyle = '#ffffff';
    minimapCtx.lineWidth = 1.5;
    minimapCtx.beginPath();
    minimapCtx.moveTo(0, -7);
    minimapCtx.lineTo(-5.5, 6);
    minimapCtx.lineTo(0, 3);
    minimapCtx.lineTo(5.5, 6);
    minimapCtx.closePath();
    minimapCtx.fill();
    minimapCtx.stroke();
    minimapCtx.restore();
  }

  function drawFullMap() {
    if (!fullmapCtx || !fullmapCanvas) return;
    const w = fullmapCanvas.width;
    const h = fullmapCanvas.height;
    const scale = w / WORLD_CONFIG.SIZE;
    const toX = (wx) => (wx + WORLD_CONFIG.HALF_SIZE) * scale;
    const toY = (wz) => (wz + WORLD_CONFIG.HALF_SIZE) * scale;

    fullmapCtx.fillStyle = '#0f291e';
    fullmapCtx.fillRect(0, 0, w, h);

    // Roads
    fullmapCtx.strokeStyle = '#334155';
    fullmapCtx.lineWidth = WORLD_CONFIG.ROAD_WIDTH * scale;
    WORLD_CONFIG.ROADS_X.forEach((rx) => {
      fullmapCtx.beginPath();
      fullmapCtx.moveTo(toX(rx), 0);
      fullmapCtx.lineTo(toX(rx), h);
      fullmapCtx.stroke();
    });
    WORLD_CONFIG.ROADS_Z.forEach((rz) => {
      fullmapCtx.beginPath();
      fullmapCtx.moveTo(0, toY(rz));
      fullmapCtx.lineTo(w, toY(rz));
      fullmapCtx.stroke();
    });

    // Landmarks
    LANDMARKS.forEach((lm) => {
      const lx = toX(lm.x);
      const ly = toY(lm.z);
      fullmapCtx.fillStyle = lm.color;
      fullmapCtx.beginPath();
      fullmapCtx.arc(lx, ly, 7, 0, Math.PI * 2);
      fullmapCtx.fill();
      fullmapCtx.fillStyle = '#f8fafc';
      fullmapCtx.font = 'bold 10px Inter, sans-serif';
      fullmapCtx.fillText(`${lm.icon} ${lm.sector}`, lx + 9, ly + 4);
    });

    // Service stations
    SERVICE_STATIONS.forEach((st) => {
      fullmapCtx.fillStyle = st.type === 'fuel' ? '#f97316' : st.type === 'garage' ? '#a855f7' : '#22c55e';
      fullmapCtx.fillRect(toX(st.x) - 4, toY(st.z) - 4, 8, 8);
    });

    // Waypoint
    if (playerState.waypoint) {
      fullmapCtx.strokeStyle = '#facc15';
      fullmapCtx.lineWidth = 2.5;
      fullmapCtx.beginPath();
      fullmapCtx.arc(toX(playerState.waypoint.x), toY(playerState.waypoint.z), 9, 0, Math.PI * 2);
      fullmapCtx.stroke();
    }

    // Player marker
    fullmapCtx.fillStyle = '#38bdf8';
    fullmapCtx.beginPath();
    fullmapCtx.arc(toX(playerState.x), toY(playerState.z), 6.5, 0, Math.PI * 2);
    fullmapCtx.fill();
  }

  // Update DOM HUD Elements
  function updateEconomyHUD() {
    const moneyEl = document.getElementById('hud-money');
    if (moneyEl) moneyEl.textContent = `₹${Math.round(saveState.money).toLocaleString()}`;
    const trophyEl = document.getElementById('hud-trophies');
    if (trophyEl) trophyEl.textContent = `${saveState.collectedTrophies.length}/${WORLD_CONFIG.COLLECTIBLE_COUNT}`;
  }

  function updateMissionHUD() {
    const box = document.getElementById('hud-mission-panel');
    if (!box) return;
    if (!activeMission) {
      if (taxiFareActive) {
        box.innerHTML = `
          <div class="text-xs font-bold uppercase tracking-wider text-amber-400">🚕 Side Activity: Instant Taxi Fare</div>
          <div class="text-sm font-semibold text-white mt-0.5">${taxiFareActive.label}</div>
          <div class="text-xs text-slate-300 mt-1">Fare Bonus: ₹${taxiFareActive.reward}</div>
        `;
      } else {
        box.innerHTML = `
          <div class="text-xs font-bold uppercase tracking-wider text-sky-400">Free-Roam Mode — Chandigarh</div>
          <div class="text-xs text-slate-300 mt-0.5">Drive into any blue glowing ring or press <span class="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300 font-mono">Tab</span> to launch 32 Missions.</div>
        `;
      }
      return;
    }

    const st = activeMission.stages[missionStageIdx];
    const mins = Math.floor(missionTimer / 60);
    const secs = Math.floor(missionTimer % 60).toString().padStart(2, '0');
    box.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-amber-400">${activeMission.title}</span>
        <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-600">⏱ ${mins}:${secs}</span>
      </div>
      <div class="text-sm font-semibold text-white mt-1">${st ? st.label : 'Complete!'}</div>
      <div class="text-[11px] text-slate-300 mt-0.5">Stage ${missionStageIdx + 1}/${activeMission.stages.length} • Reward: ₹${activeMission.reward.toLocaleString()}</div>
    `;
  }

  // Main Physics & Frame Update Loop
  let lastTime = performance.now();

  function updatePhysics(dt) {
    // 1. Check Landmark Location Banner
    let currentLandmark = 'Chandigarh Urban Sector Grid';
    for (const lm of LANDMARKS) {
      if (Math.hypot(playerState.x - lm.x, playerState.z - lm.z) <= lm.radius) {
        currentLandmark = `${lm.icon} ${lm.name} (${lm.sector})`;
        break;
      }
    }
    const locEl = document.getElementById('hud-location');
    if (locEl) locEl.textContent = currentLandmark;

    // 2. Rotate Open Hand Monument & Bob Sukhna Boats
    if (worldData.openHandMesh) {
      worldData.openHandMesh.rotation.y += dt * 0.45;
    }
    const nowSec = performance.now() * 0.001;
    worldData.sukhnaBoats.forEach((b) => {
      b.mesh.position.z = b.baseZ + Math.sin(nowSec + b.phase) * 14;
    });

    // 3. Collectible Trophy Pickup Check
    worldData.collectibles.forEach((t) => {
      if (!t.collected) {
        t.mesh.rotation.y += dt * 2.2;
        if (Math.hypot(playerState.x - t.x, playerState.z - t.z) < 5.5) {
          t.collected = true;
          t.mesh.visible = false;
          saveState.collectedTrophies.push(t.id);
          saveState.money += 1000;
          saveGameState(saveState);
          sound.playChime('success');
          showToast(`✋ Collected Golden Open Hand Trophy (${saveState.collectedTrophies.length}/20)! +₹1,000`, 'success');
          updateEconomyHUD();
        }
      }
    });

    // 4. Service Station Proximity Check (Fuel, Garage, Safehouse)
    for (const st of SERVICE_STATIONS) {
      if (Math.hypot(playerState.x - st.x, playerState.z - st.z) < 8.5 && Math.abs(playerState.speed) < 6) {
        if (st.type === 'fuel' && playerState.currentVehicle && playerState.currentVehicle.fuel < 95) {
          playerState.currentVehicle.fuel = 100;
          playerState.currentVehicle.nos = 100;
          saveState.money = Math.max(0, saveState.money - 150);
          sound.playChime('start');
          showToast(`⛽ Refueled tank & NOS at ${st.name} (-₹150)`, 'info');
          updateEconomyHUD();
        } else if (st.type === 'safehouse' && trafficPolice.wantedLevel > 0 && !trafficPolice.lineOfSight) {
          trafficPolice.setWantedLevelDirect(0);
          playerState.health = 100;
          saveGameState(saveState);
          sound.playChime('success');
          showToast(`🏠 Laid low at ${st.name}! Wanted Level cleared & game saved.`, 'success');
        }
      }
    }

    // 5. Player Driving vs On-Foot Physics
    const forward = keys['KeyW'] || keys['ArrowUp'] ? 1 : 0;
    const backward = keys['KeyS'] || keys['ArrowDown'] ? 1 : 0;
    const left = keys['KeyA'] || keys['ArrowLeft'] ? 1 : 0;
    const right = keys['KeyD'] || keys['ArrowRight'] ? 1 : 0;
    const handbrake = keys['Space'] ? 1 : 0;
    const boost = keys['ShiftLeft'] || keys['ShiftRight'] || playerState.nosActive ? 1 : 0;

    if (playerState.inVehicle && playerState.currentVehicle) {
      const v = playerState.currentVehicle;
      const spec = v.spec;
      const cust = saveState.vehicleCustomizations[v.type] || { engineLevel: 1, armorLevel: 1 };
      const engineMult = 1 + (cust.engineLevel - 1) * 0.12;
      const maxSpd = spec.maxSpeed * engineMult;
      const rainGripMult = envState.weather === 'rain' ? 0.78 : 1.0;

      // Acceleration & Braking
      if (v.fuel > 0) {
        if (forward) {
          playerState.speed += spec.accel * engineMult * dt;
        } else if (backward) {
          if (playerState.speed > 2) playerState.speed -= spec.brake * dt;
          else playerState.speed -= spec.accel * 0.55 * dt;
        } else {
          playerState.speed *= Math.pow(0.28, dt);
        }
      } else {
        playerState.speed *= Math.pow(0.2, dt);
      }

      // Nitro Boost
      if (boost && v.nos > 5 && forward) {
        playerState.speed += 28 * dt;
        v.nos = Math.max(0, v.nos - 24 * dt);
      } else {
        v.nos = Math.min(100, v.nos + 4 * dt);
        playerState.nosActive = false;
      }

      // Handbrake Drift
      if (handbrake) {
        playerState.speed *= Math.pow(0.08, dt);
        if (Math.abs(playerState.speed) > 14 && Math.random() < 0.25) {
          sound.playSkid();
        }
      }

      playerState.speed = Math.max(-maxSpd * 0.42, Math.min(maxSpd * (boost ? 1.25 : 1), playerState.speed));

      // Steering
      if (Math.abs(playerState.speed) > 0.6) {
        const dirSign = playerState.speed >= 0 ? 1 : -1;
        const driftBoost = handbrake ? 1.45 : 1.0;
        const steerAmount = (left - right) * spec.turnRate * rainGripMult * driftBoost * dirSign * dt;
        playerState.angle += steerAmount;
      }

      // Velocity displacement
      const nextX = playerState.x + Math.sin(playerState.angle) * playerState.speed * dt;
      const nextZ = playerState.z + Math.cos(playerState.angle) * playerState.speed * dt;

      // Building / Roundabout Collider Check
      let collided = false;
      for (const col of worldData.colliders) {
        if (Math.abs(nextX - col.x) < col.hw + 1.5 && Math.abs(nextZ - col.z) < col.hd + 1.5) {
          collided = true;
          const impact = Math.abs(playerState.speed);
          playerState.speed = -playerState.speed * 0.38;
          if (impact > 10) {
            sound.playCrash(impact / 30);
            v.damage = Math.min(100, v.damage + impact * 0.28);
            if (activeMission && activeMission.rules?.noCrash) {
              failMission(`Crashed into ${col.label}!`);
            }
          }
          break;
        }
      }

      // AI Vehicle Collision Check
      for (const ai of trafficPolice.aiVehicles) {
        if (Math.hypot(nextX - ai.x, nextZ - ai.z) < 3.4) {
          collided = true;
          const impact = Math.abs(playerState.speed - ai.speed);
          playerState.speed *= -0.35;
          sound.playCrash(impact / 25);
          v.damage = Math.min(100, v.damage + Math.max(2, impact * 0.35));
          trafficPolice.reportViolation('Collided with Civilian Traffic', 14, 800, showToast);
          if (activeMission && activeMission.rules?.noCrash) {
            failMission('Collided with civilian vehicle!');
          }
          break;
        }
      }

      if (!collided) {
        playerState.x = Math.max(-760, Math.min(760, nextX));
        playerState.z = Math.max(-760, Math.min(760, nextZ));
      }

      // Fuel consumption & distance tracking
      const distMoved = Math.abs(playerState.speed) * dt;
      v.fuel = Math.max(0, v.fuel - distMoved * 0.015);
      saveState.stats.distanceDrivenKm = (saveState.stats.distanceDrivenKm || 0) + distMoved * 0.001;

      v.x = playerState.x;
      v.z = playerState.z;
      v.angle = playerState.angle;
      v.speed = playerState.speed;
      v.mesh.position.set(v.x, 0, v.z);
      v.mesh.rotation.y = v.angle;

      // Spin wheels
      if (v.mesh.userData.wheels) {
        v.mesh.userData.wheels.forEach((w) => {
          w.rotation.x += playerState.speed * dt * 1.4;
        });
      }
    } else {
      // On-Foot Movement & Super-Jump
      const walkSpeed = (boost ? 14 : 8.5) * (forward - backward);
      playerState.speed = walkSpeed;
      playerState.angle += (left - right) * 2.8 * dt;

      const nx = playerState.x + Math.sin(playerState.angle) * walkSpeed * dt;
      const nz = playerState.z + Math.cos(playerState.angle) * walkSpeed * dt;
      playerState.x = Math.max(-760, Math.min(760, nx));
      playerState.z = Math.max(-760, Math.min(760, nz));

      if (handbrake && playerState.y <= 0.05) {
        playerState.vy = playerState.superJump ? 26 : 9.5;
      }
      playerState.y += playerState.vy * dt;
      if (playerState.y > 0) {
        playerState.vy -= 24 * dt;
      } else {
        playerState.y = 0;
        playerState.vy = 0;
      }

      playerMesh.position.set(playerState.x, playerState.y, playerState.z);
      playerMesh.rotation.y = playerState.angle;
    }

    // 6. Camera Follow Modes
    const camAngle = playerState.angle;
    if (playerState.cameraMode === 0) {
      // Standard 3rd-Person Chase
      const targetX = playerState.x - Math.sin(camAngle) * 11.5;
      const targetZ = playerState.z - Math.cos(camAngle) * 11.5;
      camera.position.lerp(new THREE.Vector3(targetX, playerState.y + 5.2, targetZ), Math.min(1, dt * 8));
      camera.lookAt(playerState.x + Math.sin(camAngle) * 6, playerState.y + 1.6, playerState.z + Math.cos(camAngle) * 6);
    } else if (playerState.cameraMode === 1) {
      // Far Cinematic Chase
      const targetX = playerState.x - Math.sin(camAngle) * 18.5;
      const targetZ = playerState.z - Math.cos(camAngle) * 18.5;
      camera.position.lerp(new THREE.Vector3(targetX, playerState.y + 8.8, targetZ), Math.min(1, dt * 7));
      camera.lookAt(playerState.x + Math.sin(camAngle) * 8, playerState.y + 1.8, playerState.z + Math.cos(camAngle) * 8);
    } else if (playerState.cameraMode === 2) {
      // 1st-Person Hood / Cockpit Camera
      const hoodX = playerState.x + Math.sin(camAngle) * 0.8;
      const hoodZ = playerState.z + Math.cos(camAngle) * 0.8;
      camera.position.set(hoodX, playerState.y + 1.65, hoodZ);
      camera.lookAt(playerState.x + Math.sin(camAngle) * 30, playerState.y + 1.5, playerState.z + Math.cos(camAngle) * 30);
    } else {
      // Classic GTA Top-Down Helicopter View
      camera.position.set(playerState.x, 68, playerState.z - 8);
      camera.lookAt(playerState.x, 0, playerState.z);
    }

    // 7. Check Free-Roam Mission Trigger Rings
    if (!activeMission) {
      for (const item of missionStartMeshes) {
        item.mesh.rotation.y += dt * 1.2;
        if (Math.hypot(playerState.x - item.x, playerState.z - item.z) < 4.5 && Math.abs(playerState.speed) < 8) {
          startMission(item.mission.id);
          break;
        }
      }
    }

    // 8. Check Instant Side Taxi Fare
    if (taxiFareActive && !activeMission) {
      if (Math.hypot(playerState.x - taxiFareActive.x, playerState.z - taxiFareActive.z) < 15) {
        saveState.money += taxiFareActive.reward;
        saveGameState(saveState);
        sound.playChime('success');
        showToast(`🚕 Taxi Fare Completed! Earned +₹${taxiFareActive.reward}`, 'success');
        taxiFareActive = null;
        missionBeacon.visible = false;
        updateMissionHUD();
        updateEconomyHUD();
      } else {
        missionBeacon.visible = true;
        missionBeacon.position.set(taxiFareActive.x, 22, taxiFareActive.z);
      }
    }

    // 9. Update HUD Gauges (Speed, Fuel, Damage, Wanted Stars, Traffic Signal Indicator)
    const speedKmh = Math.round(Math.abs(playerState.speed) * 2.2);
    const speedEl = document.getElementById('hud-speed');
    if (speedEl) speedEl.textContent = speedKmh;

    const vehNameEl = document.getElementById('hud-vehicle-name');
    if (vehNameEl) {
      vehNameEl.textContent = playerState.inVehicle && playerState.currentVehicle
        ? playerState.currentVehicle.spec.name
        : 'On Foot (Press E near car)';
    }

    const fuelBar = document.getElementById('hud-fuel-bar');
    const dmgBar = document.getElementById('hud-damage-bar');
    const nosBar = document.getElementById('hud-nos-bar');
    if (playerState.currentVehicle) {
      if (fuelBar) fuelBar.style.width = `${Math.round(playerState.currentVehicle.fuel)}%`;
      if (dmgBar) dmgBar.style.width = `${Math.round(100 - playerState.currentVehicle.damage)}%`;
      if (nosBar) nosBar.style.width = `${Math.round(playerState.currentVehicle.nos)}%`;
    }

    // Wanted Stars Display
    const starsEl = document.getElementById('hud-wanted-stars');
    const wantedDescEl = document.getElementById('hud-wanted-status');
    if (starsEl) {
      let starsHtml = '';
      for (let s = 1; s <= 5; s++) {
        const active = s <= trafficPolice.wantedLevel;
        starsHtml += `<span class="${active ? 'text-amber-400 animate-pulse drop-shadow' : 'text-slate-700'} text-lg">★</span>`;
      }
      starsEl.innerHTML = starsHtml;
    }
    if (wantedDescEl) {
      const labels = [
        'Level 0: Normal Patrol',
        `Level 1: Challan Fine ₹${trafficPolice.finePending} (Press P)`,
        'Level 2: PCR Unit Pursuit',
        'Level 3: Tactical Roadblock',
        'Level 4: Heavy Box-In Pursuit',
        'Level 5: Citywide Lockdown'
      ];
      wantedDescEl.textContent = labels[trafficPolice.wantedLevel] || '';
    }

    // Nearest Traffic Light Indicator on HUD
    const { signal, dist } = trafficPolice.getNearestSignal(playerState.x, playerState.z);
    const sigDot = document.getElementById('hud-signal-dot');
    const sigText = document.getElementById('hud-signal-text');
    if (sigDot && sigText && signal && dist < 75) {
      const movingNS = Math.abs(Math.cos(playerState.angle)) > 0.7;
      const isGreen = (movingNS && signal.state === 'NS_GREEN') || (!movingNS && signal.state === 'EW_GREEN');
      const isYellow = signal.state === 'YELLOW';
      sigDot.className = `w-3 h-3 rounded-full ${isYellow ? 'bg-amber-400' : isGreen ? 'bg-emerald-400' : 'bg-rose-500'}`;
      sigText.textContent = isYellow ? 'Signal: YELLOW' : isGreen ? 'Signal: GREEN' : 'Signal: RED (STOP)';
    }
  }

  // Modal & Menu Wiring
  function closeAllModals() {
    ['modal-missions', 'modal-garage', 'modal-map', 'modal-cheats', 'modal-settings', 'modal-engine-guide'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
    gamePaused = false;
  }

  function openModal(id) {
    closeAllModals();
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('hidden');
      gamePaused = true;
      if (id === 'modal-map') drawFullMap();
      if (id === 'modal-missions') renderMissionsList();
      if (id === 'modal-garage') renderGarageList();
    }
  }

  function renderMissionsList(filterCat = 'ALL') {
    const container = document.getElementById('missions-list-container');
    if (!container) return;
    const filtered = filterCat === 'ALL' ? ALL_MISSIONS : ALL_MISSIONS.filter((m) => m.category === filterCat);

    container.innerHTML = filtered
      .map((m) => {
        const done = saveState.completedMissions.includes(m.id);
        return `
        <div class="p-3.5 rounded-xl bg-slate-800/90 border ${done ? 'border-emerald-500/50' : 'border-slate-700'} flex flex-col justify-between gap-2">
          <div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">${m.category}</span>
              <span class="text-xs font-mono font-bold text-emerald-400">+₹${m.reward.toLocaleString()}</span>
            </div>
            <h4 class="text-sm font-bold text-white mt-1.5">${m.title} ${done ? '✅' : ''}</h4>
            <p class="text-xs text-slate-300 mt-1 leading-relaxed">${m.brief}</p>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-slate-700/60">
            <span class="text-[11px] text-slate-400">⏱ ${m.timeLimit}s • Weather: ${m.weather.toUpperCase()}</span>
            <button data-start-mission="${m.id}" class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition">
              Launch Mission
            </button>
          </div>
        </div>
      `;
      })
      .join('');

    container.querySelectorAll('[data-start-mission]').forEach((btn) => {
      btn.addEventListener('click', () => {
        startMission(btn.getAttribute('data-start-mission'));
      });
    });
  }

  function renderGarageList() {
    const container = document.getElementById('garage-list-container');
    if (!container) return;
    const colors = ['#e11d48', '#f59e0b', '#10b981', '#0284c7', '#7c3aed', '#f8fafc', '#1e293b'];

    container.innerHTML = Object.values(VEHICLE_CATALOG)
      .map((spec) => {
        const unlocked = saveState.unlockedVehicles.includes(spec.id);
        const selected = saveState.selectedVehicle === spec.id;
        const cust = saveState.vehicleCustomizations[spec.id] || { color: spec.defaultColor, engineLevel: 1, armorLevel: 1 };

        return `
        <div class="p-4 rounded-xl bg-slate-800/90 border ${selected ? 'border-amber-400' : 'border-slate-700'} flex flex-col justify-between gap-3">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-sky-400">${spec.category}</span>
              <span class="text-xs font-mono font-bold ${unlocked ? 'text-emerald-400' : 'text-amber-300'}">${unlocked ? 'OWNED' : '₹' + spec.price.toLocaleString()}</span>
            </div>
            <h4 class="text-base font-bold text-white mt-1">${spec.name}</h4>
            <p class="text-xs text-slate-300 mt-1">${spec.description}</p>
            <div class="mt-2.5 space-y-1 text-[11px] text-slate-300">
              <div>Top Speed: <span class="text-white font-semibold">${Math.round(spec.maxSpeed * 2.2)} km/h</span> (Engine Lv.${cust.engineLevel})</div>
              <div class="flex items-center gap-1.5 pt-1">
                <span>Paint:</span>
                ${colors
                  .map(
                    (c) =>
                      `<button data-paint-veh="${spec.id}" data-paint-col="${c}" class="w-4 h-4 rounded-full border border-white/40" style="background:${c}"></button>`
                  )
                  .join('')}
              </div>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 pt-2 border-t border-slate-700/60">
            ${
              unlocked
                ? `<button data-spawn-veh="${spec.id}" class="flex-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs">Drive Now</button>
                   <button data-upgrade-veh="${spec.id}" class="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs">Tune Engine (₹1,500)</button>`
                : `<button data-buy-veh="${spec.id}" class="w-full px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">Buy Vehicle (₹${spec.price.toLocaleString()})</button>`
            }
          </div>
        </div>
      `;
      })
      .join('');

    container.querySelectorAll('[data-buy-veh]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-buy-veh');
        const spec = VEHICLE_CATALOG[id];
        if (saveState.money < spec.price) {
          showToast(`Insufficient funds! Need ₹${spec.price.toLocaleString()}`, 'warn');
          return;
        }
        saveState.money -= spec.price;
        saveState.unlockedVehicles.push(id);
        saveState.selectedVehicle = id;
        saveGameState(saveState);
        sound.playChime('success');
        updateEconomyHUD();
        renderGarageList();
        showToast(`🎉 Purchased ${spec.name}!`, 'success');
      });
    });

    container.querySelectorAll('[data-spawn-veh]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-spawn-veh');
        saveState.selectedVehicle = id;
        saveGameState(saveState);
        const v = spawnWorldVehicle(id, playerState.x + 3, playerState.z + 3, playerState.angle);
        enterVehicle(v);
        closeAllModals();
      });
    });

    container.querySelectorAll('[data-upgrade-veh]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-upgrade-veh');
        if (saveState.money < 1500) {
          showToast('Need ₹1,500 for Stage-2 Engine Remap!', 'warn');
          return;
        }
        saveState.money -= 1500;
        saveState.vehicleCustomizations[id].engineLevel = Math.min(5, (saveState.vehicleCustomizations[id].engineLevel || 1) + 1);
        saveGameState(saveState);
        sound.playChime('success');
        updateEconomyHUD();
        renderGarageList();
        showToast(`🔧 Upgraded ${VEHICLE_CATALOG[id].name} Engine to Lv.${saveState.vehicleCustomizations[id].engineLevel}!`, 'success');
      });
    });

    container.querySelectorAll('[data-paint-veh]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-paint-veh');
        const col = btn.getAttribute('data-paint-col');
        saveState.vehicleCustomizations[id].color = col;
        saveGameState(saveState);
        if (playerState.currentVehicle && playerState.currentVehicle.type === id) {
          const v = spawnWorldVehicle(id, playerState.x, playerState.z, playerState.angle, col);
          enterVehicle(v);
        }
        showToast(`🎨 Resprayed ${VEHICLE_CATALOG[id].name}!`, 'info');
      });
    });
  }

  // Keyboard Listeners
  window.addEventListener('keydown', (e) => {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') {
      if (e.key === 'Escape' || e.code === 'Backquote') {
        document.activeElement.blur();
        closeAllModals();
      }
      return;
    }

    keys[e.code] = true;
    sound.init();

    if (e.code === 'KeyE') toggleEnterExitVehicle();
    else if (e.code === 'KeyC') {
      playerState.cameraMode = (playerState.cameraMode + 1) % 4;
      const camNames = ['3rd-Person Chase', 'Far Cinematic Chase', '1st-Person Cockpit', 'Top-Down Helicopter'];
      showToast(`🎥 Camera: ${camNames[playerState.cameraMode]}`, 'info');
    } else if (e.code === 'KeyH') {
      sound.playHorn(playerState.currentVehicle ? playerState.currentVehicle.type : 'car');
    } else if (e.code === 'KeyF') {
      if (playerState.currentVehicle) {
        const v = playerState.currentVehicle;
        v.headlightsOn = !v.headlightsOn;
        if (v.mesh.userData.headSpot) {
          v.mesh.userData.headSpot.intensity = v.headlightsOn ? 2.6 : 0;
        }
        showToast(`💡 Headlights ${v.headlightsOn ? 'ON' : 'OFF'}`, 'info');
      }
    } else if (e.code === 'KeyR') {
      playerState.speed = 0;
      if (playerState.currentVehicle) {
        playerState.currentVehicle.mesh.rotation.set(0, playerState.angle, 0);
      }
      showToast('🔄 Vehicle uprighted and reset onto roadway', 'info');
    } else if (e.code === 'KeyP') {
      if (trafficPolice.wantedLevel === 1 && trafficPolice.finePending > 0) {
        if (saveState.money >= trafficPolice.finePending) {
          saveState.money -= trafficPolice.finePending;
          saveState.stats.totalFinesPaid += trafficPolice.finePending;
          trafficPolice.setWantedLevelDirect(0);
          saveGameState(saveState);
          updateEconomyHUD();
          showToast('✅ Paid Chandigarh Traffic e-Challan! Wanted Level cleared.', 'success');
        } else {
          showToast('Not enough cash to pay Challan! Police escalating to pursuit!', 'warn');
          trafficPolice.setWantedLevelDirect(2);
        }
      }
    } else if (e.code === 'KeyM') {
      const mEl = document.getElementById('modal-map');
      if (mEl && !mEl.classList.contains('hidden')) closeAllModals();
      else openModal('modal-map');
    } else if (e.code === 'Tab') {
      e.preventDefault();
      const mEl = document.getElementById('modal-missions');
      if (mEl && !mEl.classList.contains('hidden')) closeAllModals();
      else openModal('modal-missions');
    } else if (e.code === 'KeyG') {
      const gEl = document.getElementById('modal-garage');
      if (gEl && !gEl.classList.contains('hidden')) closeAllModals();
      else openModal('modal-garage');
    } else if (e.code === 'Backquote') {
      e.preventDefault();
      const cEl = document.getElementById('modal-cheats');
      if (cEl && !cEl.classList.contains('hidden')) closeAllModals();
      else {
        openModal('modal-cheats');
        setTimeout(() => {
          const inp = document.getElementById('cheat-input');
          if (inp) inp.focus();
        }, 50);
      }
    } else if (e.code === 'Escape') {
      closeAllModals();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Wire UI Buttons
  const bindBtn = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  };

  bindBtn('btn-start-play', () => {
    sound.init();
    document.getElementById('main-menu-overlay').classList.add('hidden');
    gameStarted = true;
    gamePaused = false;
    updateEconomyHUD();
    updateMissionHUD();
  });

  bindBtn('btn-menu-missions', () => {
    document.getElementById('main-menu-overlay').classList.add('hidden');
    gameStarted = true;
    openModal('modal-missions');
  });

  bindBtn('btn-menu-garage', () => {
    document.getElementById('main-menu-overlay').classList.add('hidden');
    gameStarted = true;
    openModal('modal-garage');
  });

  bindBtn('btn-menu-newgame', () => {
    Object.assign(saveState, JSON.parse(JSON.stringify(DEFAULT_SAVE_STATE)));
    saveGameState(saveState);
    document.getElementById('main-menu-overlay').classList.add('hidden');
    gameStarted = true;
    gamePaused = false;
    updateEconomyHUD();
    updateMissionHUD();
    showToast('🆕 Started Fresh Career in Chandigarh!', 'success');
  });

  bindBtn('btn-hud-missions', () => openModal('modal-missions'));
  bindBtn('btn-hud-garage', () => openModal('modal-garage'));
  bindBtn('btn-hud-map', () => openModal('modal-map'));
  bindBtn('btn-hud-cheats', () => openModal('modal-cheats'));
  bindBtn('btn-hud-settings', () => openModal('modal-settings'));
  bindBtn('btn-hud-engine-guide', () => openModal('modal-engine-guide'));

  bindBtn('btn-hud-taxi', () => {
    if (activeMission) {
      showToast('Finish or abort your current mission first!', 'warn');
      return;
    }
    const targetLm = LANDMARKS[Math.floor(Math.random() * LANDMARKS.length)];
    taxiFareActive = {
      label: `Drop Passenger at ${targetLm.name}`,
      x: targetLm.x,
      z: targetLm.z,
      reward: 1400 + Math.floor(Math.random() * 900)
    };
    sound.playChime('start');
    showToast(`🚕 Instant Taxi Dispatch: ${taxiFareActive.label}`, 'info');
    updateMissionHUD();
  });

  bindBtn('btn-hud-weather', () => {
    const cycle = ['sunny', 'sunset', 'night', 'rain', 'fog'];
    const idx = (cycle.indexOf(envState.weather) + 1) % cycle.length;
    envState.weather = cycle[idx];
    if (envState.weather === 'night') envState.timeHours = 23.0;
    else if (envState.weather === 'sunset') envState.timeHours = 18.0;
    else envState.timeHours = 11.0;
    showToast(`🌤️ Environment switched to: ${envState.weather.toUpperCase()}`, 'info');
  });

  bindBtn('btn-hud-mute', () => {
    const isMuted = sound.toggleMute();
    const btn = document.getElementById('btn-hud-mute');
    if (btn) btn.textContent = isMuted ? '🔇 Audio Off' : '🔊 Audio On';
  });

  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', closeAllModals);
  });

  // Cheat Console Submit & Quick Pills
  bindBtn('btn-cheat-submit', () => {
    const inp = document.getElementById('cheat-input');
    if (inp) {
      executeCheatCode(inp.value);
      inp.value = '';
    }
  });

  const cheatInp = document.getElementById('cheat-input');
  if (cheatInp) {
    cheatInp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeCheatCode(cheatInp.value);
        cheatInp.value = '';
      }
    });
  }

  document.querySelectorAll('[data-quick-cheat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      executeCheatCode(btn.getAttribute('data-quick-cheat'));
    });
  });

  // Full Map Click to Set GPS Waypoint
  if (fullmapCanvas) {
    fullmapCanvas.addEventListener('click', (e) => {
      const rect = fullmapCanvas.getBoundingClientRect();
      const rx = (e.clientX - rect.left) / rect.width;
      const rz = (e.clientY - rect.top) / rect.height;
      const wx = rx * WORLD_CONFIG.SIZE - WORLD_CONFIG.HALF_SIZE;
      const wz = rz * WORLD_CONFIG.SIZE - WORLD_CONFIG.HALF_SIZE;
      playerState.waypoint = { x: wx, z: wz };
      drawFullMap();
      showToast(`📍 GPS Waypoint set at (${Math.round(wx)}, ${Math.round(wz)})`, 'info');
    });
  }

  // Mobile / On-Screen Touch Controls Wiring
  document.querySelectorAll('[data-touch-key]').forEach((btn) => {
    const code = btn.getAttribute('data-touch-key');
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      sound.init();
      keys[code] = true;
    });
    btn.addEventListener('pointerup', (e) => {
      e.preventDefault();
      keys[code] = false;
    });
    btn.addEventListener('pointerleave', () => {
      keys[code] = false;
    });
  });

  updateEconomyHUD();
  updateMissionHUD();

  // Main Animation Loop
  function animate(now) {
    requestAnimationFrame(animate);
    const rawDt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    const dt = playerState.slowMo ? rawDt * 0.45 : rawDt;

    if (gameStarted && !gamePaused) {
      updatePhysics(dt);
      trafficPolice.update(dt, playerState, showToast, (vType) => {
        if (activeMission && vType === 'redLight' && activeMission.rules?.noRedLight) {
          failMission('Crossed a red traffic light during a strict discipline mission!');
        }
      });
      updateMissionLogic(dt);
      applyEnvironmentVisuals(dt);
      sound.updateContinuous(
        playerState.inVehicle,
        playerState.speed,
        playerState.currentVehicle ? playerState.currentVehicle.spec.maxSpeed : 45,
        trafficPolice.wantedLevel,
        envState.weather === 'rain',
        dt
      );
      drawMinimap();
    }

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
}
