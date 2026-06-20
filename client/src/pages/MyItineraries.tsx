import { useAuth } from "@/_core/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { MapPin, Calendar, Plus, MoreVertical, Trash2, Share2, Eye, Globe, Lock, Compass } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function MyItineraries() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data, isLoading, refetch } = trpc.itinerary.myItineraries.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const deleteMutation = trpc.itinerary.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Itinerary deleted");
    },
  });

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Sign in to view your trips</h2>
            <a href={getLoginUrl()}>
              <Button>Sign In</Button>
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
              <p className="text-muted-foreground mt-1">
                Manage and edit your travel itineraries.
              </p>
            </div>
            <Link href="/itinerary/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Trip
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((itinerary) => (
                <Card
                  key={itinerary.id}
                  className="overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 relative"
                >
                  <Link href={`/itinerary/${itinerary.id}`}>
                    <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center relative">
                      <Compass className="w-12 h-12 text-primary/20 group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant={itinerary.status === "completed" ? "default" : "secondary"} className="capitalize text-xs">
                          {itinerary.status}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        {itinerary.isPublic ? (
                          <Globe className="w-4 h-4 text-primary" />
                        ) : (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <CardContent className="p-5 space-y-2">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {itinerary.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{itinerary.destination}</span>
                        {itinerary.duration && (
                          <>
                            <span className="text-border">•</span>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{itinerary.duration} days</span>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Link>

                  <div className="absolute bottom-4 right-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            if (itinerary.shareToken) {
                              navigator.clipboard.writeText(`${window.location.origin}/shared/${itinerary.shareToken}`);
                              toast.success("Share link copied!");
                            }
                          }}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Copy Share Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this itinerary?")) {
                              deleteMutation.mutate({ id: itinerary.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Compass className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No trips yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Create your first itinerary to get started.</p>
              <Link href="/itinerary/new">
                <Button className="mt-6 gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Trip
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
