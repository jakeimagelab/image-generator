"use client";
import { useState, useRef } from "react";

const DIRECTIONS = [
  { key: "natural",  label: "자연스럽게",   desc: "원본 느낌 최대 유지",        emoji: "✨" },
  { key: "warm",     label: "따뜻하게",     desc: "골든아워 · 따뜻한 컬러",     emoji: "🌅" },
  { key: "bright",   label: "더 밝게",      desc: "에어리 · 하이키",            emoji: "☀️" },
  { key: "cool",     label: "쿨톤",         desc: "깔끔한 아침 빛",             emoji: "🌿" },
  { key: "dramatic", label: "드라마틱",     desc: "강한 림라이트 · 대비",        emoji: "🎬" },
  { key: "close",    label: "클로즈업",     desc: "타이트한 프레이밍",          emoji: "🔍" },
];

const STRENGTHS = [
  { value: 0.3, label: "A-", desc: "최소 변화" },
  { value: 0.5, label: "A",  desc: "약간 변화" },
  { value: 0.7, label: "A+", desc: "중간 변화" },
  { value: 0.9, label: "A++", desc: "많이 변화" },
];

export default function VariationPage() {
  const [file,       setFile]       = useState<File | null>(null);
  const [preview,    setPreview]    = useState<string>("");
  const [direction,  setDirection]  = useState("natural");
  const [strength,   setStrength]   = useState(0.5);
  const [loading,    setLoading]    = useState(false);
  const [results,    setResults]    = useState<string[]>([]);
  const [error,      setError]      = useState("");
  const [selected,   setSelected]   = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
    setResults([]);
    setSelected([]);
  };

  const generate = async () => {
    if (!file) return;
    setLoading(true); setError(""); setResults([]);
    try {
      const fd = new FormData();
      fd.append("image",     file);
      fd.append("direction", direction);
      fd.append("strength",  String(strength));
      fd.append("count",     "4");
      fd.append("method",    "img2img");

      const res  = await fetch("/api/variation", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setResults(data.images);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (url: string) => {
    setSelected(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  const downloadAll = async () => {
    for (const url of selected.length > 0 ? selected : results) {
      const a = document.createElement("a");
      a.href     = url;
      a.download = `variation_${Date.now()}.jpg`;
      a.target   = "_blank";
      a.click();
      await new Promise(r => setTimeout(r, 300));
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "'Noto Sans KR', sans-serif", color: "#1C2B28" }}>

      {/* 헤더 */}
      <div style={{ background: "#155855", padding: "18px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/" style={{ color: "rgba(255,255,255,.6)", fontSize: 12, textDecoration: "none" }}>← 홈</a>
        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,.2)" }}/>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>📸 사진 베리에이션</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.6)" }}>원본 사진의 느낌을 유지하며 다양한 버전 생성</div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px", display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>

        {/* 왼쪽: 설정 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* 사진 업로드 */}
          <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #C8DDD9" }}>
            <div style={{ background: "#EAF4F2", padding: "12px 18px", borderBottom: "1px solid #C8DDD9" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#155855" }}>원본 사진 업로드</div>
            </div>
            <div style={{ padding: 16 }}>
              {preview ? (
                <div style={{ position: "relative" }}>
                  <img src={preview} style={{ width: "100%", borderRadius: 10, objectFit: "cover", maxHeight: 240 }} alt="원본"/>
                  <button onClick={() => { setFile(null); setPreview(""); setResults([]); }}
                    style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,.5)", color: "#fff",
                             border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 14 }}>
                    ✕
                  </button>
                </div>
              ) : (
                <div onClick={() => fileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                  style={{ border: "2px dashed #C8DDD9", borderRadius: 12, padding: "32px 16px",
                           textAlign: "center", cursor: "pointer", background: "#FAFAF8" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#5A7470" }}>클릭 또는 드래그</div>
                  <div style={{ fontSize: 11, color: "#9BB5B0", marginTop: 4 }}>JPG · PNG · HEIC</div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}/>
            </div>
          </div>

          {/* 변화 방향 */}
          <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #C8DDD9" }}>
            <div style={{ background: "#EAF4F2", padding: "12px 18px", borderBottom: "1px solid #C8DDD9" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#155855" }}>변화 방향</div>
            </div>
            <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {DIRECTIONS.map(d => (
                <button key={d.key} onClick={() => setDirection(d.key)}
                  style={{ padding: "10px 10px", borderRadius: 10, textAlign: "left", cursor: "pointer",
                           fontFamily: "inherit", border: direction === d.key ? "2px solid #155855" : "1.5px solid #C8DDD9",
                           background: direction === d.key ? "#EAF4F2" : "#fff" }}>
                  <div style={{ fontSize: 16, marginBottom: 3 }}>{d.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: direction === d.key ? "#155855" : "#1C2B28" }}>{d.label}</div>
                  <div style={{ fontSize: 10, color: "#9BB5B0" }}>{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 변화 강도 */}
          <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #C8DDD9" }}>
            <div style={{ background: "#EAF4F2", padding: "12px 18px", borderBottom: "1px solid #C8DDD9" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#155855" }}>변화 강도</div>
              <div style={{ fontSize: 10, color: "#9BB5B0", marginTop: 2 }}>낮을수록 원본과 유사</div>
            </div>
            <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {STRENGTHS.map(s => (
                <button key={s.value} onClick={() => setStrength(s.value)}
                  style={{ padding: "10px 4px", borderRadius: 9, textAlign: "center", cursor: "pointer",
                           fontFamily: "inherit", border: strength === s.value ? "2px solid #E85D2C" : "1.5px solid #C8DDD9",
                           background: strength === s.value ? "#FFF0EB" : "#fff" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: strength === s.value ? "#E85D2C" : "#1C2B28" }}>{s.label}</div>
                  <div style={{ fontSize: 9, color: "#9BB5B0", marginTop: 2 }}>{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 생성 버튼 */}
          <button onClick={generate} disabled={loading || !file}
            style={{ width: "100%", height: 52, background: loading ? "#9BB5B0" : "#E85D2C", color: "#fff",
                     border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading || !file ? "not-allowed" : "pointer",
                     fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? (
              <>
                <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff",
                              borderRadius: "50%", animation: "spin .7s linear infinite" }}/>
                베리에이션 생성 중... (약 60초)
              </>
            ) : "✨ 베리에이션 4장 생성"}
          </button>

          {error && (
            <div style={{ padding: "10px 14px", background: "#FFF0EB", border: "1px solid #FACCB8",
                          borderRadius: 9, fontSize: 12, color: "#E85D2C" }}>⚠ {error}</div>
          )}
        </div>

        {/* 오른쪽: 결과 */}
        <div>
          {results.length === 0 && !loading && (
            <div style={{ background: "#fff", border: "1px solid #C8DDD9", borderRadius: 16,
                          padding: "60px 32px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>🎨</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#155855", marginBottom: 8 }}>
                사진 베리에이션 생성기
              </div>
              <div style={{ fontSize: 12, color: "#9BB5B0", lineHeight: 1.8 }}>
                원본 사진을 올리고 방향·강도를 선택 후<br/>
                생성 버튼을 누르면 4가지 베리에이션이 만들어져요
              </div>
              <div style={{ marginTop: 20, padding: "14px 18px", background: "#EAF4F2", borderRadius: 10,
                            fontSize: 11, color: "#5A7470", lineHeight: 1.8, textAlign: "left" }}>
                <strong style={{ color: "#155855" }}>포토클리닉 스타일 유지:</strong><br/>
                • 역광 + 림라이트 (인물 윤곽 빛)<br/>
                • 따뜻한 아이보리/베이지 인테리어<br/>
                • 얕은 심도 + 자연스러운 보케<br/>
                • 밝고 화사한 병원 분위기
              </div>
            </div>
          )}

          {loading && (
            <div style={{ background: "#fff", border: "1px solid #C8DDD9", borderRadius: 16,
                          padding: "60px 32px", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, border: "4px solid #EAF4F2", borderTopColor: "#155855",
                            borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 20px" }}/>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#155855", marginBottom: 8 }}>
                AI가 베리에이션을 만들고 있어요
              </div>
              <div style={{ fontSize: 12, color: "#9BB5B0", lineHeight: 1.8 }}>
                원본 사진의 조명·구도·분위기를 분석하고<br/>
                포토클리닉 스타일로 4가지 버전을 생성 중...<br/>
                약 60초 소요됩니다
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#155855" }}>베리에이션 결과 ({results.length}장)</div>
                  <div style={{ fontSize: 11, color: "#9BB5B0", marginTop: 2 }}>
                    {selected.length > 0 ? `${selected.length}장 선택됨` : "클릭해서 선택하세요"}
                  </div>
                </div>
                <button onClick={downloadAll}
                  style={{ height: 36, padding: "0 16px", background: "#155855", color: "#fff",
                           border: "none", borderRadius: 9, fontSize: 12, fontWeight: 700,
                           cursor: "pointer", fontFamily: "inherit" }}>
                  📥 {selected.length > 0 ? `${selected.length}장` : "전체"} 다운로드
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {results.map((url, i) => (
                  <div key={i} onClick={() => toggleSelect(url)}
                    style={{ position: "relative", cursor: "pointer", borderRadius: 12, overflow: "hidden",
                             border: selected.includes(url) ? "3px solid #E85D2C" : "3px solid transparent",
                             boxShadow: "0 2px 12px rgba(0,0,0,.08)" }}>
                    <img src={url} style={{ width: "100%", display: "block", aspectRatio: "3/2", objectFit: "cover" }}
                      alt={`Variation ${i + 1}`}/>
                    <div style={{ position: "absolute", top: 8, left: 8, background: selected.includes(url) ? "#E85D2C" : "rgba(0,0,0,.4)",
                                   color: "#fff", borderRadius: "50%", width: 26, height: 26,
                                   display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                      {selected.includes(url) ? "✓" : i + 1}
                    </div>
                    <a href={url} download={`variation_${i+1}.jpg`} target="_blank"
                      onClick={e => e.stopPropagation()}
                      style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,.5)", color: "#fff",
                               padding: "4px 10px", borderRadius: 8, fontSize: 10, textDecoration: "none", fontWeight: 700 }}>
                      저장
                    </a>
                  </div>
                ))}
              </div>

              {/* 원본과 비교 */}
              {preview && (
                <div style={{ background: "#fff", border: "1px solid #C8DDD9", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#9BB5B0", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>원본</div>
                  <img src={preview} style={{ width: "100%", borderRadius: 8, objectFit: "cover", maxHeight: 200 }} alt="원본"/>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
