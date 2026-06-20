import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  Compass,
  Map,
  Sparkles,
  Route,
  Share2,
  Globe,
  ArrowRight,
  MapPin,
  Utensils,
  Camera,
  Star,
} from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/30" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

        <div className="container relative py-24 md:py-36">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Travel Planning
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Plan Smarter.
              <br />
              <span className="text-primary">Travel Better.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Build comprehensive travel itineraries with AI-optimized routes, real traveler tips,
              and zero backtracking. Your trips, beautifully organized and effortlessly shared.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {isAuthenticated ? (
                <Link href="/itinerary/new">
                  <Button size="lg" className="gap-2 text-base px-8 h-12">
                    Start Planning
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="gap-2 text-base px-8 h-12">
                    Start Planning — It's Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              )}
              <Link href="/discover">
                <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-12">
                  <Globe className="w-4 h-4" />
                  Explore Itineraries
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything You Need for the Perfect Trip
            </h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
              From planning to sharing, WanderWiki consolidates your entire travel workflow into one elegant platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Tags Section */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Curate Every Moment
            </h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
              Tag and organize your stops by category to ensure you never miss the best experiences.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-2xl border border-border/50 hover:shadow-md transition-all duration-300"
                style={{ backgroundColor: `var(--tag-bg)`, borderColor: `var(--tag-border)` }}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${cat.bgClass}`}
                >
                  <cat.icon className={`w-7 h-7 ${cat.iconClass}`} />
                </div>
                <h3 className="font-semibold text-base">{cat.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary/5">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to Plan Your Next Adventure?
            </h2>
            <p className="text-muted-foreground text-lg">
              Join travelers who plan smarter, share better, and never backtrack.
            </p>
            {isAuthenticated ? (
              <Link href="/itinerary/new">
                <Button size="lg" className="gap-2 text-base px-8 h-12">
                  Create Your First Itinerary
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="gap-2 text-base px-8 h-12">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">WanderWiki</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Plan smarter. Travel better. Share freely.
          </p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Route,
    title: "AI Route Optimizer",
    description:
      "Eliminate backtracking with intelligent route optimization powered by Google Maps. Maximize every minute of your trip.",
  },
  {
    icon: Map,
    title: "Interactive Map View",
    description:
      "See your entire journey plotted on a live map with numbered stops, real travel times, and route visualization.",
  },
  {
    icon: Sparkles,
    title: "AI Travel Assistant",
    description:
      "Get personalized suggestions for hidden gems, must-eat spots, and local tips from an AI trained on real traveler experiences.",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description:
      "Share your itineraries with a single link. Browse community trips for inspiration and discover new destinations.",
  },
  {
    icon: Globe,
    title: "Booking Aggregator",
    description:
      "Surface accommodation and transport options from Agoda, Booking.com, and more — all linked out for easy booking.",
  },
  {
    icon: MapPin,
    title: "Day-by-Day Planning",
    description:
      "Organize stops into days with time slots, travel durations, and daily summaries for a perfectly structured trip.",
  },
];

const categories = [
  {
    icon: Camera,
    title: "Must-See",
    description: "Iconic landmarks & views",
    bgClass: "bg-[oklch(0.9_0.08_260)]",
    iconClass: "text-[oklch(0.45_0.15_260)]",
  },
  {
    icon: Compass,
    title: "Must-Do",
    description: "Experiences & activities",
    bgClass: "bg-[oklch(0.9_0.08_160)]",
    iconClass: "text-[oklch(0.4_0.12_160)]",
  },
  {
    icon: Star,
    title: "Must-Try",
    description: "Unique local experiences",
    bgClass: "bg-[oklch(0.9_0.08_50)]",
    iconClass: "text-[oklch(0.45_0.12_50)]",
  },
  {
    icon: Utensils,
    title: "Must-Eat",
    description: "Food & restaurants",
    bgClass: "bg-[oklch(0.9_0.08_25)]",
    iconClass: "text-[oklch(0.45_0.15_25)]",
  },
];
