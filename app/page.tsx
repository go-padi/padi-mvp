import Link from "next/link";
export default function Page(){
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-2">Welcome to Padi</h2>
        <p className="text-sm text-gray-700">Seed the Module Library, then create a class and add students.</p>
        <div className="mt-4 flex gap-3">
          <Link className="btn btn-primary" href="/library">Go to Library</Link>
          <Link className="btn" href="/students">Add Students</Link>
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-2">Quick links</h3>
        <ul className="list-disc ml-6 space-y-1 text-sm">
          <li><Link className="link" href="/classes/demo/plan">Planner (demo)</Link></li>
          <li><Link className="link" href="/classes/demo/today">Today (demo)</Link></li>
          <li><Link className="link" href="/assessments/1">End-of-Phase (demo)</Link></li>
        </ul>
      </div>
    </div>
  );
}
