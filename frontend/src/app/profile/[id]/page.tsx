import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Building2 } from "lucide-react";

async function getProfile(id: string) {
  try {
    const res = await fetch(`http://backend:8080/api/v1/profile/public/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch profile');
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return null;
  }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getProfile(resolvedParams.id);

  if (!user) {
    return notFound();
  }

  const skillsList = user.skills ? user.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4 sm:p-10">
      <div className="w-full max-w-[800px] bg-background border border-border dark:bg-[#111827] rounded-xl overflow-hidden shadow-2xl flex flex-col">
          
        {/* Preview Header */}
        <div className="p-8 flex items-start justify-between z-10 border-b border-border">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center overflow-hidden shrink-0">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary text-3xl font-bold">
                  {user.fullName?.charAt(0) || "U"}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">{user.fullName || "User"}</h3>
              {user.collegeName && (
                <div className="flex items-center text-sm text-muted-foreground mt-1 gap-1">
                  <Building2 className="w-4 h-4" />
                  {user.collegeName}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary font-semibold text-xs rounded-full uppercase tracking-wider mb-2">
              {user.role || 'Student'}
            </div>
            {user.graduationYear && (
              <p className="text-sm font-medium text-foreground">Class of {user.graduationYear}</p>
            )}
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-8 flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-6 bg-background dark:bg-black/20 border-border">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Score</p>
              <h4 className="text-3xl font-bold text-foreground">1,250</h4>
              <p className="text-xs text-emerald-500 font-medium mt-2">Top 5%</p>
            </Card>
            <Card className="p-6 bg-background dark:bg-black/20 border-border">
              <p className="text-sm font-medium text-muted-foreground mb-1">Questions Solved</p>
              <h4 className="text-3xl font-bold text-foreground">342</h4>
              <p className="text-xs text-emerald-500 font-medium mt-2">Level: Expert</p>
            </Card>
          </div>

          {skillsList.length > 0 && (
            <div className="mt-8">
              <p className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Top Skills</p>
              <div className="flex flex-wrap gap-2">
                {skillsList.slice(0, 5).map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary font-medium text-sm rounded-md">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted/30 border-t border-border flex justify-between items-center text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Actively Interviewing
          </div>
          <div>AI Placement Copilot</div>
        </div>
      </div>
    </div>
  );
}
