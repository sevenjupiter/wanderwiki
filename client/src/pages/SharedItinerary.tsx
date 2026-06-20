import { Navbar } from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Calendar, Clock, Car, Camera, Compass, Star, Utensils, Eye, Heart, MessageCircle, User, Send } from "lucide-react";
import { MapView } from "@/components/Map";
import { useRef, useCallback, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

const categoryIcons: Record<string, typeof Camera> = {
  "must-see": Camera,
  "must-do": Compass,
  "must-try": Star,
  "must-eat": Utensils,
};

const categoryColors: Record<string, string> = {
  "must-see": "bg-[oklch(0.93_0.08_260)] text-[oklch(0.4_0.15_260)] border-[oklch(0.85_0.1_260)]",
  "must-do": "bg-[oklch(0.93_0.08_160)] text-[oklch(0.35_0.12_160)] border-[oklch(0.85_0.1_160)]",
  "must-try": "bg-[oklch(0.93_0.08_50)] text-[oklch(0.4_0.12_50)] border-[oklch(0.85_0.1_50)]",
  "must-eat": "bg-[oklch(0.93_0.08_25)] text-[oklch(0.4_0.15_25)] border-[oklch(0.85_0.1_25)]",
};

export default function SharedItinerary() {
  const params = useParams<{ token: string }>();
  const { data, isLoading } = trpc.itinerary.getByShareToken.useQuery(
    { token: params.token || "" },
    { enabled: !!params.token }
  );
  const mapRef = useRef<google.maps.Map | null>(null);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (data?.stops && data.stops.length > 0) {
      plotStopsOnMap(map, data.stops);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container max-w-4xl space-y-6">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Itinerary not found</h2>
            <p className="text-muted-foreground mt-2">This link may be invalid or the itinerary was removed.</p>
          </div>
        </main>
      </div>
    );
  }

  // Group stops by day
  const stopsByDay: Record<number, typeof data.stops> = {};
  data.stops?.forEach((stop) => {
    if (!stopsByDay[stop.dayNumber]) stopsByDay[stop.dayNumber] = [];
    stopsByDay[stop.dayNumber].push(stop);
  });

  const firstStop = data.stops?.[0];
  const mapCenter = firstStop?.lat && firstStop?.lng
    ? { lat: Number(firstStop.lat), lng: Number(firstStop.lng) }
    : { lat: 0, lng: 0 };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              {data.travelStyle && (
                <Badge variant="secondary" className="capitalize">{data.travelStyle}</Badge>
              )}
              <Badge variant="outline" className="capitalize">{data.status}</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{data.title}</h1>
            <div className="flex items-center gap-4 mt-3 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {data.destination}
              </span>
              {data.duration && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {data.duration} days
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {data.viewCount} views
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4" />
                {data.likeCount} likes
              </span>
            </div>
            {data.description && (
              <p className="mt-4 text-muted-foreground leading-relaxed">{data.description}</p>
            )}
          </div>

          {/* Map */}
          {data.stops && data.stops.length > 0 && data.stops.some(s => s.lat && s.lng) && (
            <Card className="mb-8 overflow-hidden">
              <MapView
                className="h-[400px]"
                initialCenter={mapCenter}
                initialZoom={11}
                onMapReady={handleMapReady}
              />
            </Card>
          )}

          {/* Community Tips Section */}
          <CommunityTips itineraryId={data.id} />

          {/* Day-by-Day View */}
          <div className="space-y-8">
            {Object.entries(stopsByDay)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([day, dayStops]) => (
                <div key={day}>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                      {day}
                    </div>
                    Day {day}
                  </h2>
                  <div className="space-y-3 ml-4 border-l-2 border-border pl-6">
                    {dayStops.sort((a, b) => a.orderIndex - b.orderIndex).map((stop, idx) => {
                      const Icon = categoryIcons[stop.category] || MapPin;
                      const colorClass = categoryColors[stop.category] || "";
                      return (
                        <Card key={stop.id} className="relative">
                          <div className="absolute -left-[33px] top-5 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={`text-xs border ${colorClass}`}>
                                    <Icon className="w-3 h-3 mr-1" />
                                    {stop.category}
                                  </Badge>
                                  {stop.startTime && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {stop.startTime}
                                      {stop.endTime && ` - ${stop.endTime}`}
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-semibold text-base">{stop.title}</h3>
                                {stop.address && (
                                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {stop.address}
                                  </p>
                                )}
                                {stop.description && (
                                  <p className="text-sm text-muted-foreground mt-2">{stop.description}</p>
                                )}
                                {stop.tips && (
                                  <p className="text-sm mt-2 bg-accent/50 p-2 rounded-lg italic">
                                    💡 {stop.tips}
                                  </p>
                                )}
                              </div>
                            </div>
                            {stop.travelTimeFromPrev && idx > 0 && (
                              <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
                                <Car className="w-3 h-3" />
                                <span>{stop.travelTimeFromPrev} min drive</span>
                                {stop.travelDistanceFromPrev && (
                                  <span>• {stop.travelDistanceFromPrev} km</span>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ============ COMMUNITY TIPS ============

function CommunityTips({ itineraryId }: { itineraryId: number }) {
  const { isAuthenticated } = useAuth();
  const [newTip, setNewTip] = useState("");
  const { data: tips, isLoading, refetch } = trpc.tips.getByItinerary.useQuery({ itineraryId });
  const createMutation = trpc.tips.create.useMutation({
    onSuccess: () => {
      refetch();
      setNewTip("");
      toast.success("Tip shared!");
    },
    onError: () => toast.error("Failed to share tip"),
  });

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Community Tips & Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : tips && tips.length > 0 ? (
          <div className="space-y-3">
            {tips.map((tip: any) => (
              <div key={tip.id} className="p-3 rounded-lg bg-accent/30 border border-border/50">
                <p className="text-sm">{tip.content}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>{tip.userName || "Anonymous Traveler"}</span>
                  {tip.category && (
                    <Badge variant="outline" className="text-[10px] h-4 capitalize">{tip.category}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No community tips yet. Be the first to share!</p>
        )}

        {isAuthenticated && (
          <div className="flex gap-2 pt-2 border-t border-border/50">
            <Textarea
              value={newTip}
              onChange={(e) => setNewTip(e.target.value)}
              placeholder="Share a tip for fellow travelers..."
              rows={2}
              className="flex-1 resize-none"
            />
            <Button
              size="sm"
              className="self-end"
              disabled={!newTip.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate({ itineraryId, content: newTip.trim() })}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function plotStopsOnMap(map: google.maps.Map, stops: any[]) {
  const bounds = new google.maps.LatLngBounds();
  const stopsWithCoords = stops.filter(s => s.lat && s.lng);

  stopsWithCoords.forEach((stop, index) => {
    const position = { lat: Number(stop.lat), lng: Number(stop.lng) };
    bounds.extend(position);

    const markerDiv = document.createElement("div");
    markerDiv.className = "flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-xs font-bold shadow-lg";
    markerDiv.textContent = String(index + 1);

    new google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      title: stop.title,
      content: markerDiv,
    });
  });

  if (stopsWithCoords.length > 1) {
    map.fitBounds(bounds, 50);

    // Draw route
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#6d28d9",
        strokeWeight: 3,
        strokeOpacity: 0.7,
      },
    });

    const waypoints = stopsWithCoords.slice(1, -1).map(s => ({
      location: { lat: Number(s.lat), lng: Number(s.lng) },
      stopover: true,
    }));

    directionsService.route(
      {
        origin: { lat: Number(stopsWithCoords[0].lat), lng: Number(stopsWithCoords[0].lng) },
        destination: { lat: Number(stopsWithCoords[stopsWithCoords.length - 1].lat), lng: Number(stopsWithCoords[stopsWithCoords.length - 1].lng) },
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          directionsRenderer.setDirections(result);
        }
      }
    );
  } else if (stopsWithCoords.length === 1) {
    map.setCenter({ lat: Number(stopsWithCoords[0].lat), lng: Number(stopsWithCoords[0].lng) });
    map.setZoom(14);
  }
}
