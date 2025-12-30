import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Logo from "@/components/logo";
import { useMutation } from "@tanstack/react-query";
import { registerMutationFn } from "@/lib/api";
import { Loader } from "lucide-react";
import { toast } from "sonner"
import GoogleOauthButton from "@/components/auth/google-oauth-button";

const SignUp = () => {
  const navigate = useNavigate();
  const { mutate, isPending } = useMutation({
    mutationFn: registerMutationFn,
  });

  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: "Name is required",
    }),
    email: z.string().trim().email("Invalid email address").min(1, {
      message: "Workspace name is required",
    }),
    password: z.string().trim().min(1, {
      message: "Password is required",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    mutate(values, {
      onSuccess: () => {
        navigate("/");
      },
      onError: (error) => {
        console.log(error);
        toast.error(error.message)
      },
    });
  };

  return (
  <div className="flex min-h-svh flex-col items-center justify-center bg-muted gap-6  p-6 md:p-10 dark:bg-slate-950 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-100/50 blur-[100px] dark:bg-blue-900/20 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-100/50 blur-[100px] dark:bg-indigo-900/20 pointer-events-none" />

      <div className="flex w-full max-w-md flex-col gap-5 relative z-10">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-bold text-xl text-slate-800 dark:text-slate-100 transition-opacity hover:opacity-80"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-blue-500/20">
            <Logo  />
          </div>
          Team Sync.
        </Link>
        <div className="flex flex-col gap-6">
          <Card className="border-0 shadow-xl shadow-slate-200/60 dark:shadow-none dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Create an account
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Signup with your Email or Google account
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-5">
                    <div className="flex flex-col gap-4">
                      <GoogleOauthButton label="Sign up"/>
                    </div>
                    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-slate-200 dark:after:border-slate-800">
                      <span className="relative z-10 bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wider">
                        Or continue with
                      </span>
                    </div>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                                Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="John Doe"
                                  className="!h-[48px] bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-all duration-200"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-2">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                                Email
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="m@example.com"
                                  className="!h-[48px] bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-all duration-200"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-2">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                                Password
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  className="!h-[48px] bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-all duration-200"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-[48px] text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 mt-2"
                      >
                        {isPending && <Loader className="animate-spin mr-2 h-5 w-5" />}
                        Create account
                      </Button>
                    </div>
                    <div className="text-center text-sm text-slate-600 dark:text-slate-400 mt-2">
                      Already have an account?{" "}
                      <Link
                        to="/"
                        className="font-semibold text-primary underline-offset-4 hover:underline hover:text-primary/80 transition-colors"
                      >
                        Sign in
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-slate-500 dark:text-slate-400 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary transition-colors px-8">
            By clicking continue, you agree to our{" "}
            <a href="#" className="font-medium">Terms of Service</a> and <a href="#" className="font-medium">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;