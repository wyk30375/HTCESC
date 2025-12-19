
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminNav from '@/components/Admin/AdminNav';

const HelpPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      toast({
        title: "Toegang geweigerd",
        description: "U moet ingelogd zijn om toegang te krijgen tot deze pagina.",
        variant: "destructive",
      });
      navigate('/admin/login');
    }
  }, [navigate, toast]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <section className="bg-dealership-primary text-white py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold">Hulp & Documentatie</h1>
            <p>Veelgestelde vragen en instructies voor het beheerderspaneel</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <AdminNav />
            
            <div className="flex-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-dealership-primary" />
                    <CardTitle>Veelgestelde Vragen</CardTitle>
                  </div>
                  <CardDescription>
                    Antwoorden op veelvoorkomende vragen over het beheerderspaneel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Hoe voeg ik een nieuwe auto toe?</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-2">Om een nieuwe auto toe te voegen aan de inventaris:</p>
                        <ol className="list-decimal list-inside space-y-2">
                          <li>Ga naar "Auto Toevoegen" in het navigatiemenu</li>
                          <li>Vul alle vereiste velden in met informatie over de auto</li>
                          <li>Upload afbeeldingen van de auto</li>
                          <li>Klik op "Opslaan" om de auto toe te voegen</li>
                        </ol>
                        <p className="mt-2">U kunt ook een kenteken invoeren om automatisch gegevens op te halen via de RDW.</p>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Hoe beheer ik afspraken?</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-2">Voor het beheren van afspraken:</p>
                        <ol className="list-decimal list-inside space-y-2">
                          <li>Ga naar "Afspraken" in het navigatiemenu</li>
                          <li>Bekijk alle geplande afspraken in het overzicht</li>
                          <li>Gebruik de groene vinkje-knop om een afspraak als voltooid te markeren</li>
                          <li>Gebruik de rode kruisje-knop om een afspraak te annuleren</li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Hoe beantwoord ik een aanvraag?</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-2">Voor het beantwoorden van aanvragen:</p>
                        <ol className="list-decimal list-inside space-y-2">
                          <li>Ga naar "Aanvragen" in het navigatiemenu</li>
                          <li>Klik op de berichtknop naast de aanvraag die u wilt beantwoorden</li>
                          <li>Vul uw antwoord in in het dialoogvenster dat verschijnt</li>
                          <li>Klik op "Verzenden" om uw antwoord te versturen</li>
                          <li>De status van de aanvraag wordt automatisch bijgewerkt naar "Beantwoord"</li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-4">
                      <AccordionTrigger>Hoe wijzig ik de status van een auto?</AccordionTrigger>
                      <AccordionContent>
                        <p className="mb-2">Voor het wijzigen van de status van een auto:</p>
                        <ol className="list-decimal list-inside space-y-2">
                          <li>Ga naar "Auto's Beheren" in het navigatiemenu</li>
                          <li>Zoek de auto waarvan u de status wilt wijzigen</li>
                          <li>Klik op de "Bewerken" knop (potlood-icoon)</li>
                          <li>Wijzig de status in het formulier dat verschijnt</li>
                          <li>Klik op "Opslaan" om de wijzigingen op te slaan</li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-5">
                      <AccordionTrigger>Hoe log ik uit van het beheerderspaneel?</AccordionTrigger>
                      <AccordionContent>
                        <p>Om uit te loggen, klik op de "Uitloggen" knop onderaan het navigatiemenu aan de linkerkant. U wordt dan automatisch teruggeleid naar de inlogpagina.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Hulp nodig?</h3>
                    <p className="mb-4">Neem contact op met de systeembeheerder als u verdere hulp nodig heeft met het beheerderspaneel.</p>
                    <Button>Contact Systeembeheerder</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpPage;
