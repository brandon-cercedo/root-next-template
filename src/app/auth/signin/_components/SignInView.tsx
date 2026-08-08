import SignInCard from "@/features/auth/components/SignInCard";

export default function SignInView() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-md p-6">
        <SignInCard />
      </div>
    </div>
  );
}
