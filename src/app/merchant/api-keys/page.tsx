"use client";

import { useEffect, useState } from "react";
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Trash2,
  Terminal,
  Activity,
  ShieldCheck,
  RefreshCw,
  Code,
  X,
} from "lucide-react";
import { useTenant } from "../TenantContext";

export default function MerchantApiKeysPage() {
  const { currentSubdomain } = useTenant();
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [usageLogs, setUsageLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [rateLimit, setRateLimit] = useState(60);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchKeysAndLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/merchant/api-keys?subdomain=${currentSubdomain}`);
      const data = await res.json();
      if (res.ok) {
        setApiKeys(data.apiKeys || []);
        setUsageLogs(data.usageLogs || []);
      }
    } catch (err) {
      console.error("Fetch API keys error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeysAndLogs();
  }, [currentSubdomain]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/merchant/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomain: currentSubdomain,
          name: keyName || "Production API Key",
          rateLimit,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewlyCreatedKey(data.apiKey.rawKey);
        fetchKeysAndLogs();
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการสร้าง API Key");
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการเพิกถอน (Revoke) คีย์นี้? การเรียกใช้ API ด้วยคีย์นี้จะใช้งานไม่ได้ทันที"))
      return;
    try {
      await fetch(`/api/merchant/api-keys?id=${id}`, { method: "DELETE" });
      fetchKeysAndLogs();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเพิกถอนคีย์");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-emerald-400" />
            การจัดการ API Keys และประวัติการเรียกใช้ (0.35฿)
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            ระบบตรวจสอบสิทธิ์ผ่าน Header `x-api-key` และหักค่าบริการจาก Wallet อัตโนมัติ
          </p>
        </div>

        <button
          onClick={() => {
            setNewlyCreatedKey(null);
            setKeyName("");
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>สร้าง API Key ใหม่</span>
        </button>
      </div>

      {/* Code integration sample banner */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Code className="w-4 h-4 text-emerald-400" />
            <span>ตัวอย่างการเชื่อมต่อ (cURL Request Header):</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            Pay-per-Use 0.35 THB
          </span>
        </div>
        <pre className="p-3 bg-slate-900 rounded-lg text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
          {`curl -X POST http://localhost:3000/api/v1/tools/ai-copywriter \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKeys[0]?.keyHash || "sk_live_your_api_key"}" \\
  -d '{"productName": "ANC Wireless Headphones", "category": "Audio"}'`}
        </pre>
      </div>

      {/* API Keys Table */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            คีย์ที่เปิดใช้งาน ({apiKeys.length})
          </h3>
        </div>

        {apiKeys.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">
            ยังไม่มี API Key ในร้านค้านี้
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">ชื่อคีย์</th>
                  <th className="p-4">Prefix / รหัสคีย์</th>
                  <th className="p-4">Rate Limit</th>
                  <th className="p-4">ใช้งานล่าสุด</th>
                  <th className="p-4">สถานะ</th>
                  <th className="p-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-sans font-semibold text-white">
                      {key.name}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">
                          {key.keyPrefix}••••••••
                        </span>
                        <button
                          onClick={() => copyToClipboard(key.keyHash)}
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                          title="คัดลอกคีย์"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 font-sans text-slate-300">
                      {key.rateLimit} คำขอ/นาที
                    </td>
                    <td className="p-4 text-slate-400 text-[11px]">
                      {key.lastUsedAt
                        ? new Date(key.lastUsedAt).toLocaleTimeString("th-TH")
                        : "ยังไม่เคยเรียกใช้"}
                    </td>
                    <td className="p-4 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          key.isActive
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {key.isActive ? "ACTIVE" : "REVOKED"}
                      </span>
                    </td>
                    <td className="p-4 text-right font-sans">
                      {key.isActive && (
                        <button
                          onClick={() => handleRevokeKey(key.id)}
                          className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[11px] font-medium transition-colors"
                        >
                          เพิกถอนคีย์
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* API Usage Logs Table */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              ประวัติการเรียกใช้ API ล่าสุด (API Usage Logs)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            หักเงินสะสม {usageLogs.reduce((s, l) => s + l.cost, 0).toFixed(2)} บาท
          </span>
        </div>

        {usageLogs.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">
            ยังไม่มีประวัติการเรียกใช้ API
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">วันที่-เวลา</th>
                  <th className="p-3.5">Method & Endpoint</th>
                  <th className="p-3.5">สถานะ</th>
                  <th className="p-3.5">Latency</th>
                  <th className="p-3.5">IP</th>
                  <th className="p-3.5 text-right">ค่าบริการที่หัก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {usageLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {new Date(log.createdAt).toLocaleString("th-TH")}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-white mr-2">
                        [{log.method}]
                      </span>
                      <span className="text-emerald-400">{log.endpoint}</span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.statusCode === 200 || log.statusCode === 201
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{log.latencyMs} ms</td>
                    <td className="p-3.5 text-slate-500 text-[11px]">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-400 text-sm">
                      -{log.cost.toFixed(2)} ฿
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                สร้าง API Key ใหม่
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {newlyCreatedKey ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  <div className="font-bold mb-1">สร้าง API Key สำเร็จ!</div>
                  คัดลอกคีย์ด้านล่างนี้เก็บไว้ในที่ปลอดภัย คีย์นี้จะไม่แสดงซ้ำอีก
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-white break-all flex items-center justify-between gap-2">
                  <span>{newlyCreatedKey}</span>
                  <button
                    onClick={() => copyToClipboard(newlyCreatedKey)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded shrink-0"
                  >
                    {copiedKey ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  เรียบร้อย
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    ชื่อกำกับคีย์ (Key Name)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น Production Server, Line Bot Webhook"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Rate Limit (คำขอ / นาที)
                  </label>
                  <input
                    type="number"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  >
                    ออกคีย์ใหม่
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
