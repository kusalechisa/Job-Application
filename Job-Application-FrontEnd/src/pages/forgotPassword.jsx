import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/Endpoints/Auth.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
import { showPopup } from "@/components/FloatingPopup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    
    console.log("Submitting forgot password for email:", email);
    
    try {
      const res = await forgotPassword({ email });
      console.log("Full response:", res);
      console.log("Response data:", res.data);
      
      const successMessage = res.data?.message || "If an account exists, reset instructions were sent.";
      setMessage(successMessage);
      showPopup(successMessage, "success");
      
      // Optional: Clear email after successful submission
      // setEmail("");
      
    } catch (err) {
      console.error("Full error object:", err);
      console.error("Error response:", err.response);
      console.error("Error message:", err.message);
      
      // More detailed error handling
      let errorMessage = "Request failed. Please try again.";
      
      if (err.response) {
        // Server responded with error
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
        errorMessage = err.response.data?.message || err.response.data?.error || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request was made but no response
        console.error("No response received from server");
        errorMessage = "Cannot connect to server. Please check your internet connection.";
      } else {
        // Something else happened
        errorMessage = err.message || "An unexpected error occurred";
      }
      
      setError(errorMessage);
      showPopup(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md mx-auto border border-white/10 bg-slate-900/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-1 pb-4 sm:pb-6">
          <CardTitle className="text-center text-white text-2xl sm:text-3xl font-bold">
            Forgot Password
          </CardTitle>
          <p className="text-center text-slate-400 text-sm sm:text-base">
            Enter your email to receive reset instructions
          </p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <p className="text-sm text-rose-400">{error}</p>
              </div>
            )}
            
            {/* Success Message */}
            {message && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-400">{message}</p>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-slate-200 text-sm sm:text-base">
                Email Address
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500"
                autoComplete="email"
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            {/* Back to Login */}
            <p className="text-center text-sm text-slate-400">
              <Link to="/login" className="text-sky-300 hover:text-white transition-colors">
                ← Back to login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}