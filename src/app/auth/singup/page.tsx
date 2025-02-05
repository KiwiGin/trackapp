"use client"

import { useState } from "react"
import Image from "next/image"
import RegisterForm from "@/components/RegisterForm"
import ImageLinkModal from "@/components/ImageLinkModal"

export default function RegisterPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imageLink, setImageLink] = useState("/user-default.svg")

  const handleImageClick = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)
  const handleSaveImageLink = (link: string) => {
    setImageLink(link)
    setIsModalOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Image
            src={imageLink || "/placeholder.svg"}
            alt="User Avatar"
            width={80}
            height={80}
            className="rounded-full bg-gray-200 p-2 cursor-pointer"
            onClick={handleImageClick}
          />
        </div>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create an Account</h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <RegisterForm imageLink={imageLink} />
        </div>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/auth/singin" className="font-medium text-primary hover:underline">
            Log in
          </a>
        </p>
      </div>

      <ImageLinkModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveImageLink} />
    </div>
  )
}

