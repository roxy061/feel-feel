"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Key,
  Terminal,
  Copy,
  Check,
  Trash2,
  Plus,
  ShieldCheck,
  Code2,
  Activity,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Clock,
  ExternalLink,
} from "lucide-react";

interface ApiKeyItem {
  id: number;
  store_id: number;
  key_name: string;
  api_key: string;
  rate_limit: number;
  is_active: number;
  created_at: string;
  last_used_at: string | null;
}

interface ApiLogItem {
  id: number;
  api_key_id: number;
  endpoint: string;
  method: string;
  ip_address: string;
  status_code: number;
  cost: number | string;
  response_message: string;
  created_at: string;
}

export default function DeveloperPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [logs, setLogs] = useState<ApiLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Key Generation State
  const [newKeyName, setNewKeyName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/merchant/api-keys");
      const data = await res.json();
      if (data.success) {
        setKeys(data.keys || []);
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load developer data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch("/api/merchant/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key_name: newKeyName.trim() || "Production API Key" }),
      });
      const data = await res.json();
      if (data.success && data.key) {
        setGeneratedKey(data.key.api_key);
        setNewKeyName("");
        fetchData();
      } else {
        alert(data.message || "สร้าง API Key ไม่สำเร็จ");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการสร้างคีย์");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: number) => {
    try {
      const res = await fetch(`/api/merchant/api-keys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: currentStatus ? 0 : 1 }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      alert("Failed to toggle API key status");
    }
  };

  const handleDeleteKey = async (id: number) => {
    if (!confirm("คุณต้องการลบ API Key นี้ใช่หรือไม่? การเรียกใช้ API ด้วยคีย์นี้จะใช้งานไม่ได้ทันที")) return;
    try {
      const res = await fetch(`/api/merchant/api-keys/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      alert("Failed to delete API key");
    }
  };

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(identifier);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const maskKey = (key: string) => {
    if (key.length <= 16) return key;
    return `${key.slice(0, 10)}...${key.slice(-8)}`;
  };

  const curlSnippet = `curl -X POST http://localhost:3000/api/v1/angpao/redeem \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${keys[0]?.api_key || "YOUR_API_KEY_HERE"}" \\
  -d '{
    "voucher_url": "https://gift.truemoney.com/campaign/?v=xxxxxx",
    "phone_number": "0812345678"
  }'`;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#EEEFF2]" />
        <div className="font-mono text-xs text-[#EEEFF2]/60">Loading Developer Portal...</div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Generate New API Key Card */}
      <section className="p-6 sm:p-8 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-[#010101] border border-[#EEEFF2]/15 flex items-center justify-center text-sky-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bebas text-2xl sm:text-3xl tracking-wide text-[#EEEFF2] leading-none">
              สร้าง API Key สำหรับนักพัฒนา (Developer Key Management)
            </h3>
            <span className="font-mono text-xs text-[#EEEFF2]/60">
              สร้างคีย์สุ่ม 64 ตัวอักษร สำหรับเชื่อมต่อระบบ TrueMoney Angpao Gateway
            </span>
          </div>
        </div>

        <form onSubmit={handleGenerateKey} className="flex flex-col sm:flex-row gap-3 max-w-xl my-4">
          <input
            type="text"
            placeholder="ตั้งชื่อคีย์ เช่น Backend Gateway Service..."
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#010101] border border-[#EEEFF2]/20 font-sans text-xs text-[#EEEFF2] placeholder-[#EEEFF2]/30 focus:outline-none focus:border-[#EEEFF2]"
            required
          />
          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#EEEFF2] hover:bg-[#EEEFF2]/90 disabled:bg-[#010101]/50 text-[#010101] disabled:text-[#EEEFF2]/40 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังสร้างคีย์...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>สร้าง API Key ใหม่</span>
              </>
            )}
          </button>
        </form>

        {/* Newly Generated Key Banner */}
        {generatedKey && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 font-bold mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>สร้าง API Key สำเร็จ! กรุณาคัดลอกและเก็บรักษาไว้อย่างปลอดภัย</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#010101] border border-emerald-500/30 font-mono text-xs text-[#EEEFF2] break-all my-2">
              <span>{generatedKey}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(generatedKey, "new_generated")}
                className="ml-3 px-3 py-1.5 rounded-md bg-[#272835] hover:bg-[#343647] text-white flex items-center gap-1 shrink-0"
              >
                {copiedKeyId === "new_generated" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอก</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-sans text-[11px] text-emerald-300/80 mt-1">
              คีย์นี้จะแสดงแบบเต็มเพียงครั้งเดียว หลังจากนี้ระบบจะซ่อนค่าคีย์บางส่วนในตาราง
            </p>
          </div>
        )}
      </section>

      {/* 2. API Keys Table */}
      <section className="p-6 sm:p-8 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EEEFF2]/10">
          <div>
            <h3 className="font-bebas text-2xl sm:text-3xl tracking-wide text-[#EEEFF2] leading-none">
              รายการ API Keys ทั้งหมด (Active Keys)
            </h3>
            <p className="font-sans text-xs text-[#EEEFF2]/60 mt-1">
              คีย์ที่เปิดใช้งานจะถูกจำกัด Rate Limit ที่ 30 requests/minute
            </p>
          </div>
          <span className="font-mono text-xs text-[#EEEFF2]/60">
            {keys.length} Keys Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-[#EEEFF2]/10 text-[#EEEFF2]/50 font-mono text-[11px] uppercase tracking-wider">
                <th className="pb-3 pr-4">ชื่อคีย์</th>
                <th className="pb-3 px-4">ค่า API Key</th>
                <th className="pb-3 px-4 text-center">Rate Limit</th>
                <th className="pb-3 px-4 text-center">สถานะ</th>
                <th className="pb-3 px-4">สร้างเมื่อ</th>
                <th className="pb-3 pl-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEFF2]/5">
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#EEEFF2]/40 font-mono">
                    ยังไม่มีการสร้าง API Key ในระบบ
                  </td>
                </tr>
              ) : (
                keys.map((k) => (
                  <tr key={k.id} className="hover:bg-[#010101]/30 transition-colors">
                    <td className="py-3.5 pr-4 font-semibold text-[#EEEFF2]">
                      {k.key_name}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs">
                      <div className="inline-flex items-center gap-2 bg-[#010101]/60 px-2.5 py-1 rounded-lg border border-[#EEEFF2]/10">
                        <span className="text-[#EEEFF2]/80">{maskKey(k.api_key)}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(k.api_key, `key_${k.id}`)}
                          className="text-[#EEEFF2]/50 hover:text-white transition-colors"
                          title="คัดลอก API Key"
                        >
                          {copiedKeyId === `key_${k.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-[#EEEFF2]/70">
                      {k.rate_limit || 30} req/min
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(k.id, k.is_active)}
                        className={`inline-flex items-center gap-1 font-mono text-[10px] px-2.5 py-1 rounded-xl uppercase font-bold border transition-colors cursor-pointer ${
                          k.is_active
                            ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900"
                            : "bg-[#010101]/60 text-[#EEEFF2]/40 border-[#EEEFF2]/10 hover:bg-[#010101]"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            k.is_active ? "bg-emerald-400" : "bg-gray-500"
                          }`}
                        />
                        <span>{k.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#EEEFF2]/50">
                      {new Date(k.created_at).toLocaleDateString("th-TH")}
                    </td>

                    <td className="py-3.5 pl-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteKey(k.id)}
                        className="p-1.5 rounded-lg bg-[#010101]/40 hover:bg-rose-950 text-rose-400 border border-[#EEEFF2]/10 transition-colors cursor-pointer"
                        title="ลบ API Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. API Documentation Box */}
      <section className="p-6 sm:p-8 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bebas text-2xl sm:text-3xl tracking-wide text-[#EEEFF2] leading-none">
              API Documentation: TrueMoney Angpao Auto-Redeem
            </h3>
          </div>
          <span className="font-mono text-xs text-emerald-400 bg-[#010101]/60 px-3 py-1 rounded-xl border border-[#EEEFF2]/10">
            Cost: 0.35 THB / Successful Call
          </span>
        </div>

        <p className="font-sans text-xs text-[#EEEFF2]/70 mb-4 leading-relaxed">
          ยิงคำขอเพื่อตรวจสอบและดึงยอดเงินจากซองของขวัญ TrueMoney เข้าสู่เบอร์โทรศัพท์เป้าหมายแบบอัตโนมัติ โดยระบบจะตัดค่าบริการ 0.35 บาทจาก Wallet ทันทีเมื่อทำรายการสำเร็จ
        </p>

        {/* Endpoint Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-3.5 rounded-xl bg-[#010101]/60 border border-[#EEEFF2]/10 text-xs font-mono space-y-1.5">
            <div className="text-[#EEEFF2]/50 text-[11px]">HTTP METHOD & ENDPOINT</div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold">POST</span>
              <span className="text-[#EEEFF2]">/api/v1/angpao/redeem</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#010101]/60 border border-[#EEEFF2]/10 text-xs font-mono space-y-1.5">
            <div className="text-[#EEEFF2]/50 text-[11px]">AUTHENTICATION HEADER</div>
            <div className="text-[#EEEFF2]">
              x-api-key: <span className="text-amber-400">&lt;YOUR_API_KEY&gt;</span>
            </div>
          </div>
        </div>

        {/* cURL Snippet */}
        <div className="relative rounded-xl bg-[#010101] border border-[#EEEFF2]/15 p-4 overflow-x-auto">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EEEFF2]/10 text-[11px] font-mono text-[#EEEFF2]/40">
            <span>Example cURL Request</span>
            <button
              type="button"
              onClick={() => copyToClipboard(curlSnippet, "curl_snippet")}
              className="inline-flex items-center gap-1 text-sky-400 hover:text-white transition-colors cursor-pointer"
            >
              {copiedKeyId === "curl_snippet" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>คัดลอกคำสั่งแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอก cURL</span>
                </>
              )}
            </button>
          </div>
          <pre className="font-mono text-xs text-[#EEEFF2]/90 leading-relaxed overflow-x-auto">
            {curlSnippet}
          </pre>
        </div>
      </section>

      {/* 4. API Usage Logs */}
      <section className="p-6 sm:p-8 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EEEFF2]/10">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bebas text-2xl sm:text-3xl tracking-wide text-[#EEEFF2] leading-none">
                ประวัติการเรียกใช้งาน (API Activity Logs)
              </h3>
              <p className="font-sans text-xs text-[#EEEFF2]/60 mt-0.5">
                บันทึกการเรียกใช้ API ล่าสุด 50 รายการ พร้อมสถานะและค่าบริการ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchData}
            className="inline-flex items-center gap-1 text-xs font-mono text-sky-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>รีเฟรชประวัติ</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-[#EEEFF2]/10 text-[#EEEFF2]/50 font-mono text-[11px] uppercase tracking-wider">
                <th className="pb-3 pr-4">เวลา</th>
                <th className="pb-3 px-4">Endpoint</th>
                <th className="pb-3 px-4 text-center">Status</th>
                <th className="pb-3 px-4 text-right">ค่าบริการ</th>
                <th className="pb-3 pl-4">ข้อความตอบกลับ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEFF2]/5">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#EEEFF2]/40 font-mono">
                    ยังไม่มีประวัติการเรียกใช้ API
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isSuccess = log.status_code >= 200 && log.status_code < 300;
                  return (
                    <tr key={log.id} className="hover:bg-[#010101]/30 transition-colors font-mono">
                      <td className="py-3 pr-4 text-[#EEEFF2]/60 text-[11px]">
                        {new Date(log.created_at).toLocaleString("th-TH", {
                          dateStyle: "short",
                          timeStyle: "medium",
                        })}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-emerald-400 mr-2 font-bold">{log.method}</span>
                        <span className="text-[#EEEFF2]/80">{log.endpoint}</span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
                            isSuccess
                              ? "bg-emerald-950 text-emerald-400 border-emerald-500/30"
                              : "bg-rose-950 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {log.status_code}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-[#EEEFF2]">
                        {parseFloat(String(log.cost || "0")).toFixed(2)} ฿
                      </td>

                      <td className="py-3 pl-4 text-[#EEEFF2]/70 font-sans text-xs truncate max-w-[240px]">
                        {log.response_message}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
