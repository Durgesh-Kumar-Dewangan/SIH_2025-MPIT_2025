import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [socialMediaId, setSocialMediaId] = useState("");
  const [instituteEnrollment, setInstituteEnrollment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) navigate("/");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) navigate("/");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
              social_media_id: socialMediaId,
              institute_enrollment: instituteEnrollment,
            },
          },
        });
        if (error) throw error;
        toast.success("Account created successfully!");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.message.includes("User already registered")) {
        toast.error("This email is already registered. Please login instead.");
      } else if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please try again.");
      } else {
        toast.error(error.message || "Authentication failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (session) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-200 to-blue-200 p-4">
      <div 
        className={`relative bg-white rounded-[30px] shadow-[0_5px_15px_rgba(0,0,0,0.35)] overflow-hidden w-full max-w-3xl min-h-[480px] transition-all duration-600 ${
          !isLogin ? 'auth-active' : ''
        }`}
      >
        {/* Sign In Form */}
        <div className={`absolute top-0 left-0 h-full w-1/2 transition-all duration-600 ease-in-out ${
          !isLogin ? 'translate-x-full' : 'translate-x-0'
        } z-20`}>
          <form onSubmit={handleSubmit} className="bg-white flex flex-col items-center justify-center h-full px-10">
            <h1 className="text-4xl font-bold mb-2">Sign In</h1>
            <div className="flex gap-3 my-5">
              <a href="#" className="border border-gray-300 rounded-lg inline-flex justify-center items-center w-10 h-10 hover:bg-gray-50 transition-colors">
                <i className="fa-brands fa-google-plus-g"></i>
              </a>
              <a href="#" className="border border-gray-300 rounded-lg inline-flex justify-center items-center w-10 h-10 hover:bg-gray-50 transition-colors">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="border border-gray-300 rounded-lg inline-flex justify-center items-center w-10 h-10 hover:bg-gray-50 transition-colors">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="#" className="border border-gray-300 rounded-lg inline-flex justify-center items-center w-10 h-10 hover:bg-gray-50 transition-colors">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
            <span className="text-xs mb-2">or use your email password</span>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-100 border-none my-2 px-4 py-2.5 text-sm rounded-lg w-full outline-none"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-gray-100 border-none my-2 px-4 py-2.5 text-sm rounded-lg w-full outline-none"
            />
            <a href="#" className="text-gray-700 text-xs my-4 hover:underline">Forget Your Password?</a>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#2da0a8] hover:bg-[#258a91] text-white text-xs px-11 py-2.5 border border-transparent rounded-lg font-semibold tracking-wider uppercase mt-2.5 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>

        {/* Sign Up Form */}
        <div className={`absolute top-0 left-0 h-full w-1/2 transition-all duration-600 ease-in-out ${
          !isLogin ? 'translate-x-full opacity-100 z-50 animate-[move_0.6s]' : 'translate-x-0 opacity-0 z-10'
        }`}>
          <form onSubmit={handleSubmit} className="bg-white flex flex-col items-center justify-center h-full px-10">
            <h1 className="text-4xl font-bold mb-2">Create Account</h1>
            <div className="flex gap-3 my-5">
              <a href="#" className="border border-gray-300 rounded-lg inline-flex justify-center items-center w-10 h-10 hover:bg-gray-50 transition-colors">
                <i className="fa-brands fa-google-plus-g"></i>
              </a>
              <a href="#" className="border border-gray-300 rounded-lg inline-flex justify-center items-center w-10 h-10 hover:bg-gray-50 transition-colors">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="border border-gray-300 rounded-lg inline-flex justify-center items-center w-10 h-10 hover:bg-gray-50 transition-colors">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="#" className="border border-gray-300 rounded-lg inline-flex justify-center items-center w-10 h-10 hover:bg-gray-50 transition-colors">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
            <span className="text-xs mb-2">or use your email for registration</span>
            <Input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required={!isLogin}
              className="bg-gray-100 border-none my-2 px-4 py-2.5 text-sm rounded-lg w-full outline-none"
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-100 border-none my-2 px-4 py-2.5 text-sm rounded-lg w-full outline-none"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-gray-100 border-none my-2 px-4 py-2.5 text-sm rounded-lg w-full outline-none"
            />
            <Input
              type="text"
              placeholder="Social Media ID (e.g., @username)"
              value={socialMediaId}
              onChange={(e) => setSocialMediaId(e.target.value)}
              required={!isLogin}
              className="bg-gray-100 border-none my-2 px-4 py-2.5 text-sm rounded-lg w-full outline-none"
            />
            <Input
              type="text"
              placeholder="Institute Enrollment Number"
              value={instituteEnrollment}
              onChange={(e) => setInstituteEnrollment(e.target.value)}
              required={!isLogin}
              className="bg-gray-100 border-none my-2 px-4 py-2.5 text-sm rounded-lg w-full outline-none"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#2da0a8] hover:bg-[#258a91] text-white text-xs px-11 py-2.5 border border-transparent rounded-lg font-semibold tracking-wider uppercase mt-2.5 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </div>

        {/* Toggle Container */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-600 ease-in-out z-[1000] ${
          !isLogin ? '-translate-x-full rounded-r-[150px] rounded-br-[100px] rounded-tl-none rounded-bl-none' : 'translate-x-0 rounded-l-[150px] rounded-bl-[100px] rounded-tr-none rounded-br-none'
        }`}>
          <div className={`bg-gradient-to-r from-[#5c6bc0] to-[#2da0a8] h-full relative -left-full w-[200%] transition-all duration-600 ease-in-out ${
            !isLogin ? 'translate-x-1/2' : 'translate-x-0'
          }`}>
            {/* Toggle Left */}
            <div className={`absolute w-1/2 h-full flex items-center justify-center flex-col px-8 text-center top-0 transition-all duration-600 ease-in-out ${
              !isLogin ? 'translate-x-0' : '-translate-x-[200%]'
            }`}>
              <h1 className="text-white text-4xl font-bold mb-2">Welcome Back!</h1>
              <p className="text-white text-sm leading-5 tracking-wide my-5">Enter your personal details to use all of site features</p>
              <Button
                type="button"
                onClick={() => setIsLogin(true)}
                className="bg-transparent border border-white text-white hover:bg-white/10"
              >
                Sign In
              </Button>
            </div>

            {/* Toggle Right */}
            <div className={`absolute right-0 w-1/2 h-full flex items-center justify-center flex-col px-8 text-center top-0 transition-all duration-600 ease-in-out ${
              !isLogin ? 'translate-x-[200%]' : 'translate-x-0'
            }`}>
              <h1 className="text-white text-4xl font-bold mb-2">Hello, Friend!</h1>
              <p className="text-white text-sm leading-5 tracking-wide my-5">Register with your personal details to use all of site features</p>
              <Button
                type="button"
                onClick={() => setIsLogin(false)}
                className="bg-transparent border border-white text-white hover:bg-white/10"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}