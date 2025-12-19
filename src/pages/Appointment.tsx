
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { CalendarIcon, Check } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Appointment = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [carInfo, setCarInfo] = useState("");
  const [message, setMessage] = useState("");
  const [preferredContact, setPreferredContact] = useState("phone");

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
    "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const serviceTypes = [
    "Kleine Onderhoudsbeurt",
    "Grote Onderhoudsbeurt",
    "APK Keuring",
    "Reparatie",
    "Bandenwissel",
    "Aircoservice",
    "Remmen",
    "Verlichting",
    "Elektronica",
    "Anders"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast({
        title: "Fout",
        description: "Selecteer een datum voor uw afspraak.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Afspraak aangevraagd",
      description: "Uw afspraak is succesvol aangevraagd. We nemen zo spoedig mogelijk contact met u op.",
    });
    
    // Reset form
    setDate(undefined);
    setTime("");
    setName("");
    setEmail("");
    setPhone("");
    setServiceType("");
    setCarInfo("");
    setMessage("");
    setPreferredContact("phone");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="bg-dealership-primary text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Afspraak Maken</h1>
            <p className="text-lg max-w-3xl">
              Maak eenvoudig een afspraak voor onderhoud, reparatie of een andere service. Vul het onderstaande formulier in en wij nemen zo snel mogelijk contact met u op.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Afspraak Aanvragen</CardTitle>
                  <CardDescription>
                    Vul het formulier in om een afspraak aan te vragen voor uw auto.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">1. Kies een datum en tijd</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="date">Datum</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                                id="date"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? (
                                  format(date, "EEEE d MMMM yyyy", { locale: nl })
                                ) : (
                                  <span>Kies een datum</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                locale={nl}
                                disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  return (
                                    date < today ||
                                    date.getDay() === 0 ||
                                    date.getDay() === 6
                                  );
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time">Tijd</Label>
                          <Select value={time} onValueChange={setTime} required>
                            <SelectTrigger id="time">
                              <SelectValue placeholder="Selecteer een tijd" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((slot) => (
                                <SelectItem key={slot} value={slot}>
                                  {slot}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">2. Persoonlijke gegevens</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Naam</Label>
                          <Input
                            id="name"
                            placeholder="Uw volledige naam"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">E-mailadres</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="您的邮箱@163.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefoonnummer</Label>
                          <Input
                            id="phone"
                            placeholder="Uw telefoonnummer"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-preference">Contactvoorkeur</Label>
                          <RadioGroup
                            value={preferredContact}
                            onValueChange={setPreferredContact}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="phone" id="phone-contact" />
                              <Label htmlFor="phone-contact" className="font-normal">Telefoon</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="email" id="email-contact" />
                              <Label htmlFor="email-contact" className="font-normal">E-mail</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">3. Service details</h3>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="service-type">Type service</Label>
                          <Select value={serviceType} onValueChange={setServiceType} required>
                            <SelectTrigger id="service-type">
                              <SelectValue placeholder="Selecteer type service" />
                            </SelectTrigger>
                            <SelectContent>
                              {serviceTypes.map((service) => (
                                <SelectItem key={service} value={service}>
                                  {service}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="car-info">Auto informatie</Label>
                          <Input
                            id="car-info"
                            placeholder="Merk, model, bouwjaar, kenteken"
                            value={carInfo}
                            onChange={(e) => setCarInfo(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Toelichting (optioneel)</Label>
                          <Textarea
                            id="message"
                            placeholder="Beschrijf hier uw vraag of probleem"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-dealership-accent hover:bg-red-700"
                    >
                      Afspraak Aanvragen
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Appointment;
