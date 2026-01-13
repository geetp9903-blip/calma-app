import { getCategories } from "@/app/actions/tasks";
import { CreateTaskForm } from "@/components/create/CreateTaskForm";
import { MobileNav } from "@/components/MobileNav";

export default async function CreatePage() {
    const categories = await getCategories();

    return (
        <div className="pb-24 min-h-screen bg-slate-50 dark:bg-black">
            <header className="px-6 pt-12 pb-6">
                <h1 className="text-2xl font-bold text-foreground">Plan Focus</h1>
                <p className="text-slate-500 text-sm">Design your time block.</p>
            </header>

            <main className="px-4">
                <CreateTaskForm categories={categories} />
            </main>

            <MobileNav />
        </div>
    );
}
