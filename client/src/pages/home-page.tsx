import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { serviceCategories } from "@shared/schema";
import { Wrench, Paintbrush, Utensils, Sprout, LogOut } from "lucide-react";

const serviceIcons: Record<string, React.ReactNode> = {
  "Plumbing": <Wrench className="h-8 w-8" />,
  "Painting": <Paintbrush className="h-8 w-8" />,
  "Cooking": <Utensils className="h-8 w-8" />,
  "Gardening": <Sprout className="h-8 w-8" />,
};

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Service Marketplace</h1>
          <div className="flex items-center space-x-4">
            {user?.userType === "worker" && (
              <Link href="/profile">
                <Button variant="outline">My Profile</Button>
              </Link>
            )}
            <Button
              variant="ghost"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Welcome, {user?.name}</h2>
          <p className="text-lg text-muted-foreground mb-8">
            {user?.userType === "customer"
              ? "Find and book services from our trusted professionals."
              : "Manage your service offerings and bookings."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCategories.map((service) => (
              <Link key={service} href="/services">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {serviceIcons[service] || <Wrench className="h-8 w-8" />}
                      <span>{service}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Find skilled professionals for your {service.toLowerCase()} needs
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
