// ============================================================================
// MODULE 1: CONSTANTS, CHANDIGARH MAP LAYOUT, VEHICLES & MISSIONS DATA
// ============================================================================

export const WORLD_CONFIG = {
  SIZE: 1600,
  HALF_SIZE: 800,
  BLOCK_SIZE: 280,
  ROAD_WIDTH: 26,
  SIDEWALK_WIDTH: 4.5,
  ROUNDABOUT_OUTER: 24,
  ROUNDABOUT_INNER: 11,
  SPEED_LIMIT_KMH: 80,
  COLLECTIBLE_COUNT: 20,
  ROADS_X: [-560, -280, 0, 280, 560],
  ROADS_Z: [-560, -280, 0, 280, 560],
  ROAD_NAMES_Z: {
    '-560': 'Uttar Marg (Capitol Axis)',
    '-280': 'Madhya Marg (Central Artery)',
    '0': 'Udyog Path (Sector 17 Heart)',
    '280': 'Dakshin Marg (Highway Axis)',
    '560': 'Purv Marg (Airport & Station Belt)'
  },
  ROAD_NAMES_X: {
    '-560': 'Paschim Marg (University Belt)',
    '-280': 'Jan Marg (Boulevard Axis)',
    '0': 'Himalaya Marg (Heritage Spine)',
    '280': 'Sukhna Path (Lake Boulevard)',
    '560': 'Industrial Expressway'
  }
};

export const LANDMARKS = [
  {
    id: 'sector17',
    name: 'Sector 17 Plaza (City Heart)',
    sector: 'Sector 17',
    x: -140,
    z: -140,
    radius: 95,
    color: '#f59e0b',
    icon: '⛲',
    description: 'Le Corbusier brutalist commercial plaza, musical fountain, Neelam Cinema & shopping arcades.'
  },
  {
    id: 'capitol',
    name: 'Capitol Complex & Open Hand',
    sector: 'Sector 1',
    x: -140,
    z: -700,
    radius: 110,
    color: '#10b981',
    icon: '✋',
    description: 'UNESCO World Heritage site featuring the giant rotating Open Hand Monument, High Court & Secretariat.'
  },
  {
    id: 'rockgarden',
    name: 'Nek Chand Rock Garden',
    sector: 'Sector 1 East',
    x: 140,
    z: -700,
    radius: 95,
    color: '#d97706',
    icon: '🪨',
    description: 'Labyrinth of curved terracotta arches, waterfalls, mosaic walls, and recycled ceramic sculptures.'
  },
  {
    id: 'sukhna',
    name: 'Sukhna Lake Promenade',
    sector: 'Sector 1 Lakefront',
    x: 420,
    z: -420,
    radius: 130,
    color: '#0ea5e9',
    icon: '⛵',
    description: 'Foothill reservoir at the Shivalik hills with shikara boats, promenade walk, and lighthouse.'
  },
  {
    id: 'rosegarden',
    name: 'Zakir Hussain Rose Garden',
    sector: 'Sector 16',
    x: -420,
    z: -140,
    radius: 95,
    color: '#ec4899',
    icon: '🌹',
    description: 'Asia’s largest rose garden with 1,600+ flower beds, pergolas, and curved walking trails.'
  },
  {
    id: 'panjab_uni',
    name: 'Panjab University & StuC',
    sector: 'Sector 14',
    x: -420,
    z: -420,
    radius: 105,
    color: '#ef4444',
    icon: '🎓',
    description: 'Iconic geometric white brutalist Gandhi Bhawan sitting on a reflection pool and Student Centre.'
  },
  {
    id: 'isbt17',
    name: 'ISBT Sector 17 Bus Terminus',
    sector: 'Sector 17 South',
    x: -140,
    z: 140,
    radius: 85,
    color: '#3b82f6',
    icon: '🚌',
    description: 'Busy central inter-state bus terminal with CTU bus bays and taxi stands.'
  },
  {
    id: 'isbt43',
    name: 'ISBT Sector 43 & District Courts',
    sector: 'Sector 43',
    x: -420,
    z: 420,
    radius: 95,
    color: '#6366f1',
    icon: '🚍',
    description: 'Southern inter-state bus hub serving Punjab, Himachal, and Haryana routes.'
  },
  {
    id: 'elante',
    name: 'Elante Mall & Industrial Area',
    sector: 'Industrial Phase I',
    x: 420,
    z: 140,
    radius: 105,
    color: '#a855f7',
    icon: '🛍️',
    description: 'Chandigarh’s largest glass-and-steel shopping mall, multiplex, and corporate courtyard.'
  },
  {
    id: 'railway',
    name: 'Chandigarh Junction Railway Station',
    sector: 'Daria / East Terminal',
    x: 420,
    z: 420,
    radius: 100,
    color: '#eab308',
    icon: '🚆',
    description: 'Main rail hub featuring Vande Bharat / Shatabdi express platforms and clock tower.'
  },
  {
    id: 'airport',
    name: 'Shaheed Bhagat Singh Intl Airport',
    sector: 'South Aero Terminal',
    x: 140,
    z: 680,
    radius: 120,
    color: '#14b8a6',
    icon: '✈️',
    description: 'Modern glass terminal, ATC control tower, and illuminated runway strip.'
  },
  {
    id: 'sector22',
    name: 'Sector 22 Shastri Market & Safehouse',
    sector: 'Sector 22',
    x: -420,
    z: 140,
    radius: 90,
    color: '#22c55e',
    icon: '🏠',
    description: 'Bustling street market, Aroma chowk eateries, player safehouse, and custom tuning garage.'
  }
];

export const SERVICE_STATIONS = [
  { id: 'fuel_17', type: 'fuel', name: 'IndianOil Sector 17', x: -245, z: -35 },
  { id: 'fuel_28', type: 'fuel', name: 'HP Petrol Pump Madhya Marg', x: 245, z: -245 },
  { id: 'fuel_43', type: 'fuel', name: 'Bharat Petroleum Dakshin Marg', x: -245, z: 315 },
  { id: 'garage_22', type: 'garage', name: 'Sector 22 Customs & Respray', x: -340, z: 75 },
  { id: 'garage_ind', type: 'garage', name: 'Elante Auto Works & Tuning', x: 340, z: 75 },
  { id: 'safehouse_22', type: 'safehouse', name: 'Sector 22 Kothi Safehouse', x: -460, z: 185 },
  { id: 'safehouse_8', type: 'safehouse', name: 'Sector 8 Heritage Villa', x: 140, z: -420 }
];

export const VEHICLE_CATALOG = {
  hatchback: {
    id: 'hatchback',
    name: 'Marut-800 DX',
    category: 'Hatchback',
    price: 0,
    unlockedByDefault: true,
    maxSpeed: 42,
    accel: 26,
    brake: 36,
    turnRate: 2.55,
    grip: 0.92,
    mass: 950,
    maxHealth: 100,
    width: 1.9,
    height: 1.45,
    length: 3.7,
    defaultColor: '#e11d48',
    description: 'Classic nimble Chandigarh family hatchback. Easy to park in Sector 22.'
  },
  sedan: {
    id: 'sedan',
    name: 'Hindustan Royale / Dzire',
    category: 'Sedan',
    price: 4500,
    unlockedByDefault: true,
    maxSpeed: 48,
    accel: 29,
    brake: 38,
    turnRate: 2.35,
    grip: 0.90,
    mass: 1250,
    maxHealth: 125,
    width: 2.05,
    height: 1.5,
    length: 4.4,
    defaultColor: '#f8fafc',
    description: 'Comfortable executive sedan favored by VIP officials and Chandigarh taxis.'
  },
  suv: {
    id: 'suv',
    name: 'Sher-E-Punjab 4x4 Thar',
    category: 'SUV',
    price: 8500,
    unlockedByDefault: false,
    maxSpeed: 54,
    accel: 34,
    brake: 40,
    turnRate: 2.25,
    grip: 0.94,
    mass: 1850,
    maxHealth: 175,
    width: 2.25,
    height: 1.95,
    length: 4.5,
    defaultColor: '#1e293b',
    description: 'Gedi Route king! High-clearance 4x4 SUV with heavy bullbars and deep bass.'
  },
  sports: {
    id: 'sports',
    name: 'Corbusier GT-X',
    category: 'Luxury Sports',
    price: 18000,
    unlockedByDefault: false,
    maxSpeed: 68,
    accel: 45,
    brake: 48,
    turnRate: 2.65,
    grip: 0.96,
    mass: 1400,
    maxHealth: 130,
    width: 2.15,
    height: 1.25,
    length: 4.6,
    defaultColor: '#f59e0b',
    description: 'Low-slung twin-turbo supercar seen cruising Sector 9 & Madhya Marg at midnight.'
  },
  autorickshaw: {
    id: 'autorickshaw',
    name: 'Chandigarh Tuk-Tuk Auto',
    category: 'Auto-Rickshaw',
    price: 2500,
    unlockedByDefault: true,
    maxSpeed: 33,
    accel: 22,
    brake: 34,
    turnRate: 3.25,
    grip: 0.85,
    mass: 650,
    maxHealth: 80,
    width: 1.55,
    height: 1.75,
    length: 2.9,
    defaultColor: '#16a34a',
    description: 'Iconic yellow-and-green three-wheeler with unbeatable turning radius.'
  },
  bike: {
    id: 'bike',
    name: 'Royal Punjabi Cruiser 350',
    category: 'Motorcycle',
    price: 3500,
    unlockedByDefault: true,
    maxSpeed: 56,
    accel: 38,
    brake: 42,
    turnRate: 3.1,
    grip: 0.91,
    mass: 420,
    maxHealth: 75,
    width: 0.95,
    height: 1.35,
    length: 2.3,
    defaultColor: '#b91c1c',
    description: 'Heavy thumping cruiser bike built for weaving through ISBT traffic.'
  },
  bus: {
    id: 'bus',
    name: 'CTU Low-Floor City Bus',
    category: 'Heavy Bus',
    price: 12000,
    unlockedByDefault: false,
    maxSpeed: 36,
    accel: 18,
    brake: 30,
    turnRate: 1.65,
    grip: 0.88,
    mass: 5200,
    maxHealth: 320,
    width: 2.65,
    height: 3.1,
    length: 9.2,
    defaultColor: '#dc2626',
    description: 'Chandigarh Transport Undertaking commuter bus. Massive momentum through roadblocks.'
  },
  police: {
    id: 'police',
    name: 'Chandigarh Police PCR Interceptor',
    category: 'Emergency / Law',
    price: 15000,
    unlockedByDefault: false,
    maxSpeed: 60,
    accel: 39,
    brake: 44,
    turnRate: 2.5,
    grip: 0.95,
    mass: 1750,
    maxHealth: 200,
    width: 2.2,
    height: 1.85,
    length: 4.6,
    defaultColor: '#ffffff',
    description: 'High-speed Chandigarh Police PCR unit equipped with roof beacon & bullbar.'
  },
  ambulance: {
    id: 'ambulance',
    name: 'PGIMER Rapid Ambulance 108',
    category: 'Emergency',
    price: 9500,
    unlockedByDefault: false,
    maxSpeed: 52,
    accel: 32,
    brake: 40,
    turnRate: 2.2,
    grip: 0.92,
    mass: 2100,
    maxHealth: 190,
    width: 2.25,
    height: 2.35,
    length: 5.2,
    defaultColor: '#f8fafc',
    description: 'Emergency medical response van with active sirens and sturdy chassis.'
  }
};

export const CORE_MISSIONS = [
  {
    id: 'm1_pickup',
    number: 1,
    title: 'Mission 1: The Pickup',
    category: 'Story',
    brief: 'Pick up Roshan outside Sector 17 Plaza and rush him to Sukhna Lake Promenade before sunset boat closing time.',
    reward: 2500,
    timeLimit: 95,
    weather: 'sunny',
    requiredVehicle: null,
    rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 100 },
    stages: [
      { type: 'goto', label: 'Pick up Roshan at Sector 17 Plaza Entrance', x: -140, z: -55, radius: 14 },
      { type: 'goto', label: 'Drive Roshan to Sukhna Lake Boat Club', x: 350, z: -320, radius: 16 }
    ]
  },
  {
    id: 'm2_discipline',
    number: 2,
    title: 'Mission 2: Traffic Discipline',
    category: 'Traffic Rules',
    brief: 'Chandigarh Traffic Police exam! Drive from Sector 22 Market to Sector 17 Plaza without crossing a red light, crashing, or exceeding 80 km/h.',
    reward: 3500,
    timeLimit: 110,
    weather: 'sunny',
    requiredVehicle: null,
    rules: { noRedLight: true, noCrash: true, speedLimit: 80, maxDamage: 2 },
    stages: [
      { type: 'goto', label: 'Start at Sector 22 Market Checkout', x: -340, z: 35, radius: 14 },
      { type: 'goto', label: 'Pass Matka Chowk Checkpoint Cleanly', x: -280, z: -140, radius: 15 },
      { type: 'goto', label: 'Stop inside Sector 17 Plaza Inspection Bay', x: -140, z: -55, radius: 14 }
    ]
  },
  {
    id: 'm3_redlight',
    number: 3,
    title: 'Mission 3: The Red Light',
    category: 'Police Action',
    brief: 'Trigger the CCTV speed/red-light camera at Madhya Marg Chowk to draw away PCR patrols, then lose the police and reach the Sector 22 Safehouse.',
    reward: 4000,
    timeLimit: 130,
    weather: 'sunset',
    requiredVehicle: null,
    rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 100 },
    stages: [
      { type: 'trigger_wanted', label: 'Blast through Madhya Marg Intersection Camera to trigger Level 2 Pursuit', x: 0, z: -280, radius: 18, wantedTarget: 2 },
      { type: 'escape_and_goto', label: 'Evade PCR Line-of-Sight & Reach Sector 22 Safehouse', x: -450, z: 180, radius: 16 }
    ]
  },
  {
    id: 'm4_airport',
    number: 4,
    title: 'Mission 4: Airport Drop',
    category: 'Story',
    brief: 'Pick up an NRI passenger from Panjab University Gate and sprint across Dakshin Marg to Chandigarh International Airport before check-in closes!',
    reward: 4500,
    timeLimit: 115,
    weather: 'sunny',
    requiredVehicle: null,
    rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 100 },
    stages: [
      { type: 'goto', label: 'Pick up Passenger at Panjab University Gate', x: -320, z: -320, radius: 15 },
      { type: 'goto', label: 'Pass Tribune Chowk Flyover Corridor', x: 140, z: 280, radius: 18 },
      { type: 'goto', label: 'Drop Passenger at Airport Departure Terminal', x: 140, z: 610, radius: 18 }
    ]
  },
  {
    id: 'm5_delivery',
    number: 5,
    title: 'Mission 5: The Delivery',
    category: 'Precision',
    brief: 'Deliver fragile architectural blueprints from Capitol Complex to Elante Mall Corporate Office while obeying traffic signals and keeping damage under 15%.',
    reward: 4800,
    timeLimit: 125,
    weather: 'cloudy',
    requiredVehicle: null,
    rules: { noRedLight: true, noCrash: false, speedLimit: 95, maxDamage: 15 },
    stages: [
      { type: 'goto', label: 'Collect Blueprints at Capitol Complex Gate', x: -140, z: -595, radius: 15 },
      { type: 'goto', label: 'Deliver Undamaged Blueprints to Elante Mall', x: 350, z: 140, radius: 16 }
    ]
  },
  {
    id: 'm6_police_chase',
    number: 6,
    title: 'Mission 6: Police Chase',
    category: 'Police Action',
    brief: 'You are ambushed by a Level 3 Tactical Roadblock unit near ISBT 17! Break through the cordon, shake off the pursuit, and reach the Sector 8 Safehouse.',
    reward: 5500,
    timeLimit: 140,
    weather: 'night',
    requiredVehicle: null,
    startWanted: 3,
    rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 100 },
    stages: [
      { type: 'goto', label: 'Break through the Udyog Path Cordon', x: 120, z: 0, radius: 18 },
      { type: 'escape_and_goto', label: 'Clear Wanted Level & Hide at Sector 8 Heritage Safehouse', x: 140, z: -410, radius: 16 }
    ]
  },
  {
    id: 'm7_vip_escort',
    number: 7,
    title: 'Mission 7: VIP Escort',
    category: 'Precision',
    brief: 'Chauffeur a High Court dignitary from Rose Garden to Capitol Secretariat without a single scratch on the vehicle!',
    reward: 6000,
    timeLimit: 110,
    weather: 'sunny',
    requiredVehicle: null,
    rules: { noRedLight: false, noCrash: true, speedLimit: false, maxDamage: 3 },
    stages: [
      { type: 'goto', label: 'Pick up Dignitary at Zakir Hussain Rose Garden', x: -320, z: -140, radius: 15 },
      { type: 'goto', label: 'Escort Smoothly to Capitol Complex Secretariat', x: -140, z: -610, radius: 16 }
    ]
  },
  {
    id: 'm8_parking',
    number: 8,
    title: 'Mission 8: Parking Challenge',
    category: 'Skill',
    brief: 'Navigate tight cones and park cleanly at under 5 km/h inside 3 designated bays at Sector 17, ISBT 17, and Elante Mall without touching any cars.',
    reward: 4200,
    timeLimit: 120,
    weather: 'sunny',
    requiredVehicle: null,
    rules: { noRedLight: false, noCrash: true, speedLimit: false, maxDamage: 5 },
    stages: [
      { type: 'park', label: 'Stop Completely inside Sector 17 Parking Bay #1', x: -95, z: -35, radius: 7 },
      { type: 'park', label: 'Stop Completely inside ISBT 17 Bus Bay #2', x: -95, z: 85, radius: 7 },
      { type: 'park', label: 'Stop Completely inside Elante VIP Slot #3', x: 335, z: 95, radius: 7 }
    ]
  },
  {
    id: 'm9_taxi',
    number: 9,
    title: 'Mission 9: The Taxi Driver',
    category: 'Career',
    brief: 'Complete 3 back-to-back Chandigarh passenger fares cleanly to maintain a 5-Star Driver Rating and earn big tips.',
    reward: 5200,
    timeLimit: 160,
    weather: 'sunny',
    requiredVehicle: null,
    rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 35 },
    stages: [
      { type: 'goto', label: 'Fare 1 Pickup: ISBT Sector 43 Stand', x: -330, z: 330, radius: 15 },
      { type: 'goto', label: 'Fare 1 Drop & Fare 2 Pickup: Sector 17 Plaza', x: -140, z: -45, radius: 15 },
      { type: 'goto', label: 'Fare 2 Drop & Fare 3 Pickup: Sukhna Lake', x: 320, z: -320, radius: 15 },
      { type: 'goto', label: 'Fare 3 Final Drop: Chandigarh Railway Station', x: 340, z: 340, radius: 16 }
    ]
  },
  {
    id: 'm10_sprint',
    number: 10,
    title: 'Mission 10: Sector Sprint (Gedi Route Race)',
    category: 'Racing',
    brief: 'High-speed checkpoint sprint along Madhya Marg, Sukhna Path, and Jan Marg! Hit all 5 checkpoints before the rival street racers timer expires.',
    reward: 6500,
    timeLimit: 95,
    weather: 'sunset',
    requiredVehicle: null,
    rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 100 },
    stages: [
      { type: 'goto', label: 'Checkpoint 1/5: Jan Marg Roundabout', x: -280, z: 0, radius: 18 },
      { type: 'goto', label: 'Checkpoint 2/5: Madhya Marg West', x: -280, z: -280, radius: 18 },
      { type: 'goto', label: 'Checkpoint 3/5: Madhya Marg Central', x: 0, z: -280, radius: 18 },
      { type: 'goto', label: 'Checkpoint 4/5: Sukhna Lake Turnoff', x: 280, z: -280, radius: 18 },
      { type: 'goto', label: 'Finish Line 5/5: Elante Expressway', x: 280, z: 0, radius: 20 }
    ]
  },
  {
    id: 'm11_emergency',
    number: 11,
    title: 'Mission 11: Emergency Response',
    category: 'Emergency',
    brief: 'Commandeer the Emergency Response unit! Rush medical aid to an incident at Rock Garden and transport the patient to Sector 16 General Hospital.',
    reward: 5800,
    timeLimit: 105,
    weather: 'rain',
    spawnVehicle: 'ambulance',
    rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 40 },
    stages: [
      { type: 'goto', label: 'Respond to Incident at Rock Garden Gate', x: 140, z: -590, radius: 16 },
      { type: 'goto', label: 'Rush Patient to Sector 16 Hospital Emergency Wing', x: -310, z: -195, radius: 16 }
    ]
  },
  {
    id: 'm12_getaway',
    number: 12,
    title: 'Mission 12: The Getaway (Grand Finale)',
    category: 'Heist Finale',
    brief: 'After a high-stakes diamond heist near Elante, survive a Level 4 Heavy Pursuit in monsoon rain, hit the Railway Station drop-off, and escape to Airport Runway!',
    reward: 12000,
    timeLimit: 165,
    weather: 'rain',
    startWanted: 4,
    rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 100 },
    stages: [
      { type: 'goto', label: 'Drop Heist Crew at Chandigarh Railway Station', x: 350, z: 340, radius: 18 },
      { type: 'goto', label: 'Pass Dakshin Marg Police Barricade', x: 0, z: 280, radius: 18 },
      { type: 'escape_and_goto', label: 'Lose Police & Board Private Jet at Airport Runway', x: 140, z: 640, radius: 20 }
    ]
  }
];

// Generate 22 additional playable mission variations across all landmarks, weather & difficulty
export const MISSION_VARIATIONS = [
  { id: 'v1', number: 13, title: 'Variation 13: Monsoon Tuk-Tuk Dash', category: 'Side Contract', brief: 'Drive from ISBT 43 to Rose Garden during heavy monsoon rain.', reward: 2200, timeLimit: 90, weather: 'rain', rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 100 }, stages: [{ type: 'goto', label: 'Reach Rose Garden Gate in Rain', x: -320, z: -140, radius: 15 }] },
  { id: 'v2', number: 14, title: 'Variation 14: Midnight Gedi Sprint', category: 'Racing', brief: 'Nighttime high-speed sprint from Panjab University to Sukhna Lake.', reward: 3200, timeLimit: 75, weather: 'night', rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 100 }, stages: [{ type: 'goto', label: 'Hit Madhya Marg Chowk', x: 0, z: -280, radius: 18 }, { type: 'goto', label: 'Finish at Sukhna Lake', x: 340, z: -340, radius: 16 }] },
  { id: 'v3', number: 15, title: 'Variation 15: Foggy Morning Challan Test', category: 'Traffic Rules', brief: 'Zero violations allowed! Drive from Railway Station to Sector 17 in dense winter fog.', reward: 3800, timeLimit: 120, weather: 'fog', rules: { noRedLight: true, noCrash: true, speedLimit: 80, maxDamage: 5 }, stages: [{ type: 'goto', label: 'Reach Sector 17 Plaza Safely', x: -140, z: -55, radius: 15 }] },
  { id: 'v4', number: 16, title: 'Variation 16: Student Centre Food Express', category: 'Courier', brief: 'Deliver hot parathas from Panjab University StuC to Sector 22 Market.', reward: 2100, timeLimit: 70, weather: 'sunny', rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 25 }, stages: [{ type: 'goto', label: 'Pickup at PU StuC', x: -340, z: -340, radius: 15 }, { type: 'goto', label: 'Drop at Sector 22 Market', x: -340, z: 95, radius: 15 }] },
  { id: 'v5', number: 17, title: 'Variation 17: Shatabdi Express Connection', category: 'Taxi', brief: 'Rush a late traveller from Sector 17 ISBT to Chandigarh Railway Station.', reward: 2900, timeLimit: 80, weather: 'sunset', rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 100 }, stages: [{ type: 'goto', label: 'Pickup at ISBT 17', x: -120, z: 95, radius: 15 }, { type: 'goto', label: 'Reach Railway Station Platform', x: 340, z: 340, radius: 16 }] },
  { id: 'v6', number: 18, title: 'Variation 18: High Court Security Run', category: 'VIP', brief: 'Escort confidential files from Capitol Complex to District Courts Sector 43 without crashing.', reward: 4400, timeLimit: 110, weather: 'sunny', rules: { noRedLight: false, noCrash: true, speedLimit: false, maxDamage: 2 }, stages: [{ type: 'goto', label: 'Start at Capitol Complex', x: -140, z: -595, radius: 15 }, { type: 'goto', label: 'Reach Sector 43 Courts', x: -340, z: 340, radius: 16 }] },
  { id: 'v7', number: 19, title: 'Variation 19: Sukhna Sunrise Sightseeing', category: 'Sightseeing', brief: 'Tour 3 heritage landmarks: Capitol Complex, Rock Garden, and Sukhna Lake.', reward: 3600, timeLimit: 130, weather: 'sunset', rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 100 }, stages: [{ type: 'goto', label: 'Visit Capitol Complex', x: -140, z: -590, radius: 16 }, { type: 'goto', label: 'Visit Rock Garden', x: 140, z: -590, radius: 16 }, { type: 'goto', label: 'Visit Sukhna Lake', x: 340, z: -340, radius: 16 }] },
  { id: 'v8', number: 20, title: 'Variation 20: Industrial Cargo Haul', category: 'Courier', brief: 'Transport heavy electronics from Industrial Area Elante to Airport Cargo Bay.', reward: 3300, timeLimit: 95, weather: 'cloudy', rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 20 }, stages: [{ type: 'goto', label: 'Load at Elante Industrial Hub', x: 340, z: 140, radius: 15 }, { type: 'goto', label: 'Unload at Airport Cargo Terminal', x: 140, z: 610, radius: 16 }] },
  { id: 'v9', number: 21, title: 'Variation 21: Dakshin Marg Drag Strip', category: 'Racing', brief: 'Flat-out drag race along Dakshin Marg from West to East!', reward: 3900, timeLimit: 55, weather: 'sunny', rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 100 }, stages: [{ type: 'goto', label: 'Start Line: Dakshin Marg West', x: -520, z: 280, radius: 18 }, { type: 'goto', label: 'Midpoint: Dakshin Marg Roundabout', x: 0, z: 280, radius: 18 }, { type: 'goto', label: 'Finish: Dakshin Marg East', x: 520, z: 280, radius: 18 }] },
  { id: 'v10', number: 22, title: 'Variation 22: PCR Heat Evasion (Level 4)', category: 'Police Action', brief: 'Survive a Level 4 pursuit in thick fog and escape to Panjab University campus.', reward: 6200, timeLimit: 150, weather: 'fog', startWanted: 4, rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 100 }, stages: [{ type: 'escape_and_goto', label: 'Evade Level 4 Police & Reach PU Campus', x: -340, z: -340, radius: 16 }] },
  { id: 'v11', number: 23, title: 'Variation 23: Precision Rain Parking', category: 'Skill', brief: 'Park cleanly on slick wet asphalt at Sukhna Lake and Rock Garden.', reward: 3700, timeLimit: 105, weather: 'rain', rules: { noRedLight: false, noCrash: true, speedLimit: false, maxDamage: 5 }, stages: [{ type: 'park', label: 'Park at Sukhna Bay', x: 320, z: -295, radius: 7 }, { type: 'park', label: 'Park at Rock Garden Bay', x: 140, z: -575, radius: 7 }] },
  { id: 'v12', number: 24, title: 'Variation 24: CTU Bus Corridor Tour', category: 'Career', brief: 'Stop at 4 major bus stops connecting ISBT 43, Sector 22, Sector 17, and ISBT 17.', reward: 4600, timeLimit: 145, weather: 'sunny', spawnVehicle: 'bus', rules: { noRedLight: true, noCrash: false, speedLimit: false, maxDamage: 30 }, stages: [{ type: 'park', label: 'Bus Stop 1: ISBT 43', x: -310, z: 310, radius: 10 }, { type: 'park', label: 'Bus Stop 2: Sector 22 Market', x: -310, z: 95, radius: 10 }, { type: 'park', label: 'Bus Stop 3: Sector 17 Plaza', x: -120, z: -55, radius: 10 }, { type: 'park', label: 'Bus Stop 4: ISBT 17 Terminus', x: -120, z: 95, radius: 10 }] },
  { id: 'v13', number: 25, title: 'Variation 25: Midnight VIP Airport Run', category: 'VIP', brief: 'Drive a diplomat from Capitol Complex to the Airport at midnight without any police attention.', reward: 5100, timeLimit: 120, weather: 'night', rules: { noRedLight: true, noCrash: true, speedLimit: false, maxDamage: 5 }, stages: [{ type: 'goto', label: 'Pickup at Capitol Complex', x: -140, z: -595, radius: 15 }, { type: 'goto', label: 'Reach Airport VIP Gate', x: 140, z: 610, radius: 16 }] },
  { id: 'v14', number: 26, title: 'Variation 26: Rose Garden Floral Delivery', category: 'Courier', brief: 'Deliver fresh rose bouquets to Elante Mall before they wilt.', reward: 2600, timeLimit: 80, weather: 'sunny', rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 20 }, stages: [{ type: 'goto', label: 'Pickup at Rose Garden', x: -320, z: -140, radius: 15 }, { type: 'goto', label: 'Drop at Elante Mall Entrance', x: 340, z: 140, radius: 15 }] },
  { id: 'v15', number: 27, title: 'Variation 27: Citywide Lockdown Survival (Level 5)', category: 'Police Action', brief: 'Maximum heat! Survive a Level 5 Citywide Search and reach the Airport hangar.', reward: 9500, timeLimit: 180, weather: 'night', startWanted: 5, rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 100 }, stages: [{ type: 'escape_and_goto', label: 'Evade Level 5 Search & Reach Airport Hangar', x: 180, z: 630, radius: 18 }] },
  { id: 'v16', number: 28, title: 'Variation 28: Jan Marg Speed Trial', category: 'Racing', brief: 'North-to-South time trial down Jan Marg from Capitol Complex to ISBT 43.', reward: 3400, timeLimit: 65, weather: 'sunny', rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 100 }, stages: [{ type: 'goto', label: 'Start at Jan Marg North', x: -280, z: -540, radius: 18 }, { type: 'goto', label: 'Pass Jan Marg Central', x: -280, z: 0, radius: 18 }, { type: 'goto', label: 'Finish at Jan Marg South', x: -280, z: 540, radius: 18 }] },
  { id: 'v17', number: 29, title: 'Variation 29: Monsoon Ambulance Rescue', category: 'Emergency', brief: 'Respond to a highway pileup near Railway Station and rush to Sector 16 Hospital.', reward: 4900, timeLimit: 100, weather: 'rain', spawnVehicle: 'ambulance', rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 35 }, stages: [{ type: 'goto', label: 'Reach Railway Station Incident', x: 340, z: 340, radius: 16 }, { type: 'goto', label: 'Return to Sector 16 Hospital', x: -310, z: -195, radius: 16 }] },
  { id: 'v18', number: 30, title: 'Variation 30: Strict Chauffeur Exam II', category: 'Traffic Rules', brief: 'Obey all traffic lights and stay under 80 km/h from Sukhna Lake to ISBT 43.', reward: 4300, timeLimit: 135, weather: 'cloudy', rules: { noRedLight: true, noCrash: true, speedLimit: 80, maxDamage: 3 }, stages: [{ type: 'goto', label: 'Start at Sukhna Lake', x: 320, z: -320, radius: 15 }, { type: 'goto', label: 'Finish Cleanly at ISBT 43', x: -320, z: 320, radius: 15 }] },
  { id: 'v19', number: 31, title: 'Variation 31: Perimeter Ring Rally', category: 'Racing', brief: 'Complete a full high-speed lap around Chandigarh’s outer arterial ring!', reward: 7500, timeLimit: 140, weather: 'sunset', rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 100 }, stages: [{ type: 'goto', label: 'Corner 1: North-West', x: -560, z: -560, radius: 22 }, { type: 'goto', label: 'Corner 2: North-East', x: 560, z: -560, radius: 22 }, { type: 'goto', label: 'Corner 3: South-East', x: 560, z: 560, radius: 22 }, { type: 'goto', label: 'Corner 4: South-West Finish', x: -560, z: 560, radius: 22 }] },
  { id: 'v20', number: 32, title: 'Variation 32: Inspector Patrol Duty', category: 'Police Action', brief: 'Patrol 3 major roundabouts in a Police PCR Interceptor in under 90 seconds.', reward: 4700, timeLimit: 90, weather: 'night', spawnVehicle: 'police', rules: { noRedLight: false, noCrash: false, speedLimit: false, maxDamage: 40 }, stages: [{ type: 'goto', label: 'Patrol Matka Chowk', x: 0, z: -280, radius: 18 }, { type: 'goto', label: 'Patrol Sector 17 Chowk', x: 0, z: 0, radius: 18 }, { type: 'goto', label: 'Patrol Tribune Chowk', x: 280, z: 280, radius: 18 }] }
];

export const ALL_MISSIONS = [...CORE_MISSIONS, ...MISSION_VARIATIONS];

export const CHEAT_CODES = {
  FULLHEALTH: { desc: 'Restored player health & armor to 100%' },
  REPAIRCAR: { desc: 'Repaired current vehicle engine, body & refilled fuel' },
  ADD5000: { desc: 'Credited ₹5,000 to player wallet' },
  SPAWNCAR: { desc: 'Spawned Hindustan Royale Sedan ahead of player' },
  SPAWNSUV: { desc: 'Spawned Sher-E-Punjab 4x4 Thar SUV ahead of player' },
  SPAWNBIKE: { desc: 'Spawned Royal Punjabi Cruiser 350 Motorcycle' },
  NOS: { desc: 'Activated High-Octane Nitro Boost + Refilled NOS Tank' },
  CLEARCHASE: { desc: 'Cleared Chandigarh Police Wanted Level to 0' },
  WANTEDUP: { desc: 'Increased Police Wanted Level (+1 Star)' },
  WANTEDDOWN: { desc: 'Decreased Police Wanted Level (-1 Star)' },
  SUNNYDAY: { desc: 'Set weather to Clear Chandigarh Sunshine (11:30 AM)' },
  RAINMODE: { desc: 'Activated Shivalik Monsoon Rain & Wet Roads' },
  MIDNIGHT: { desc: 'Set time to 00:00 Midnight with Neon Streetlights' },
  SUPERJUMP: { desc: 'Toggled Super-Jump mode when on foot' },
  SLOWMO: { desc: 'Toggled Cinematic Slow-Motion time dilation (0.45x)' }
};
