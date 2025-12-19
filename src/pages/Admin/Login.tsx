
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Base account for demo purposes
    // In a real application, this would be replaced with actual authentication
    if ((username === 'admin' && password === 'password') || 
        (username === 'demo' && password === 'demo123')) {
      toast({
        title: "Ingelogd",
        description: "U bent succesvol ingelogd.",
      });
      // Store login state
      localStorage.setItem('isLoggedIn', 'true');
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } else {
      toast({
        title: "Login mislukt",
        description: "Ongeldige inloggegevens. Probeer opnieuw.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="bg-dealership-primary text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Beheeromgeving Login</h1>
            <p className="text-lg max-w-3xl">
              Log in om toegang te krijgen tot de beheeromgeving.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>
                  Voer uw inloggegevens in om toegang te krijgen tot het dashboard.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Gebruikersnaam</Label>
                    <Input 
                      id="username" 
                      type="text" 
                      placeholder="Gebruikersnaam" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Wachtwoord</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Wachtwoord" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-gray-500">
                      <strong>Demo Account:</strong> gebruikersnaam: demo, wachtwoord: demo123
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-dealership-primary hover:bg-blue-900"
                    disabled={loading}
                  >
                    {loading ? "Bezig met inloggen..." : "Inloggen"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
