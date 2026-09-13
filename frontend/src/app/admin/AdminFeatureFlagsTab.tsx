"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertOctagon, CheckCircle } from "lucide-react";
import api from "@/lib/api";

export interface AdminFeatureFlagsTabProps {
  featureFlags: any[];
  fetchTabData: (tab: any) => Promise<void>;
  actionError: string;
  setActionError: (msg: string) => void;
  actionSuccess: string;
  setActionSuccess: (msg: string) => void;
}

export default function AdminFeatureFlagsTab({
  featureFlags,
  fetchTabData,
  actionError,
  setActionError,
  actionSuccess,
  setActionSuccess
}: AdminFeatureFlagsTabProps) {
  const [newFlagKey, setNewFlagKey] = useState<string>("" );
  const [newFlagDesc, setNewFlagDesc] = useState<string>("");
  const [newFlagEnabled, setNewFlagEnabled] = useState<boolean>(true);
  const [newFlagRollout, setNewFlagRollout] = useState<number>(100);
  const [newFlagColleges, setNewFlagColleges] = useState<string>("ALL");
  const [showNewFlagForm, setShowNewFlagForm] = useState<boolean>(false);

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
          <h3 className="text-xl font-bold text-slate-900">Feature Flags & Targeted Rollouts</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">Control platform features dynamically across colleges and user tiers.</p>
        </div>
        <Button 
          onClick={() => setShowNewFlagForm(!showNewFlagForm)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-4 h-10"
        >
          {showNewFlagForm ? "Close Form" : "+ New Feature Flag"}
        </Button>
      </div>

      {showNewFlagForm && (
        <Card className="p-6 bg-slate-50 border border-slate-200 shadow-sm rounded-2xl space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">Create New Feature Flag</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="Flag Key (e.g. NEW_ATS_ENGINE_V2)" 
              value={newFlagKey} 
              onChange={e => setNewFlagKey(e.target.value)} 
              className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white font-mono uppercase font-bold"
            />
            <input 
              type="text" 
              placeholder="Description..." 
              value={newFlagDesc} 
              onChange={e => setNewFlagDesc(e.target.value)} 
              className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white"
            />
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Rollout %:</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={newFlagRollout} 
                onChange={e => setNewFlagRollout(Number(e.target.value))} 
                className="w-20 text-xs p-3 border border-slate-200 rounded-xl bg-white font-bold text-center"
              />
            </div>
          </div>
          <input 
            type="text" 
            placeholder="Target Colleges (comma-separated, e.g. MIT,Stanford or ALL)" 
            value={newFlagColleges} 
            onChange={e => setNewFlagColleges(e.target.value)} 
            className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white font-mono"
          />
          <Button 
            onClick={async () => {
              if (!newFlagKey) return alert("Please enter Flag Key");
              try {
                await api.post("/admin/feature-flags", {
                  key: newFlagKey,
                  description: newFlagDesc,
                  enabled: newFlagEnabled,
                  rolloutPercentage: newFlagRollout,
                  targetColleges: newFlagColleges
                });
                setActionSuccess(`Feature flag '${newFlagKey}' created successfully!`);
                setActionError("");
                setNewFlagKey("");
                setNewFlagDesc("");
                setShowNewFlagForm(false);
                fetchTabData("feature-flags");
              } catch (e: any) {
                setActionError("Failed to create feature flag: " + (e.response?.data?.message || e.message));
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl px-6"
          >
            Create Feature Flag
          </Button>
        </Card>
      )}

      <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Flag Key</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Rollout %</th>
                <th className="px-4 py-3">Target Colleges</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {featureFlags.map((flag: any) => (
                <tr key={flag.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-700">{flag.key}</td>
                  <td className="px-4 py-3 text-slate-600">{flag.description}</td>
                  <td className="px-4 py-3">
                    <Badge className={flag.enabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}>
                      {flag.enabled ? "ENABLED" : "DISABLED"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center font-bold">{flag.rolloutPercentage}%</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{flag.targetColleges || "ALL"}</td>
                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    <Button 
                      onClick={async () => {
                        if (flag.rolloutPercentage > 0) {
                          const msg = `WARNING: ${flag.enabled ? "Disabling" : "Enabling"} flag '${flag.key}' will immediately affect live users (rollout: ${flag.rolloutPercentage}%). Continue?`;
                          if (!confirm(msg)) return;
                        }
                        try {
                          await api.put(`/admin/feature-flags/${flag.id}`, { enabled: !flag.enabled });
                          setActionSuccess(`Feature flag '${flag.key}' ${!flag.enabled ? "enabled" : "disabled"}.`);
                          setActionError("");
                          fetchTabData("feature-flags");
                        } catch (e: any) {
                          setActionError("Failed to update feature flag: " + (e.response?.data?.message || e.message));
                        }
                      }}
                      variant="outline" 
                      className="text-xs font-bold h-8 px-3 rounded-lg"
                    >
                      {flag.enabled ? "Disable" : "Enable"}
                    </Button>
                    <Button 
                      onClick={async () => {
                        if (!confirm(`Delete feature flag '${flag.key}'? (Current rollout: ${flag.rolloutPercentage}%)`)) return;
                        try {
                          await api.delete(`/admin/feature-flags/${flag.id}`);
                          setActionSuccess(`Feature flag '${flag.key}' deleted successfully.`);
                          setActionError("");
                          fetchTabData("feature-flags");
                        } catch (e: any) {
                          setActionError("Failed to delete feature flag: " + (e.response?.data?.message || e.message));
                        }
                      }}
                      variant="ghost" 
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-2"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
