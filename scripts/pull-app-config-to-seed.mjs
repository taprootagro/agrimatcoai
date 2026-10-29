#!/usr/bin/env node
/**
 * 从 Supabase app_config 拉取当前线上 JSON，写回 taprootagrosetting/ 并可选更新 001_init.sql 种子。
 * 配置里的 Storage / CDN 图片 URL 会一并保留（文件仍在 cms-public 桶，需单独备份 Storage）。
 *
 * 用法：
 *   node scripts/pull-app-config-to-seed.mjs
 *   node scripts/pull-app-config-to-seed.mjs --write-init
 *   node scripts/pull-app-config-to-seed.mjs --out ./cms-export.json
 *
 * 连接（优先级）：
 *   1. SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY — 直连 PostgREST，完整 config（含 systemPrompt）
 *   2. taprootagrosetting/backend.json — GET Edge /functions/v1/server/config（anon；不含 systemPrompt）
 *
 * 环境变量可覆盖 backend.json：
 *   SUPABASE_URL, SUPABASE_ANON_KEY, EDGE_FUNCTION_NAME（默认 server）
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitConfigToSettings } from './apply-config-to-settings.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function readBackendDefaults() {
  const p = path.join(root, 'taprootagrosetting', 'backend.json');
  if (!fs.existsSync(p)) return {};
  try {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    return j.backendProxyConfig || {};
  } catch {
    return {};
  }
}

function parseArgs(argv) {
  const out = {
    writeInit: false,
    outPath: path.join(root, 'cms-export.json'),
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--write-init') out.writeInit = true;
    else if (a === '--out' && argv[i + 1]) {
      out.outPath = path.resolve(argv[++i]);
    } else if (a === '--help' || a === '-h') {
      console.log(`Usage: node scripts/pull-app-config-to-seed.mjs [--write-init] [--out path.json]`);
      process.exit(0);
    }
  }
  return out;
}

async function fetchViaServiceRole(supabaseUrl, serviceRoleKey) {
  const base = supabaseUrl.replace(/\/+$/, '');
  const url =
    `${base}/rest/v1/app_config?id=eq.main&select=config,version,updated_at,updated_by`;
  const res = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`PostgREST ${res.status}: ${body.slice(0, 400)}`);
  }
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0 || !rows[0]?.config) {
    throw new Error('app_config row id=main not found or empty');
  }
  return {
    config: rows[0].config,
    version: rows[0].version,
    updatedAt: rows[0].updated_at,
    updatedBy: rows[0].updated_by,
    source: 'service_role',
  };
}

async function fetchViaEdge(supabaseUrl, anonKey, fnName) {
  const base = supabaseUrl.replace(/\/+$/, '');
  const fn = (fnName || 'server').replace(/^\//, '');
  const url = `${base}/functions/v1/${fn}/config`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Edge GET /config ${res.status}: ${body.slice(0, 400)}`);
  }
  const data = await res.json();
  if (data?.data === null || !data?.config) {
    throw new Error('Edge returned no app_config (run 001_init.sql or push config first)');
  }
  return {
    config: data.config,
    version: data.version,
    updatedAt: data.updatedAt,
    updatedBy: data.updatedBy,
    source: 'edge_anon',
  };
}

/** 统计配置 JSON 内可能指向 Storage/CDN 的 URL（便于确认图链仍在种子里） */
function summarizeMediaUrls(cfg) {
  const found = new Set();
  const re =
    /(?:https?:\/\/[^\s"'<>]*storage\/v1\/object\/public\/cms-public\/[^\s"'<>]+|https?:\/\/[^\s"'<>]*\/media\/[^\s"'<>]+|storage\/v1\/object\/public\/cms-public\/[^\s"'<>]+|\/media\/[^\s"'<>]+)/gi;
  const walk = (v) => {
    if (typeof v === 'string') {
      const m = v.match(re);
      if (m) m.forEach((s) => found.add(s.slice(0, 120)));
      return;
    }
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(cfg);
  return [...found];
}

function runScript(relPath, args, label) {
  const r = spawnSync(process.execPath, [path.join(root, relPath), ...args], {
    cwd: root,
    stdio: 'inherit',
    encoding: 'utf8',
  });
  if (r.status !== 0) {
    console.error(`[pull-app-config-to-seed] failed: ${label}`);
    process.exit(r.status ?? 1);
  }
}

const args = parseArgs(process.argv);
const backend = readBackendDefaults();

const supabaseUrl = (process.env.SUPABASE_URL || backend.supabaseUrl || '').trim();
const anonKey = (process.env.SUPABASE_ANON_KEY || backend.supabaseAnonKey || '').trim();
const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const fnName = (process.env.EDGE_FUNCTION_NAME || backend.edgeFunctionName || 'server').trim();

if (!supabaseUrl) {
  console.error('[pull-app-config-to-seed] Missing Supabase URL (taprootagrosetting/backend.json or SUPABASE_URL)');
  process.exit(1);
}

let pulled;
try {
  if (serviceRole) {
    console.log('[pull-app-config-to-seed] fetching app_config via service_role (full JSON)');
    pulled = await fetchViaServiceRole(supabaseUrl, serviceRole);
  } else if (anonKey) {
    console.log('[pull-app-config-to-seed] fetching via Edge GET /config (anon; cloudAIConfig.systemPrompt omitted)');
    console.log('[pull-app-config-to-seed] tip: set SUPABASE_SERVICE_ROLE_KEY locally for full pull');
    pulled = await fetchViaEdge(supabaseUrl, anonKey, fnName);
  } else {
    console.error('[pull-app-config-to-seed] Need SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
} catch (e) {
  console.error('[pull-app-config-to-seed]', e instanceof Error ? e.message : e);
  process.exit(1);
}

const cfg = pulled.config;
if (!cfg || typeof cfg !== 'object' || Array.isArray(cfg)) {
  console.error('[pull-app-config-to-seed] Invalid config payload');
  process.exit(1);
}

fs.writeFileSync(args.outPath, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
const outLabel = args.outPath.startsWith(root)
  ? path.relative(root, args.outPath)
  : args.outPath;
console.log(`[pull-app-config-to-seed] wrote ${outLabel}`);
console.log(
  `[pull-app-config-to-seed] remote version=${pulled.version ?? '?'} updated_at=${pulled.updatedAt ?? '?'} source=${pulled.source}`,
);

const mediaHints = summarizeMediaUrls(cfg);
if (mediaHints.length > 0) {
  console.log(`[pull-app-config-to-seed] found ${mediaHints.length} cms-public/media URL fragment(s) in config (Storage objects not copied)`);
  mediaHints.slice(0, 8).forEach((u) => console.log(`  · ${u}${u.length >= 120 ? '…' : ''}`));
  if (mediaHints.length > 8) console.log(`  · … and ${mediaHints.length - 8} more`);
}

splitConfigToSettings(cfg);
console.log('[pull-app-config-to-seed] updated taprootagrosetting/*.json');

if (args.writeInit) {
  runScript('scripts/generate-seed-sql.mjs', ['--write-init'], 'generate-seed-sql');
  console.log('[pull-app-config-to-seed] updated supabase/migrations/001_init.sql app_config seed');
}

console.log('[pull-app-config-to-seed] done — commit taprootagrosetting/ and 001_init.sql; backup cms-public Storage separately');
