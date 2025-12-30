import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/store/store";

const GoogleOAuth = () => {
  const { setAccessToken } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const status = params.get("status");
  const accessToken = params.get("access_token");
  const currentWorkspace = params.get("current_workspace");

  console.log(
    status,
    accessToken,
    "access_token",
    currentWorkspace,
    "currentWorkspace",
    "success"
  );

  React.useEffect(() => {
    if (status === "success" && accessToken) {
      setAccessToken(accessToken);
      if (currentWorkspace) {
        navigate(`/workspace/${currentWorkspace}`, { replace: true });
      } else {
        navigate(`/`, { replace: true });
      }
    }
  }, [status, accessToken, currentWorkspace, navigate, setAccessToken]);

  // 成功状态：显示加载中
  if (status === "success" && accessToken) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-slate-50 p-6 md:p-10 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // 失败状态：显示错误界面
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-slate-50 p-6 md:p-10 dark:bg-slate-950 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-100/50 blur-[100px] dark:bg-blue-900/20 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-100/50 blur-[100px] dark:bg-indigo-900/20 pointer-events-none" />

      <div className="flex w-full max-w-md flex-col gap-8 relative z-10">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-bold text-xl text-slate-800 dark:text-slate-100 transition-opacity hover:opacity-80"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-blue-500/20">
            <Logo />
          </div>
          Team Sync
        </Link>
        
        <Card className="border-0 shadow-xl shadow-slate-200/60 dark:shadow-none dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
          <CardContent className="pt-10 pb-10 px-8 flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 ring-1 ring-red-100 dark:ring-red-900/50 animate-in zoom-in-50 duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 dark:text-red-400">
                 <circle cx="12" cy="12" r="10" />
                 <line x1="12" x2="12" y1="8" y2="12" />
                 <line x1="12" x2="12.01" y1="16" y2="16" />
               </svg>
            </div>
            
            <h1 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Authentication Failed
            </h1>
            
            <p className="mb-8 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-[280px]">
              We couldn't sign you in with Google. Please check your credentials and try again.
            </p>

            <Button 
              onClick={() => navigate("/")} 
              className="w-full h-[48px] text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
        
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          Need help? <a href="#" className="font-medium underline underline-offset-4 hover:text-primary transition-colors">Contact Support</a>
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuth;