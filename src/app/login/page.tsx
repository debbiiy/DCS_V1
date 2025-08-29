'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

  const isEmailValid = email.includes('@')
  const isPasswordValid = password.length > 0
  const isFormValid = isEmailValid && isPasswordValid

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.message || 'Login failed')
    } else {
      localStorage.setItem('userRole', data.role)
      localStorage.setItem('username', data.username)
      localStorage.setItem('email', data.email)

      if (data.role === 'ADMIN') router.push('/dashboard/admin')
      else if (data.role === 'APPROVER') router.push('/dashboard/approver')
      else if (data.role.includes('REVIEWER')) router.push('/dashboard/reviewer')
      else router.push('/dashboard/user')
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:block w-1/2 order-2 md:order-1">
        <img
          src="/samudera_banner.jpg"
          alt="background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-white p-10 order-1 md:order-2 shadow-lg">
        <form
          onSubmit={handleLogin}
          className="bg-white shadow-2xl rounded-lg w-full h-auto p-10 flex flex-col justify-start space-y-6"
        >
          <div className="flex items-center justify-start -ml-4">
            <img src="/logo-samudera.png" alt="logo" className="w-80" />
          </div>

          <h2 className="text-xl font-semibold text-gray-800">Sign In</h2>

          <div className="flex flex-col space-y-1">
            <input
              type="email"
              placeholder="Email"
              className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring text-black ${
                !isEmailValid && email ? 'border-red-500' : 'border-gray-300'
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {!isEmailValid && email && (
              <p className="text-red-500 text-sm">Must be a valid email format</p>
            )}
          </div>

          <div className="relative flex flex-col space-y-1">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring text-black pr-10 ${
                !isPasswordValid && passwordTouched ? 'border-red-500' : 'border-gray-300'
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
            />
            {!isPasswordValid && passwordTouched && (
              <p className="text-red-500 text-sm">Password is Required</p>
            )}
            <div
              className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-red-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-2 rounded-full font-semibold transition duration-300 ${
              isFormValid
                ? 'bg-[#ff0000] hover:bg-[#e60000] text-white'
                : 'bg-[#ffcccc] text-gray-400 cursor-not-allowed'
            }`}
          >
            LOGIN NOW!
          </button>
        </form>
      </div>
    </div>
  )
}
