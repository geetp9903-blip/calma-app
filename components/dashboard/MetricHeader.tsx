import { CalmCard } from "@/components/CalmCard";

interface MetricHeaderProps {
    metrics: {
        tasksAssigned: number;
        completionRate: number;
        timeConsumed: number;
        topCategory: string;
    };
}

export function MetricHeader({ metrics }: MetricHeaderProps) {
    const cards = [
        { label: "Assigned", value: metrics.tasksAssigned },
        { label: "Completion", value: `${metrics.completionRate}%` },
        { label: "Focus Time", value: `${metrics.timeConsumed}h` },
        { label: "Top Focus", value: metrics.topCategory },
    ];

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {cards.map((card, i) => (
                <CalmCard key={i} className="min-w-[140px] p-4 flex-shrink-0 snap-start">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                        {card.label}
                    </p>
                    <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-calma-blue-700 to-calma-blue-500 dark:from-blue-100 dark:to-blue-300">
                        {card.value}
                    </p>
                </CalmCard>
            ))}
        </div>
    );
}
