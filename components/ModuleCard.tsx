'use client';
export default function ModuleCard({ m }: { m:any }){
  return (
    <div className="card space-y-2">
      <div className="text-sm text-gray-500">{m.code} · {m.section}</div>
      <div className="text-lg font-semibold">{m.title}</div>
      <div className="text-sm text-gray-700">{m.objective}</div>
      <div className="text-xs text-gray-500">Domain: {m.domain}</div>
    </div>
  );
}
