export default function PlaceholderPage() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
       <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground/50">
          <Brain className="w-10 h-10" />
       </div>
       <h1 className="text-2xl font-bold font-heading">Aptitude Training</h1>
       <p className="text-muted-foreground max-w-md">Boost your quantitative and verbal skills with our upcoming aptitude module.</p>
    </div>
  );
}
import { Brain } from "lucide-react";
