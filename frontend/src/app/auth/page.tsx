"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  
  const { signInWithProvider } = useAuth();
  const supabase = createClient();

  // Form states
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      setError("");
      await signInWithProvider(provider);
      // Supabase OAuth redirects to the provider, so we don't need to do anything else here
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.fullName,
          }
        }
      });

      if (error) throw error;
      
      setSuccess("Account Created Successfully! You can now log in.");
      setTimeout(() => {
        setActiveTab("login");
        setLoginData(prev => ({ ...prev, email: signupData.email }));
        setSuccess("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-extrabold text-foreground font-heading tracking-tighter">PlacementAI</h1>
          </Link>
          <p className="text-muted-foreground mt-2 font-medium">Your intelligent career copilot.</p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start justify-between text-red-600 shadow-sm"
            >
              <p className="text-sm font-semibold">{error}</p>
              <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start justify-between text-emerald-600 shadow-sm"
            >
              <p className="text-sm font-semibold">{success}</p>
              <button onClick={() => setSuccess("")} className="text-emerald-400 hover:text-emerald-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-6 pb-2">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/80 rounded-xl h-12">
                <TabsTrigger value="login" className="rounded-lg text-sm font-bold data-[state=active]:bg-card data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all">Login</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg text-sm font-bold data-[state=active]:bg-card data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all">Sign Up</TabsTrigger>
              </TabsList>
            </div>

            {/* Login Tab */}
            <TabsContent value="login" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <form onSubmit={handleLogin}>
                <CardHeader className="pt-2 px-6 pb-4">
                  <CardTitle className="text-xl font-bold font-heading">Welcome Back</CardTitle>
                  <CardDescription className="text-muted-foreground font-medium">Enter your credentials to access your dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <Input 
                      id="login-email" 
                      type="email" 
                      placeholder="john.doe@example.com" 
                      required 
                      className="rounded-xl h-11 bg-muted border-border focus:bg-card transition-colors"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="login-password">Password</Label>
                    </div>
                    <Input 
                      id="login-password" 
                      type="password" 
                      required 
                      className="rounded-xl h-11 bg-muted border-border focus:bg-card transition-colors"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 px-6 pb-6 pt-2">
                  <Button type="submit" className="w-full h-11 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-md transition-all" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                  </Button>
                  
                  <div className="relative w-full my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground font-bold tracking-wider">Or continue with</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="h-11 rounded-xl bg-card border-border text-foreground hover:bg-muted font-semibold"
                      onClick={() => handleOAuth('google')}
                      disabled={loading}
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" aria-hidden="true" focusable="false"><path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"></path><path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"></path><path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"></path><path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"></path></svg>
                      Google
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="h-11 rounded-xl bg-card border-border text-foreground hover:bg-muted font-semibold"
                      onClick={() => handleOAuth('github')}
                      disabled={loading}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                      GitHub
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <form onSubmit={handleSignup}>
                <CardHeader className="pt-2 px-6 pb-4">
                  <CardTitle className="text-xl font-bold font-heading">Create Account</CardTitle>
                  <CardDescription className="text-muted-foreground font-medium">Join PlacementAI to supercharge your career.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input 
                      id="signup-name" 
                      placeholder="John Doe" 
                      required 
                      className="rounded-xl h-11 bg-muted border-border focus:bg-card transition-colors"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({...signupData, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="john.doe@example.com" 
                      required 
                      className="rounded-xl h-11 bg-muted border-border focus:bg-card transition-colors"
                      value={signupData.email}
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input 
                        id="signup-password" 
                        type="password" 
                        required 
                        className="rounded-xl h-11 bg-muted border-border focus:bg-card transition-colors"
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm</Label>
                      <Input 
                        id="signup-confirm" 
                        type="password" 
                        required 
                        className="rounded-xl h-11 bg-muted border-border focus:bg-card transition-colors"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 px-6 pb-6 pt-2">
                  <Button type="submit" className="w-full h-11 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-md transition-all" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
