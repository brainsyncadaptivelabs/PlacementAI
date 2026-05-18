"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Briefcase, Code } from "lucide-react";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link className="inline-flex items-center gap-2" href="/">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">A</div>
          <span className="font-heading font-bold text-2xl tracking-tight">AI Placement <span className="text-primary">Copilot</span></span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-center mb-4">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1">
              <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
              <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign In</TabsTrigger>
            </TabsList>
          </div>

          <Card className="border-none shadow-xl">
            <TabsContent value="signup">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center font-heading">Create Your Account</CardTitle>
                <CardDescription className="text-center">Enter your details to start your placement journey</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input id="full-name" placeholder="John Doe" type="text" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" placeholder="name@example.com" type="email" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Link href="/dashboard" className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90">Sign Up</Button>
                </Link>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Or continue with</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" size="icon" className="w-full py-6">
                    <Mail className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="w-full py-6">
                    <Briefcase className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="w-full py-6">
                    <Code className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-center w-full text-slate-500">
                  Already have an account? <button onClick={() => setActiveTab("login")} className="text-primary hover:underline font-medium">Login</button>
                </p>
              </CardFooter>
            </TabsContent>

            <TabsContent value="login">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center font-heading">Welcome Back!</CardTitle>
                <CardDescription className="text-center">Login to your account to continue</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email-login">Email Address</Label>
                  <Input id="email-login" placeholder="name@example.com" type="email" />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password-login">Password</Label>
                    <Link href="#" className="text-xs text-primary hover:underline">Forgot Password?</Link>
                  </div>
                  <Input id="password-login" type="password" />
                </div>
                <Link href="/dashboard" className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90">Login</Button>
                </Link>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Or continue with</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" size="icon" className="w-full py-6">
                    <Mail className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="w-full py-6">
                    <Briefcase className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="w-full py-6">
                    <Code className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-center w-full text-slate-500">
                  Don&apos;t have an account? <button onClick={() => setActiveTab("signup")} className="text-primary hover:underline font-medium">Sign Up</button>
                </p>
              </CardFooter>
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}
