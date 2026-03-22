"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ShoppingCart, X, Plus, Minus, Calendar, Clock, User, PawPrint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import Checkout from "@/components/checkout"
import {
  ServiceProduct,
  SERVICES,
  getMainServices,
  getAddOns,
  formatPrice,
} from "@/lib/products"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface CartItem {
  service: ServiceProduct
  quantity: number
}

interface BookingDetails {
  customerName: string
  petName: string
  email: string
  phone: string
  date: Date | null
  time: string
  notes: string
}

type BookingStep = "services" | "details" | "checkout"

const TIME_SLOTS = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
]

const CATEGORIES = [
  { value: "all", label: "All Services" },
  { value: "pet-day-care", label: "Day Care" },
  { value: "pet-boarding", label: "Boarding" },
  { value: "grooming", label: "Grooming" },
  { value: "teeth-cleaning", label: "Teeth Cleaning" },
]

export function BookingPage() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  
  const [step, setStep] = useState<BookingStep>("services")
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all")
  const [cart, setCart] = useState<CartItem[]>([])
  const [addOns, setAddOns] = useState<CartItem[]>([])
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    customerName: "",
    petName: "",
    email: "",
    phone: "",
    date: null,
    time: "",
    notes: "",
  })
  const [mobileCartOpen, setMobileCartOpen] = useState(false)

  const mainServices = getMainServices()
  const addOnServices = getAddOns()

  const filteredServices = selectedCategory === "all"
    ? mainServices
    : mainServices.filter(s => s.category === selectedCategory)

  const cartTotal = cart.reduce((sum, item) => sum + (item.service.priceInCents * item.quantity), 0)
  const addOnsTotal = addOns.reduce((sum, item) => sum + (item.service.priceInCents * item.quantity), 0)
  const totalPrice = cartTotal + addOnsTotal
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0) + addOns.reduce((sum, item) => sum + item.quantity, 0)

  const toggleService = (service: ServiceProduct) => {
    const existing = cart.find(item => item.service.id === service.id)
    if (existing) {
      setCart(cart.filter(item => item.service.id !== service.id))
    } else {
      setCart([...cart, { service, quantity: 1 }])
    }
  }

  const toggleAddOn = (service: ServiceProduct) => {
    const existing = addOns.find(item => item.service.id === service.id)
    if (existing) {
      setAddOns(addOns.filter(item => item.service.id !== service.id))
    } else {
      setAddOns([...addOns, { service, quantity: 1 }])
    }
  }

  const updateQuantity = (serviceId: string, delta: number, isAddOn: boolean) => {
    if (isAddOn) {
      setAddOns(addOns.map(item => {
        if (item.service.id === serviceId) {
          const newQty = Math.max(1, item.quantity + delta)
          return { ...item, quantity: newQty }
        }
        return item
      }))
    } else {
      setCart(cart.map(item => {
        if (item.service.id === serviceId) {
          const newQty = Math.max(1, item.quantity + delta)
          return { ...item, quantity: newQty }
        }
        return item
      }))
    }
  }

  const removeItem = (serviceId: string, isAddOn: boolean) => {
    if (isAddOn) {
      setAddOns(addOns.filter(item => item.service.id !== serviceId))
    } else {
      setCart(cart.filter(item => item.service.id !== serviceId))
    }
  }

  const isServiceSelected = (serviceId: string) => cart.some(item => item.service.id === serviceId)
  const isAddOnSelected = (serviceId: string) => addOns.some(item => item.service.id === serviceId)

  const canProceedToDetails = cart.length > 0
  const canProceedToCheckout = 
    bookingDetails.customerName && 
    bookingDetails.petName && 
    bookingDetails.email && 
    bookingDetails.date && 
    bookingDetails.time

  const allProductIds = [...cart.map(c => c.service.id), ...addOns.map(a => a.service.id)].join(",")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="size-5" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
          </div>
          <h1 className="font-serif text-xl sm:text-2xl font-semibold text-foreground">Book Appointment</h1>
          
          {/* Mobile Cart Button */}
          <Sheet open={mobileCartOpen} onOpenChange={setMobileCartOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden relative">
                <ShoppingCart className="size-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 size-5 p-0 flex items-center justify-center text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Your Cart</SheetTitle>
              </SheetHeader>
              <CartSummary 
                cart={cart}
                addOns={addOns}
                cartTotal={cartTotal}
                addOnsTotal={addOnsTotal}
                totalPrice={totalPrice}
                onRemove={removeItem}
                onUpdateQuantity={updateQuantity}
              />
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Step Indicator */}
        <div className="container mx-auto px-4 pb-4">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <StepIndicator step={1} label="Select Services" active={step === "services"} completed={step !== "services"} />
            <div className="w-8 sm:w-12 h-px bg-border" />
            <StepIndicator step={2} label="Details" active={step === "details"} completed={step === "checkout"} />
            <div className="w-8 sm:w-12 h-px bg-border" />
            <StepIndicator step={3} label="Checkout" active={step === "checkout"} completed={false} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {step === "services" && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Services Selection */}
            <div className="flex-1">
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORIES.map(category => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>

              {/* Services List */}
              <div className="space-y-3 mb-8">
                <h2 className="font-serif text-lg font-medium text-foreground mb-4">Services</h2>
                {filteredServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    selected={isServiceSelected(service.id)}
                    onToggle={() => toggleService(service)}
                  />
                ))}
              </div>

              {/* Add-Ons Section */}
              <div className="space-y-3">
                <h2 className="font-serif text-lg font-medium text-foreground mb-4">Add-Ons</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Enhance your pet&apos;s grooming experience with these extras
                </p>
                {addOnServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    selected={isAddOnSelected(service.id)}
                    onToggle={() => toggleAddOn(service)}
                    isAddOn
                  />
                ))}
              </div>

              {/* Continue Button (Mobile) */}
              <div className="lg:hidden mt-8">
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={!canProceedToDetails}
                  onClick={() => setStep("details")}
                >
                  Continue to Details ({formatPrice(totalPrice)})
                </Button>
              </div>
            </div>

            {/* Desktop Cart Sidebar */}
            <aside className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-36 bg-card rounded-xl border border-border p-6">
                <h2 className="font-serif text-lg font-medium text-foreground mb-4">Your Cart</h2>
                <CartSummary 
                  cart={cart}
                  addOns={addOns}
                  cartTotal={cartTotal}
                  addOnsTotal={addOnsTotal}
                  totalPrice={totalPrice}
                  onRemove={removeItem}
                  onUpdateQuantity={updateQuantity}
                />
                <Button 
                  className="w-full mt-4" 
                  size="lg"
                  disabled={!canProceedToDetails}
                  onClick={() => setStep("details")}
                >
                  Continue to Details
                </Button>
              </div>
            </aside>
          </div>
        )}

        {step === "details" && (
          <div className="max-w-2xl mx-auto">
            <Button 
              variant="ghost" 
              className="mb-6"
              onClick={() => setStep("services")}
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to Services
            </Button>

            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-6">Booking Details</h2>
              
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Your Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="customerName"
                        placeholder="John Smith"
                        className="pl-10"
                        value={bookingDetails.customerName}
                        onChange={(e) => setBookingDetails({ ...bookingDetails, customerName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="petName">Pet&apos;s Name</Label>
                    <div className="relative">
                      <PawPrint className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="petName"
                        placeholder="Buddy"
                        className="pl-10"
                        value={bookingDetails.petName}
                        onChange={(e) => setBookingDetails({ ...bookingDetails, petName: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={bookingDetails.email}
                      onChange={(e) => setBookingDetails({ ...bookingDetails, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={bookingDetails.phone}
                      onChange={(e) => setBookingDetails({ ...bookingDetails, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Preferred Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !bookingDetails.date && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 size-4" />
                          {bookingDetails.date ? format(bookingDetails.date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={bookingDetails.date ?? undefined}
                          onSelect={(date) => setBookingDetails({ ...bookingDetails, date: date ?? null })}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Time</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !bookingDetails.time && "text-muted-foreground"
                          )}
                        >
                          <Clock className="mr-2 size-4" />
                          {bookingDetails.time || "Select time"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2" align="start">
                        <div className="grid grid-cols-2 gap-1 max-h-60 overflow-y-auto">
                          {TIME_SLOTS.map(time => (
                            <Button
                              key={time}
                              variant={bookingDetails.time === time ? "default" : "ghost"}
                              size="sm"
                              className="text-xs"
                              onClick={() => setBookingDetails({ ...bookingDetails, time })}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements, allergies, or requests..."
                    value={bookingDetails.notes}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Summary */}
                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <h3 className="font-medium text-foreground">Order Summary</h3>
                  {cart.map(item => (
                    <div key={item.service.id} className="flex justify-between text-sm">
                      <span>{item.service.name} {item.quantity > 1 && `x${item.quantity}`}</span>
                      <span>{formatPrice(item.service.priceInCents * item.quantity)}</span>
                    </div>
                  ))}
                  {addOns.map(item => (
                    <div key={item.service.id} className="flex justify-between text-sm text-muted-foreground">
                      <span>+ {item.service.name} {item.quantity > 1 && `x${item.quantity}`}</span>
                      <span>{formatPrice(item.service.priceInCents * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={!canProceedToCheckout}
                  onClick={() => setStep("checkout")}
                >
                  Proceed to Payment
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === "checkout" && (
          <div className="max-w-2xl mx-auto">
            <Button 
              variant="ghost" 
              className="mb-6"
              onClick={() => setStep("details")}
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to Details
            </Button>

            <div className="bg-card rounded-xl border border-border p-6 mb-6">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Complete Your Booking</h2>
              
              {/* Booking Summary */}
              <div className="bg-secondary/50 rounded-lg p-4 mb-6 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-primary" />
                  <span>{bookingDetails.date ? format(bookingDetails.date, "EEEE, MMMM d, yyyy") : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-primary" />
                  <span>{bookingDetails.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <PawPrint className="size-4 text-primary" />
                  <span>{bookingDetails.petName} ({bookingDetails.customerName})</span>
                </div>
              </div>

              {/* Services */}
              <div className="space-y-2 mb-4">
                {cart.map(item => (
                  <div key={item.service.id} className="flex justify-between text-sm">
                    <span>{item.service.name} {item.quantity > 1 && `x${item.quantity}`}</span>
                    <span className="font-medium">{formatPrice(item.service.priceInCents * item.quantity)}</span>
                  </div>
                ))}
                {addOns.map(item => (
                  <div key={item.service.id} className="flex justify-between text-sm text-muted-foreground">
                    <span>+ {item.service.name} {item.quantity > 1 && `x${item.quantity}`}</span>
                    <span>{formatPrice(item.service.priceInCents * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Stripe Checkout */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Checkout productId={allProductIds} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function StepIndicator({ step, label, active, completed }: { step: number; label: string; active: boolean; completed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "size-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
        active && "bg-primary text-primary-foreground",
        completed && "bg-primary/20 text-primary",
        !active && !completed && "bg-muted text-muted-foreground"
      )}>
        {step}
      </div>
      <span className={cn(
        "hidden sm:inline text-sm",
        active && "font-medium text-foreground",
        !active && "text-muted-foreground"
      )}>
        {label}
      </span>
    </div>
  )
}

function ServiceCard({ service, selected, onToggle, isAddOn = false }: { 
  service: ServiceProduct; 
  selected: boolean; 
  onToggle: () => void;
  isAddOn?: boolean;
}) {
  return (
    <div 
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer",
        selected 
          ? "border-primary bg-primary/5" 
          : "border-border bg-card hover:border-primary/50",
        isAddOn && "bg-secondary/30"
      )}
      onClick={onToggle}
    >
      <Checkbox checked={selected} onCheckedChange={onToggle} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground truncate">{service.name}</h3>
          {isAddOn && (
            <Badge variant="secondary" className="text-xs shrink-0">Add-on</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{service.description}</p>
      </div>
      <span className="font-semibold text-foreground shrink-0">{formatPrice(service.priceInCents)}</span>
    </div>
  )
}

function CartSummary({ 
  cart, 
  addOns, 
  cartTotal, 
  addOnsTotal, 
  totalPrice,
  onRemove,
  onUpdateQuantity,
}: { 
  cart: CartItem[]
  addOns: CartItem[]
  cartTotal: number
  addOnsTotal: number
  totalPrice: number
  onRemove: (id: string, isAddOn: boolean) => void
  onUpdateQuantity: (id: string, delta: number, isAddOn: boolean) => void
}) {
  if (cart.length === 0 && addOns.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ShoppingCart className="size-10 mx-auto mb-2 opacity-50" />
        <p>Your cart is empty</p>
        <p className="text-sm">Select services to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Services */}
      {cart.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Services</h3>
          {cart.map(item => (
            <CartItemRow 
              key={item.service.id} 
              item={item} 
              onRemove={() => onRemove(item.service.id, false)}
              onUpdateQuantity={(delta) => onUpdateQuantity(item.service.id, delta, false)}
            />
          ))}
        </div>
      )}

      {/* Add-Ons */}
      {addOns.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Add-Ons</h3>
          {addOns.map(item => (
            <CartItemRow 
              key={item.service.id} 
              item={item} 
              onRemove={() => onRemove(item.service.id, true)}
              onUpdateQuantity={(delta) => onUpdateQuantity(item.service.id, delta, true)}
              isAddOn
            />
          ))}
        </div>
      )}

      {/* Totals */}
      <div className="border-t border-border pt-4 space-y-1">
        {cart.length > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Services</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
        )}
        {addOns.length > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Add-Ons</span>
            <span>{formatPrice(addOnsTotal)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-lg pt-2">
          <span>Total</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
      </div>
    </div>
  )
}

function CartItemRow({ item, onRemove, onUpdateQuantity, isAddOn = false }: { 
  item: CartItem
  onRemove: () => void
  onUpdateQuantity: (delta: number) => void
  isAddOn?: boolean
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex-1 min-w-0">
        <p className={cn("truncate", isAddOn && "text-muted-foreground")}>{item.service.name}</p>
      </div>
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="size-6"
          onClick={(e) => { e.stopPropagation(); onUpdateQuantity(-1) }}
        >
          <Minus className="size-3" />
        </Button>
        <span className="w-6 text-center">{item.quantity}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="size-6"
          onClick={(e) => { e.stopPropagation(); onUpdateQuantity(1) }}
        >
          <Plus className="size-3" />
        </Button>
      </div>
      <span className="w-16 text-right font-medium">
        {formatPrice(item.service.priceInCents * item.quantity)}
      </span>
      <Button 
        variant="ghost" 
        size="icon" 
        className="size-6 text-muted-foreground hover:text-destructive"
        onClick={(e) => { e.stopPropagation(); onRemove() }}
      >
        <X className="size-3" />
      </Button>
    </div>
  )
}
