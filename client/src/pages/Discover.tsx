import { Navbar } from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { MapPin, Calendar, Heart, Eye, User, Compass, Search, X } from "lucide-react";
import { useState, useMemo } from "react";

export default function Discover() {
  const [destination, setDestination] = useState("");
  const [travelStyle, setTravelStyle] = useState("all");
  const [durationRange, setDurationRange] = useState("any");
  const [searchInput, setSearchInput] = useState("");

  const filters = useMemo(() => ({
    limit: 30,
    offset: 0,
    destination: destination || undefined,
    travelStyle: travelStyle !== "all" ? travelStyle : undefined,
    minDuration: durationRange === "short" ? 1 : durationRange === "medium" ? 5 : durationRange === "long" ? 10 : undefined,
    maxDuration: durationRange === "short" ? 4 : durationRange === "medium" ? 9 : durationRange === "long" ? undefined : undefined,
  }), [destination, travelStyle, durationRange]);

  const { data, isLoading } = trpc.itinerary.discover.useQuery(filters);

  const handleSearch = () => {
    setDestination(searchInput);
  };

  const clearFilters = () => {
    setDestination("");
    setSearchInput("");
    setTravelStyle("all");
    setDurationRange("any");
  };

  const hasFilters = destination || travelStyle !== "all" || durationRange !== "any";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Discover Itineraries</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Browse community-shared trips for inspiration and ideas.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 p-5 rounded-xl border border-border/50 bg-card/50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  placeholder="Search by destination (e.g., Sicily, Japan, Alaska...)"
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch} className="gap-1.5">
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={travelStyle} onValueChange={setTravelStyle}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Travel Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Styles</SelectItem>
                  <SelectItem value="solo">Solo</SelectItem>
                  <SelectItem value="couple">Couple</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="backpacker">Backpacker</SelectItem>
                </SelectContent>
              </Select>
              <Select value={durationRange} onValueChange={setDurationRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Duration</SelectItem>
                  <SelectItem value="short">Short (1-4 days)</SelectItem>
                  <SelectItem value="medium">Medium (5-9 days)</SelectItem>
                  <SelectItem value="long">Long (10+ days)</SelectItem>
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                  <X className="w-3.5 h-3.5" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((item) => (
                <Link key={item.itinerary.id} href={`/shared/${item.itinerary.shareToken}`}>
                  <Card className="overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center relative overflow-hidden">
                      <Compass className="w-16 h-16 text-primary/20 group-hover:scale-110 transition-transform duration-500" />
                      {item.itinerary.travelStyle && (
                        <Badge variant="secondary" className="absolute top-3 right-3 capitalize">
                          {item.itinerary.travelStyle}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-5 space-y-3">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {item.itinerary.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{item.itinerary.destination}</span>
                        {item.itinerary.duration && (
                          <>
                            <span className="text-border">•</span>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{item.itinerary.duration} days</span>
                          </>
                        )}
                      </div>
                      {item.itinerary.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.itinerary.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{item.user?.name || "Traveler"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {item.itinerary.likeCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {item.itinerary.viewCount || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Compass className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                {hasFilters ? "No itineraries match your filters" : "No itineraries shared yet"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {hasFilters ? "Try adjusting your search criteria." : "Be the first to share your travel plans!"}
              </p>
              {hasFilters ? (
                <Button variant="outline" className="mt-6" onClick={clearFilters}>Clear Filters</Button>
              ) : (
                <Link href="/itinerary/new">
                  <Button className="mt-6">Create an Itinerary</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
