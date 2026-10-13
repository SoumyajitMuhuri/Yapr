import { useState } from "react";
import { SignInButton, SignUpButton, useSignIn } from "@clerk/react";
import { Button } from "@heroui/react";
import { ShieldCheckIcon } from "lucide-react";
import { AuthCardShell } from "./AuthCardShell";

const AFTER_AUTH = "/";
const SSO_CALLBACK = "/sso-callback";

const actionButtonClassName = "h-12 rounded-2xl text-[15px] font-semibold";

export function AuthActionPanel() {
  const { signIn } = useSignIn();
  const [googleError, setGoogleError] = useState("");

  const handleGoogleSignIn = async () => {
    setGoogleError("");

    try {
      const { error } = await signIn.sso({
        strategy: "oauth_google",
        redirectCallbackUrl: SSO_CALLBACK,
        redirectUrl: AFTER_AUTH,
      });

      if (error) {
        setGoogleError(error.message || "Google sign-in failed. Please try again.");
      }
    } catch (error) {
      setGoogleError(error.message || "Google sign-in failed. Please try again.");
    }
  };

  return (
    <section className="relative flex flex-1 flex-col items-stretch justify-center overflow-hidden px-5 py-12 sm:px-10 md:px-14 md:py-10 lg:px-16">
      <AuthCardShell>
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
            Welcome
          </h1>
          <div
            aria-hidden="true"
            className="mt-6 h-px w-full bg-black/10 dark:bg-white/10"
          />
        </div>

        <div className="grid gap-3">
          <SignInButton mode="modal" forceRedirectUrl={AFTER_AUTH}>
            <Button
              fullWidth
              size="lg"
              variant="primary"
              className={actionButtonClassName}
            >
              Log in
            </Button>
          </SignInButton>

          <SignUpButton mode="modal" forceRedirectUrl={AFTER_AUTH}>
            <Button
              fullWidth
              size="lg"
              variant="secondary"
              className={actionButtonClassName}
            >
              Sign up
            </Button>
          </SignUpButton>

          <Button
            fullWidth
            size="lg"
            variant="secondary"
            className={`${actionButtonClassName} border border-black/10 bg-white dark:border-white/10 dark:bg-[#1c1c1e]`}
            onPress={handleGoogleSignIn}
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        </div>

        {googleError && (
          <p role="alert" className="mt-3 text-center text-sm text-danger">
            {googleError}
          </p>
        )}

        <div className="mt-8 flex items-center justify-center gap-2 border-t border-black/6 pt-6 text-[11px] text-[#8E8E93] dark:border-white/8 dark:text-[#636366]">
          <ShieldCheckIcon
            className="size-3.5 shrink-0 text-[#34C759] dark:text-[#30D158]"
            strokeWidth={2}
            aria-hidden="true"
          />
          <span>Protected session · TLS encryption</span>
        </div>
      </AuthCardShell>
    </section>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
        transform="translate(0 5)"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.62 5.91c4.45-4.11 7.14-10.17 7.14-17.56Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.95 23.95 0 0 0 0 21.56l7.98-6.19Z"
        transform="translate(0 5)"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.91-5.79l-7.62-5.91c-2.12 1.42-4.84 2.26-8.29 2.26-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
    </svg>
  );
}