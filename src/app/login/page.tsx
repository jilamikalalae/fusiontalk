import { Button } from "@/components/ui/button";
import Image from "next/image";
import bg1 from "@/app/login/bg1.webp";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Create an account</h1>

      <div className="space-y-4">
        <Button className="w-full bg-red-500 text-white hover:bg-red-600">
          Continue with Google
        </Button>
        <Button className="w-full bg-black text-white hover:bg-gray-800">
          Continue with Apple
        </Button>
        <Button className="w-full bg-gray-100 text-black hover:bg-gray-200">
          Continue with Email
        </Button>
      </div>

      <div className="mt-4">
        <label className="flex items-center space-x-2 text-sm">
          <input type="checkbox" />
          <span>
            I do not wish to receive news and promotions from this service by email.
          </span>
        </label>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        By continuing, you agree to our <a href="#" className="text-blue-500">Terms of Use</a> and <a href="#" className="text-blue-500">Privacy Policy</a>.
      </p>

      <div className="text-center mt-6 text-sm">
        Already have an account? <a href="#" className="text-blue-500">Log in</a>
      </div>
    </div>
  );
}
