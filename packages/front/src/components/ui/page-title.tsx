import React from 'react';

interface PageTitleProps {
    title: string;
    children?: React.ReactNode;
}

export function PageTitle({ title, children }: PageTitleProps) {
    if (children) {
        return (
            <div className="flex items-center justify-between pb-4 mb-2 border-b w-full">
                <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                <div>{children}</div>
            </div>
        );
    }
    return (
        <div className="pb-4 mb-2 border-b w-full">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        </div>
    );
}
