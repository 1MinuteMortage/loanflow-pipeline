import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ShieldCheck, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

function safeReturnTo(raw) {
  if (!raw || typeof raw !== "string") return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export default function VerifySMS() {
  const [searchParams] = useSearchParams();
  const returnTo = safeReturnTo(searchParams.get("returnTo"));
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    checkVerificationNeeded();
  }, []);

  const checkVerificationNeeded = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) {
        base44.auth.redirectToLogin();
        return;
      }

      // No phone number on file — skip verification
      if (!user.phone_number) {
        if (!user.first_login_completed) {
          await base44.entities.User.update(user.id, { first_login_completed: true });
        }
        window.location.href = returnTo;
        return;
      }

      // First login — mark completed and skip SMS
      if (!user.first_login_completed) {
        await base44.entities.User.update(user.id, { first_login_completed: true });
        window.location.href = returnTo;
        return;
      }

      // Subsequent login — require SMS verification
      setNeedsVerification(true);
      await sendCode();
    } catch (err) {
      setError(err.message || "Failed to verify");
    } finally {
      setLoading(false);
    }
  };

  const sendCode = async () => {
    setSending(true);
    setError("");
    try {
      const res = await base44.functions.invoke("send-sms-verification", {});
      if (res?.data?.error) throw new Error(res.data.error);
    } catch (err) {
      setError(err.message || "Failed to send verification code. Add Twilio secrets in the dashboard.");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setVerifying(true);
    try {
      const res = await base44.functions.invoke("verify-sms-code", { code });
      if (res?.data?.error) throw new Error(res.data.error);
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!needsVerification) return null;

  return (
    <AuthLayout
      icon={ShieldCheck}
      title="Verify your identity"
      subtitle="We sent a 6-digit code to your phone"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      <div className="flex justify-center mb-6">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={setCode}
          autoFocus
          autoComplete="one-time-code"
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <Button
        className="w-full h-12 font-medium"
        onClick={handleVerify}
        disabled={verifying || code.length < 6}
      >
        {verifying ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify"
        )}
      </Button>
      <p className="text-center text-sm text-muted-foreground mt-4">
        Didn't receive the code?{" "}
        <button onClick={sendCode} disabled={sending} className="text-primary font-medium hover:underline disabled:opacity-50">
          {sending ? "Sending..." : "Resend"}
        </button>
      </p>
    </AuthLayout>
  );
}