'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { Upload, CheckCircle } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface FormData {
    name: string
    email: string
    phone: string
    cityState: string
    position: string
    willingToTravel: string
    hasLicense: string
    yearsExperience: string
    equipmentSkills: string[]
    coverLetter: string
    availabilityDate: string
}

const POSITIONS = [
    'Landscaping Crew - El Dorado, AR',
    'Landscaping Crew - Oklahoma City, OK',
    'Multi-Location Landscaper (Travel Required)',
    'Commercial Property Specialist',
    'Seasonal Worker (All Locations)',
    'Other'
]

const EQUIPMENT_OPTIONS = [
    'Commercial Mower',
    'Edger/Trimmer',
    'Leaf Blower',
    'Pressure Washer',
    'Heavy Equipment'
]

export default function JobApplicationForm() {
    const { addToast } = useToast()
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        cityState: '',
        position: '',
        willingToTravel: '',
        hasLicense: '',
        yearsExperience: '',
        equipmentSkills: [],
        coverLetter: '',
        availabilityDate: ''
    })
    const [resume, setResume] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCheckboxChange = (skill: string) => {
        setFormData(prev => ({
            ...prev,
            equipmentSkills: prev.equipmentSkills.includes(skill)
                ? prev.equipmentSkills.filter(s => s !== skill)
                : [...prev.equipmentSkills, skill]
        }))
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            if (file.type !== 'application/pdf') {
                addToast({ type: 'error', message: 'Please upload a PDF file' })
                return
            }
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                addToast({ type: 'error', message: 'File size must be less than 5MB' })
                return
            }
            setResume(file)
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // First upload resume if provided
            let resumeUrl = ''
            if (resume) {
                const resumeFormData = new FormData()
                resumeFormData.append('file', resume)
                resumeFormData.append('applicantName', formData.name)

                const uploadRes = await fetch('/api/careers/upload-resume', {
                    method: 'POST',
                    body: resumeFormData
                })

                const uploadData = await uploadRes.json() as { success: boolean; url?: string; error?: string }
                if (!uploadData.success || !uploadData.url) {
                    throw new Error(uploadData.error || 'Failed to upload resume')
                }
                resumeUrl = uploadData.url
            }

            // Submit application
            const applicationData = {
                ...formData,
                resumeUrl,
                equipmentSkills: formData.equipmentSkills
            }

            const res = await fetch('/api/careers/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applicationData)
            })

            const data = await res.json() as { success: boolean; error?: string }
            if (data.success) {
                setIsSuccess(true)
                addToast({ type: 'success', message: 'Application submitted successfully!' })
            } else {
                throw new Error(data.error || 'Failed to submit application')
            }
        } catch (error) {
            console.error('Application submission error:', error)
            addToast({
                type: 'error',
                message: error instanceof Error ? error.message : 'Failed to submit application. Please try again.'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="flex justify-center mb-6">
                    <CheckCircle className="w-16 h-16 text-forest-green" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
                <p className="text-lg text-gray-600 mb-4">
                    Thank you for applying to join the Evergrow team. We've received your application and will review it shortly.
                </p>
                <p className="text-gray-600">
                    You'll receive a confirmation email at <strong>{formData.email}</strong> with next steps.
                </p>
                <button
                    onClick={() => {
                        setIsSuccess(false)
                        setFormData({
                            name: '',
                            email: '',
                            phone: '',
                            cityState: '',
                            position: '',
                            willingToTravel: '',
                            hasLicense: '',
                            yearsExperience: '',
                            equipmentSkills: [],
                            coverLetter: '',
                            availabilityDate: ''
                        })
                        setResume(null)
                    }}
                    className="mt-8 inline-block bg-forest-green text-white px-8 py-3 rounded-md font-semibold hover:bg-forest-green-700 transition-colors"
                >
                    Submit Another Application
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
            {/* Personal Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest-green focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest-green focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest-green focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="cityState" className="block text-sm font-medium text-gray-700 mb-1">
                            Current City/State <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="cityState"
                            name="cityState"
                            required
                            placeholder="e.g., El Dorado, AR"
                            value={formData.cityState}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest-green focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Position Details */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Position Details</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                            Position Applying For <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="position"
                            name="position"
                            required
                            value={formData.position}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest-green focus:border-transparent"
                        >
                            <option value="">Select a position...</option>
                            {POSITIONS.map(pos => (
                                <option key={pos} value={pos}>{pos}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Willing to Travel Between Locations? <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="willingToTravel"
                                        value="yes"
                                        required
                                        checked={formData.willingToTravel === 'yes'}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    Yes
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="willingToTravel"
                                        value="no"
                                        required
                                        checked={formData.willingToTravel === 'no'}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    No
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valid Driver's License? <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="hasLicense"
                                        value="yes"
                                        required
                                        checked={formData.hasLicense === 'yes'}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    Yes
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="hasLicense"
                                        value="no"
                                        required
                                        checked={formData.hasLicense === 'no'}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    No
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700 mb-1">
                            Years Experience in Landscaping <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="yearsExperience"
                            name="yearsExperience"
                            required
                            min="0"
                            max="50"
                            value={formData.yearsExperience}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest-green focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Skills & Equipment */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Equipment Skills</h3>
                <p className="text-sm text-gray-600 mb-4">Select all equipment you have experience operating:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {EQUIPMENT_OPTIONS.map(skill => (
                        <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.equipmentSkills.includes(skill)}
                                onChange={() => handleCheckboxChange(skill)}
                                className="w-4 h-4 text-forest-green border-gray-300 rounded focus:ring-forest-green"
                            />
                            <span className="text-gray-700">{skill}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Resume Upload */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Resume Upload</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <label htmlFor="resume" className="cursor-pointer">
                        <span className="text-hopeful-teal font-semibold hover:text-hopeful-teal/80">
                            Choose a file
                        </span>
                        <span className="text-gray-600"> or drag and drop</span>
                        <input
                            type="file"
                            id="resume"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">PDF only, max 5MB</p>
                    {resume && (
                        <p className="mt-4 text-sm text-forest-green font-medium">
                            ✓ {resume.name}
                        </p>
                    )}
                </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">
                            Why do you want to join Evergrow?
                        </label>
                        <textarea
                            id="coverLetter"
                            name="coverLetter"
                            rows={5}
                            value={formData.coverLetter}
                            onChange={handleInputChange}
                            placeholder="Tell us about yourself and why you'd be a great fit for our team..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest-green focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="availabilityDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Availability Start Date
                        </label>
                        <input
                            type="date"
                            id="availabilityDate"
                            name="availabilityDate"
                            value={formData.availabilityDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest-green focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-hopeful-teal text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-hopeful-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
            </div>
        </form>
    )
}
