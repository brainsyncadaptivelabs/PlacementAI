export default function PlaceholderPage() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
       <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
          <Code2 className="w-10 h-10" />
       </div>
       <h1 className="text-2xl font-bold font-heading">Coding Practice</h1>
       <p className="text-slate-500 max-w-md">This feature is currently under development. Stay tuned for expert-curated coding challenges!</p>
    </div>
  );
}
import { Code2 } from "lucide-react";
