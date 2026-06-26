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
  const comment = `        // ── ${date} ${topic.title} ──\r\n`;

  const entries = (topic.official || []).map(e => {
    const tags = JSON.stringify(e.tags);
    return `${comment}
        { title:"${e.title}", source:"Ai-Thinker Docs", date:"${date}","product":"${e.product}",sourceType:"official",
          summary:"${e.summary}",
          persona:"${e.persona || "IoT 开发者 · 嵌入式工程师"}",
          tags:${tags},
          url:"${e.url}"
        }`;
  }).join(",\n");

  // Find and replace the closing ]; before function escT
  // Note: file uses CRLF line endings
  const marker = "\r\n        \r\n      ];\r\n\r\n      function escT";
  const idx = html.indexOf(marker);
  if (idx === -1) {
    console.error("Cannot find OFFICIAL_DOCS closing marker");
    return html;
  }
  return html.substring(0, idx) + entries + ",\r\n        \r\n      ];\r\n\r\n      function escT" + html.substring(idx + marker.length);
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

  // Apply
  const html = fs.readFileSync(HTML_PATH, "utf-8");
  const topicsJson = fs.readFileSync(TOPICS_PATH, "utf-8");

  const updatedHtml = appendOfficialDocs(html, topic);
  const updatedTopics = appendExternalTopics(topicsJson, topic);
  const updatedCurriculum = markCovered(curriculum);

  fs.writeFileSync(HTML_PATH, updatedHtml, "utf-8");
  fs.writeFileSync(TOPICS_PATH, updatedTopics, "utf-8");
  fs.writeFileSync(CURRICULUM_PATH, JSON.stringify({
    version: 1,
    description: "Ai-Thinker 每日学习课程表",
    curriculum: updatedCurriculum
  }, null, 2), "utf-8");

  console.log(`✅ [${topic.title}] ${(topic.official||[]).length} official + ${(topic.external||[]).length} external entries added.`);
}

main();
