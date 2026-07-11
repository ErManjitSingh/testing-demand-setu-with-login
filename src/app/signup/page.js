import SignUpForm from "@/components/auth/SignUpForm";
import AuthPageShell from "@/components/auth/AuthPageShell";

export const metadata = {
  title: "Sign up | Demand Setu",
  description: "Create your Demand Setu account to book stays and manage your trips.",
};

export default function SignUpPage() {
  return (
    <AuthPageShell
      mode="signup"
      title="Create your account"
      description="Book stays and manage trips with Demand Setu."
    >
      <SignUpForm />
    </AuthPageShell>
  );
}
