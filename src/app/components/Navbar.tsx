'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Sidebar from './Sidebar'

export default function Navbar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const [role, setRole] = useState('')
  const [username, setUsername] = useState('')
  const sidebarRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole')
    const storedUsername = localStorage.getItem('username')
    if (storedRole) setRole(storedRole)
    if (storedUsername) setUsername(storedUsername)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !(sidebarRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setIsOpen])

  const handleLogout = async () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('username')
    await fetch('/api/logout', { method: 'POST' })
    window.location.replace('/login')
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 h-16 bg-white shadow-md px-6 flex justify-between items-center transition-all duration-300 z-40 ${isOpen ? 'ml-64' : 'ml-0'}`}
      >
        <div className="flex items-center space-x-2">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
            {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
          <h1 className="text-lg font-semibold text-gray-700">Document Control System</h1>
        </div>

        <div className="flex items-center space-x-4">
          <p className="text-gray-700">
            Hello, <span className="font-semibold capitalize">{username || 'Guest'}</span>
          </p>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </nav>

      <div ref={sidebarRef}>
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
    </>
  )
}
