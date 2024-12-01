import { Button } from "@/components/ui/button";
import Image from "next/image";
import bg1 from "@/app/login/bg1.webp";

export default function registerPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left side: Background image */}
      <div className="relative">
        <Image
          src={bg1}
          alt="Background Image"
          fill
          className="object-cover"
        />
      </div>

      {/* Right side: Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Create an account</h1>

          <div className="space-y-4">
            <Button className="w-full bg-gray-100 text-black hover:bg-gray-200">
              Continue with Email
            </Button>
          </div>

       

          <p className="text-xs text-gray-500 mt-4">
            By continuing, you agree to our <a href="#" className="text-blue-500">Terms of Use</a> and <a href="#" className="text-blue-500">Privacy Policy</a>.
          </p>

          <div className="text-center mt-6 text-sm">
            Already have an account? <a href="/login" className="text-blue-500">Log in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
