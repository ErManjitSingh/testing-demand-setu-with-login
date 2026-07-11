import SignInForm from "@/components/auth/SignInForm";
import AuthPageShell from "@/components/auth/AuthPageShell";

export const metadata = {
  title: "Sign in | Demand Setu",
  description: "Sign in to book stays and manage your trips on Demand Setu.",
};

export default function SignInPage() {
  return (
    <AuthPageShell
      mode="signin"
      title="Welcome back"
      description="Sign in with Google or mobile."
    >
      <SignInForm />
    </AuthPageShell>
  );
}
