"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2, Globe, Link2, MapPin, Users, Briefcase,
  Save, Loader2, Camera, Edit
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500-1000", "1000+"];
const INDUSTRIES = [
  "Technology", "Software", "E-Commerce", "Finance & Banking", "Consulting",
  "Healthcare", "Manufacturing", "Logistics", "EdTech", "Fintech", "Other"
];

export default function CompanyWorkspacePage() {
  const [workspace, setWorkspace] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    api.get("/recruiters/company")
      .then(r => {
        if (r.data) {
          setWorkspace(r.data);
          setForm(r.data);
        } else {
          setEditing(true);
        }
      })
      .catch(() => setEditing(true))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put("/recruiter/company", form);
      setWorkspace(res.data);
      setForm(res.data);
      setEditing(false);
      toast.success("Company workspace saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const field = (key: string) => ({
    value: form[key] || "",
    onChange: (e: any) => setForm((f: any) => ({ ...f, [key]: e.target.value })),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight font-heading">Company Workspace</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Your company profile is automatically applied to all jobs you create.
          </p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)} variant="outline" className="gap-2 border-border">
            <Edit className="w-4 h-4" /> Edit Profile
          </Button>
        ) : (
          <Button onClick={save} disabled={saving} className="bg-primary hover:bg-primary/90 text-white gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Workspace"}
          </Button>
        )}
      </div>

      {/* Company Identity */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="w-4 h-4 text-primary" /> Company Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Logo Preview */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-muted border border-border flex items-center justify-center overflow-hidden">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-8 h-8 text-muted-foreground/50" />
              )}
            </div>
            {editing && (
              <div className="flex-1">
                <Label className="text-sm font-semibold">Logo URL</Label>
                <Input placeholder="https://..." {...field("logoUrl")} className="mt-1.5 border-border bg-background" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Company Name</Label>
              {editing ? (
                <Input placeholder="e.g., Acme Technologies" {...field("companyName")} className="border-border bg-background" />
              ) : (
                <p className="text-foreground font-medium">{workspace?.companyName || "—"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Industry</Label>
              {editing ? (
                <select {...field("industry")} className="w-full rounded-lg border border-border bg-background text-foreground px-3 py-2 text-sm">
                  <option value="">Select Industry</option>
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
              ) : (
                <p className="text-foreground font-medium">{workspace?.industry || "—"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Company Size</Label>
              {editing ? (
                <select {...field("companySize")} className="w-full rounded-lg border border-border bg-background text-foreground px-3 py-2 text-sm">
                  <option value="">Select Size</option>
                  {COMPANY_SIZES.map(s => <option key={s}>{s} employees</option>)}
                </select>
              ) : (
                <p className="text-foreground font-medium">{workspace?.companySize || "—"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Headquarters</Label>
              {editing ? (
                <Input placeholder="e.g., Bengaluru, India" {...field("headquarters")} className="border-border bg-background" />
              ) : (
                <p className="text-foreground font-medium">{workspace?.headquarters || "—"}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">About the Company</Label>
            {editing ? (
              <Textarea placeholder="Brief description of your company..." {...field("description")} className="border-border bg-background resize-none h-24" />
            ) : (
              <p className="text-foreground text-sm leading-relaxed">{workspace?.description || "—"}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="w-4 h-4 text-primary" /> Links & Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { key: "careersWebsite", label: "Careers Website", placeholder: "https://careers.company.com", icon: Globe },
            { key: "linkedinUrl", label: "LinkedIn", placeholder: "https://linkedin.com/company/...", icon: Link2 },
            { key: "officeLocations", label: "Office Locations", placeholder: "Bengaluru, Mumbai, Hyderabad", icon: MapPin },
            { key: "hiringManagerDetails", label: "Hiring Manager", placeholder: "Name • email@company.com", icon: Users },
          ].map(({ key, label, placeholder, icon: Icon }) => (
            <div key={key} className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" /> {label}
              </Label>
              {editing ? (
                <Input placeholder={placeholder} {...field(key)} className="border-border bg-background" />
              ) : (
                <p className="text-foreground text-sm">{workspace?.[key] || "—"}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Culture & Benefits */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="w-4 h-4 text-primary" /> Culture & Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Company Culture</Label>
            {editing ? (
              <Textarea placeholder="Describe your culture, values, and work environment..." {...field("companyCulture")} className="border-border bg-background resize-none h-24" />
            ) : (
              <p className="text-foreground text-sm leading-relaxed">{workspace?.companyCulture || "—"}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Benefits & Perks</Label>
            {editing ? (
              <Textarea placeholder="Health insurance, flexible hours, WFH, stock options..." {...field("benefits")} className="border-border bg-background resize-none h-24" />
            ) : (
              <p className="text-foreground text-sm leading-relaxed">{workspace?.benefits || "—"}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Hiring Preferences</Label>
            {editing ? (
              <Textarea placeholder="Preferred skills, degree requirements, culture fit notes..." {...field("hiringPreferences")} className="border-border bg-background resize-none h-24" />
            ) : (
              <p className="text-foreground text-sm leading-relaxed">{workspace?.hiringPreferences || "—"}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
