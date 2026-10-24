// ============================================================================
// MODULE 4: GAMEPLAY ENGINE — DRIVING PHYSICS, AI TRAFFIC, POLICE & MISSIONS
// ============================================================================
import { WORLD_CONFIG, VEHICLE_CATALOG, SERVICE_STATIONS } from './constants.js';
import { buildVehicleMesh } from './world_builder.js';

export class TrafficAndPoliceManager {
  constructor(THREE, scene, worldData, soundEngine) {
    this.THREE = THREE;
    this.scene = scene;
    this.worldData = worldData;
    this.sound = soundEngine;
    this.aiVehicles = [];
    this.policeUnits = [];
    this.pedestrians = [];
    this.roadblocks = [];
    this.signalTimer = 0;

    // Wanted system state
    this.wantedLevel = 0;
    this.wantedHeat = 0;
    this.cooldownTimer = 0;
    this.lineOfSight = false;
    this.lastSeenPos = { x: 0, z: 0 };
    this.violationCooldown = 0;
    this.finePending = 0;
  }

  initTraffic(count = 32) {
    const types = ['hatchback', 'sedan', 'suv', 'autorickshaw', 'bike', 'bus', 'sports'];
    const palette = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#f8fafc', '#6366f1', '#ec4899', '#14b8a6'];

    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      const color = type === 'autorickshaw' ? '#16a34a' : type === 'bus' ? '#dc2626' : palette[i % palette.length];
      const mesh = buildVehicleMesh(this.THREE, type, color);
      const axis = i % 2 === 0 ? 'X' : 'Z';
      const dir = i % 4 < 2 ? 1 : -1;
      const laneOffset = dir * 6.2; // Left-hand Indian traffic drive lane

      let x = 0, z = 0, angle = 0;
      if (axis === 'X') {
        const roadZ = WORLD_CONFIG.ROADS_Z[i % WORLD_CONFIG.ROADS_Z.length];
        z = roadZ + laneOffset;
        x = -620 + (i * 43) % 1240;
        angle = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      } else {
        const roadX = WORLD_CONFIG.ROADS_X[i % WORLD_CONFIG.ROADS_X.length];
        x = roadX - laneOffset;
        z = -620 + (i * 47) % 1240;
        angle = dir > 0 ? 0 : Math.PI;
      }

      mesh.position.set(x, 0, z);
      mesh.rotation.y = angle;
      this.scene.add(mesh);

      const spec = VEHICLE_CATALOG[type];
      this.aiVehicles.push({
        id: `ai_${i}`,
        type,
        mesh,
        x,
        z,
        angle,
        axis,
        dir,
        speed: spec.maxSpeed * 0.45,
        targetSpeed: spec.maxSpeed * 0.48,
        spec,
        honkTimer: 2 + Math.random() * 8
      });
    }

    // Spawn Sidewalk Pedestrians
    const shirtColors = ['#f97316', '#06b6d4', '#8b5cf6', '#ec4899', '#eab308', '#22c55e'];
    for (let p = 0; p < 36; p++) {
      const pedGroup = new this.THREE.Group();
      const body = new this.THREE.Mesh(
        new this.THREE.BoxGeometry(0.45, 0.75, 0.28),
        new this.THREE.MeshStandardMaterial({ color: shirtColors[p % shirtColors.length] })
      );
      body.position.y = 1.05;
      const head = new this.THREE.Mesh(
        new this.THREE.SphereGeometry(0.2, 10, 10),
        new this.THREE.MeshStandardMaterial({ color: '#fde68a' })
      );
      head.position.y = 1.62;
      pedGroup.add(body, head);

      const rx = WORLD_CONFIG.ROADS_X[p % WORLD_CONFIG.ROADS_X.length] + (p % 2 === 0 ? 15.2 : -15.2);
      const rz = -550 + (p * 33) % 1100;
      pedGroup.position.set(rx, 0, rz);
      this.scene.add(pedGroup);
      this.pedestrians.push({
        mesh: pedGroup,
        x: rx,
        z: rz,
        dir: p % 2 === 0 ? 1 : -1,
        speed: 2.2 + (p % 3) * 0.45
      });
    }
  }

  updateTrafficSignals(dt) {
    this.signalTimer += dt;
    this.worldData.trafficSignals.forEach((sig) => {
      const cycle = (this.signalTimer + sig.phaseOffset) % 16;
      if (cycle < 7) {
        sig.state = 'NS_GREEN';
        sig.greenMat.color.setHex(0x22c55e);
        sig.yellowMat.color.setHex(0x422006);
        sig.redMat.color.setHex(0x450a0a);
      } else if (cycle < 8.5) {
        sig.state = 'YELLOW';
        sig.greenMat.color.setHex(0x052e16);
        sig.yellowMat.color.setHex(0xfacc15);
        sig.redMat.color.setHex(0x450a0a);
      } else {
        sig.state = 'EW_GREEN';
        sig.greenMat.color.setHex(0x052e16);
        sig.yellowMat.color.setHex(0x422006);
        sig.redMat.color.setHex(0xef4444);
      }
    });
  }

  getNearestSignal(x, z) {
    let best = null;
    let bestDist = 9999;
    for (const sig of this.worldData.trafficSignals) {
      const d = Math.hypot(sig.x - x, sig.z - z);
      if (d < bestDist) {
        bestDist = d;
        best = sig;
      }
    }
    return { signal: best, dist: bestDist };
  }

  reportViolation(reason, heatAmount, fineAmount, onNotify) {
    if (this.violationCooldown > 0) return;
    this.violationCooldown = 2.6;
    this.wantedHeat += heatAmount;
    this.finePending += fineAmount;

    const prevLevel = this.wantedLevel;
    if (this.wantedHeat >= 100) this.wantedLevel = 5;
    else if (this.wantedHeat >= 72) this.wantedLevel = 4;
    else if (this.wantedHeat >= 48) this.wantedLevel = 3;
    else if (this.wantedHeat >= 24) this.wantedLevel = 2;
    else if (this.wantedHeat >= 8) this.wantedLevel = 1;

    this.cooldownTimer = 14 + this.wantedLevel * 6;
    if (onNotify) {
      onNotify(`🚨 Traffic/Law Violation: ${reason} (+₹${fineAmount} Challan)`, 'warn');
    }
    if (this.wantedLevel > prevLevel && this.wantedLevel >= 2) {
      this.syncPoliceUnits();
    }
  }

  setWantedLevelDirect(level) {
    this.wantedLevel = Math.max(0, Math.min(5, level));
    const heatMap = [0, 12, 30, 54, 78, 105];
    this.wantedHeat = heatMap[this.wantedLevel];
    this.cooldownTimer = this.wantedLevel > 0 ? 16 + this.wantedLevel * 5 : 0;
    if (this.wantedLevel === 0) {
      this.finePending = 0;
      this.lineOfSight = false;
    }
    this.syncPoliceUnits();
  }

  syncPoliceUnits() {
    const desiredCount =
      this.wantedLevel <= 1 ? 1 : this.wantedLevel === 2 ? 2 : this.wantedLevel === 3 ? 4 : this.wantedLevel === 4 ? 6 : 8;

    while (this.policeUnits.length < desiredCount) {
      const idx = this.policeUnits.length;
      const mesh = buildVehicleMesh(this.THREE, 'police', '#ffffff', '#94a3b8', true);
      const angle = (idx / desiredCount) * Math.PI * 2;
      const spawnDist = 95 + idx * 18;
      const px = Math.max(-720, Math.min(720, this.lastSeenPos.x + Math.cos(angle) * spawnDist));
      const pz = Math.max(-720, Math.min(720, this.lastSeenPos.z + Math.sin(angle) * spawnDist));
      mesh.position.set(px, 0, pz);
      this.scene.add(mesh);

      this.policeUnits.push({
        mesh,
        x: px,
        z: pz,
        angle: 0,
        speed: 0,
        mode: idx >= 3 && this.wantedLevel >= 3 ? 'intercept' : 'chase'
      });
    }

    while (this.policeUnits.length > desiredCount) {
      const removed = this.policeUnits.pop();
      this.scene.remove(removed.mesh);
    }
  }

  update(dt, playerState, onNotify, onMissionViolation) {
    this.updateTrafficSignals(dt);
    if (this.violationCooldown > 0) this.violationCooldown -= dt;

    // 1. Update AI Civilian Vehicles
    for (const ai of this.aiVehicles) {
      let shouldStop = false;

      // Check traffic light ahead
      const { signal, dist } = this.getNearestSignal(ai.x, ai.z);
      if (signal && dist > 18 && dist < 34) {
        if (ai.axis === 'Z' && signal.state !== 'NS_GREEN') shouldStop = true;
        if (ai.axis === 'X' && signal.state !== 'EW_GREEN') shouldStop = true;
      }

      // Check distance to player to avoid rear-ending or honk
      const distToPlayer = Math.hypot(playerState.x - ai.x, playerState.z - ai.z);
      if (distToPlayer < 13) {
        shouldStop = true;
        ai.honkTimer -= dt;
        if (ai.honkTimer <= 0) {
          this.sound.playHorn(ai.type);
          ai.honkTimer = 4 + Math.random() * 5;
        }
      }

      const target = shouldStop ? 0 : ai.targetSpeed;
      ai.speed += (target - ai.speed) * Math.min(1, dt * 4.5);

      // Move around roundabout smoothly or along lane
      if (ai.axis === 'X') {
        ai.x += ai.dir * ai.speed * dt;
        if (ai.x > 740) ai.x = -740;
        if (ai.x < -740) ai.x = 740;
      } else {
        ai.z += ai.dir * ai.speed * dt;
        if (ai.z > 740) ai.z = -740;
        if (ai.z < -740) ai.z = 740;
      }

      ai.mesh.position.set(ai.x, 0, ai.z);
    }

    // 2. Update Pedestrians
    for (const ped of this.pedestrians) {
      ped.z += ped.dir * ped.speed * dt;
      if (ped.z > 680) ped.dir = -1;
      if (ped.z < -680) ped.dir = 1;
      ped.mesh.position.set(ped.x, 0, ped.z);
      ped.mesh.rotation.y = ped.dir > 0 ? 0 : Math.PI;
    }

    // 3. Check Player Traffic Rule Violations (Red Light & Speeding)
    if (playerState.inVehicle) {
      const speedKmh = Math.abs(playerState.speed) * 2.2;
      const { signal, dist } = this.getNearestSignal(playerState.x, playerState.z);

      if (signal && dist < 17 && speedKmh > 25) {
        const movingNS = Math.abs(Math.cos(playerState.angle)) > 0.7;
        const ranRed =
          (movingNS && signal.state === 'EW_GREEN') || (!movingNS && signal.state === 'NS_GREEN');
        if (ranRed && this.violationCooldown <= 0) {
          this.reportViolation('Ran Red Signal at Chowk CCTV', 16, 1000, onNotify);
          if (onMissionViolation) onMissionViolation('redLight');
        }
      }

      if (speedKmh > 112 && this.violationCooldown <= 0) {
        this.reportViolation('Excessive Speeding over 110 km/h', 10, 500, onNotify);
      }
    }

    // 4. Police Wanted Level AI & Line-of-Sight Pursuit
    if (this.wantedLevel > 0) {
      let spotted = false;
      const flash = Math.floor( performance.now() / 160 ) % 2 === 0;

      for (const cop of this.policeUnits) {
        // Flash roof beacons
        if (cop.mesh.userData.beacon) {
          cop.mesh.userData.beacon.redBeacon.material.color.setHex(flash ? 0xef4444 : 0x450a0a);
          cop.mesh.userData.beacon.blueBeacon.material.color.setHex(flash ? 0x1e3a8a : 0x3b82f6);
        }

        const dx = playerState.x - cop.x;
        const dz = playerState.z - cop.z;
        const dist = Math.hypot(dx, dz);

        if (dist < 135) {
          spotted = true;
          this.lastSeenPos.x = playerState.x;
          this.lastSeenPos.z = playerState.z;
        }

        if (this.wantedLevel >= 2) {
          // Aim toward last seen position or intercept point ahead of player
          const aimX =
            cop.mode === 'intercept'
              ? this.lastSeenPos.x + Math.sin(playerState.angle) * 28
              : this.lastSeenPos.x;
          const aimZ =
            cop.mode === 'intercept'
              ? this.lastSeenPos.z + Math.cos(playerState.angle) * 28
              : this.lastSeenPos.z;

          const targetAngle = Math.atan2(aimX - cop.x, aimZ - cop.z);
          let diff = targetAngle - cop.angle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;

          cop.angle += diff * Math.min(1, dt * 3.8);
          const maxCopSpeed = 36 + this.wantedLevel * 4.5;
          cop.speed = Math.min(maxCopSpeed, cop.speed + 28 * dt);

          cop.x += Math.sin(cop.angle) * cop.speed * dt;
          cop.z += Math.cos(cop.angle) * cop.speed * dt;
          cop.mesh.position.set(cop.x, 0, cop.z);
          cop.mesh.rotation.y = cop.angle;

          // Police ramming player
          if (dist < 3.6) {
            playerState.speed *= 0.65;
            if (playerState.inVehicle && playerState.currentVehicle) {
              playerState.currentVehicle.damage = Math.min(100, playerState.currentVehicle.damage + 12 * dt);
            } else {
              playerState.health = Math.max(0, playerState.health - 20 * dt);
            }
          }
        }
      }

      this.lineOfSight = spotted;
      if (spotted) {
        this.cooldownTimer = 12 + this.wantedLevel * 5;
      } else {
        this.cooldownTimer -= dt;
        if (this.cooldownTimer <= 0) {
          this.wantedLevel = Math.max(0, this.wantedLevel - 1);
          if (this.wantedLevel === 0) {
            this.wantedHeat = 0;
            this.syncPoliceUnits();
            if (onNotify) onNotify('✅ Evaded Chandigarh Police! Wanted Level Cleared.', 'success');
          } else {
            this.cooldownTimer = 10 + this.wantedLevel * 4;
            this.syncPoliceUnits();
          }
        }
      }
    }
  }
}
