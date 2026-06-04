interface ServiceProcessProps {
  steps: {
    number: string
    title: string
    description: string
  }[]
}

export function ServiceProcess({ steps }: ServiceProcessProps) {
  return (
    <section className="section section-alt">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-h2 font-heading text-forest-green mb-4">
            Our Process
          </h2>
          <p className="text-lg text-gray-600">
            Here's exactly what you can expect when you work with us:
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forest-green text-white font-heading font-bold text-2xl">
                  {step.number}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-heading font-bold text-forest-green mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
