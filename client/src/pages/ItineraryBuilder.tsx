import { useAuth } from "@/_core/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getLoginUrl } from "@/const";
import {
  Plus, MapPin, Clock, Car, Camera, Compass, Star, Utensils,
  GripVertical, Trash2, Sparkles, Route, Share2, Globe, Lock,
  DollarSign, MessageSquare, ExternalLink, ChevronUp, ChevronDown,
  Wand2, Send, Map as MapIcon, X, Pencil,
} from "lucide-react";
import { MapView } from "@/components/Map";
import { Streamdown } from "streamdown";

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

export default function ItineraryBuilder() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const isNew = params.id === "new";

  // New itinerary form state
  const [newTitle, setNewTitle] = useState("");
  const [newDestination, setNewDestination] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newStyle, setNewStyle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCurrency, setNewCurrency] = useState("USD");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");

  const createMutation = trpc.itinerary.create.useMutation({
    onSuccess: (data) => {
      toast.success("Itinerary created!");
      setLocation(`/itinerary/${data.id}`);
    },
    onError: () => toast.error("Failed to create itinerary"),
  });

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Sign in to build itineraries</h2>
            <a href={getLoginUrl()}>
              <Button>Sign In</Button>
            </a>
          </div>
        </main>
      </div>
    );
  }

  if (isNew) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Create New Trip</h1>
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Trip Title *</Label>
                  <Input
                    id="title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Sicily Road Trip Adventure"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination *</Label>
                  <Input
                    id="destination"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    placeholder="e.g., Sicily, Italy"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (days)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      placeholder="7"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Travel Style</Label>
                    <Select value={newStyle} onValueChange={setNewStyle}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo">Solo</SelectItem>
                        <SelectItem value="couple">Couple</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="group">Group</SelectItem>
                        <SelectItem value="backpacker">Backpacker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={newCurrency} onValueChange={setNewCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                      <SelectItem value="SGD">SGD (S$)</SelectItem>
                      <SelectItem value="MYR">MYR (RM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Brief description of your trip..."
                    rows={3}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (!newTitle || !newDestination) {
                      toast.error("Title and destination are required");
                      return;
                    }
                    createMutation.mutate({
                      title: newTitle,
                      destination: newDestination,
                      duration: newDuration ? parseInt(newDuration) : undefined,
                      travelStyle: newStyle || undefined,
                      description: newDescription || undefined,
                      currency: newCurrency,
                      startDate: newStartDate ? new Date(newStartDate) : undefined,
                      endDate: newEndDate ? new Date(newEndDate) : undefined,
                    });
                  }}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create Itinerary"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return <ItineraryEditor id={parseInt(params.id || "0")} />;
}

// ============ ITINERARY EDITOR ============

function ItineraryEditor({ id }: { id: number }) {
  const { data, isLoading, refetch } = trpc.itinerary.getById.useQuery({ id }, { enabled: id > 0 });
  const [activeTab, setActiveTab] = useState("itinerary");
  const [addStopOpen, setAddStopOpen] = useState(false);
  const [addStopDay, setAddStopDay] = useState(1);

  const updateMutation = trpc.itinerary.update.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Saved!");
    },
  });

  const optimizeMutation = trpc.maps.optimizeRoute.useMutation({
    onSuccess: (data) => {
      refetch();
      toast.success(data.message);
    },
    onError: () => toast.error("Route optimization failed"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 py-8">
          <div className="container space-y-6">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-[600px] w-full rounded-xl" />
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
          </div>
        </main>
      </div>
    );
  }

  const days = data.duration || Math.max(...(data.stops?.map(s => s.dayNumber) || [1]), 1);
  const stopsByDay: Record<number, typeof data.stops> = {};
  data.stops?.forEach((stop) => {
    if (!stopsByDay[stop.dayNumber]) stopsByDay[stop.dayNumber] = [];
    stopsByDay[stop.dayNumber].push(stop);
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-6">
        <div className="container">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{data.title}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {data.destination}
                </span>
                {data.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {data.duration} days
                  </span>
                )}
                <Badge variant="outline" className="capitalize">{data.status}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  updateMutation.mutate({ id, isPublic: !data.isPublic });
                }}
              >
                {data.isPublic ? <Globe className="w-4 h-4 mr-1" /> : <Lock className="w-4 h-4 mr-1" />}
                {data.isPublic ? "Public" : "Private"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/shared/${data.shareToken}`);
                  toast.success("Share link copied!");
                }}
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button
                size="sm"
                onClick={() => optimizeMutation.mutate({ itineraryId: id })}
                disabled={optimizeMutation.isPending}
                className="gap-1"
              >
                <Route className="w-4 h-4" />
                {optimizeMutation.isPending ? "Optimizing..." : "Optimize Route"}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="itinerary" className="gap-1.5">
                <MapPin className="w-4 h-4" />
                Itinerary
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-1.5">
                <MapIcon className="w-4 h-4" />
                Map
              </TabsTrigger>
              <TabsTrigger value="budget" className="gap-1.5">
                <DollarSign className="w-4 h-4" />
                Budget
              </TabsTrigger>
              <TabsTrigger value="booking" className="gap-1.5">
                <ExternalLink className="w-4 h-4" />
                Booking
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-1.5">
                <Sparkles className="w-4 h-4" />
                AI Assistant
              </TabsTrigger>
            </TabsList>

            {/* Itinerary Tab */}
            <TabsContent value="itinerary">
              <ItineraryTab
                itineraryId={id}
                days={days}
                stopsByDay={stopsByDay}
                destination={data.destination}
                refetch={refetch}
              />
            </TabsContent>

            {/* Map Tab */}
            <TabsContent value="map">
              <MapTab stops={data.stops || []} />
            </TabsContent>

            {/* Budget Tab */}
            <TabsContent value="budget">
              <BudgetTab itineraryId={id} budget={data.budget || []} currency={data.currency || "USD"} refetch={refetch} />
            </TabsContent>

            {/* Booking Tab */}
            <TabsContent value="booking">
              <BookingTab destination={data.destination} />
            </TabsContent>

            {/* AI Tab */}
            <TabsContent value="ai">
              <AITab itineraryId={id} destination={data.destination} stops={data.stops || []} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

// ============ ITINERARY TAB ============

function ItineraryTab({
  itineraryId, days, stopsByDay, destination, refetch,
}: {
  itineraryId: number;
  days: number;
  stopsByDay: Record<number, any[]>;
  destination: string;
  refetch: () => void;
}) {
  const [addStopDay, setAddStopDay] = useState(1);
  const [addStopOpen, setAddStopOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editStop, setEditStop] = useState<any>(null);

  const suggestMutation = trpc.ai.suggestStops.useMutation({
    onSuccess: () => toast.success("AI suggestions ready!"),
    onError: () => toast.error("Failed to get suggestions"),
  });

  const reorderMutation = trpc.stop.reorder.useMutation({
    onSuccess: () => { refetch(); toast.success("Reordered!"); },
  });

  const moveStop = (stop: any, direction: "up" | "down", dayStops: any[]) => {
    const sorted = [...dayStops].sort((a, b) => a.orderIndex - b.orderIndex);
    const idx = sorted.findIndex(s => s.id === stop.id);
    if (direction === "up" && idx > 0) {
      const orders = sorted.map((s, i) => ({ id: s.id, dayNumber: s.dayNumber, orderIndex: i }));
      [orders[idx], orders[idx - 1]] = [orders[idx - 1], orders[idx]];
      orders.forEach((o, i) => o.orderIndex = i);
      reorderMutation.mutate({ itineraryId, orders });
    } else if (direction === "down" && idx < sorted.length - 1) {
      const orders = sorted.map((s, i) => ({ id: s.id, dayNumber: s.dayNumber, orderIndex: i }));
      [orders[idx], orders[idx + 1]] = [orders[idx + 1], orders[idx]];
      orders.forEach((o, i) => o.orderIndex = i);
      reorderMutation.mutate({ itineraryId, orders });
    }
  };

  const filterStops = (dayStops: any[]) => {
    if (categoryFilter === "all") return dayStops;
    return dayStops.filter(s => s.category === categoryFilter);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => suggestMutation.mutate({ destination, duration: days })}
          disabled={suggestMutation.isPending}
          className="gap-1"
        >
          <Wand2 className="w-4 h-4" />
          {suggestMutation.isPending ? "Getting suggestions..." : "AI Suggest Stops"}
        </Button>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs text-muted-foreground">Filter:</span>
          {["all", "must-see", "must-do", "must-try", "must-eat"].map((cat) => {
            const Icon = cat === "all" ? MapPin : categoryIcons[cat] || MapPin;
            return (
              <Button
                key={cat}
                variant={categoryFilter === cat ? "default" : "outline"}
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                onClick={() => setCategoryFilter(cat)}
              >
                <Icon className="w-3 h-3" />
                {cat === "all" ? "All" : cat.replace("must-", "")}
              </Button>
            );
          })}
        </div>
      </div>

      {/* AI Suggestions */}
      {suggestMutation.data && suggestMutation.data.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI Suggestions for {destination}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestMutation.data.map((suggestion: any, i: number) => (
              <AISuggestionCard
                key={i}
                suggestion={suggestion}
                itineraryId={itineraryId}
                dayCount={days}
                refetch={refetch}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Day-by-Day Stops */}
      {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
        const dayStops = stopsByDay[day] || [];
        const totalTravelTime = dayStops.reduce((sum: number, s: any) => sum + (s.travelTimeFromPrev || 0), 0);
        const totalDuration = dayStops.reduce((sum: number, s: any) => sum + (s.duration || 0), 0);
        const stopCount = dayStops.length;

        return (
        <div key={day} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {day}
                </div>
                Day {day}
              </h3>
              {stopCount > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{stopCount} stops</span>
                  {totalDuration > 0 && <span>• {Math.round(totalDuration / 60)}h activity</span>}
                  {totalTravelTime > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Car className="w-3 h-3" />
                      {totalTravelTime} min travel
                    </span>
                  )}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setAddStopDay(day); setAddStopOpen(true); }}
              className="gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Stop
            </Button>
          </div>

          <div className="space-y-2 ml-3.5 border-l-2 border-border/70 pl-5">
            {filterStops(stopsByDay[day] || [])
              .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
              .map((stop: any) => (
                <StopCard
                  key={stop.id}
                  stop={stop}
                  refetch={refetch}
                  onEdit={() => setEditStop(stop)}
                  onMoveUp={() => moveStop(stop, "up", stopsByDay[day] || [])}
                  onMoveDown={() => moveStop(stop, "down", stopsByDay[day] || [])}
                />
              ))}
            {filterStops(stopsByDay[day] || []).length === 0 && (
              <p className="text-sm text-muted-foreground py-4 italic">
                {categoryFilter !== "all" ? `No ${categoryFilter} stops for this day.` : "No stops added yet for this day."}
              </p>
            )}
          </div>
        </div>
        );
      })}

      {/* Add Stop Dialog */}
      <AddStopDialog
        open={addStopOpen}
        onOpenChange={setAddStopOpen}
        itineraryId={itineraryId}
        dayNumber={addStopDay}
        existingStopCount={(stopsByDay[addStopDay] || []).length}
        refetch={refetch}
      />

      {/* Edit Stop Dialog */}
      {editStop && (
        <EditStopDialog
          stop={editStop}
          open={!!editStop}
          onOpenChange={(v: boolean) => { if (!v) setEditStop(null); }}
          refetch={refetch}
          days={days}
        />
      )}
    </div>
  );
}

// ============ STOP CARD ============

function StopCard({ stop, refetch, onEdit, onMoveUp, onMoveDown }: {
  stop: any;
  refetch: () => void;
  onEdit?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const Icon = categoryIcons[stop.category] || MapPin;
  const colorClass = categoryColors[stop.category] || "";
  const deleteMutation = trpc.stop.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Stop removed"); },
  });

  return (
    <Card className="relative group">
      <div className="absolute -left-[27px] top-5 w-3 h-3 rounded-full bg-background border-2 border-primary/70" />
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Reorder buttons */}
          <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onMoveUp}>
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onMoveDown}>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`text-xs border ${colorClass}`}>
                <Icon className="w-3 h-3 mr-1" />
                {stop.category}
              </Badge>
              {stop.startTime && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {stop.startTime}{stop.endTime && ` - ${stop.endTime}`}
                </span>
              )}
            </div>
            <h4 className="font-medium">{stop.title}</h4>
            {stop.address && (
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {stop.address}
              </p>
            )}
            {stop.description && (
              <p className="text-sm text-muted-foreground mt-1">{stop.description}</p>
            )}
            {stop.tips && (
              <p className="text-xs mt-2 bg-accent/50 p-2 rounded italic">💡 {stop.tips}</p>
            )}
            {stop.travelTimeFromPrev && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Car className="w-3 h-3" />
                {stop.travelTimeFromPrev} min
                {stop.travelDistanceFromPrev && ` • ${stop.travelDistanceFromPrev} km`}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
                <GripVertical className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={() => deleteMutation.mutate({ id: stop.id })}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ ADD STOP DIALOG ============

function AddStopDialog({
  open, onOpenChange, itineraryId, dayNumber, existingStopCount, refetch,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  itineraryId: number;
  dayNumber: number;
  existingStopCount: number;
  refetch: () => void;
}) {
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState<string>("must-see");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [tips, setTips] = useState("");

  const createMutation = trpc.stop.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Stop added!");
      onOpenChange(false);
      resetForm();
    },
    onError: () => toast.error("Failed to add stop"),
  });

  const geocodeMutation = trpc.maps.geocode.useMutation();

  const resetForm = () => {
    setTitle(""); setAddress(""); setCategory("must-see");
    setDescription(""); setStartTime(""); setEndTime("");
    setDuration(""); setTips("");
  };

  const handleCreate = async () => {
    if (!title) { toast.error("Title is required"); return; }

    let lat: string | undefined;
    let lng: string | undefined;
    let placeId: string | undefined;

    if (address) {
      const geo = await geocodeMutation.mutateAsync({ address });
      if (geo) {
        lat = String(geo.lat);
        lng = String(geo.lng);
        placeId = geo.placeId;
      }
    }

    createMutation.mutate({
      itineraryId,
      dayNumber,
      orderIndex: existingStopCount,
      title,
      address: address || undefined,
      category: category as any,
      description: description || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      duration: duration ? parseInt(duration) : undefined,
      tips: tips || undefined,
      lat,
      lng,
      placeId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Stop — Day {dayNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Colosseum" />
          </div>
          <div className="space-y-2">
            <Label>Address / Location</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., Piazza del Colosseo, Rome" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="must-see">🏛️ Must-See</SelectItem>
                <SelectItem value="must-do">🎯 Must-Do</SelectItem>
                <SelectItem value="must-try">⭐ Must-Try</SelectItem>
                <SelectItem value="must-eat">🍽️ Must-Eat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Duration (min)</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="60" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Tips</Label>
            <Input value={tips} onChange={(e) => setTips(e.target.value)} placeholder="e.g., Book tickets online to skip the queue" />
          </div>
          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={createMutation.isPending || geocodeMutation.isPending}
          >
            {createMutation.isPending || geocodeMutation.isPending ? "Adding..." : "Add Stop"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ EDIT STOP DIALOG ============

function EditStopDialog({ stop, open, onOpenChange, refetch, days }: {
  stop: any;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  refetch: () => void;
  days: number;
}) {
  const [title, setTitle] = useState(stop.title || "");
  const [address, setAddress] = useState(stop.address || "");
  const [category, setCategory] = useState(stop.category || "must-see");
  const [description, setDescription] = useState(stop.description || "");
  const [startTime, setStartTime] = useState(stop.startTime || "");
  const [endTime, setEndTime] = useState(stop.endTime || "");
  const [duration, setDuration] = useState(stop.duration ? String(stop.duration) : "");
  const [tips, setTips] = useState(stop.tips || "");
  const [dayNumber, setDayNumber] = useState(String(stop.dayNumber));

  const updateMutation = trpc.stop.update.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Stop updated!");
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to update stop"),
  });

  const geocodeMutation = trpc.maps.geocode.useMutation();

  const handleSave = async () => {
    if (!title) { toast.error("Title is required"); return; }

    let lat: string | undefined;
    let lng: string | undefined;
    let placeId: string | undefined;

    if (address && address !== stop.address) {
      const geo = await geocodeMutation.mutateAsync({ address });
      if (geo) {
        lat = String(geo.lat);
        lng = String(geo.lng);
        placeId = geo.placeId;
      }
    }

    updateMutation.mutate({
      id: stop.id,
      title,
      address: address || undefined,
      category: category as any,
      description: description || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      duration: duration ? parseInt(duration) : undefined,
      tips: tips || undefined,
      dayNumber: parseInt(dayNumber),
      ...(lat && lng ? { lat, lng, placeId } : {}),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Stop</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Address / Location</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="must-see">Must-See</SelectItem>
                  <SelectItem value="must-do">Must-Do</SelectItem>
                  <SelectItem value="must-try">Must-Try</SelectItem>
                  <SelectItem value="must-eat">Must-Eat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Day</Label>
              <Select value={dayNumber} onValueChange={setDayNumber}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: days }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>Day {i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Duration (min)</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Tips</Label>
            <Input value={tips} onChange={(e) => setTips(e.target.value)} />
          </div>
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={updateMutation.isPending || geocodeMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ AI SUGGESTION CARD ============

function AISuggestionCard({ suggestion, itineraryId, dayCount, refetch }: {
  suggestion: any;
  itineraryId: number;
  dayCount: number;
  refetch: () => void;
}) {
  const [selectedDay, setSelectedDay] = useState("1");
  const Icon = categoryIcons[suggestion.category] || MapPin;
  const colorClass = categoryColors[suggestion.category] || "";

  const createMutation = trpc.stop.create.useMutation({
    onSuccess: () => { refetch(); toast.success(`Added "${suggestion.title}" to Day ${selectedDay}`); },
  });

  const geocodeMutation = trpc.maps.geocode.useMutation();

  const handleAdd = async () => {
    let lat: string | undefined;
    let lng: string | undefined;
    let placeId: string | undefined;

    if (suggestion.address) {
      const geo = await geocodeMutation.mutateAsync({ address: suggestion.address });
      if (geo) { lat = String(geo.lat); lng = String(geo.lng); placeId = geo.placeId; }
    }

    createMutation.mutate({
      itineraryId,
      dayNumber: parseInt(selectedDay),
      orderIndex: 99,
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      address: suggestion.address,
      duration: suggestion.estimatedDuration,
      tips: suggestion.tips,
      lat, lng, placeId,
    });
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <Badge className={`text-xs border ${colorClass}`}>
            <Icon className="w-3 h-3 mr-1" />
            {suggestion.category}
          </Badge>
        </div>
        <h4 className="font-medium text-sm">{suggestion.title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{suggestion.description}</p>
      </div>
      <div className="flex items-center gap-2">
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger className="w-20 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: dayCount }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>Day {i + 1}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAdd}
          disabled={createMutation.isPending}
          className="h-8"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ============ MAP TAB ============

function MapTab({ stops }: { stops: any[] }) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedStop, setSelectedStop] = useState<any>(null);
  const [nearbySearch, setNearbySearch] = useState<{ lat: number; lng: number; type: string } | null>(null);
  const stopsWithCoords = useMemo(() => stops.filter(s => s.lat && s.lng), [stops]);

  const { data: nearbyPOI, isFetching: nearbyLoading } = trpc.maps.nearbyPlaces.useQuery(
    nearbySearch!,
    { enabled: !!nearbySearch }
  );

  const firstStop = stopsWithCoords[0];
  const center = firstStop
    ? { lat: Number(firstStop.lat), lng: Number(firstStop.lng) }
    : { lat: 37.7749, lng: -122.4194 };

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (stopsWithCoords.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    const infoWindow = new google.maps.InfoWindow();

    stopsWithCoords.forEach((stop, index) => {
      const position = { lat: Number(stop.lat), lng: Number(stop.lng) };
      bounds.extend(position);

      const markerDiv = document.createElement("div");
      markerDiv.className = "flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-xs font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform";
      markerDiv.textContent = String(index + 1);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position,
        title: stop.title,
        content: markerDiv,
      });

      marker.addListener("click", () => {
        setSelectedStop(stop);
        infoWindow.setContent(`
          <div style="padding:8px;max-width:200px;">
            <strong style="font-size:14px;">${stop.title}</strong>
            <p style="font-size:12px;color:#666;margin:4px 0 0;">${stop.address || ""}</p>
            ${stop.category ? `<span style="font-size:11px;background:#f3f4f6;padding:2px 6px;border-radius:4px;">${stop.category}</span>` : ""}
          </div>
        `);
        infoWindow.open(map, marker);
      });
    });

    if (stopsWithCoords.length > 1) {
      map.fitBounds(bounds, 50);

      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: { strokeColor: "#6d28d9", strokeWeight: 3, strokeOpacity: 0.7 },
      });

      const waypoints = stopsWithCoords.slice(1, -1).map(s => ({
        location: { lat: Number(s.lat), lng: Number(s.lng) },
        stopover: true,
      }));

      directionsService.route({
        origin: { lat: Number(stopsWithCoords[0].lat), lng: Number(stopsWithCoords[0].lng) },
        destination: { lat: Number(stopsWithCoords[stopsWithCoords.length - 1].lat), lng: Number(stopsWithCoords[stopsWithCoords.length - 1].lng) },
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === "OK" && result) directionsRenderer.setDirections(result);
      });
    } else {
      map.setCenter(center);
      map.setZoom(14);
    }
  }, [stopsWithCoords]);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <MapView
          className="h-[500px]"
          initialCenter={center}
          initialZoom={stopsWithCoords.length > 0 ? 11 : 3}
          onMapReady={handleMapReady}
        />
      </Card>

      {/* Selected Stop Details */}
      {selectedStop && (
        <Card className="border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{selectedStop.title}</h4>
                {selectedStop.address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {selectedStop.address}
                  </p>
                )}
                {selectedStop.description && (
                  <p className="text-sm mt-2">{selectedStop.description}</p>
                )}
                {selectedStop.tips && (
                  <p className="text-xs mt-2 bg-accent/50 p-2 rounded italic">💡 {selectedStop.tips}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  {selectedStop.category && (
                    <Badge variant="outline" className="text-xs capitalize">{selectedStop.category}</Badge>
                  )}
                  {selectedStop.duration && (
                    <span className="text-xs text-muted-foreground">{selectedStop.duration} min</span>
                  )}
                  {selectedStop.travelTimeFromPrev && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Car className="w-3 h-3" />
                      {selectedStop.travelTimeFromPrev} min from prev
                    </span>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedStop(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nearby POI Suggestions */}
      {stopsWithCoords.length > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const c = stopsWithCoords[Math.floor(stopsWithCoords.length / 2)];
              if (c) setNearbySearch({ lat: Number(c.lat), lng: Number(c.lng), type: "tourist_attraction" });
            }}
            disabled={nearbyLoading}
            className="gap-1"
          >
            <Compass className="w-3.5 h-3.5" />
            {nearbyLoading && nearbySearch?.type === "tourist_attraction" ? "Searching..." : "Find Nearby Attractions"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const c = stopsWithCoords[Math.floor(stopsWithCoords.length / 2)];
              if (c) setNearbySearch({ lat: Number(c.lat), lng: Number(c.lng), type: "restaurant" });
            }}
            disabled={nearbyLoading}
            className="gap-1"
          >
            <Utensils className="w-3.5 h-3.5" />
            Nearby Restaurants
          </Button>
        </div>
      )}

      {nearbyPOI && nearbyPOI.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-primary" />
              Nearby Points of Interest
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {nearbyPOI.slice(0, 8).map((poi: any, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-border/50 text-sm">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{poi.name}</p>
                    {poi.rating && (
                      <p className="text-xs text-muted-foreground">
                        {poi.rating} ★ • {poi.vicinity || poi.address || ""}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stopsWithCoords.length === 0 && (
        <p className="text-center text-muted-foreground text-sm">
          Add stops with addresses to see them on the map.
        </p>
      )}
      {stopsWithCoords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {stopsWithCoords.map((stop, i) => (
            <div
              key={stop.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedStop?.id === stop.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
              }`}
              onClick={() => setSelectedStop(stop)}
            >
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{stop.title}</p>
                <p className="text-xs text-muted-foreground truncate">{stop.address}</p>
              </div>
              {stop.travelTimeFromPrev && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {stop.travelTimeFromPrev} min
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ BUDGET TAB ============

function BudgetTab({ itineraryId, budget, currency, refetch }: {
  itineraryId: number;
  budget: any[];
  currency: string;
  refetch: () => void;
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("accommodation");
  const [notes, setNotes] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");

  const createMutation = trpc.budget.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Budget item added");
      setTitle(""); setAmount(""); setNotes(""); setBookingUrl("");
    },
  });

  const deleteMutation = trpc.budget.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Removed"); },
  });

  const total = budget.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const byCategory = budget.reduce((acc: Record<string, number>, item) => {
    acc[item.category] = (acc[item.category] || 0) + Number(item.amount || 0);
    return acc;
  }, {});

  const currencySymbol: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", JPY: "¥", AUD: "A$", SGD: "S$", MYR: "RM" };
  const sym = currencySymbol[currency] || currency;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{sym}{total.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Budget</p>
          </CardContent>
        </Card>
        {Object.entries(byCategory).map(([cat, amt]) => (
          <Card key={cat}>
            <CardContent className="p-4 text-center">
              <p className="text-lg font-semibold">{sym}{(amt as number).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground capitalize">{cat}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Budget Item */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add Expense</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Item name" />
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="accommodation">Accommodation</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="activities">Activities</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                if (!title || !amount) { toast.error("Title and amount required"); return; }
                createMutation.mutate({ itineraryId, title, amount, category: category as any, currency, notes: notes || undefined, bookingUrl: bookingUrl || undefined });
              }}
              disabled={createMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" />
            <Input value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} placeholder="Booking URL (optional)" />
          </div>
        </CardContent>
      </Card>

      {/* Budget Items List */}
      {budget.length > 0 && (
        <div className="space-y-2">
          {budget.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 group">
              <Badge variant="outline" className="capitalize text-xs">{item.category}</Badge>
              <span className="flex-1 font-medium text-sm">{item.title}</span>
              {item.bookingUrl && (
                <a href={item.bookingUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
              )}
              <span className="font-semibold text-sm">{sym}{Number(item.amount).toFixed(2)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive"
                onClick={() => deleteMutation.mutate({ id: item.id })}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ BOOKING TAB ============

function BookingTab({ destination }: { destination: string }) {
  const encodedDest = encodeURIComponent(destination);

  const bookingLinks = [
    { name: "Agoda", url: `https://www.agoda.com/search?city=${encodedDest}`, description: "Hotels & vacation rentals across Asia and worldwide" },
    { name: "Booking.com", url: `https://www.booking.com/searchresults.html?ss=${encodedDest}`, description: "World's largest selection of hotels and accommodations" },
    { name: "Hotels.com", url: `https://www.hotels.com/search.do?q-destination=${encodedDest}`, description: "Earn rewards with every stay" },
    { name: "Trip.com", url: `https://www.trip.com/hotels/?city=${encodedDest}`, description: "Hotels, flights, and train tickets" },
    { name: "Airbnb", url: `https://www.airbnb.com/s/${encodedDest}/homes`, description: "Unique stays and local experiences" },
  ];

  const carRentalLinks = [
    { name: "Rentalcars.com", url: `https://www.rentalcars.com/search-results?location=${encodedDest}`, description: "Compare car rental deals worldwide" },
    { name: "Kayak", url: `https://www.kayak.com/cars/${encodedDest}`, description: "Search hundreds of car rental sites" },
    { name: "Discover Cars", url: `https://www.discovercars.com/?location=${encodedDest}`, description: "Best price guarantee on car rentals" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🏨 Accommodation
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookingLinks.map((link) => (
            <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
              <Card className="h-full hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold group-hover:text-primary transition-colors">{link.name}</h4>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                  <p className="text-xs text-primary mt-2">Search for: {destination}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🚗 Car Rental
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {carRentalLinks.map((link) => (
            <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
              <Card className="h-full hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold group-hover:text-primary transition-colors">{link.name}</h4>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                  <p className="text-xs text-primary mt-2">Search for: {destination}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ AI TAB ============

function AITab({ itineraryId, destination, stops }: { itineraryId: number; destination: string; stops: any[] }) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
    },
    onError: () => toast.error("Failed to get response"),
  });

  const tipsMutation = trpc.ai.generateTips.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user" as const, content: input }];
    setMessages(newMessages);
    setInput("");

    const context = `Destination: ${destination}\nStops: ${stops.map(s => `${s.title} (${s.category})`).join(", ")}`;
    chatMutation.mutate({ messages: newMessages, itineraryContext: context });
  };

  const suggestedPrompts = [
    `What are the hidden gems in ${destination}?`,
    `What should I skip in ${destination}?`,
    `Best time to visit each stop?`,
    `Local food recommendations for ${destination}`,
    `Money-saving tips for ${destination}`,
  ];

  return (
    <div className="space-y-4">
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Travel Assistant
          </CardTitle>
        </CardHeader>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <Sparkles className="w-10 h-10 text-primary/30 mx-auto" />
              <p className="text-muted-foreground text-sm">
                Ask me anything about your trip to {destination}!
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedPrompts.map((prompt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setMessages([{ role: "user", content: prompt }]);
                      chatMutation.mutate({
                        messages: [{ role: "user", content: prompt }],
                        itineraryContext: `Destination: ${destination}`,
                      });
                    }}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="text-sm prose prose-sm max-w-none">
                    <Streamdown>{msg.content}</Streamdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.1s]" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your trip..."
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />
            <Button onClick={handleSend} disabled={chatMutation.isPending || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Button
        variant="outline"
        className="gap-2"
        onClick={() => tipsMutation.mutate({ destination })}
        disabled={tipsMutation.isPending}
      >
        <Wand2 className="w-4 h-4" />
        {tipsMutation.isPending ? "Generating tips..." : `Generate Travel Tips for ${destination}`}
      </Button>
    </div>
  );
}
