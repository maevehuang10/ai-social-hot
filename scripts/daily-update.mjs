import fs from "node:fs/promises";

const siteFile = new URL("../site/index.html", import.meta.url);
const timeZone = "Asia/Shanghai";

const sourcePool = [
  {
    account: "RAKwireless",
    platform: "LinkedIn",
    url: "https://www.linkedin.com/company/rakwireless/",
    heat: "5",
    tags: ["Product", "LoRaWAN", "Gateway", "Sensor", "B2B"],
    title: "LoRaWAN solution content worth tracking",
    summary: "今日自动收录：RAKwireless 适合观察 LoRaWAN 方案表达，尤其是网关、节点、传感器和云平台如何被组织成完整应用链路。",
    metrics: ["Public reactions need manual review", "Official LinkedIn account"],
    reason: "它和 Ai-Thinker 的 LoRa、网关、传感器节点用户高度相关，适合参考他们如何把硬件能力讲成场景方案。",
    learn: "可以做：一张图说明 LoRa module + gateway + cloud 在农业、园区或工业监测中的完整链路。"
  },
  {
    account: "Espressif Systems",
    platform: "LinkedIn",
    url: "https://www.linkedin.com/company/espressif-systems",
    heat: "5",
    tags: ["Product", "ESP32", "Developer", "Wi-Fi", "Bluetooth"],
    title: "ESP32 developer ecosystem angle",
    summary: "今日自动收录：ESP32 生态内容适合持续跟踪。海外开发者关注的不只是芯片参数，也包括开发工具、量产可靠性、应用案例和连接方式组合。",
    metrics: ["Public reactions need manual review", "Official LinkedIn account"],
    reason: "ESP32 是 Ai-Thinker 海外内容的核心关键词之一，官方生态账号的表达方式可以帮助优化模组内容结构。",
    learn: "可以做：ESP32 Wi-Fi + BLE 在智能家居设备里的选型逻辑，用开发者能快速理解的 checklist 表达。"
  },
  {
    account: "Adafruit Industries",
    platform: "YouTube",
    url: "https://www.youtube.com/@adafruit",
    heat: "4",
    tags: ["Tutorial", "Sensor", "Developer", "Electronics"],
    title: "Tutorial-first hardware content",
    summary: "今日自动收录：Adafruit 的教程型内容适合作为硬件品牌学习对象。它通常先提出清楚问题，再展示材料、步骤和结果。",
    metrics: ["Post-level views visible on YouTube", "Tutorial channel"],
    reason: "教程结构适合工程师和开发者用户，也适合把 Ai-Thinker 的雷达传感器、ESP32、LoRa 模组做成可复现内容。",
    learn: "可以做：How to test a radar sensor for presence detection，用短步骤展示真实效果。"
  },
  {
    account: "The Things Network",
    platform: "Website",
    url: "https://www.thethingsnetwork.org/",
    heat: "5",
    tags: ["Industry", "LoRaWAN", "Community", "Developer"],
    title: "LoRaWAN community deployment signal",
    summary: "今日自动收录：社区规模和真实部署信息能说明技术生态是否活跃，适合用于判断 LoRaWAN 内容方向是否值得跟进。",
    metrics: ["Community scale visible on website", "Gateway/member data"],
    reason: "社区部署数据对工程师和方案商来说是很强的信任信号。",
    learn: "可以做：LoRaWAN 为什么适合远距离低功耗传感器，用社区规模和真实部署做背书。"
  },
  {
    account: "STMicroelectronics",
    platform: "LinkedIn",
    url: "https://www.linkedin.com/company/stmicroelectronics",
    heat: "4",
    tags: ["Industry", "Sensor", "MCU", "Industrial IoT"],
    title: "Sensor and MCU application story",
    summary: "今日自动收录：传感器和 MCU 应用内容适合工业物联网、智能设备和工程师用户，能启发雷达/传感器类内容表达。",
    metrics: ["Public reactions need manual review", "Official LinkedIn account"],
    reason: "它能帮助我们把硬件参数转成应用场景和工程价值。",
    learn: "可以做：雷达传感器如何帮助设备获得 presence detection 能力，突出应用场景而非只讲参数。"
  },
  {
    account: "Silicon Labs",
    platform: "LinkedIn",
    url: "https://www.linkedin.com/company/silicon-labs",
    heat: "4",
    tags: ["Industry", "Matter", "Wireless", "IoT"],
    title: "Wireless protocol education angle",
    summary: "今日自动收录：无线协议、Matter、边缘设备和智能家居内容适合观察技术品牌如何讲清复杂概念。",
    metrics: ["Public reactions need manual review", "Official LinkedIn account"],
    reason: "这类内容和 Ai-Thinker 的 Wi-Fi、BLE、LoRa、UWB 用户群体高度相关。",
    learn: "可以做：一张图讲清 Wi-Fi、BLE、LoRa、UWB 在 IoT 设备里的分工。"
  },
  {
    account: "DigiKey",
    platform: "LinkedIn",
    url: "https://www.linkedin.com/company/digikey",
    heat: "4",
    tags: ["B2B", "Engineer", "Electronics", "Distributor"],
    title: "Engineer-friendly B2B content",
    summary: "今日自动收录：B2B 分销商内容适合观察工程师、采购和电子行业用户关心的问题，比如选型、供应链和应用资料。",
    metrics: ["Public reactions visible on LinkedIn", "Official account"],
    reason: "它更接近真实采购和工程决策语境，适合帮助 Ai-Thinker 做更专业可信的内容。",
    learn: "可以做：无线模组选型 checklist，帮助采购和工程师快速判断 Wi-Fi、LoRa、UWB 的差异。"
  },
  {
    account: "Hackster.io",
    platform: "Website",
    url: "https://www.hackster.io/",
    heat: "4",
    tags: ["Industry", "Developer", "Community", "IoT"],
    title: "Developer project community signal",
    summary: "今日自动收录：开发者项目社区适合观察真实用户正在做什么，比泛泛发布参数更容易看出海外开发者关心的应用场景。",
    metrics: ["Stable official website", "Developer project community"],
    reason: "这类内容能给海外选题提供灵感，比如智能家居、工业监测、无线传感器节点和边缘设备。",
    learn: "可以做：整理 3 个适合 ESP32 / LoRa / radar sensor 的开发者项目场景，做成 LinkedIn carousel。"
  }
];

function getDateParts(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })
      .formatToParts(date)
      .filter(part => part.type !== "literal")
      .map(part => [part.type, part.value])
  );

  return {
    isoDate: `${parts.year}-${parts.month}-${parts.day}`,
    compactDate: `${parts.year}${parts.month}${parts.day}`,
    label: `${Number(parts.month)}/${Number(parts.day)}`
  };
}

function pickSources(compactDate) {
  const offset = Number(compactDate.slice(-2)) % sourcePool.length;
  return [0, 1, 2, 3].map(index => sourcePool[(offset + index) % sourcePool.length]);
}

function makeRecords() {
  const { isoDate, compactDate, label } = getDateParts();
  const times = ["08:20", "08:35", "08:45", "08:55"];

  return {
    isoDate,
    compactDate,
    label,
    records: pickSources(compactDate).map((source, index) => ({
      id: `seed-${compactDate}-${source.account.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      ...source,
      createdAt: `${isoDate}T${times[index]}:00.000Z`
    }))
  };
}

function appendDateTab(html, label) {
  return html.replace(/const fixedDates = \[(.*?)\];/s, (match, dates) => {
    if (dates.includes(`"${label}"`)) return match;
    const nextDates = dates.trim() ? `${dates.trim()}, "${label}"` : `"${label}"`;
    return `const fixedDates = [${nextDates}];`;
  });
}

function insertRecords(html, records) {
  const marker = "\n    ];\n\n    let captures = loadCaptures();";
  if (!html.includes(marker)) {
    throw new Error("Could not find seedCaptures closing marker.");
  }

  const formatted = records.map(record => JSON.stringify(record, null, 8).replace(/^/gm, "      ")).join(",\n");
  return html.replace(marker, `,\n${formatted}${marker}`);
}

const html = await fs.readFile(siteFile, "utf8");
const { compactDate, label, records } = makeRecords();

if (html.includes(`seed-${compactDate}-`)) {
  console.log(`Daily records for ${label} already exist.`);
  process.exit(0);
}

const updatedHtml = appendDateTab(insertRecords(html, records), label);
await fs.writeFile(siteFile, updatedHtml, "utf8");
console.log(`Added ${records.length} daily records for ${label}.`);
