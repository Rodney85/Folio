import { useEffect } from "react";
import { SignUp as ClerkSignUp } from "@clerk/clerk-react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

/**
 * SignUp page component that displays Clerk's SignUp component.
 * Preserves the Affonso affiliate ?via= param through Clerk's routing.
 */
const SignUp = () => {
  const location = useLocation();

  useEffect(() => {
    // Persist the ?via= affiliate param in sessionStorage so Affonso pixel
    // can attribute the conversion even after Clerk changes the URL internally.
    const params = new URLSearchParams(location.search);
    const via = params.get("via");
    if (via) {
      sessionStorage.setItem("affonso_via", via);
      // Also write into the cookie directly as a fallback
      document.cookie = `affonso_ref=${via}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }
  }, [location.search]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="max-w-md w-full rounded-xl overflow-hidden">
        <div className="mb-4">
          <Link
            to={`/${location.search}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <ClerkSignUp
          routing="path"
          path="/sign-up"
          signInUrl={`/sign-in${location.search}`}
          fallbackRedirectUrl="/welcome"
          appearance={{
            elements: {
              rootBox: "w-full mx-auto",
              card: "bg-white shadow-md rounded-xl p-6",
              headerTitle: "text-2xl font-bold text-gray-900",
              headerSubtitle: "text-gray-600",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
              formFieldInput: "bg-gray-50 border border-gray-300",
              footerAction: "text-blue-600 hover:text-blue-800",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-500",
            },
          }}
        />
      </div>
    </div>
  );
};

export default SignUp;
