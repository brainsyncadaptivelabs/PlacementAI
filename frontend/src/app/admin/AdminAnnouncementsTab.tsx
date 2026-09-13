"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertOctagon, CheckCircle } from "lucide-react";
import api from "@/lib/api";

export interface AdminAnnouncementsTabProps {
  announcements: any[];
  fetchTabData: (tab: any) => Promise<void>;
  actionError: string;
  setActionError: (msg: string) => void;
  actionSuccess: string;
  setActionSuccess: (msg: string) => void;
}

export default function AdminAnnouncementsTab({
  announcements,
  fetchTabData,
  actionError,
  setActionError,
  actionSuccess,
  setActionSuccess
}: AdminAnnouncementsTabProps) {
  const [newAnnTitle, setNewAnnTitle] = useState<string>("");
  const [newAnnMessage, setNewAnnMessage] = useState<string>("");
  const [newAnnTarget, setNewAnnTarget] = useState<string>("ALL");
  const [showNewAnnForm, setShowNewAnnForm] = useState<boolean>(false);
  const [maintEnabled, setMaintEnabled] = useState<boolean>(false);
  const [maintMessage, setMaintMessage] = useState<string>("");

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError("")} className="text-rose-500 hover:text-rose-700">✕</button>
        </div>
      )}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess("")} className="text-emerald-500 hover:text-emerald-700">✕</button>
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900">System Broadcast Announcements</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">Manage global banner notifications & maintenance mode schedules.</p>
        </div>
        <Button 
          onClick={() => setShowNewAnnForm(!showNewAnnForm)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-4 h-10"
        >
          {showNewAnnForm ? "Close Form" : "+ Compose Broadcast"}
        </Button>
      </div>

      {showNewAnnForm && (
        <Card className="p-6 bg-slate-50 border border-slate-200 shadow-sm rounded-2xl space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">Compose New System Announcement</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Announcement Title (e.g. Scheduled System Maintenance)" 
              value={newAnnTitle} 
              onChange={e => setNewAnnTitle(e.target.value)} 
              className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white"
            />
            <select 
              value={newAnnTarget} 
              onChange={e => setNewAnnTarget(e.target.value)} 
              className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white font-bold"
            >
              <option value="ALL">Target: All Users</option>
              <option value="CANDIDATE">Target: Candidates Only</option>
              <option value="RECRUITER">Target: Recruiters Only</option>
              <option value="PLACEMENT_OFFICER">Target: Placement Officers</option>
            </select>
          </div>
          <textarea 
            placeholder="Broadcast message body visible in top banner..." 
            value={newAnnMessage} 
            onChange={e => setNewAnnMessage(e.target.value)} 
            className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white h-24"
          />
          <Button 
            onClick={async () => {
              if (!newAnnTitle || !newAnnMessage) return alert("Please fill in title and message");
              try {
                await api.post("/admin/announcements", {
                  title: newAnnTitle,
                  message: newAnnMessage,
                  targetType: newAnnTarget
                });
                setActionSuccess("System announcement created successfully!");
                setActionError("");
                setNewAnnTitle("");
                setNewAnnMessage("");
                setShowNewAnnForm(false);
                fetchTabData("announcements");
              } catch (e: any) {
                setActionError("Failed to create announcement: " + (e.response?.data?.message || e.message));
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl px-6"
          >
            Publish Announcement
          </Button>
        </Card>
      )}

      {/* Maintenance Mode Configuration Card */}
      <Card className="p-6 bg-amber-50/60 border border-amber-200 shadow-sm rounded-2xl space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-amber-900 text-sm">Emergency Platform Maintenance Mode</h4>
            <p className="text-xs text-amber-700">When enabled, locks non-admin user interactions and displays a maintenance banner.</p>
          </div>
          <Button 
            onClick={async () => {
              const msg = !maintEnabled 
                ? "WARNING: Enabling emergency maintenance mode will lock non-admin access for all live users immediately. Continue?"
                : "Disabling maintenance mode will restore normal user access. Continue?";
              if (!confirm(msg)) return;
              try {
                await api.post("/admin/maintenance-mode", {
                  enabled: !maintEnabled,
                  message: maintMessage || "System is undergoing scheduled maintenance."
                });
                setMaintEnabled(!maintEnabled);
                setActionSuccess(`Maintenance mode ${!maintEnabled ? "ENABLED" : "DISABLED"} successfully.`);
                setActionError("");
              } catch (e: any) {
                setActionError("Failed to update maintenance mode: " + (e.response?.data?.message || e.message));
              }
            }}
            className={maintEnabled ? "bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-9 px-4 rounded-xl" : "bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-4 rounded-xl"}
          >
            {maintEnabled ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
          </Button>
        </div>
        <input 
          type="text" 
          placeholder="Custom maintenance banner message..." 
          value={maintMessage} 
          onChange={e => setMaintMessage(e.target.value)} 
          className="w-full text-xs p-2.5 border border-amber-300 rounded-xl bg-white"
        />
      </Card>

      <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
        <h4 className="font-bold text-slate-800 mb-4">Active & Scheduled Announcements</h4>
        {announcements.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-8 text-center">No active announcements created yet.</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann: any) => (
              <div key={ann.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{ann.title}</span>
                    <Badge className={ann.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : ann.status === "DRAFT" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-700"}>
                      {ann.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">{ann.targetType}</Badge>
                  </div>
                  <p className="text-xs text-slate-600">{ann.message}</p>
                  <p className="text-[10px] text-slate-400">Created by {ann.createdBy || "SUPER_ADMIN"}</p>
                </div>
                {ann.status === "DRAFT" && (
                  <Button 
                    onClick={async () => {
                      try {
                        await api.post(`/admin/announcements/${ann.id}/approve`);
                        setActionSuccess(`Announcement #${ann.id} approved for system broadcast.`);
                        setActionError("");
                        fetchTabData("announcements");
                      } catch (e: any) {
                        setActionError("Failed to approve announcement: " + (e.response?.data?.message || e.message));
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl px-3 h-8"
                  >
                    Approve Broadcast
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
