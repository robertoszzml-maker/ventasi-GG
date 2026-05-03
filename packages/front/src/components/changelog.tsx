'use client';

import { CHANGELOG_DATA, ChangelogEntryType } from '@/constants/changelog';

const typeLabel: Record<ChangelogEntryType, string> = {
    new: 'Nuevo',
    improved: 'Mejorado',
    fixed: 'Corregido',
};

const typeColor: Record<ChangelogEntryType, string> = {
    new: 'text-green-600',
    improved: 'text-blue-600',
    fixed: 'text-orange-600',
};

export function Changelog() {
    return (
        <div className="space-y-10">
            {CHANGELOG_DATA.map((entry, idx) => (
                <div key={idx} className="border-l-2 border-primary pl-6">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm text-muted-foreground">{entry.date}</span>
                    </div>
                    <ul className="space-y-1 text-sm list-none">
                        {entry.changes.map((change, i) => (
                            <li key={i} className="flex gap-2">
                                <span className={`font-medium ${typeColor[change.type]}`}>
                                    [{typeLabel[change.type]}]
                                </span>
                                <span className="text-muted-foreground">{change.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
