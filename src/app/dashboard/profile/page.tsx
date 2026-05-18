"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, Bell, Shield, Download, Trash2, Key } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-heading text-slate-900">Profile & Settings</h1>
        <p className="text-slate-500">Manage your account information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
         {/* Profile Information */}
         <Card className="lg:col-span-2 border-none shadow-sm bg-white">
            <CardHeader className="p-8 border-b border-slate-50">
               <CardTitle className="text-lg font-bold font-heading">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24 border-4 border-primary/10">
                     <AvatarImage src="https://github.com/shadcn.png" />
                     <AvatarFallback className="text-2xl">SS</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                     <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/5">Change Photo</Button>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">JPG, PNG or GIF. Max 1MB.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <Label htmlFor="full-name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</Label>
                     <Input id="full-name" defaultValue="Shreya Singh" className="bg-slate-50 border-none focus-visible:ring-primary/20" />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
                     <Input id="email" defaultValue="shreya@example.com" disabled className="bg-slate-100 border-none opacity-60" />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="college" className="text-xs font-bold uppercase tracking-wider text-slate-500">College</Label>
                     <Input id="college" defaultValue="ABC Engineering College" className="bg-slate-50 border-none focus-visible:ring-primary/20" />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="branch" className="text-xs font-bold uppercase tracking-wider text-slate-500">Branch</Label>
                     <Input id="branch" defaultValue="Computer Science" className="bg-slate-50 border-none focus-visible:ring-primary/20" />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="grad-year" className="text-xs font-bold uppercase tracking-wider text-slate-500">Graduation Year</Label>
                     <Input id="grad-year" defaultValue="2025" className="bg-slate-50 border-none focus-visible:ring-primary/20" />
                  </div>
               </div>

               <div className="pt-4 flex justify-end">
                  <Button className="bg-primary hover:bg-primary/90 px-10 py-6 text-base shadow-lg shadow-primary/20">Save Changes</Button>
               </div>
            </CardContent>
         </Card>

         {/* Account Settings */}
         <div className="space-y-6">
            <Card className="border-none shadow-sm bg-white">
               <CardHeader className="p-6 border-b border-slate-50">
                  <CardTitle className="text-base font-bold font-heading">Account Settings</CardTitle>
               </CardHeader>
               <CardContent className="p-2">
                  {[
                     { label: "Change Password", icon: Key },
                     { label: "Notification Settings", icon: Bell },
                     { label: "Privacy Settings", icon: Shield },
                     { label: "Download My Data", icon: Download },
                  ].map((item, i) => (
                     <button key={i} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors group text-left">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              <item.icon className="w-5 h-5" />
                           </div>
                           <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                     </button>
                  ))}
                  <div className="p-2">
                     <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-50 transition-colors group text-left">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                              <Trash2 className="w-5 h-5" />
                           </div>
                           <span className="text-sm font-semibold text-red-600">Delete Account</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-red-200 group-hover:text-red-400 transition-colors" />
                     </button>
                  </div>
               </CardContent>
            </Card>

            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
               <h4 className="font-bold text-sm text-primary mb-2">Need help?</h4>
               <p className="text-xs text-slate-500 leading-relaxed mb-4">Check our documentation or contact our support team for any assistance with your account.</p>
               <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5 text-xs h-9">Contact Support</Button>
            </div>
         </div>
      </div>
    </div>
  );
}
