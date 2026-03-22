"use client"

import { MapPin, Phone, Mail, Clock, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Us",
    details: ["123 Pet Paradise Lane", "Pawsville, CA 90210"],
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["(555) 123-PAWS", "(555) 123-7297"],
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["hello@all4pawsplaycare.com", "bookings@all4pawsplaycare.com"],
  },
  {
    icon: Clock,
    title: "Opening Hours",
    details: ["Mon-Fri: 8am - 7pm", "Sat-Sun: 9am - 6pm"],
  },
]

export function ContactSection() {
  return (
    <section id="contact" className="py-12 md:py-24 pb-28 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Get in Touch
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Contact Us
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Have questions? We&apos;re here to help! Reach out to us or book your appointment online.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Info Cards */}
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <div key={index} className="bg-card rounded-2xl md:rounded-3xl p-4 md:p-6 border border-border">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm md:text-base mb-1 md:mb-2">{info.title}</h3>
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                      {detail}
                    </p>
                  ))}
                </div>
              )
            })}
          </div>

          {/* Book Appointment CTA */}
          <div id="book" className="bg-card rounded-2xl md:rounded-3xl p-6 md:p-8 border border-border flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Calendar className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </div>
            
            <h3 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-3">
              Ready to Book?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Schedule your pet&apos;s next grooming, daycare, or boarding appointment with our easy online booking system.
            </p>
            
            <div className="space-y-3 w-full max-w-xs">
              <Button asChild size="lg" className="w-full">
                <Link href="/booking">
                  Book Appointment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Select multiple services, add-ons, and pay securely online
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border w-full">
              <p className="text-sm text-muted-foreground mb-2">Prefer to book by phone?</p>
              <a 
                href="tel:+15551237297" 
                className="text-primary font-medium hover:underline flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                (555) 123-PAWS
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
