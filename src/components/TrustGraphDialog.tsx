import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type NodeType = "rider" | "employer" | "rwa" | "campus" | "contact" | "stranger";
interface GNode { id: string; label: string; sub: string; x: number; y: number; type: NodeType; }
interface HopNode extends GNode { edge: number; edgeLabel: string; }
interface DriverNode extends GNode { via: string[]; edge: number; edgeLabel: string; distance?: number; rating?: number; }
interface Scenario { rider: GNode; firstHop: HopNode[]; drivers: DriverNode[]; }

const SCENARIOS: Record<string, Scenario> = {
  hsr: {
    rider: { id: "rider", label: "You", sub: "HSR Layout", x: 380, y: 260, type: "rider" },
    firstHop: [
      { id: "c1", label: "Rohit N.", sub: "Manyata · colleague", x: 190, y: 140, type: "employer", edge: 0.85, edgeLabel: "employer domain" },
      { id: "c2", label: "Prestige Lakeside", sub: "RWA neighbor", x: 190, y: 380, type: "rwa", edge: 0.90, edgeLabel: "RWA / society" },
      { id: "c3", label: "Ananya S.", sub: "phone contact", x: 570, y: 380, type: "contact", edge: 0.75, edgeLabel: "verified contact" },
    ],
    drivers: [
      { id: "d1", label: "Arjun K.", sub: "Sedan · Manyata route", x: 70, y: 60, type: "employer", via: ["c1"], edge: 0.95, edgeLabel: "2 prior rides" },
      { id: "d2", label: "Lakshmi R.", sub: "Hatchback · same block", x: 70, y: 460, type: "rwa", via: ["c2"], edge: 0.90, edgeLabel: "RWA / society" },
      { id: "d3", label: "Rahul V.", sub: "EV · Manyata route", x: 380, y: 470, type: "employer", via: ["c1", "c2"], edge: 0.85, edgeLabel: "employer + RWA" },
      { id: "d4", label: "Megha P.", sub: "Sedan · outer ring rd", x: 690, y: 460, type: "contact", via: ["c3"], edge: 0.75, edgeLabel: "verified contact" },
      { id: "stranger", label: "Unverified Driver", sub: "2.1km · no shared edge", x: 670, y: 200, type: "stranger", via: [], edge: 0, edgeLabel: "no verified path", distance: 2.1, rating: 4.6 },
    ],
  },
  pes: {
    rider: { id: "rider", label: "You", sub: "PES University", x: 380, y: 260, type: "rider" },
    firstHop: [
      { id: "c1", label: "Sanya K.", sub: "classmate · campus", x: 190, y: 140, type: "campus", edge: 0.80, edgeLabel: "campus domain" },
      { id: "c2", label: "Whitefield Society", sub: "RWA, destination", x: 190, y: 380, type: "rwa", edge: 0.90, edgeLabel: "RWA / society" },
      { id: "c3", label: "Devansh M.", sub: "phone contact", x: 570, y: 380, type: "contact", edge: 0.75, edgeLabel: "verified contact" },
    ],
    drivers: [
      { id: "d1", label: "Karthik S.", sub: "Hatchback · seniors batch", x: 70, y: 60, type: "campus", via: ["c1"], edge: 0.90, edgeLabel: "4 prior rides" },
      { id: "d2", label: "Fatima A.", sub: "EV · Whitefield", x: 70, y: 460, type: "rwa", via: ["c2"], edge: 0.90, edgeLabel: "RWA / society" },
      { id: "d3", label: "Naveen T.", sub: "Sedan · campus + RWA", x: 380, y: 470, type: "campus", via: ["c1", "c2"], edge: 0.80, edgeLabel: "campus + RWA" },
      { id: "d4", label: "Priya D.", sub: "Hatchback · Whitefield", x: 690, y: 460, type: "contact", via: ["c3"], edge: 0.75, edgeLabel: "verified contact" },
      { id: "stranger", label: "Unverified Driver", sub: "1.6km · no shared edge", x: 670, y: 200, type: "stranger", via: [], edge: 0, edgeLabel: "no verified path", distance: 1.6, rating: 4.8 },
    ],
  },
};

const COLORS: Record<NodeType, string> = {
  rider: "#EDEFEA", employer: "#4ADE80", rwa: "#5BC0EB", campus: "#C792EA", contact: "#F4B860", stranger: "#5C7268",
};

interface Scored extends DriverNode { score: number; pathStr: string; pathIds: string[]; }

function computeScores(s: Scenario): Scored[] {
  const byId: Record<string, HopNode | GNode> = Object.fromEntries([s.rider, ...s.firstHop, ...s.drivers].map((n) => [n.id, n]));
  return s.drivers.map((d) => {
    if (d.type === "stranger") return { ...d, score: 0.30, pathStr: "No verified path — open-market fallback", pathIds: [] };
    let best = 0, bestVia: string | null = null;
    d.via.forEach((viaId) => {
      const hop1 = (byId[viaId] as HopNode).edge;
      const total = hop1 * d.edge;
      if (total > best) { best = total; bestVia = viaId; }
    });
    const viaNode = byId[bestVia!] as HopNode;
    const pathStr = `You → ${viaNode.label} (${viaNode.edgeLabel}) → ${d.label} (${d.edgeLabel})`;
    return { ...d, score: best, pathStr, pathIds: ["rider", bestVia!, d.id] };
  });
}

interface Props { open: boolean; onOpenChange: (o: boolean) => void; from?: string; to?: string; }

const TrustGraphDialog = ({ open, onOpenChange, from, to }: Props) => {
  const [scenarioKey, setScenarioKey] = useState<"hsr" | "pes">("hsr");
  const [mode, setMode] = useState<"trust" | "typical">("trust");
  const [ran, setRan] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const scenario = SCENARIOS[scenarioKey];
  const scored = useMemo(() => computeScores(scenario), [scenario]);

  useEffect(() => { if (open) { setRan(false); } }, [open, scenarioKey]);

  // auto-run once when opened
  useEffect(() => { if (open && !ran) { const t = setTimeout(() => setRan(true), 350); return () => clearTimeout(t); } }, [open, ran]);

  const ordered = useMemo(() => {
    if (mode === "trust") return [...scored].sort((a, b) => b.score - a.score);
    const synth: Record<string, number> = { d1: 0.8, d2: 1.1, d3: 1.4, d4: 1.9 };
    return [...scored].sort((a, b) => (a.distance ?? synth[a.id] ?? 9) - (b.distance ?? synth[b.id] ?? 9));
  }, [scored, mode]);

  const activeEdges = new Set<string>();
  if (ran && mode === "trust") {
    ordered.forEach((d) => {
      if (d.pathIds.length) {
        activeEdges.add(d.pathIds[1]);
        activeEdges.add(`${d.id}__${d.pathIds[1]}`);
      }
    });
  }

  const allNodes: GNode[] = [scenario.rider, ...scenario.firstHop, ...scenario.drivers];
  const byId: Record<string, GNode> = Object.fromEntries(allNodes.map((n) => [n.id, n]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl bg-[#0B1410] text-[#EDEFEA] border-[#1D2D24] p-0 overflow-hidden">
        <div className="p-6 pb-4 border-b border-[#1D2D24]">
          <DialogHeader>
            <div className="text-[11px] tracking-widest uppercase text-[#4ADE80] font-mono">Technical Differentiator 3.1</div>
            <DialogTitle className="text-2xl font-semibold text-[#EDEFEA]">
              Trust is modeled as a <span className="text-[#4ADE80]">graph</span>, not a star rating.
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#8FA396] mt-2 leading-relaxed">
            Breadth-first traversal over verified relationship edges (employer, campus, RWA, contacts, ride history){from && to ? ` — matching for ${from} → ${to}` : ""}.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4 p-4 max-h-[75vh] overflow-y-auto">
          {/* Graph */}
          <div className="bg-[#101B15] border border-[#1D2D24] rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-3 border-b border-[#1D2D24] flex-wrap gap-2">
              <div className="text-sm font-semibold">Trust Graph — live traversal</div>
              <div className="flex gap-2 flex-wrap text-[10px] font-mono text-[#8FA396]">
                {(["employer", "rwa", "campus", "contact", "stranger"] as NodeType[]).map((t) => (
                  <span key={t} className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: COLORS[t] }} />{t}
                  </span>
                ))}
              </div>
            </div>
            <svg ref={svgRef} viewBox="0 0 760 520" className="w-full h-auto" style={{ background: "radial-gradient(ellipse at 50% 40%, #0F1C16 0%, #0E1813 70%)" }}>
              {/* rider -> firstHop */}
              {scenario.firstHop.map((n) => {
                const active = activeEdges.has(n.id);
                return <line key={n.id} x1={scenario.rider.x} y1={scenario.rider.y} x2={n.x} y2={n.y}
                  stroke={active ? "#4ADE80" : "#2A4036"} strokeWidth={active ? 2.2 : 1.4}
                  style={active ? { filter: "drop-shadow(0 0 4px rgba(74,222,128,0.6))" } : undefined} />;
              })}
              {/* firstHop -> drivers */}
              {scenario.drivers.flatMap((d) => d.via.map((v) => {
                const key = `${d.id}__${v}`;
                const active = activeEdges.has(key);
                const a = byId[v];
                return <line key={key} x1={a.x} y1={a.y} x2={d.x} y2={d.y}
                  stroke={active ? "#4ADE80" : "#2A4036"} strokeWidth={active ? 2.2 : 1.4}
                  style={active ? { filter: "drop-shadow(0 0 4px rgba(74,222,128,0.6))" } : undefined} />;
              }))}
              {/* nodes */}
              {allNodes.map((n) => {
                const r = n.type === "rider" ? 16 : n.type === "stranger" ? 11 : 12;
                return (
                  <g key={n.id}>
                    <circle cx={n.x} cy={n.y} r={r} fill={n.type === "rider" ? "#0E1813" : "#0E1813"}
                      stroke={COLORS[n.type]} strokeWidth={n.type === "rider" ? 2.5 : 1.8}
                      strokeDasharray={n.type === "stranger" ? "3,3" : undefined} />
                    <text x={n.x} y={n.y - r - 7} textAnchor="middle" fontSize={10.5} fill="#EDEFEA">{n.label}</text>
                    <text x={n.x} y={n.y + r + 13} textAnchor="middle" fontSize={8.5} fill="#5C7268" fontFamily="monospace">{n.sub}</text>
                  </g>
                );
              })}
            </svg>
            <div className="p-3 border-t border-[#1D2D24] flex gap-2 flex-wrap items-center">
              {(["hsr", "pes"] as const).map((k) => (
                <button key={k} onClick={() => setScenarioKey(k)}
                  className={`px-3 py-1.5 rounded-md text-xs border ${scenarioKey === k ? "border-[#4ADE80] text-[#4ADE80] bg-[#4ADE80]/10" : "border-[#1D2D24] text-[#8FA396] bg-[#0E1813]"}`}>
                  {k === "hsr" ? "HSR Layout → Manyata" : "PES Univ → Whitefield"}
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-[#1D2D24] flex gap-2 flex-wrap items-center">
              <button onClick={() => { setRan(false); setTimeout(() => setRan(true), 50); }}
                className="bg-[#4ADE80] text-[#06140C] px-4 py-2 rounded-md font-semibold text-xs">
                Find my ride
              </button>
              <button onClick={() => setRan(false)}
                className="border border-[#1D2D24] text-[#8FA396] px-4 py-2 rounded-md text-xs">
                Reset
              </button>
              <div className="ml-auto flex border border-[#1D2D24] rounded-md overflow-hidden">
                {(["trust", "typical"] as const).map((m) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`px-3 py-2 text-[11px] font-mono ${mode === m ? "bg-[#234A33] text-[#4ADE80]" : "text-[#8FA396]"}`}>
                    {m === "trust" ? "Sort: Trust graph" : "Sort: Distance + ★"}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3 border-t border-[#1D2D24] text-[11px] text-[#5C7268] leading-relaxed">
              <b className="text-[#8FA396]">How the score is computed —</b> for every candidate, the engine finds the max-product path over verified edges (employer 0.85 · RWA 0.90 · campus 0.80 · contact 0.75 · prior ride 0.95).
            </div>
          </div>

          {/* Results */}
          <div className="bg-[#101B15] border border-[#1D2D24] rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-3 border-b border-[#1D2D24]">
              <div className="text-sm font-semibold">Ranked matches</div>
              <span className="text-[10px] font-mono text-[#4ADE80]">
                {mode === "trust" ? "graph proximity score" : "distance + ★ rating"}
              </span>
            </div>
            <div className="p-3 flex flex-col gap-2 min-h-[340px]">
              {!ran ? (
                <div className="text-[#5C7268] text-xs font-mono m-auto text-center p-10">
                  Click "Find my ride" to<br />run the trust traversal →
                </div>
              ) : ordered.map((d, i) => {
                const pct = Math.round(d.score * 100);
                const synth = [0.8, 1.1, 1.4, 1.9];
                const dim = d.type === "stranger" && mode === "trust";
                const scoreLabel = mode === "trust"
                  ? `${d.score.toFixed(2)} trust`
                  : `${(d.distance ?? synth[i] ?? 2).toFixed(1)}km · ${(d.rating ?? 4.5).toFixed(1)}★`;
                return (
                  <div key={d.id} className={`border rounded-lg p-3 bg-[#0E1813] ${i === 0 ? "border-[#4ADE80]" : "border-[#1D2D24]"}`}
                    style={{ animation: `rise .4s ease ${i * 0.08}s both` }}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="font-semibold text-sm">
                        <span className="text-[#5C7268] text-[11px] mr-1.5 font-mono">{String(i + 1).padStart(2, "0")}</span>
                        {d.label}
                      </div>
                      <div className={`font-mono text-xs ${dim ? "text-[#8FA396]" : "text-[#4ADE80]"}`}>{scoreLabel}</div>
                    </div>
                    <div className="font-mono text-[10.5px] text-[#8FA396] mb-1.5">
                      {mode === "trust" ? d.pathStr : (d.type === "stranger" ? "No verified relationship" : "Nearest by GPS, rated anonymously")}
                    </div>
                    <div className="h-1.5 bg-[#1A2A22] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${mode === "trust" ? pct : Math.round(100 - ((d.distance ?? synth[i] ?? 2) / 2.5 * 100))}%`,
                          background: dim ? "#5C7268" : "linear-gradient(90deg,#2E7D52,#4ADE80)",
                        }} />
                    </div>
                    <div className="inline-block mt-2 text-[9.5px] font-mono text-[#5C7268] border border-[#1D2D24] rounded-full px-2 py-0.5">{d.sub}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <style>{`@keyframes rise{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}`}</style>
      </DialogContent>
    </Dialog>
  );
};

export default TrustGraphDialog;
