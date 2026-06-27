// Seed script for sample itineraries
// Run with: node server/seed-samples.mjs
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const conn = await mysql.createConnection(DATABASE_URL);

// First, ensure we have a system user for sample data
const [existingUser] = await conn.execute(
  "SELECT id FROM users WHERE openId = 'system-sample-user' LIMIT 1"
);

let systemUserId;
if (existingUser.length === 0) {
  const [result] = await conn.execute(
    "INSERT INTO users (openId, name, email, role) VALUES ('system-sample-user', 'WanderWiki Team', 'team@wanderwiki.com', 'admin')"
  );
  systemUserId = result.insertId;
} else {
  systemUserId = existingUser[0].id;
}

// Sample itineraries with detailed stops
const sampleItineraries = [
  {
    title: "Sicily Road Trip Loop",
    destination: "Sicily, Italy",
    country: "Italy",
    description: "A 10-day road trip around Sicily starting and ending at Catania airport. Covers ancient ruins, stunning coastlines, and incredible food.",
    startDate: "2025-04-10",
    endDate: "2025-04-19",
    duration: 10,
    travelStyle: "solo",
    isPublic: true,
    currency: "EUR",
    status: "completed",
    stops: [
      { day: 1, order: 0, title: "Catania Airport Pickup", category: "must-do", address: "Catania-Fontanarossa Airport, Catania", lat: "37.4668", lng: "15.0664", startTime: "10:00", endTime: "11:00", cost: "35", costCategory: "transport", notes: "Pick up rental car" },
      { day: 1, order: 1, title: "Taormina - Greek Theatre", category: "must-see", address: "Via Teatro Antico, Taormina", lat: "37.8523", lng: "15.2920", startTime: "12:30", endTime: "14:30", cost: "13", costCategory: "activities", notes: "Stunning views of Mt Etna" },
      { day: 1, order: 2, title: "Trattoria Da Nino", category: "must-eat", address: "Via Luigi Pirandello 37, Taormina", lat: "37.8516", lng: "15.2882", startTime: "15:00", endTime: "16:30", cost: "25", costCategory: "food", notes: "Try the pasta alla norma" },
      { day: 1, order: 3, title: "Hotel Villa Belvedere", category: "must-see", address: "Via Bagnoli Croci 79, Taormina", lat: "37.8533", lng: "15.2877", startTime: "17:00", endTime: "17:30", cost: "95", costCategory: "accommodation", notes: "Check-in, sea view room" },
      { day: 2, order: 0, title: "Drive to Cefalù", category: "must-do", address: "Cefalù, Sicily", lat: "38.0386", lng: "14.0226", startTime: "09:00", endTime: "11:00", cost: "20", costCategory: "transport", notes: "2hr scenic coastal drive" },
      { day: 2, order: 1, title: "Cefalù Cathedral", category: "must-see", address: "Piazza del Duomo, Cefalù", lat: "38.0397", lng: "14.0236", startTime: "11:30", endTime: "12:30", cost: "0", costCategory: "activities", notes: "Norman-era mosaics" },
      { day: 2, order: 2, title: "Cefalù Beach", category: "must-do", address: "Lungomare Giuseppe Giardina, Cefalù", lat: "38.0371", lng: "14.0194", startTime: "13:00", endTime: "15:00", cost: "0", costCategory: "activities", notes: "Crystal clear water" },
      { day: 2, order: 3, title: "La Brace Restaurant", category: "must-eat", address: "Via XXV Novembre 10, Cefalù", lat: "38.0389", lng: "14.0227", startTime: "19:30", endTime: "21:00", cost: "35", costCategory: "food", notes: "Fresh seafood" },
      { day: 3, order: 0, title: "Drive to Palermo", category: "must-do", address: "Palermo, Sicily", lat: "38.1157", lng: "13.3615", startTime: "09:00", endTime: "10:00", cost: "15", costCategory: "transport", notes: "1hr drive" },
      { day: 3, order: 1, title: "Palermo Cathedral", category: "must-see", address: "Via Vittorio Emanuele, Palermo", lat: "38.1148", lng: "13.3566", startTime: "10:30", endTime: "12:00", cost: "7", costCategory: "activities", notes: "Rooftop access for views" },
      { day: 3, order: 2, title: "Ballarò Street Market", category: "must-try", address: "Via Ballarò, Palermo", lat: "38.1108", lng: "13.3591", startTime: "12:30", endTime: "14:00", cost: "15", costCategory: "food", notes: "Street food: arancini, panelle" },
      { day: 3, order: 3, title: "B&B Palermo Centro", category: "must-see", address: "Via Maqueda 200, Palermo", lat: "38.1157", lng: "13.3615", startTime: "15:00", endTime: "15:30", cost: "70", costCategory: "accommodation", notes: "Central location" },
      { day: 4, order: 0, title: "Monreale Cathedral", category: "must-see", address: "Piazza Guglielmo II, Monreale", lat: "38.0819", lng: "13.2919", startTime: "09:00", endTime: "11:00", cost: "10", costCategory: "activities", notes: "Best mosaics in Sicily" },
      { day: 4, order: 1, title: "Drive to Agrigento", category: "must-do", address: "Agrigento, Sicily", lat: "37.3111", lng: "13.5766", startTime: "11:30", endTime: "14:00", cost: "25", costCategory: "transport", notes: "2.5hr drive south" },
      { day: 4, order: 2, title: "Valley of the Temples", category: "must-see", address: "Valle dei Templi, Agrigento", lat: "37.2906", lng: "13.5881", startTime: "15:00", endTime: "18:00", cost: "13", costCategory: "activities", notes: "Go at sunset for best photos" },
      { day: 5, order: 0, title: "Drive to Syracuse", category: "must-do", address: "Syracuse, Sicily", lat: "37.0755", lng: "15.2866", startTime: "09:00", endTime: "11:30", cost: "25", costCategory: "transport", notes: "2.5hr drive east" },
      { day: 5, order: 1, title: "Ortigia Island Walk", category: "must-see", address: "Ortigia, Syracuse", lat: "37.0599", lng: "15.2933", startTime: "12:00", endTime: "14:00", cost: "0", costCategory: "activities", notes: "Beautiful baroque architecture" },
      { day: 5, order: 2, title: "Don Camillo Restaurant", category: "must-eat", address: "Via Maestranza 96, Syracuse", lat: "37.0588", lng: "15.2929", startTime: "20:00", endTime: "22:00", cost: "45", costCategory: "food", notes: "Michelin-recommended seafood" },
      { day: 6, order: 0, title: "Mount Etna Excursion", category: "must-do", address: "Mount Etna, Sicily", lat: "37.7510", lng: "14.9934", startTime: "08:00", endTime: "16:00", cost: "65", costCategory: "activities", notes: "Cable car + 4x4 to summit" },
      { day: 7, order: 0, title: "Catania Fish Market", category: "must-try", address: "Piazza Alonzo di Benedetto, Catania", lat: "37.5023", lng: "15.0872", startTime: "08:00", endTime: "10:00", cost: "10", costCategory: "food", notes: "La Pescheria - lively morning market" },
      { day: 7, order: 1, title: "Return Rental Car", category: "must-do", address: "Catania-Fontanarossa Airport", lat: "37.4668", lng: "15.0664", startTime: "14:00", endTime: "15:00", cost: "0", costCategory: "transport", notes: "Return car, fly home" },
    ],
  },
  {
    title: "Japan Golden Route",
    destination: "Tokyo → Kyoto → Osaka",
    country: "Japan",
    description: "12-day journey through Japan's cultural heartland. Bullet trains, temples, street food, and cherry blossoms.",
    startDate: "2025-03-25",
    endDate: "2025-04-05",
    duration: 12,
    travelStyle: "solo",
    isPublic: true,
    currency: "JPY",
    status: "completed",
    stops: [
      { day: 1, order: 0, title: "Narita Airport → Shinjuku", category: "must-do", address: "Shinjuku Station, Tokyo", lat: "35.6896", lng: "139.7006", startTime: "14:00", endTime: "16:00", cost: "3250", costCategory: "transport", notes: "Narita Express" },
      { day: 1, order: 1, title: "Shinjuku Gyoen Garden", category: "must-see", address: "11 Naitomachi, Shinjuku", lat: "35.6852", lng: "139.7100", startTime: "16:30", endTime: "18:00", cost: "500", costCategory: "activities", notes: "Cherry blossoms in spring" },
      { day: 1, order: 2, title: "Omoide Yokocho", category: "must-eat", address: "1 Chome Nishishinjuku, Shinjuku", lat: "35.6938", lng: "139.6989", startTime: "19:00", endTime: "21:00", cost: "2000", costCategory: "food", notes: "Yakitori alley" },
      { day: 2, order: 0, title: "Senso-ji Temple", category: "must-see", address: "2 Chome-3-1 Asakusa, Taito", lat: "35.7148", lng: "139.7967", startTime: "08:00", endTime: "10:00", cost: "0", costCategory: "activities", notes: "Go early to avoid crowds" },
      { day: 2, order: 1, title: "Tsukiji Outer Market", category: "must-eat", address: "4 Chome-16-2 Tsukiji, Chuo", lat: "35.6654", lng: "139.7707", startTime: "11:00", endTime: "13:00", cost: "3000", costCategory: "food", notes: "Fresh sushi and tamagoyaki" },
      { day: 2, order: 2, title: "TeamLab Borderless", category: "must-do", address: "Azabudai Hills, Minato", lat: "35.6594", lng: "139.7350", startTime: "14:00", endTime: "16:30", cost: "3800", costCategory: "activities", notes: "Book tickets in advance" },
      { day: 3, order: 0, title: "Meiji Shrine", category: "must-see", address: "1-1 Yoyogikamizonocho, Shibuya", lat: "35.6764", lng: "139.6993", startTime: "08:00", endTime: "09:30", cost: "0", costCategory: "activities", notes: "Peaceful morning walk" },
      { day: 3, order: 1, title: "Shibuya Crossing", category: "must-see", address: "Shibuya Crossing, Shibuya", lat: "35.6595", lng: "139.7004", startTime: "10:00", endTime: "10:30", cost: "0", costCategory: "activities", notes: "View from Starbucks above" },
      { day: 3, order: 2, title: "Harajuku & Takeshita Street", category: "must-try", address: "Takeshita Street, Harajuku", lat: "35.6716", lng: "139.7031", startTime: "11:00", endTime: "13:00", cost: "1500", costCategory: "shopping", notes: "Crepes and fashion" },
      { day: 4, order: 0, title: "Shinkansen to Kyoto", category: "must-do", address: "Kyoto Station", lat: "34.9856", lng: "135.7584", startTime: "09:00", endTime: "11:15", cost: "14170", costCategory: "transport", notes: "Nozomi bullet train, 2hr15min" },
      { day: 4, order: 1, title: "Fushimi Inari Shrine", category: "must-see", address: "68 Fukakusa Yabunouchicho, Fushimi", lat: "34.9671", lng: "135.7727", startTime: "13:00", endTime: "15:30", cost: "0", costCategory: "activities", notes: "10,000 torii gates, hike to top" },
      { day: 4, order: 2, title: "Nishiki Market", category: "must-eat", address: "Nishiki Market, Nakagyo", lat: "35.0050", lng: "135.7649", startTime: "16:30", endTime: "18:00", cost: "2500", costCategory: "food", notes: "Kyoto's kitchen" },
      { day: 5, order: 0, title: "Arashiyama Bamboo Grove", category: "must-see", address: "Sagaogurayama Tabuchiyamacho, Ukyo", lat: "35.0094", lng: "135.6722", startTime: "07:00", endTime: "09:00", cost: "0", costCategory: "activities", notes: "Go at sunrise for empty paths" },
      { day: 5, order: 1, title: "Kinkaku-ji Golden Pavilion", category: "must-see", address: "1 Kinkakujicho, Kita", lat: "35.0394", lng: "135.7292", startTime: "10:00", endTime: "11:30", cost: "500", costCategory: "activities", notes: "Iconic golden temple" },
      { day: 5, order: 2, title: "Gion District Walk", category: "must-try", address: "Gion, Higashiyama, Kyoto", lat: "35.0037", lng: "135.7756", startTime: "17:00", endTime: "19:00", cost: "0", costCategory: "activities", notes: "Spot geisha at dusk" },
      { day: 6, order: 0, title: "Day trip to Nara", category: "must-do", address: "Nara Park, Nara", lat: "34.6851", lng: "135.8430", startTime: "09:00", endTime: "16:00", cost: "1500", costCategory: "activities", notes: "Friendly deer, Todai-ji temple" },
    ],
  },
  {
    title: "New Zealand South Island Loop",
    destination: "New Zealand",
    country: "New Zealand",
    description: "10-day self-drive loop of NZ's South Island. Mountains, glaciers, fjords, and adventure sports.",
    startDate: "2025-01-15",
    endDate: "2025-01-24",
    duration: 10,
    travelStyle: "couple",
    isPublic: true,
    currency: "NZD",
    status: "completed",
    stops: [
      { day: 1, order: 0, title: "Christchurch Airport Pickup", category: "must-do", address: "Christchurch Airport, NZ", lat: "-43.4894", lng: "172.5322", startTime: "09:00", endTime: "10:00", cost: "85", costCategory: "transport", notes: "Campervan pickup" },
      { day: 1, order: 1, title: "Drive to Lake Tekapo", category: "must-do", address: "Lake Tekapo, NZ", lat: "-44.0047", lng: "170.4772", startTime: "10:30", endTime: "13:30", cost: "40", costCategory: "transport", notes: "3hr drive, stunning scenery" },
      { day: 1, order: 2, title: "Church of the Good Shepherd", category: "must-see", address: "Pioneer Drive, Lake Tekapo", lat: "-44.0040", lng: "170.4815", startTime: "14:00", endTime: "15:00", cost: "0", costCategory: "activities", notes: "Iconic NZ photo spot" },
      { day: 2, order: 0, title: "Drive to Mt Cook", category: "must-do", address: "Aoraki/Mount Cook Village", lat: "-43.7340", lng: "170.0960", startTime: "08:00", endTime: "09:00", cost: "20", costCategory: "transport", notes: "1hr drive" },
      { day: 2, order: 1, title: "Hooker Valley Track", category: "must-do", address: "Hooker Valley Track, Mt Cook", lat: "-43.7175", lng: "170.0846", startTime: "09:30", endTime: "13:00", cost: "0", costCategory: "activities", notes: "3hr return hike, glacier views" },
      { day: 2, order: 2, title: "Drive to Queenstown", category: "must-do", address: "Queenstown, NZ", lat: "-45.0312", lng: "168.6626", startTime: "14:00", endTime: "18:00", cost: "50", costCategory: "transport", notes: "4hr scenic drive" },
      { day: 3, order: 0, title: "Bungee Jump - Kawarau Bridge", category: "must-do", address: "Kawarau Bridge, Queenstown", lat: "-45.0147", lng: "168.8272", startTime: "09:00", endTime: "11:00", cost: "235", costCategory: "activities", notes: "World's first bungee site" },
      { day: 3, order: 1, title: "Fergburger", category: "must-eat", address: "42 Shotover St, Queenstown", lat: "-45.0320", lng: "168.6614", startTime: "12:00", endTime: "13:00", cost: "25", costCategory: "food", notes: "Famous NZ burger joint" },
      { day: 3, order: 2, title: "Skyline Gondola & Luge", category: "must-try", address: "Brecon Street, Queenstown", lat: "-45.0253", lng: "168.6572", startTime: "14:00", endTime: "16:00", cost: "59", costCategory: "activities", notes: "Views + luge rides" },
      { day: 4, order: 0, title: "Milford Sound Cruise", category: "must-see", address: "Milford Sound, Fiordland", lat: "-44.6717", lng: "167.9264", startTime: "07:00", endTime: "17:00", cost: "120", costCategory: "activities", notes: "Full day trip from Queenstown" },
      { day: 5, order: 0, title: "Drive to Franz Josef", category: "must-do", address: "Franz Josef, West Coast", lat: "-43.3879", lng: "170.1834", startTime: "08:00", endTime: "13:00", cost: "60", costCategory: "transport", notes: "5hr drive via Haast Pass" },
      { day: 5, order: 1, title: "Franz Josef Glacier Walk", category: "must-see", address: "Franz Josef Glacier, NZ", lat: "-43.4285", lng: "170.1596", startTime: "14:00", endTime: "16:30", cost: "0", costCategory: "activities", notes: "Valley walk to glacier viewpoint" },
      { day: 6, order: 0, title: "Drive to Christchurch", category: "must-do", address: "Christchurch, NZ", lat: "-43.5321", lng: "172.6362", startTime: "08:00", endTime: "13:00", cost: "50", costCategory: "transport", notes: "5hr drive back via Arthur's Pass" },
      { day: 6, order: 1, title: "Return Campervan", category: "must-do", address: "Christchurch Airport", lat: "-43.4894", lng: "172.5322", startTime: "14:00", endTime: "15:00", cost: "0", costCategory: "transport", notes: "Drop off and fly home" },
    ],
  },
];

// Insert sample itineraries
for (const itin of sampleItineraries) {
  // Check if already exists
  const [existing] = await conn.execute(
    "SELECT id FROM itineraries WHERE title = ? AND userId = ? LIMIT 1",
    [itin.title, systemUserId]
  );

  if (existing.length > 0) {
    console.log(`Skipping "${itin.title}" - already exists`);
    continue;
  }

  const shareToken = Math.random().toString(36).substring(2, 18);
  const [result] = await conn.execute(
    `INSERT INTO itineraries (userId, title, destination, country, description, startDate, endDate, duration, travelStyle, isPublic, shareToken, currency, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [systemUserId, itin.title, itin.destination, itin.country, itin.description, itin.startDate, itin.endDate, itin.duration, itin.travelStyle, itin.isPublic, shareToken, itin.currency, itin.status]
  );

  const itineraryId = result.insertId;
  console.log(`Created "${itin.title}" (id: ${itineraryId})`);

  // Insert stops
  for (const stop of itin.stops) {
    const stopDate = itin.startDate
      ? new Date(new Date(itin.startDate).getTime() + (stop.day - 1) * 86400000).toISOString().split("T")[0]
      : null;

    await conn.execute(
      `INSERT INTO stops (itineraryId, dayNumber, orderIndex, title, category, address, lat, lng, startTime, endTime, cost, costCategory, stopDate, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [itineraryId, stop.day, stop.order, stop.title, stop.category, stop.address, stop.lat, stop.lng, stop.startTime, stop.endTime, stop.cost, stop.costCategory, stopDate, stop.notes]
    );
  }
  console.log(`  → Inserted ${itin.stops.length} stops`);
}

console.log("\nDone seeding sample itineraries!");
await conn.end();
