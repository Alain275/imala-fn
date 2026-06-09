import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

// Rwandan phone regex: starting with 078/079/072/073 or +25078/etc followed by 7 digits
const phoneRegex = /^(?:\+250|0)?7[8923]\d{7}$/;


// Since the schema has a message for length, let's make it 6 characters
const loginSchemaFixed = z.object({
  phone: z.string().regex(phoneRegex, "Enter a valid Rwandan phone number (e.g. 0788123456)"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["farmer", "agronomist"])
});

type LoginFormValues = z.infer<typeof loginSchemaFixed>;

export default function SignInPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchemaFixed),
    defaultValues: {
      phone: "",
      password: "",
      role: "farmer"
    }
  });


  const onSubmit = async (data: LoginFormValues) => {
    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Retrieve existing mock user or store a placeholder
      const existingUser = localStorage.getItem("imara_user");
      const user = existingUser ? JSON.parse(existingUser) : {
        name: data.role === "agronomist" ? "Senior Agronomist" : "Imara Farmer",
        phone: data.phone,
        role: data.role,
        district: "Gasabo"
      };

      // Ensure role matches what they selected to login
      user.role = data.role;
      localStorage.setItem("imara_user", JSON.stringify(user));

      toast.success("Logged in successfully!");
      
      // Redirect based on role
      if (data.role === "agronomist") {
        navigate("/agronomist");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("Failed to authenticate. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6ee] relative overflow-hidden flex items-stretch">
      {/* Dynamic background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#f6ebd5]/60 blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] right-[30%] w-[45vw] h-[45vw] rounded-full bg-[#f6ebd5]/40 blur-3xl -z-10" />
      <div className="absolute top-[30%] left-[25%] w-72 h-72 rounded-full bg-[#f6ebd5]/50 blur-2xl -z-10" />

      {/* Main Container */}
      <div className="w-full grid lg:grid-cols-12 min-h-screen z-10 items-stretch">
        
        {/* Left Side: SignIn Form */}
        <div className="lg:col-span-7 px-6 py-12 sm:px-12 lg:px-20 flex flex-col justify-center items-center relative bg-transparent">
          
          {/* Back button */}
          <div className="mb-8 flex justify-between items-center w-full max-w-lg">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-600 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            
            {/* Logo */}
            <div className="flex items-center gap-2 lg:hidden">
              <span className="text-xl font-bold text-emerald-800 tracking-wider">IMARA</span>
            </div>
          </div>

          <div className="w-full max-w-lg">
            <h1 className="text-3xl font-bold text-emerald-950 mb-6">Welcome Back</h1>
            

            

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Telephone input */}
              <div className="relative">
                <span className="absolute left-3 -top-2 bg-[#faf6ee] px-1.5 text-[11px] font-semibold text-emerald-800 tracking-wide z-10">
                  Telephone Number
                </span>
                <div className="flex items-center rounded-xl border border-[#e0d6bc] bg-[#faf6ee]/20 px-3.5 py-3.5 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/20 transition-all">
                  <Phone className="w-4 h-4 text-emerald-700/50 mr-2.5 flex-shrink-0" />
                  <input
                    {...register("phone")}
                    type="tel"
                    placeholder="e.g. 0788123456"
                    className="w-full bg-transparent text-sm text-emerald-950 placeholder-emerald-950/30 outline-none"
                  />
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-rose-600 mt-1 pl-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Password input */}
              <div className="relative">
                <span className="absolute left-3 -top-2 bg-[#faf6ee] px-1.5 text-[11px] font-semibold text-emerald-800 tracking-wide z-10">
                  Password
                </span>
                <div className="flex items-center rounded-xl border border-[#e0d6bc] bg-[#faf6ee]/20 px-3.5 py-3.5 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/20 transition-all">
                  <Lock className="w-4 h-4 text-emerald-700/50 mr-2.5 flex-shrink-0" />
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full bg-transparent text-sm text-emerald-950 placeholder-emerald-950/30 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-emerald-700/50 hover:text-emerald-800 transition-colors ml-2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-600 mt-1 pl-1">{errors.password.message}</p>
                )}
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end mt-2">
                <a href="#" className="text-xs font-semibold text-emerald-800 hover:text-emerald-600 underline">
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-sm shadow-[0_8px_20px_-6px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_24px_-4px_rgba(16,185,129,0.4)] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>

          {/* Switch link for Mobile View */}
          <div className="mt-8 text-center lg:hidden">
            <p className="text-xs text-emerald-900/60">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-bold text-emerald-800 hover:text-emerald-600 underline">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side: Giant circle overlay stretching full-screen height */}
        <div className="hidden lg:col-span-5 lg:flex relative overflow-hidden items-center justify-center h-full min-h-screen">
          
          {/* Giant circle element extending leftwards */}
          <div className="">
            
            {/* Content inside the giant circle */}
            <div className="max-w-sm text-center space-y-6 relative z-10 px-10">
              <div className="flex justify-center mb-1">
                <img 
                  src="/crop advisory.png" 
                  alt="Crop Advisory" 
                  className="w-50 h-50 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]" 
                />
              </div>
              
              <h2 className="text-4xl font-extrabold tracking-tight text-emerald-700 drop-shadow-sm">Get Started</h2>
              
              <p className="text-emerald-900/80 text-sm font-light leading-relaxed">
                New to IMARA? 
              </p>
              
              <Link
                to="/register"
                className="inline-block px-10 py-3 rounded-xl border-2 border-emerald-600 hover:border-emerald-700 text-emerald-700 hover:text-emerald-800 font-bold text-xs uppercase tracking-wider bg-transparent hover:bg-emerald-50/30 transition-all duration-300 active:scale-95 shadow-[0_4px_12px_rgba(5,150,105,0.15)]"
              >
                Sign Up
              </Link>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
