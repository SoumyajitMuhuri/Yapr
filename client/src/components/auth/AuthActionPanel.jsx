import { SignInButton, SignUpButton } from "@clerk/react";
import { Button } from "@heroui/react";
import { ShieldCheckIcon } from "lucide-react";
import { AuthCardShell } from "./AuthCardShell";

const AFTER_AUTH = "/";
const actionButtonClassName = "h-12 rounded-2xl text-[15px] font-semibold";

export function AuthActionPanel() {
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
        </div>

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