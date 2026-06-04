'use client'

import { useState } from 'react'
import { ZipValidator } from './ZipValidator'
import { ContactStep } from './ContactStep'
import { ServiceStep } from './ServiceStep'
import { SuccessStep } from './SuccessStep'

type FormStep = 'zip' | 'contact' | 'service' | 'success'

interface FormData {
    zipCode: string
    location: string
    name: string
    email: string
    phone: string
    address: string
    serviceType: string
    propertySize: string
    description: string
    photos: File[]
}

export function QuoteForm() {
    const [currentStep, setCurrentStep] = useState<FormStep>('zip')
    const [formData, setFormData] = useState<Partial<FormData>>({
        photos: [],
    })

    const updateFormData = (data: Partial<FormData>) => {
        setFormData((prev) => ({ ...prev, ...data }))
    }

    const goToStep = (step: FormStep) => {
        setCurrentStep(step)
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
            {/* Progress Indicator */}
            {currentStep !== 'success' && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-600">
                            {currentStep === 'zip' && 'Step 1 of 3: Service Area'}
                            {currentStep === 'contact' && 'Step 2 of 3: Your Information'}
                            {currentStep === 'service' && 'Step 3 of 3: Project Details'}
                        </span>
                        <span className="text-sm text-gray-500">
                            {currentStep === 'zip' && '33%'}
                            {currentStep === 'contact' && '66%'}
                            {currentStep === 'service' && '100%'}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-forest-green h-2 rounded-full transition-all duration-300"
                            style={{
                                width:
                                    currentStep === 'zip'
                                        ? '33%'
                                        : currentStep === 'contact'
                                            ? '66%'
                                            : '100%',
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Step Components */}
            {currentStep === 'zip' && (
                <ZipValidator
                    onValidZip={(zipCode, location) => {
                        updateFormData({ zipCode, location })
                        goToStep('contact')
                    }}
                />
            )}

            {currentStep === 'contact' && (
                <ContactStep
                    initialData={{
                        name: formData.name || '',
                        email: formData.email || '',
                        phone: formData.phone || '',
                        address: formData.address || '',
                    }}
                    onBack={() => goToStep('zip')}
                    onNext={(data) => {
                        updateFormData(data)
                        goToStep('service')
                    }}
                />
            )}

            {currentStep === 'service' && (
                <ServiceStep
                    initialData={{
                        serviceType: formData.serviceType || '',
                        propertySize: formData.propertySize || '',
                        description: formData.description || '',
                        photos: formData.photos || [],
                    }}
                    fullFormData={formData as FormData}
                    onBack={() => goToStep('contact')}
                    onSuccess={() => goToStep('success')}
                />
            )}

            {currentStep === 'success' && <SuccessStep />}
        </div>
    )
}
