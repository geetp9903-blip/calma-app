"use client";

import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { createCategory } from "@/app/actions/tasks";
import { cn } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
    color: string;
}

interface CategorySelectorProps {
    categories: Category[];
    selectedId: string;
    onSelect: (id: string) => void;
    onNewCategory?: (category: Category) => void;
}

const PRESET_COLORS = [
    "#ef4444", // Red
    "#f97316", // Orange
    "#eab308", // Yellow
    "#22c55e", // Green
    "#06b6d4", // Cyan
    "#3b82f6", // Blue
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#64748b", // Slate
];

export function CategorySelector({ categories, selectedId, onSelect, onNewCategory }: CategorySelectorProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newColor, setNewColor] = useState(PRESET_COLORS[5]); // Default Blue
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setLoading(true);

        const result = await createCategory(newName, newColor);

        if (result.success && result.category) {
            onNewCategory?.(result.category);
            onSelect(result.category.id);
            setIsCreating(false);
            setNewName("");
        }
        setLoading(false);
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Category</label>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="text-xs text-calma-blue-500 font-medium flex items-center gap-1 hover:underline"
                    >
                        <Plus className="w-3 h-3" /> New
                    </button>
                )}
            </div>

            {isCreating ? (
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-3 animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center gap-2">
                        <input
                            autoFocus
                            placeholder="Category Name"
                            className="flex-1 bg-transparent border-b border-slate-200 dark:border-slate-700 text-sm py-1 focus:outline-none focus:border-calma-blue-500"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                        />
                        <button onClick={() => setIsCreating(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {PRESET_COLORS.map(c => (
                            <button
                                key={c}
                                onClick={() => setNewColor(c)}
                                className={cn(
                                    "w-6 h-6 rounded-full flex-shrink-0 transition-all",
                                    newColor === c ? "ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900 scale-110" : "opacity-70 hover:opacity-100"
                                )}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>

                    <button
                        disabled={!newName.trim() || loading}
                        onClick={handleCreate}
                        className="w-full bg-slate-900 text-white dark:bg-white dark:text-black py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Create Category"}
                    </button>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => onSelect(cat.id)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                selectedId === cat.id
                                    ? "ring-2 ring-offset-1 border-transparent dark:ring-offset-slate-900"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800"
                            )}
                            style={{
                                backgroundColor: selectedId === cat.id ? cat.color : undefined,
                                color: selectedId === cat.id ? '#fff' : undefined,
                                borderColor: selectedId === cat.id ? cat.color : undefined
                            }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
