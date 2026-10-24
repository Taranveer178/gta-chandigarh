// ============================================================================
// MODULE 3: 3D CHANDIGARH WORLD MAP, LANDMARKS, TRAFFIC SIGNALS & VEHICLES
// ============================================================================
import { WORLD_CONFIG, LANDMARKS, SERVICE_STATIONS, VEHICLE_CATALOG } from './constants.js';

export function buildVehicleMesh(THREE, typeId, customColor, wheelColor = '#cbd5e1', isPolice = false) {
  const spec = VEHICLE_CATALOG[typeId] || VEHICLE_CATALOG.hatchback;
  const group = new THREE.Group();
  const colorHex = customColor || spec.defaultColor;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.32,
    metalness: 0.45
  });
  const darkMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.7 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    roughness: 0.15,
    metalness: 0.8,
    transparent: true,
    opacity: 0.72
  });
  const chromeMat = new THREE.MeshStandardMaterial({ color: wheelColor, roughness: 0.3, metalness: 0.8 });
  const headlightMat = new THREE.MeshBasicMaterial({ color: '#fef9c3' });
  const taillightMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });

  const w = spec.width;
  const h = spec.height;
  const l = spec.length;

  if (typeId === 'bike') {
    // Motorcycle mesh
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.55, 1.55), bodyMat);
    frame.position.set(0, 0.65, 0);
    frame.castShadow = true;
    group.add(frame);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 0.08), chromeMat);
    handle.position.set(0, 1.12, 0.45);
    group.add(handle);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.75), darkMat);
    seat.position.set(0, 0.88, -0.2);
    group.add(seat);

    const riderBody = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.68, 0.35), new THREE.MeshStandardMaterial({ color: '#1e40af' }));
    riderBody.position.set(0, 1.32, -0.15);
    group.add(riderBody);

    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), new THREE.MeshStandardMaterial({ color: '#f59e0b' }));
    helmet.position.set(0, 1.82, -0.1);
    group.add(helmet);
  } else if (typeId === 'autorickshaw') {
    // Indian Green & Yellow Auto-Rickshaw
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.48, l), new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.5 }));
    lowerBody.position.y = h * 0.32;
    lowerBody.castShadow = true;
    group.add(lowerBody);

    const canopy = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, h * 0.48, l * 0.84), new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.4 }));
    canopy.position.set(0, h * 0.78, -0.12);
    canopy.castShadow = true;
    group.add(canopy);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, h * 0.36, 0.08), glassMat);
    windshield.position.set(0, h * 0.72, l * 0.35);
    group.add(windshield);
  } else {
    // Car / SUV / Sports / Bus / Police / Ambulance chassis
    const chassisH = typeId === 'bus' ? h * 0.85 : h * 0.46;
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(w, chassisH, l), bodyMat);
    chassis.position.y = chassisH * 0.5 + 0.28;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    group.add(chassis);

    if (typeId !== 'bus') {
      const cabinL = typeId === 'sports' ? l * 0.48 : l * 0.56;
      const cabinH = h * 0.42;
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(w * 0.88, cabinH, cabinL), bodyMat);
      cabin.position.set(0, chassisH + cabinH * 0.5 + 0.24, -l * 0.05);
      cabin.castShadow = true;
      group.add(cabin);

      const glassBox = new THREE.Mesh(new THREE.BoxGeometry(w * 0.90, cabinH * 0.78, cabinL * 0.96), glassMat);
      glassBox.position.copy(cabin.position);
      group.add(glassBox);
    } else {
      // CTU Bus windows stripe
      const winBand = new THREE.Mesh(new THREE.BoxGeometry(w * 1.01, h * 0.32, l * 0.92), glassMat);
      winBand.position.set(0, h * 0.65, 0);
      group.add(winBand);
    }

    // Bullbar for SUV & Police
    if (typeId === 'suv' || typeId === 'police') {
      const bullbar = new THREE.Mesh(new THREE.BoxGeometry(w * 0.75, 0.45, 0.18), darkMat);
      bullbar.position.set(0, 0.58, l * 0.51);
      group.add(bullbar);
    }
  }

  // Wheels
  const wheelRadius = typeId === 'bus' ? 0.52 : typeId === 'suv' ? 0.44 : 0.34;
  const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.26, 14);
  wheelGeo.rotateZ(Math.PI / 2);

  const wheelPositions =
    typeId === 'bike'
      ? [
          [0, wheelRadius, l * 0.35],
          [0, wheelRadius, -l * 0.35]
        ]
      : typeId === 'autorickshaw'
      ? [
          [0, wheelRadius, l * 0.36],
          [-w * 0.45, wheelRadius, -l * 0.34],
          [w * 0.45, wheelRadius, -l * 0.34]
        ]
      : [
          [-w * 0.48, wheelRadius, l * 0.32],
          [w * 0.48, wheelRadius, l * 0.32],
          [-w * 0.48, wheelRadius, -l * 0.32],
          [w * 0.48, wheelRadius, -l * 0.32]
        ];

  group.userData.wheels = [];
  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, darkMat);
    wheel.position.set(wx, wy, wz);
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(wheelRadius * 0.55, wheelRadius * 0.55, 0.28, 10).rotateZ(Math.PI / 2),
      chromeMat
    );
    wheel.add(hub);
    group.add(wheel);
    group.userData.wheels.push(wheel);
  });

  // Headlights & Taillights
  const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.1), headlightMat);
  hlLeft.position.set(-w * 0.32, 0.62, l * 0.5 + 0.02);
  const hlRight = hlLeft.clone();
  hlRight.position.x = w * 0.32;
  group.add(hlLeft, hlRight);

  const tlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.1), taillightMat);
  tlLeft.position.set(-w * 0.32, 0.62, -l * 0.5 - 0.02);
  const tlRight = tlLeft.clone();
  tlRight.position.x = w * 0.32;
  group.add(tlLeft, tlRight);

  // Police or Emergency Beacon Bar
  if (isPolice || typeId === 'police' || typeId === 'ambulance') {
    const bar = new THREE.Group();
    const redBeacon = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.18, 0.25),
      new THREE.MeshBasicMaterial({ color: '#ef4444' })
    );
    redBeacon.position.x = -0.25;
    const blueBeacon = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.18, 0.25),
      new THREE.MeshBasicMaterial({ color: '#3b82f6' })
    );
    blueBeacon.position.x = 0.25;
    bar.add(redBeacon, blueBeacon);
    bar.position.set(0, h + 0.22, 0);
    group.add(bar);
    group.userData.beacon = { redBeacon, blueBeacon };
  }

  // Headlight SpotLight for Night Driving
  const headSpot = new THREE.SpotLight(0xfffbeb, 0, 58, Math.PI / 4.5, 0.45, 1.2);
  headSpot.position.set(0, 0.85, l * 0.5);
  const targetObj = new THREE.Object3D();
  targetObj.position.set(0, 0.2, l * 0.5 + 28);
  group.add(targetObj);
  headSpot.target = targetObj;
  group.add(headSpot);
  group.userData.headSpot = headSpot;

  return group;
}

export function buildPlayerCharacterMesh(THREE) {
  const group = new THREE.Group();
  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.78, 0.32),
    new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.5 })
  );
  torso.position.y = 1.15;
  torso.castShadow = true;
  group.add(torso);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 14, 14),
    new THREE.MeshStandardMaterial({ color: '#fcd34d', roughness: 0.4 })
  );
  head.position.y = 1.78;
  group.add(head);

  const legGeo = new THREE.BoxGeometry(0.22, 0.72, 0.24);
  const legMat = new THREE.MeshStandardMaterial({ color: '#1e293b' });
  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(-0.15, 0.38, 0);
  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.position.set(0.15, 0.38, 0);
  group.add(leftLeg, rightLeg);

  group.userData.legs = [leftLeg, rightLeg];
  return group;
}

export function buildChandigarhWorld(THREE, scene) {
  const worldData = {
    colliders: [], // { x, z, hw, hd, type, label }
    roundabouts: [], // { x, z, r }
    trafficSignals: [], // { x, z, redLightMeshes, greenLightMeshes, yellowLightMeshes, state }
    streetlights: [],
    collectibles: [],
    openHandMesh: null,
    sukhnaBoats: []
  };

  // 1. Base Ground Lawn (Chandigarh Green Belt)
  const groundMat = new THREE.MeshStandardMaterial({ color: '#2d5a27', roughness: 0.92 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_CONFIG.SIZE + 400, WORLD_CONFIG.SIZE + 400), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const roadMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.75, metalness: 0.1 });
  const sidewalkMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.85 });
  const lineMat = new THREE.MeshBasicMaterial({ color: '#f8fafc' });
  const yellowLineMat = new THREE.MeshBasicMaterial({ color: '#facc15' });

  // 2. Grid Roads (X and Z Arterials)
  WORLD_CONFIG.ROADS_X.forEach((rx) => {
    const road = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_CONFIG.ROAD_WIDTH, WORLD_CONFIG.SIZE), roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(rx, 0.04, 0);
    road.receiveShadow = true;
    scene.add(road);

    // Sidewalks
    [-1, 1].forEach((side) => {
      const sw = new THREE.Mesh(
        new THREE.BoxGeometry(WORLD_CONFIG.SIDEWALK_WIDTH, 0.18, WORLD_CONFIG.SIZE),
        sidewalkMat
      );
      sw.position.set(rx + side * (WORLD_CONFIG.ROAD_WIDTH / 2 + WORLD_CONFIG.SIDEWALK_WIDTH / 2), 0.09, 0);
      scene.add(sw);
    });

    // Center median divider line
    const divLine = new THREE.Mesh(new THREE.PlaneGeometry(0.45, WORLD_CONFIG.SIZE), yellowLineMat);
    divLine.rotation.x = -Math.PI / 2;
    divLine.position.set(rx, 0.06, 0);
    scene.add(divLine);
  });

  WORLD_CONFIG.ROADS_Z.forEach((rz) => {
    const road = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_CONFIG.SIZE, WORLD_CONFIG.ROAD_WIDTH), roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.05, rz);
    road.receiveShadow = true;
    scene.add(road);

    const divLine = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_CONFIG.SIZE, 0.45), yellowLineMat);
    divLine.rotation.x = -Math.PI / 2;
    divLine.position.set(0, 0.07, rz);
    scene.add(divLine);
  });

  // 3. Iconic Chandigarh Roundabouts (Chowks) & Traffic Signals at all 25 Intersections
  const poleMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.6 });
  const islandMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.8 });
  const curbMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.6 });

  WORLD_CONFIG.ROADS_X.forEach((rx, ix) => {
    WORLD_CONFIG.ROADS_Z.forEach((rz, iz) => {
      // Roundabout asphalt apron
      const apron = new THREE.Mesh(new THREE.CircleGeometry(WORLD_CONFIG.ROUNDABOUT_OUTER, 28), roadMat);
      apron.rotation.x = -Math.PI / 2;
      apron.position.set(rx, 0.065, rz);
      scene.add(apron);

      // Landscaped center roundabout island
      const curb = new THREE.Mesh(
        new THREE.CylinderGeometry(WORLD_CONFIG.ROUNDABOUT_INNER + 0.8, WORLD_CONFIG.ROUNDABOUT_INNER + 1.0, 0.42, 24),
        curbMat
      );
      curb.position.set(rx, 0.21, rz);
      scene.add(curb);

      const lawn = new THREE.Mesh(
        new THREE.CylinderGeometry(WORLD_CONFIG.ROUNDABOUT_INNER, WORLD_CONFIG.ROUNDABOUT_INNER, 0.5, 24),
        islandMat
      );
      lawn.position.set(rx, 0.26, rz);
      scene.add(lawn);

      // Decorative Matka / Fountain / Sculpture in center of roundabout
      const statueMat = new THREE.MeshStandardMaterial({
        color: (ix + iz) % 2 === 0 ? '#f59e0b' : '#38bdf8',
        roughness: 0.3,
        metalness: 0.5
      });
      const matka = new THREE.Mesh(new THREE.SphereGeometry(2.8, 16, 14), statueMat);
      matka.position.set(rx, 2.2, rz);
      matka.castShadow = true;
      scene.add(matka);

      worldData.roundabouts.push({ x: rx, z: rz, r: WORLD_CONFIG.ROUNDABOUT_INNER + 0.8 });
      worldData.colliders.push({
        x: rx,
        z: rz,
        hw: WORLD_CONFIG.ROUNDABOUT_INNER - 0.5,
        hd: WORLD_CONFIG.ROUNDABOUT_INNER - 0.5,
        type: 'roundabout',
        label: 'Roundabout Island'
      });

      // Traffic signal poles at intersection corners
      const sigGroup = new THREE.Group();
      sigGroup.position.set(rx + 16, 0, rz + 16);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 6.2, 8), poleMat);
      pole.position.y = 3.1;
      sigGroup.add(pole);

      const box = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.8, 0.75), new THREE.MeshStandardMaterial({ color: '#0f172a' }));
      box.position.y = 5.6;
      sigGroup.add(box);

      const redMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });
      const yellowMat = new THREE.MeshBasicMaterial({ color: '#422006' });
      const greenMat = new THREE.MeshBasicMaterial({ color: '#052e16' });

      const redBulb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), redMat);
      redBulb.position.set(0, 6.1, 0.38);
      const yellowBulb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), yellowMat);
      yellowBulb.position.set(0, 5.6, 0.38);
      const greenBulb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), greenMat);
      greenBulb.position.set(0, 5.1, 0.38);
      sigGroup.add(redBulb, yellowBulb, greenBulb);
      scene.add(sigGroup);

      worldData.trafficSignals.push({
        x: rx,
        z: rz,
        redMat,
        yellowMat,
        greenMat,
        state: 'NS_GREEN',
        phaseOffset: (ix * 3 + iz * 5) % 12
      });
    });
  });

  // 4. Construct the 12 Authentic Chandigarh Landmarks
  const brutalistConcrete = new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.78 });
  const redSandstone = new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.72 });
  const glassFacade = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.2, metalness: 0.75 });

  // (A) Sector 17 Plaza (-140, -140)
  {
    const cx = -140, cz = -140;
    const plazaFloor = new THREE.Mesh(new THREE.BoxGeometry(150, 0.25, 150), new THREE.MeshStandardMaterial({ color: '#94a3b8' }));
    plazaFloor.position.set(cx, 0.12, cz);
    plazaFloor.receiveShadow = true;
    scene.add(plazaFloor);

    // Musical Fountain in center
    const fountainPool = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 0.9, 24), new THREE.MeshStandardMaterial({ color: '#0ea5e9' }));
    fountainPool.position.set(cx, 0.5, cz);
    scene.add(fountainPool);
    const jet = new THREE.Mesh(new THREE.ConeGeometry(3.5, 9, 16), new THREE.MeshBasicMaterial({ color: '#e0f2fe', wireframe: true }));
    jet.position.set(cx, 5.0, cz);
    scene.add(jet);

    // 4 Brutalist Shopping Blocks around the Plaza
    [
      [cx - 48, cz - 42, 34, 18, 22],
      [cx + 48, cz - 42, 34, 18, 22],
      [cx - 48, cz + 42, 34, 16, 22],
      [cx + 48, cz + 42, 34, 22, 22]
    ].forEach(([bx, bz, bw, bh, bd]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), brutalistConcrete);
      b.position.set(bx, bh / 2, bz);
      b.castShadow = true;
      b.receiveShadow = true;
      scene.add(b);
      worldData.colliders.push({ x: bx, z: bz, hw: bw / 2, hd: bd / 2, type: 'building', label: 'Sector 17 Arcade' });
    });
  }

  // (B) Capitol Complex & Open Hand Monument (-140, -700)
  {
    const cx = -140, cz = -690;
    // Secretariat Slab
    const sec = new THREE.Mesh(new THREE.BoxGeometry(75, 42, 18), brutalistConcrete);
    sec.position.set(cx - 45, 21, cz - 25);
    sec.castShadow = true;
    scene.add(sec);
    worldData.colliders.push({ x: cx - 45, z: cz - 25, hw: 37.5, hd: 9, type: 'building', label: 'Secretariat' });

    // Open Hand Monument (rotating sculpture)
    const handGroup = new THREE.Group();
    handGroup.position.set(cx + 25, 0, cz);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 18, 12), brutalistConcrete);
    shaft.position.y = 9;
    handGroup.add(shaft);

    const palm = new THREE.Mesh(
      new THREE.BoxGeometry(14, 11, 1.6),
      new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.35, metalness: 0.45 })
    );
    palm.position.y = 20;
    handGroup.add(palm);

    const thumb = new THREE.Mesh(
      new THREE.BoxGeometry(4, 6, 1.6),
      new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.35, metalness: 0.45 })
    );
    thumb.position.set(8.5, 19, 0);
    handGroup.add(thumb);

    scene.add(handGroup);
    worldData.openHandMesh = handGroup;
    worldData.colliders.push({ x: cx + 25, z: cz, hw: 4, hd: 4, type: 'monument', label: 'Open Hand Monument' });
  }

  // (C) Rock Garden (140, -700)
  {
    const cx = 140, cz = -685;
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const rx = cx + Math.cos(angle) * 38;
      const rz = cz + Math.sin(angle) * 38;
      const arch = new THREE.Mesh(new THREE.TorusGeometry(6, 1.5, 10, 18, Math.PI), redSandstone);
      arch.position.set(rx, 0, rz);
      arch.rotation.y = angle;
      scene.add(arch);
    }
  }

  // (D) Sukhna Lake (420, -420)
  {
    const cx = 420, cz = -420;
    const lakeWater = new THREE.Mesh(
      new THREE.BoxGeometry(195, 0.35, 195),
      new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.12, metalness: 0.65 })
    );
    lakeWater.position.set(cx, 0.18, cz);
    scene.add(lakeWater);

    // Floating Shikara Boats
    for (let i = 0; i < 5; i++) {
      const boat = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 1.2, 8.5),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? '#f59e0b' : '#ec4899' })
      );
      boat.position.set(cx - 50 + i * 25, 0.7, cz - 30 + (i % 2) * 40);
      scene.add(boat);
      worldData.sukhnaBoats.push({ mesh: boat, baseZ: boat.position.z, phase: i * 1.4 });
    }
  }

  // (E) Zakir Hussain Rose Garden (-420, -140)
  {
    const cx = -420, cz = -140;
    const roseColors = ['#e11d48', '#f43f5e', '#fb7185', '#facc15', '#c026d3'];
    for (let gx = -3; gx <= 3; gx++) {
      for (let gz = -3; gz <= 3; gz++) {
        if (gx === 0 && gz === 0) continue;
        const bed = new THREE.Mesh(
          new THREE.CylinderGeometry(6.5, 7, 0.8, 12),
          new THREE.MeshStandardMaterial({ color: roseColors[Math.abs(gx + gz) % roseColors.length] })
        );
        bed.position.set(cx + gx * 22, 0.4, cz + gz * 22);
        scene.add(bed);
      }
    }
  }

  // (F) Panjab University & Gandhi Bhawan (-420, -420)
  {
    const cx = -420, cz = -420;
    const pool = new THREE.Mesh(new THREE.BoxGeometry(56, 0.3, 56), new THREE.MeshStandardMaterial({ color: '#38bdf8' }));
    pool.position.set(cx, 0.15, cz);
    scene.add(pool);

    const bhawan = new THREE.Mesh(
      new THREE.ConeGeometry(18, 22, 4),
      new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.4 })
    );
    bhawan.position.set(cx, 11, cz);
    bhawan.castShadow = true;
    scene.add(bhawan);
    worldData.colliders.push({ x: cx, z: cz, hw: 14, hd: 14, type: 'building', label: 'Gandhi Bhawan PU' });
  }

  // (G) Elante Mall (420, 140)
  {
    const cx = 420, cz = 140;
    const mallMain = new THREE.Mesh(new THREE.BoxGeometry(92, 34, 68), glassFacade);
    mallMain.position.set(cx, 17, cz);
    mallMain.castShadow = true;
    scene.add(mallMain);
    worldData.colliders.push({ x: cx, z: cz, hw: 46, hd: 34, type: 'building', label: 'Elante Mall' });
  }

  // (H) ISBT 17 (-140, 140), ISBT 43 (-420, 420), Railway Station (420, 420), Airport (140, 680)
  [
    { x: -140, z: 140, w: 72, h: 16, d: 36, color: '#1d4ed8', label: 'ISBT Sector 17' },
    { x: -420, z: 420, w: 78, h: 18, d: 40, color: '#4338ca', label: 'ISBT Sector 43' },
    { x: 420, z: 420, w: 88, h: 20, d: 34, color: '#b45309', label: 'Chandigarh Railway Station' },
    { x: 140, z: 685, w: 110, h: 24, d: 44, color: '#0f766e', label: 'Airport Terminal' }
  ].forEach((b) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(b.w, b.h, b.d),
      new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.5 })
    );
    mesh.position.set(b.x, b.h / 2, b.z);
    mesh.castShadow = true;
    scene.add(mesh);
    worldData.colliders.push({ x: b.x, z: b.z, hw: b.w / 2, hd: b.d / 2, type: 'building', label: b.label });
  });

  // 5. Fill Residential Sectors, Kothis, Markets & Boulevard Trees
  const sectorCenters = [-420, -140, 140, 420];
  const kothiColors = ['#e2e8f0', '#fed7aa', '#fde68a', '#cbd5e1', '#fca5a5'];
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#78350f' });
  const foliageMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.85 });

  sectorCenters.forEach((sx) => {
    sectorCenters.forEach((sz) => {
      // Skip specialized full-sector parks/lakes
      if ((sx === 420 && sz === -420) || (sx === -420 && sz === -140) || (sx === -140 && sz === -140)) return;

      // Add 4 residential kothi / apartment blocks per sector quadrant
      [
        [-58, -58],
        [58, -58],
        [-58, 58],
        [58, 58]
      ].forEach(([ox, oz], idx) => {
        const bx = sx + ox;
        const bz = sz + oz;
        // Ensure not overlapping existing landmark collider
        const exists = worldData.colliders.some((c) => Math.hypot(c.x - bx, c.z - bz) < 48);
        if (exists) return;

        const bw = 26 + (idx % 2) * 8;
        const bh = 11 + (( Math.abs(sx + sz) + idx) % 3) * 6;
        const bd = 24;
        const house = new THREE.Mesh(
          new THREE.BoxGeometry(bw, bh, bd),
          new THREE.MeshStandardMaterial({ color: kothiColors[(idx + Math.abs(sx)) % kothiColors.length], roughness: 0.75 })
        );
        house.position.set(bx, bh / 2, bz);
        house.castShadow = true;
        house.receiveShadow = true;
        scene.add(house);
        worldData.colliders.push({ x: bx, z: bz, hw: bw / 2, hd: bd / 2, type: 'building', label: 'Sector Kothi' });
      });
    });
  });

  // Avenue Trees along boulevards
  for (let i = -680; i <= 680; i += 85) {
    WORLD_CONFIG.ROADS_X.forEach((rx) => {
      if (WORLD_CONFIG.ROADS_Z.some((rz) => Math.abs(i - rz) < 38)) return;
      [-21, 21].forEach((offset) => {
        const tree = new THREE.Group();
        tree.position.set(rx + offset, 0, i);
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 3.8, 7), trunkMat);
        trunk.position.y = 1.9;
        const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(3.4, 1), foliageMat);
        crown.position.y = 5.2;
        crown.castShadow = true;
        tree.add(trunk, crown);
        scene.add(tree);
      });
    });
  }

  // 6. Petrol Pumps, Garages & Safehouses
  SERVICE_STATIONS.forEach((st) => {
    const color = st.type === 'fuel' ? '#f97316' : st.type === 'garage' ? '#a855f7' : '#22c55e';
    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.8, 12),
      new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
    );
    canopy.position.set(st.x, 5.4, st.z);
    scene.add(canopy);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(4.5, 5.8, 24),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(st.x, 0.12, st.z);
    scene.add(ring);
  });

  // 7. 20 Collectible Open Hand Gold Trophies scattered across Chandigarh
  const trophyMat = new THREE.MeshStandardMaterial({
    color: '#facc15',
    emissive: '#ca8a04',
    emissiveIntensity: 0.5,
    metalness: 0.85,
    roughness: 0.2
  });

  for (let i = 0; i < WORLD_CONFIG.COLLECTIBLE_COUNT; i++) {
    const angle = (i / WORLD_CONFIG.COLLECTIBLE_COUNT) * Math.PI * 2;
    const dist = 120 + (i % 5) * 125;
    const tx = Math.round(Math.cos(angle) * dist);
    const tz = Math.round(Math.sin(angle) * dist);
    const trophy = new THREE.Mesh(new THREE.OctahedronGeometry(1.6, 0), trophyMat);
    trophy.position.set(tx, 2.2, tz);
    scene.add(trophy);
    worldData.collectibles.push({ id: `trophy_${i + 1}`, mesh: trophy, x: tx, z: tz, collected: false });
  }

  return worldData;
}
