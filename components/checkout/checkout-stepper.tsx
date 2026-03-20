"use client"

import { cn } from "@/lib/utils"
import { Check, type LucideIcon } from "lucide-react"

interface Step {
  id: number
  title: string
  icon: LucideIcon
}

interface CheckoutStepperProps {
  steps: Step[]
  currentStep: number
}

export function CheckoutStepper({ steps, currentStep }: CheckoutStepperProps) {
  return (
    <div className="w-full">
      {/* Desktop stepper */}
      <div className="hidden md:flex items-center justify-center">
        {steps.map((step, index) => {
          const StepIcon = step.icon
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id
          
          return (
            <div key={step.id} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "border-primary bg-primary/10 text-primary",
                    !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground/50"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-sm font-medium transition-colors",
                    isCurrent && "text-primary",
                    isCompleted && "text-foreground",
                    !isCompleted && !isCurrent && "text-muted-foreground/50"
                  )}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-24 h-0.5 mx-4 transition-colors duration-300",
                    currentStep > step.id ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Etapa {currentStep} de {steps.length}
          </span>
          <span className="text-sm font-medium text-primary">
            {steps[currentStep - 1]?.title}
          </span>
        </div>
        <div className="flex gap-1">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                currentStep >= step.id ? "bg-primary" : "bg-muted-foreground/20"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
