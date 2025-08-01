import { ArrowLeft } from "lucide-react"
import { authService } from "../../services/authService"
import GoogleIcon from "../../assets/icons/GoogleIcon"
import AppleIcon from "../../assets/icons/AppleIcon"

const AuthPage = () => {
  const handleGoogleAuth = () => {
    authService.loginWithGoogle()
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6">

        <div className="text-center mb-8 mt-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-12">Sign Up</h1>
          <p className="text-gray-900 text-2xl leading-relaxed font-bold">Welcome! Let's customize Wellvantage for your Goals.</p>
        </div>

        <div className="space-y-4">
          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
            Continue
          </button>

          <div className="text-center">
            <span className="text-black font-medium">OR</span>
          </div>

          <button
            onClick={handleGoogleAuth}
            className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          <button className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
            <AppleIcon />
            <span>Continue with Apple</span>
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          I agree to the collection and processing of my data as outlined in the{" "}
          <a href="#" className="text-blue-500 hover:underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  )
}

export default AuthPage;