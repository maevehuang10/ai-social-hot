#!/usr/bin/env node
/**
 * 每日课程表更新脚本 (GitHub Actions)
 */

const fs = require("fs");
const path = require("path");

const CURRICULUM_PATH = path.join(__dirname, "..", "curriculum.json");
const HTML_PATH = path.join(__dirname, "..", "site", "index.html");
const TOPICS_PATH = path.join(__dirname, "..", "site", "social-content-tracker", "topics.json");

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function findNextTopic(curriculum) {
  for (const t of curriculum) { if (!t.covered) return t; }
  return null;
}

function appendOfficialDocs(html, topic) {
  const date = todayStr();
  const comment = `        // ${date} ${topic.title}`;

  const entries = (topic.official || []).map(e => {
    const tags = JSON.stringify(e.tags);
    return `${comment}
        { title:"${e.title}", source:"Ai-Thinker Docs", date:"${date}","product":"${e.product}",sourceType:"official",
          summary:"${e.summary}",
          persona:"${e.persona || "IoT developer"}",
          tags:${tags},
          url:"${e.url}"
        }`;
  }).join(",\n");

  // Find the closing ]; before the first function escT after OFFICIAL_DOCS
  // Strategy: find "const OFFICIAL_DOCS", then find the matching closing ];
  const docStart = html.indexOf("const OFFICIAL_DOCS = [");
  if (docStart === -1) { console.error("OFFICIAL_DOCS not found"); return html; }

  // Find the matching closing ]; - scan forward from docStart
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let docEnd = -1;
  for (let i = docStart; i < html.length; i++) {
    const ch = html[i];
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === stringChar) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'") { inString = true; stringChar = ch; continue; }
    if (ch === '[') depth++;
    if (ch === ']') {
      depth--;
      if (depth === 0) { docEnd = i + 1; break; }
    }
  }

  if (docEnd === -1 || docEnd <= docStart) {
    console.error("Cannot find OFFICIAL_DOCS closing bracket");
    return html;
  }

  // Insert before the closing ];
  return html.substring(0, docEnd - 1) + entries + ",\n        \n      ]" + html.substring(docEnd);
}

function appendExternalTopics(json, topic) {
  const date = todayStr();
  const data = JSON.parse(json);
  const entries = (topic.external || []).map(e => ({
    title: e.title,
    source: e.source,
    date: date,
    product: e.product,
    score: e.score,
    formats: ["LinkedIn Post"],
    platforms: ["LinkedIn"],
    tags: e.tags,
    value: e.summary,
    summary: e.summary,
    hook: e.hook,
    post: e.post,
    url: e.url
  }));
  data.topics.push(...entries);
  data.generatedAt = new Date().toISOString();
  return JSON.stringify(data, null, 2);
}

function markCovered(curriculum) {
  const t = findNextTopic(curriculum);
  if (t) t.covered = true;
  return curriculum;
}

function main() {
  console.log(`[${todayStr()}] Curriculum updater starting...`);

  let curriculum;
  try {
    curriculum = JSON.parse(fs.readFileSync(CURRICULUM_PATH, "utf-8")).curriculum;
  } catch (e) {
    console.error("Failed to read curriculum.json:", e.message);
    process.exit(1);
  }

  const topic = findNextTopic(curriculum);
  if (!topic) {
    console.log("All topics covered. Nothing to do.");
    return;
  }

  console.log(`Next topic: [${topic.id}] ${topic.title}`);

  // ESP safety check
  const allText = JSON.stringify(topic.official || []) + JSON.stringify(topic.external || []);
  if (/esp32|esp8266|espressif|esp-/i.test(allText)) {
    console.error(`ERROR: ESP reference detected in topic ${topic.id}! Aborting.`);
    return;
  }

  const html = fs.readFileSync(HTML_PATH, "utf-8");
  const topicsJson = fs.readFileSync(TOPICS_PATH, "utf-8");

  const updatedHtml = appendOfficialDocs(html, topic);
  const updatedTopics = appendExternalTopics(topicsJson, topic);
  const updatedCurriculum = markCovered(curriculum);

  fs.writeFileSync(HTML_PATH, updatedHtml, "utf-8");
  fs.writeFileSync(TOPICS_PATH, updatedTopics, "utf-8");
  fs.writeFileSync(CURRICULUM_PATH, JSON.stringify({
    version: 1,
    description: "Ai-Thinker daily curriculum",
    curriculum: updatedCurriculum
  }, null, 2), "utf-8");

  console.log(`OK [${topic.title}] ${(topic.official||[]).length} official + ${(topic.external||[]).length} external entries added.`);
}

main();
