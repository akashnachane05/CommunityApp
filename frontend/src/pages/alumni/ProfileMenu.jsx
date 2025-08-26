import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { User, Key, IdCard, LogOut } from "lucide-react"

export default function ProfileMenu({ user, setActiveTab, logout }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar + Name (clickable) */}
      <div
        className="flex items-center space-x-3 pl-3 border-l border-gray-200 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <Avatar className="ring-2 ring-blue-100">
          <AvatarImage src="/placeholder.svg?height=32&width=32" />
          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
           {user?.fullName
            ? (() => {
                const parts = user.fullName.trim().split(/\s+/)
                const first = parts[0]?.charAt(0) || ""
                const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) : ""
                return first + last
                })()
            : "U"}
          </AvatarFallback>
        </Avatar>

      </div>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
          {/* Header */}
            <div className="flex items-center space-x-3 p-4 border-b">
                <Avatar className="ring-2 ring-blue-100 h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                   {user?.fullName
                    ? (() => {
                        const parts = user.fullName.trim().split(/\s+/)
                        const first = parts[0]?.charAt(0) || ""
                        const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) : ""
                        return first + last
                        })()
                    : "U"}

                </AvatarFallback>
                </Avatar>
                <div>
                <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.email || "your.email@example.com"}</p>
                </div>
            </div>

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={() => {
                setActiveTab("profile")
                setOpen(false)
              }}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <User className="h-4 w-4 mr-2 text-blue-600" />
              User Profile
            </button>
            <button
              onClick={() => alert("Change password clicked")}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <Key className="h-4 w-4 mr-2 text-green-600" />
              Change Password
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
