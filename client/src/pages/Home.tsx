import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Navbar } from "@/components/Navbar";
import { Link } from "wouter";
import { Plus, MapPin, Calendar, Users, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";

// Sample itineraries to showcase the platform
const SAMPLE_ITINERARIES = [
  {
    id: "sicily",
    title: "Sicily Road Trip Loop",
    destination: "Sicily, Italy",
    duration: 10,
    style: "Solo",
    stops: 24,
    image: "https://images.unsplash.com/photo-1523365280197-f1783db9fe62?w=400&h=250&fit=crop",
  },
  {
    id: "alaska",
    title: "Alaska Highway Adventure",
    destination: "Alaska, USA",
    duration: 14,
    style: "Couple",
    stops: 18,
    image: "https://images.unsplash.com/photo-1531176175280-109b5d3e5e66?w=400&h=250&fit=crop",
  },
  {
    id: "japan",
    title: "Japan Golden Route",
    destination: "Tokyo → Kyoto → Osaka",
    duration: 12,
    style: "Solo",
    stops: 30,
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=250&fit=crop",
  },
  {
    id: "newzealand",
    title: "NZ South Island Loop",
    destination: "New Zealand",
    duration: 10,
    style: "Couple",
    stops: 20,
    image: "https://images.unsplash.com/photo-1469521669194-babb45599def?w=400&h=250&fit=crop",
  },
  {
    id: "portugal",
    title: "Portugal Coastal Drive",
    destination: "Lisbon → Porto",
    duration: 8,
    style: "Family",
    stops: 16,
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=250&fit=crop",
  },
  {
    id: "thailand",
    title: "Thailand Islands & Temples",
    destination: "Bangkok → Chiang Mai → Islands",
    duration: 14,
    style: "Group",
    stops: 22,
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&h=250&fit=crop",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: publicItineraries } = trpc.itinerary.discover.useQuery({ limit: 6, offset: 0 });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero - compact, no scroll needed */}
        <section className="py-12 md:py-16">
          <div className="container max-w-5xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Plan Smarter. Travel Better.
            </h1>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Build AI-optimized itineraries with zero backtracking. Share with friends. Link to bookings.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              {isAuthenticated ? (
                <Link href="/itinerary/new">
                  <Button size="lg" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Itinerary
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Start Planning
                  </Button>
                </a>
              )}
              <Link href="/discover">
                <Button variant="outline" size="lg" className="gap-2">
                  Browse Itineraries
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Sample Itineraries Grid */}
        <section className="pb-16">
          <div className="container max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Popular Itineraries</h2>
                <p className="text-sm text-muted-foreground">Curated trips from the community</p>
              </div>
              <Link href="/discover">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(publicItineraries && publicItineraries.length > 0 ? publicItineraries : SAMPLE_ITINERARIES).map((item: any, idx: number) => (
                <Card key={item.id || idx} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="h-36 bg-muted overflow-hidden">
                    {(item.image || item.coverImageUrl) ? (
                      <img
                        src={item.image || item.coverImageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <MapPin className="w-8 h-8 text-primary/40" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.destination}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-[10px] h-5">
                        <Calendar className="w-2.5 h-2.5 mr-1" />
                        {item.duration} days
                      </Badge>
                      {(item.style || item.travelStyle) && (
                        <Badge variant="outline" className="text-[10px] h-5 capitalize">
                          <Users className="w-2.5 h-2.5 mr-1" />
                          {item.style || item.travelStyle}
                        </Badge>
                      )}
                      {item.stops && (
                        <Badge variant="outline" className="text-[10px] h-5">
                          {item.stops} stops
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Minimal footer */}
      <footer className="border-t py-4">
        <div className="container max-w-6xl flex items-center justify-between text-xs text-muted-foreground">
          <span>WanderWiki</span>
          <span>Plan smarter. Travel better. Share freely.</span>
        </div>
      </footer>
    </div>
  );
}
