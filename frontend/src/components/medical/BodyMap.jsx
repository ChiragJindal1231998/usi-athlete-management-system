import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const REGIONS = [
  { id: "head", label: "Head", path: "M100 22 a18 22 0 1 0 0.01 0 z" },
  { id: "neck", label: "Neck", path: "M88 66 L112 66 L110 80 L90 80 Z" },
  { id: "left-shoulder", label: "Left shoulder", path: "M64 82 q-2 -2 4 -6 q12 -6 22 4 L88 102 q-12 0 -22 4 q-6 -4 -2 -24 Z" },
  { id: "right-shoulder", label: "Right shoulder", path: "M136 82 q2 -2 -4 -6 q-12 -6 -22 4 L112 102 q12 0 22 4 q6 -4 2 -24 Z" },
  { id: "chest", label: "Chest", path: "M88 82 L112 82 L116 124 L84 124 Z" },
  { id: "abdomen", label: "Abdomen", path: "M84 124 L116 124 L118 168 L82 168 Z" },
  { id: "left-upper-arm", label: "Left upper arm", path: "M58 106 L78 102 L76 158 L54 158 Z" },
  { id: "right-upper-arm", label: "Right upper arm", path: "M142 106 L122 102 L124 158 L146 158 Z" },
  { id: "left-forearm", label: "Left forearm", path: "M54 160 L76 160 L78 214 L58 214 Z" },
  { id: "right-forearm", label: "Right forearm", path: "M146 160 L124 160 L122 214 L142 214 Z" },
  { id: "left-hand", label: "Left hand", path: "M58 216 L78 216 L76 232 L60 232 Z" },
  { id: "right-hand", label: "Right hand", path: "M142 216 L122 216 L124 232 L140 232 Z" },
  // Thighs — Arjun's injury sits in right-thigh
  { id: "left-thigh", label: "Left thigh", path: "M82 170 L98 170 L96 248 L78 248 Z" },
  { id: "right-thigh", label: "Right thigh", path: "M118 170 L102 170 L104 248 L122 248 Z" },
  { id: "left-knee", label: "Left knee", path: "M78 250 L96 250 L96 268 L78 268 Z" },
  { id: "right-knee", label: "Right knee", path: "M104 250 L122 250 L122 268 L104 268 Z" },
  { id: "left-shin", label: "Left shin", path: "M80 270 L96 270 L94 332 L82 332 Z" },
  { id: "right-shin", label: "Right shin", path: "M104 270 L120 270 L118 332 L106 332 Z" },
  { id: "left-foot", label: "Left foot", path: "M82 334 L96 334 L100 348 L78 348 Z" },
  { id: "right-foot", label: "Right foot", path: "M104 334 L118 334 L122 348 L100 348 Z" },
];

export function BodyMap({ athleteId, selectedRegion, onSelectRegion }) {
  const { injuries } = useApp();
  const regionStateById = new Map();
  injuries
    .filter((i) => i.athleteId === athleteId)
    .forEach((i) => regionStateById.set(i.region, i.severity));

  return (
    <div className="relative flex h-full items-center justify-center">
      <svg
        data-testid="body-map"
        viewBox="0 0 200 360"
        className="h-[440px] w-auto select-none"
        aria-label="Anatomical body map, front view"
      >
        {/* Subtle silhouette outline */}
        <ellipse cx="100" cy="180" rx="78" ry="172" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.6" />
        {REGIONS.map((r) => {
          const state = regionStateById.get(r.id) || "healthy";
          const isSelected = selectedRegion === r.id;
          return (
            <g key={r.id}>
              <path
                d={r.path}
                className={cn("body-region", state, isSelected && "selected")}
                onClick={() => onSelectRegion(r.id)}
                data-testid={`region-${r.id}`}
              >
                <title>{r.label}</title>
              </path>
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-2 left-2 flex flex-col gap-1 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-[10px] text-slate-600 backdrop-blur">
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: "#E2E8F0" }} /> Healthy</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: "#FEF3C7", border: "1px solid #D97706" }} /> Mild</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: "#FED7AA", border: "1px solid #EA580C" }} /> Moderate</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: "#FECACA", border: "1px solid #DC2626" }} /> Severe</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: "#DBEAFE", border: "1px solid #2563EB" }} /> In rehab</div>
      </div>
    </div>
  );
}

export function regionLabel(id) {
  return REGIONS.find((r) => r.id === id)?.label || id;
}
