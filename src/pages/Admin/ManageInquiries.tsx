
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Mail, Phone, User, Calendar, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminNav from '@/components/Admin/AdminNav';

// Define the inquiry type to include all necessary properties
interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: string;
  reply?: string; // Optional because not all inquiries have replies
  archived?: boolean; // Optional flag to mark inquiries as archived
}

// Mock data for inquiries with the proper type
const mockInquiries: Inquiry[] = [
  {
    id: "1",
    name: "Hans Vermeer",
    email: "xxxxx@163.com",
    phone: "06-11223344",
    subject: "Vraag over BMW 3 Serie",
    message: "Goedendag, ik heb interesse in de BMW 3 Serie die op uw website staat. Is deze nog beschikbaar en kan ik deze komen bekijken? Ook ben ik benieuwd naar de mogelijkheden voor financiering. Met vriendelijke groet, Hans Vermeer",
    date: "2025-03-24",
    status: "Nieuw",
    archived: false
  },
  {
    id: "2",
    name: "Lisa de Jong",
    email: "xxxxx@163.com",
    phone: "06-22334455",
    subject: "APK en onderhoudsbeurt",
    message: "Beste AutoGarage, ik zou graag mijn Volkswagen Golf willen laten keuren voor de APK. Daarnaast is het tijd voor een grote onderhoudsbeurt. Wanneer kan ik hiervoor langskomen? Alvast bedankt, Lisa de Jong",
    date: "2025-03-23",
    status: "In behandeling",
    archived: false
  },
  {
    id: "3",
    name: "Mohammed El Amrani",
    email: "xxxxx@163.com",
    phone: "06-33445566",
    subject: "Offerte reparatie",
    message: "Hallo, ik heb een probleem met mijn Audi A4. Er zit een raar geluid in de motor en het waarschuwingslampje brandt soms. Kunnen jullie mij een offerte sturen voor een diagnose en eventuele reparatie? Groeten, Mohammed",
    date: "2025-03-22",
    status: "Beantwoord",
    reply: "Beste Mohammed, bedankt voor uw bericht. Wij kunnen uw auto onderzoeken. Kunt u langskomen op maandag tussen 9:00 en 17:00? Dan maken we een diagnose en sturen we u een offerte. Met vriendelijke groet, Team AutoGarage",
    archived: false
  },
  {
    id: "4",
    name: "Sarah Bakker",
    email: "xxxxx@163.com",
    phone: "06-44556677",
    subject: "Interesse in inruil",
    message: "Goedemiddag, ik rij momenteel in een Volvo V40 uit 2016 en ik heb interesse in een nieuwe auto. Kunnen jullie aangeven wat mijn auto ongeveer waard is bij inruil? Ik ben vooral geïnteresseerd in een gezinsauto zoals een SUV. Met vriendelijke groet, Sarah Bakker",
    date: "2025-03-21",
    status: "Nieuw",
    archived: false
  },
  {
    id: "5",
    name: "Pieter van der Meer",
    email: "xxxxx@163.com",
    phone: "06-55667788",
    subject: "Klacht over reparatie",
    message: "Beste, vorige week heb ik mijn auto bij jullie laten repareren vanwege problemen met de remmen. Helaas heb ik gemerkt dat het probleem nog steeds bestaat. Ik wil graag zo snel mogelijk langs komen om dit te bespreken. Vriendelijke groet, Pieter van der Meer",
    date: "2025-03-20",
    status: "Urgent",
    archived: false
  }
];

const ManageInquiries = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [inquiries, setInquiries] = useState<Inquiry[]>(mockInquiries);

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
    
    // Load inquiries from localStorage if available
    const savedInquiries = localStorage.getItem('inquiries');
    if (savedInquiries) {
      setInquiries(JSON.parse(savedInquiries));
    } else {
      // Initialize localStorage with mock data if not already present
      localStorage.setItem('inquiries', JSON.stringify(mockInquiries));
    }
  }, [navigate, toast]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Nieuw":
        return <Badge className="bg-blue-500">Nieuw</Badge>;
      case "In behandeling":
        return <Badge className="bg-yellow-500">In behandeling</Badge>;
      case "Beantwoord":
        return <Badge className="bg-green-500">Beantwoord</Badge>;
      case "Urgent":
        return <Badge className="bg-red-500">Urgent</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleReply = () => {
    if (!selectedInquiry) return;
    
    if (!replyMessage.trim()) {
      toast({
        title: "Fout",
        description: "Voer een antwoord in",
        variant: "destructive",
      });
      return;
    }
    
    // Update the inquiry status to "Beantwoord"
    const updatedInquiries = inquiries.map(inquiry => {
      if (inquiry.id === selectedInquiry.id) {
        return { ...inquiry, status: "Beantwoord", reply: replyMessage };
      }
      return inquiry;
    });
    
    setInquiries(updatedInquiries);
    localStorage.setItem('inquiries', JSON.stringify(updatedInquiries));
    
    toast({
      title: "Antwoord verzonden",
      description: `Uw antwoord is verzonden naar ${selectedInquiry.name}.`,
    });
    
    // Reset the form
    setReplyMessage("");
    setSelectedInquiry(null);
  };

  const handleArchive = (inquiryId: string) => {
    const updatedInquiries = inquiries.map(inquiry => {
      if (inquiry.id === inquiryId) {
        return { ...inquiry, archived: true };
      }
      return inquiry;
    });
    
    setInquiries(updatedInquiries);
    localStorage.setItem('inquiries', JSON.stringify(updatedInquiries));
    
    toast({
      title: "Aanvraag gearchiveerd",
      description: "De aanvraag is succesvol gearchiveerd.",
    });
    
    // Close dialog
    setSelectedInquiry(null);
  };

  const handleMarkAsUrgent = (inquiryId: string) => {
    const updatedInquiries = inquiries.map(inquiry => {
      if (inquiry.id === inquiryId) {
        return { ...inquiry, status: "Urgent" };
      }
      return inquiry;
    });
    
    setInquiries(updatedInquiries);
    localStorage.setItem('inquiries', JSON.stringify(updatedInquiries));
    
    toast({
      title: "Gemarkeerd als urgent",
      description: "De aanvraag is gemarkeerd als urgent.",
    });
  };

  const handleContact = (inquiry: Inquiry, method: 'email' | 'phone') => {
    if (method === 'email') {
      // In a real app, you might open the user's email client
      window.location.href = `mailto:${inquiry.email}?subject=RE: ${inquiry.subject}`;
      toast({
        title: "E-mail voorbereid",
        description: `E-mail naar ${inquiry.email} wordt voorbereid.`,
      });
    } else {
      toast({
        title: "Telefooncontact",
        description: `U kunt ${inquiry.name} bellen op ${inquiry.phone}.`,
      });
    }
  };

  // Filter out archived inquiries
  const visibleInquiries = inquiries.filter(inquiry => !inquiry.archived);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <section className="bg-dealership-primary text-white py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold">Aanvragen Beheren</h1>
            <p>Bekijk en beantwoord inkomende aanvragen</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <AdminNav />
            
            <div className="flex-1">
              <Card>
                <CardHeader>
                  <CardTitle>Aanvragen</CardTitle>
                  <CardDescription>
                    Overzicht van alle inkomende aanvragen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Afzender</TableHead>
                        <TableHead className="hidden md:table-cell">Onderwerp</TableHead>
                        <TableHead className="hidden md:table-cell">Datum</TableHead>
                        <TableHead className="text-right">Acties</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleInquiries.map((inquiry) => (
                        <TableRow key={inquiry.id}>
                          <TableCell>
                            {getStatusBadge(inquiry.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="h-6 w-6 rounded-full bg-gray-100 p-1 mr-2" />
                              <div>
                                <div className="font-medium">{inquiry.name}</div>
                                <div className="text-xs text-gray-500 hidden md:block">{inquiry.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="max-w-xs truncate">{inquiry.subject}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatDate(inquiry.date)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedInquiry(inquiry)}
                                >
                                  Details
                                </Button>
                              </DialogTrigger>
                              {selectedInquiry && (
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Aanvraagdetails</DialogTitle>
                                    <DialogDescription>
                                      {selectedInquiry.subject}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center">
                                        <User className="h-6 w-6 rounded-full bg-gray-100 p-1 mr-2" />
                                        <div>
                                          <div className="font-medium">{selectedInquiry.name}</div>
                                          <div className="text-sm text-gray-500">{selectedInquiry.email} | {selectedInquiry.phone}</div>
                                        </div>
                                      </div>
                                      <div>
                                        {getStatusBadge(selectedInquiry.status)}
                                        <p className="text-xs text-gray-500 mt-1">
                                          {formatDate(selectedInquiry.date)}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="p-4 border rounded-md bg-gray-50">
                                      <p className="whitespace-pre-line">{selectedInquiry.message}</p>
                                    </div>
                                    
                                    {selectedInquiry.reply && (
                                      <div className="p-4 border rounded-md bg-blue-50">
                                        <h4 className="font-medium mb-1">Uw eerder verzonden antwoord:</h4>
                                        <p className="whitespace-pre-line">{selectedInquiry.reply}</p>
                                      </div>
                                    )}
                                    
                                    <div>
                                      <h3 className="text-lg font-medium mb-2">Antwoord</h3>
                                      <Textarea
                                        placeholder="Typ hier uw antwoord..."
                                        rows={5}
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
                                    <div className="flex flex-wrap gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleContact(selectedInquiry, 'email')}
                                      >
                                        <Mail className="mr-2 h-4 w-4" />
                                        E-mail
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleContact(selectedInquiry, 'phone')}
                                      >
                                        <Phone className="mr-2 h-4 w-4" />
                                        Bellen
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleArchive(selectedInquiry.id)}
                                      >
                                        Archiveren
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-600 hover:bg-red-50"
                                        onClick={() => handleMarkAsUrgent(selectedInquiry.id)}
                                      >
                                        Als urgent markeren
                                      </Button>
                                    </div>
                                    <div className="flex gap-2">
                                      <DialogClose asChild>
                                        <Button variant="outline" size="sm">Annuleren</Button>
                                      </DialogClose>
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="bg-dealership-primary hover:bg-blue-900"
                                        onClick={handleReply}
                                      >
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Antwoord verzenden
                                      </Button>
                                    </div>
                                  </DialogFooter>
                                </DialogContent>
                              )}
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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

export default ManageInquiries;
