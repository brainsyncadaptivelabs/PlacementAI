"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Trash2, Loader2 } from "lucide-react";

export interface AdminUsersTabProps {
  usersData: any;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedCollege: string;
  setSelectedCollege: (val: string) => void;
  selectedBranch: string;
  setSelectedBranch: (val: string) => void;
  selectedPlan: string;
  setSelectedPlan: (val: string) => void;
  currentPage: number;
  fetchUsersList: (page: number) => Promise<void>;
  handleUserClick: (userId: number) => Promise<void>;
  handleDeleteUser: (userId: number, email: string) => Promise<void>;
  userModalOpen: boolean;
  setUserModalOpen: (open: boolean) => void;
  selectedUser: any;
  loadingUserDetail: boolean;
  updatingPlan: boolean;
  handleUpdatePlan: (userId: number, newPlan: string) => Promise<void>;
}

export default function AdminUsersTab({
  usersData,
  searchTerm,
  setSearchTerm,
  selectedCollege,
  setSelectedCollege,
  selectedBranch,
  setSelectedBranch,
  selectedPlan,
  setSelectedPlan,
  currentPage,
  fetchUsersList,
  handleUserClick,
  handleDeleteUser,
  userModalOpen,
  setUserModalOpen,
  selectedUser,
  loadingUserDetail,
  updatingPlan,
  handleUpdatePlan,
}: AdminUsersTabProps) {
  return (
    <div className="space-y-6">
      {/* Filter controls */}
      <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name, email, college..."
                className="w-full bg-white border border-slate-250 text-slate-900 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">College</label>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full bg-white border border-slate-250 text-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
            >
              <option value="ALL">All Colleges</option>
              {usersData?.distinctColleges?.map((c: string) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-white border border-slate-250 text-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
            >
              <option value="ALL">All Branches</option>
              {usersData?.distinctBranches?.map((b: string) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Plan</label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full bg-white border border-slate-250 text-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
            >
              <option value="ALL">All Plans</option>
              <option value="FREE">Free</option>
              <option value="BASIC">Basic</option>
              <option value="PREMIUM">Premium</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => fetchUsersList(0)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 rounded-xl text-xs">
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden bg-white border border-slate-200 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">College</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Resumes</th>
              <th className="px-6 py-4">Interviews</th>
              <th className="px-6 py-4">ATS Avg</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {usersData?.users?.map((user: any) => (
              <tr key={user.id} className="hover:bg-slate-950/20 text-slate-800">
                <td className="px-6 py-4 font-semibold">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user.fullName}</p>
                    <p className="text-xs text-slate-500 font-semibold">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-bold">{user.collegeName}</td>
                <td className="px-6 py-4">
                  <Badge className={
                    user.plan === "PREMIUM" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    user.plan === "BASIC" ? "bg-indigo-50 text-indigo-700 border border-indigo-150" :
                    "bg-slate-500/10 text-slate-500 border-slate-500/20"
                  }>
                    {user.plan}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-xs font-bold">{user.totalResumes}</td>
                <td className="px-6 py-4 text-xs font-bold">{user.totalInterviews}</td>
                <td className="px-6 py-4 text-xs font-bold text-emerald-700">{user.avgAtsScore}%</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <Button onClick={() => handleUserClick(user.id)} size="sm" variant="outline" className="border-slate-250 text-slate-700 font-bold hover:bg-slate-50 text-xs">
                    <Eye className="w-3.5 h-3.5 mr-1" /> View Profile
                  </Button>
                  <Button onClick={() => handleDeleteUser(user.id, user.email)} size="sm" variant="destructive" className="bg-rose-650 hover:bg-rose-600 text-white font-bold text-xs">
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-bold">
          <p>Showing page {currentPage + 1} of {usersData?.totalPages || 1}</p>
          <div className="flex gap-2">
            <Button disabled={currentPage === 0} onClick={() => fetchUsersList(currentPage - 1)} variant="outline" className="border-slate-250 text-slate-700 hover:bg-slate-50 h-9 px-4 text-xs">
              Previous
            </Button>
            <Button disabled={currentPage + 1 >= (usersData?.totalPages || 1)} onClick={() => fetchUsersList(currentPage + 1)} variant="outline" className="border-slate-250 text-slate-700 hover:bg-slate-50 h-9 px-4 text-xs">
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* User details Modal popup */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <header className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Full User Profile View</h2>
                <p className="text-xs text-slate-500">Comprehensive placement preparation tracker</p>
              </div>
              <Button onClick={() => setUserModalOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-250 font-bold px-4 h-10 rounded-xl text-xs">
                Close Profile
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingUserDetail ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-xs text-slate-500 font-bold">Downloading user records...</p>
                </div>
              ) : selectedUser ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Left Column Profile info */}
                  <div className="md:col-span-1 space-y-6">
                    <Card className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center font-black text-2xl text-slate-600 uppercase">
                        {selectedUser.fullName?.[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{selectedUser.fullName}</h3>
                        <p className="text-xs text-slate-500 font-semibold">{selectedUser.email}</p>
                      </div>
                      <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-150 py-1 px-2.5 font-bold">
                        {selectedUser.plan} Member
                      </Badge>
                      <div className="w-full pt-2 flex flex-col gap-2">
                        {selectedUser.plan !== "PREMIUM" ? (
                          <Button 
                            onClick={() => handleUpdatePlan(selectedUser.id, "PREMIUM")}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold h-10 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-amber-500/10"
                            disabled={updatingPlan}
                          >
                            {updatingPlan ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>⭐ Make Premium User</>
                            )}
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleUpdatePlan(selectedUser.id, "FREE")}
                            variant="outline"
                            className="w-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold h-10 rounded-xl text-xs flex items-center justify-center gap-1.5"
                            disabled={updatingPlan}
                          >
                            {updatingPlan ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>❌ Revoke Premium</>
                            )}
                          </Button>
                        )}
                        <Button 
                          onClick={() => {
                            handleDeleteUser(selectedUser.id, selectedUser.email);
                            setUserModalOpen(false);
                          }}
                          variant="destructive"
                          className="w-full bg-rose-650 hover:bg-rose-600 text-white font-bold h-10 rounded-xl text-xs flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete User Account
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-6 space-y-3 text-xs font-bold bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="flex justify-between">
                        <p>College Name</p>
                        <p className="text-slate-900 font-extrabold text-right max-w-[120px] truncate">{selectedUser.collegeName}</p>
                      </div>
                      <div className="flex justify-between">
                        <p>Branch / Department</p>
                        <p className="text-slate-900 font-extrabold">{selectedUser.branch}</p>
                      </div>
                      <div className="flex justify-between">
                        <p>Graduation Year</p>
                        <p className="text-slate-900 font-extrabold">{selectedUser.graduationYear}</p>
                      </div>
                      <div className="flex justify-between">
                        <p>Phone Number</p>
                        <p className="text-slate-900 font-extrabold">{selectedUser.phone || "N/A"}</p>
                      </div>
                    </Card>
                  </div>

                  {/* Middle Column Logs & Uploaded Resumes */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Scores and History */}
                    <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
                      <h4 className="font-bold text-slate-800 mb-4">ATS Resumes Analysis</h4>
                      <table className="w-full text-left">
                        <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2">Filename</th>
                            <th className="px-4 py-2">Role</th>
                            <th className="px-4 py-2 text-right">ATS Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-xs">
                          {selectedUser.resumes?.map((res: any) => (
                            <tr key={res.id} className="text-slate-900 font-medium">
                              <td className="px-4 py-2 truncate max-w-[180px]">{res.fileName}</td>
                              <td className="px-4 py-2">{res.analyzedRole || "N/A"}</td>
                              <td className="px-4 py-2 text-right font-black text-emerald-700">{res.atsScore}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Card>

                    {/* Timeline logs */}
                    <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
                      <h4 className="font-bold text-slate-800 mb-4">Preparation Timeline</h4>
                      <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
                        {selectedUser.timeline?.map((evt: any, i: number) => (
                          <div key={i} className="flex gap-4 items-start text-xs">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-slate-900 font-bold">{evt.event}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-medium">{evt.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
