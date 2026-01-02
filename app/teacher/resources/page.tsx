'use client';
import Link from 'next/link';

const resources = [
  { title: 'Printable Silence Game instructions', description: 'Quick one-pager to run LS1 offline.', href: '#' },
  { title: 'Classroom setup checklist', description: 'Prepare your space for multisensory lessons.', href: '#' },
  { title: 'Parent communication template', description: 'Share progress updates with families.', href: '#' },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Resources</h2>
        <p className="text-sm text-gray-700">Static reference materials for teachers exploring the curriculum.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {resources.map(item => (
          <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
            <p className="text-sm text-gray-700">{item.description}</p>
            <Link href={item.href} className="text-sm font-semibold text-blue-700 hover:underline">
              View resource →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
