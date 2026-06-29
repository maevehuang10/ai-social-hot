import fs from "node:fs/promises";

const siteFile = new URL("../site/index.html", import.meta.url);
const timeZoneOffsetHours = 8;
const lookbackDays = 3;

const sources = [
  {
    key: "rakwireless",
    account: "RAKwireless",
    platform: "LinkedIn",
    url: "https://www.linkedin.com/company/rakwireless/",
    heat: "5",
    tags: ["Product", "LoRaWAN", "Gateway", "Sensor", "B2B"],
    title: "LoRaWAN solution content worth tracking",
    summary: "Daily collection: track how RAKwireless explains complete LoRaWAN solutions, especially gateway, node, sensor, and cloud workflows.",
    metrics: ["Public reactions need manual review", "Official LinkedIn account"],
    reason: "This is highly relevant to Ai-Thinker LoRa, gateway, and sensor-node audiences.",
    learn: "Can adapt: diagram LoRa module + gateway + cloud for agriculture, campus, or industrial monitoring."
  },
  {
    key: "espressif",
    account: "Espressif Systems",
    platform: "LinkedIn",
    url: "https://www.linkedin.com/company/espressif-systems",
    heat: "5",
    tags: ["Product", "ESP32", "Developer", "Wi-Fi", "Bluetooth"],
    title: "ESP32 developer ecosystem angle",
    summary: "Daily collection: ESP32 ecosystem posts are useful for tracking developer concerns beyond specs, including tools, production reliability, and use cases.",
    metrics: ["Public reactions need manual review", "Official LinkedIn account"],
    reason: "ESP32 is a core overseas keyword for Ai-Thinker content.",
    learn: "Can adapt: make an ESP32 Wi-Fi + BLE selection checklist for smart-home devices."
  },
  {
    key: "adafruit",
    account: "Adafruit Industries",
    platform: "YouTube",
    url: "https://www.youtube.com/@adafruit",
    heat: "4",
    tags: ["Tutorial", "Sensor", "Developer", "Electronics"],
    title: "Tutorial-first hardware content",
    summary: "Daily collection: tutorial-led hardware content usually starts with a clear problem, then shows parts, steps, and a visible result.",
    metrics: ["Post-level views visible on YouTube", "Tutorial channel"],
    reason: "Tutorial formats fit engineers and developers, and can be adapted for radar sensors, ESP32, and LoRa modules.",
    learn: "Can adapt: How to test a radar sensor for presence detection, using short reproducible steps."
  },
  {
    key: "ttn",
    account: "The Things Network",
    platform: "Website",
    url: "https://www.thethingsnetwork.org/",
    heat: "5",
    tags: ["Industry", "LoRaWAN", "Community", "Developer"],
    title: "LoRaWAN community deployment signal",
    summary: "Daily collection: community scale and deployment data help judge whether a technical ecosystem is active and worth following.",
    metrics: ["Community scale visible on website", "Gateway/member data"],
    reason: "Community deployment data is a strong trust signal for engineers and solution providers.",
    learn: "Can adapt: explain why LoRaWAN fits long-range low-power sensors using ecosystem proof."
  },
  {
    key: "stmicroelectronics",
    account: "STMicroelectronics",
    platform: "LinkedIn",
    url: "https://www.linkedin.com/company/stmicroelectronics",
    heat: "4",
    tags: ["Industry", "Sensor", "MCU", "Industrial IoT"],
    title: "Sensor and MCU application story",
    summary: "Daily collection: sensor and MCU application content is useful for industrial IoT, smart devices, and engineering audiences.",
    metrics: ["Public reactions need manual review", "Official LinkedIn account"],
    reason: "It helps turn hardware parameters into application scenarios and engineering value.",
    learn: "Can adapt: show how a radar sensor gives a device presence-detection capability."
  },
  {
    key: "silicon-labs",
    account: "Silicon Labs",
    platform: "LinkedIn",
    url: "https://www.linkedin.com/company/silicon-labs",
    heat: "4",
    tags: ["Industry", "Matter", "Wireless", "IoT"],
    title: "Wireless protocol education angle",
    summary: "Daily collection: wireless protocol education is useful for seeing how technical brands explain complex concepts clearly.",
    metrics: ["Public reactions need manual review", "Official LinkedIn account"],
    reason: "This overlaps with Ai-Thinker Wi-Fi, BLE, LoRa, and UWB audiences.",
    learn: "Can adapt: one visual explaining Wi-Fi, BLE, LoRa, and UWB roles in IoT devices."
  },
  {
    key: "digikey",
    account: "DigiKey",
    platform: "LinkedIn",
    url: "https://www.linkedin.com/company/digikey",
    heat: "4",
    tags: ["B2B", "Engineer", "Electronics", "Distributor"],
    title: "Engineer-friendly B2B content",
    summary: "Daily collection: B2B distributor content reflects what engineers and buyers care about, such as selection, supply, and application resources.",
    metrics: ["Public reactions visible on LinkedIn", "Official account"],
    reason: "It is close to real engineering and purchasing decision contexts.",
    learn: "Can adapt: wireless module selection checklist for Wi-Fi, LoRa, and UWB."
  },
  {
    key: "hackster",
    account: "Hackster.io",
    platform: "Website",
    url: "https://www.hackster.io/",
    heat: "4",
    tags: ["Industry", "Developer", "Community", "IoT"],
    title: "Developer project community signal",
    summary: "Daily collection: developer project communities show what real users are building, which is often more useful than generic product specs.",
    metrics: ["Stable official website", "Developer project community"],
    reason: "This can inspire smart-home, industrial monitoring, wireless sensor node, and edge-device topics.",
    learn: "Can adapt: collect 3 project scenarios for ESP32 / LoRa / radar sensor and turn them into a LinkedIn carousel."
  }
];

const slots = [
  { key: "morning", times: ["08:20", "08:35", "08:45", "08:55"], count: 4 },
  { key: "noon", times: ["12:10", "12:35"], count: 2 },
  { key: "afternoon", times: ["15:20", "16:40"], count: 2 },
  { key: "evening", times: ["19:30", "21:10"], count: 2 }
];

function getShanghaiDate(addDays = 0) {
  const shifted = new Date(Date.now() + timeZoneOffsetHours * 60 * 60 * 1000);
  shifted.setUTCDate(shifted.getUTCDate() + addDays);

  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");

  return {
    isoDate: `${year}-${month}-${day}`,
    compactDate: `${year}${month}${day}`,
    label: `${Number(month)}/${Number(day)}`
  };
}

function pickSource(dateKey, slotKey, index) {
  const seed = Number(dateKey.slice(-4)) + slotKey.length * 3;
  return sources[(seed + index) % sources.length];
}

function makeRecord(day, slot, time, index) {
  const source = pickSource(day.compactDate, slot.key, index);
  return {
    id: `seed-${day.compactDate}-${slot.key}-${source.key}-${index + 1}`,
    ...source,
    summary: `${slot.key} collection: ${source.summary}`,
    createdAt: `${day.isoDate}T${time}:00.000Z`
  };
}

function makeRecordsForDay(dayOffset) {
  const day = getShanghaiDate(dayOffset);
  const allowedSlots = dayOffset === 0 ? slots.slice(0, 1) : slots;
  const records = allowedSlots.flatMap(slot =>
    slot.times.slice(0, slot.count).map((time, index) => makeRecord(day, slot, time, index))
  );
  return { ...day, records };
}

function appendDateTabs(html, labels) {
  return html.replace(/const fixedDates = \[(.*?)\];/s, (match, dates) => {
    let nextDates = dates.trim();
    for (const label of labels) {
      if (!nextDates.includes(`"${label}"`)) {
        nextDates = nextDates ? `${nextDates}, "${label}"` : `"${label}"`;
      }
    }
    return `const fixedDates = [${nextDates}];`;
  });
}

function insertRecords(html, records) {
  // Use flexible marker that works regardless of indentation changes
  const pattern = /\n\s*];\s*\n\s*let captures = loadCaptures\(\);/;
  const match = html.match(pattern);
  if (!match) {
    throw new Error("Could not find seedCaptures closing marker.");
  }
  const marker = match[0];

  const existingIds = new Set([...html.matchAll(/"id":\s*"([^"]+)"|id:\s*"([^"]+)"/g)].map(match => match[1] || match[2]));
  const existingTimes = new Set([...html.matchAll(/"?createdAt"?\s*:\s*"([^"]+)"/g)].map(match => match[1]));
  const newRecords = records.filter(record => !existingIds.has(record.id) && !existingTimes.has(record.createdAt));
  if (!newRecords.length) return { html, added: 0 };

  const formatted = newRecords
    .map(record => JSON.stringify(record, null, 8).replace(/^/gm, "      "))
    .join(",\n");

  return {
    html: html.replace(marker, `,\n${formatted}${marker}`),
    added: newRecords.length
  };
}

const html = await fs.readFile(siteFile, "utf8");
const batches = Array.from({ length: lookbackDays }, (_, index) => makeRecordsForDay(-index));
const allRecords = batches.flatMap(batch => batch.records);
const labels = batches.map(batch => batch.label);

const inserted = insertRecords(html, allRecords);
const updatedHtml = appendDateTabs(inserted.html, labels);

if (updatedHtml !== html) {
  await fs.writeFile(siteFile, updatedHtml, "utf8");
}

console.log(`Added ${inserted.added} records across ${labels.join(", ")}.`);
