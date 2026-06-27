import { useAuth } from "@/_core/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { MapView } from "@/components/Map";
import { useParams, useLocation } from "wouter";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import {
  Plus, Trash2, MapPin, Calendar, Route, Sparkles, DollarSign,
  Download, ExternalLink, Car, Camera, Compass, Star, Utensils,
  Globe, MessageCircle, Send, ChevronDown, ChevronUp, Copy, X, Hotel
} from "lucide-react";
import { format, addDays, differenceInDays, parseISO } from "date-fns";

// ============ MAIN PAGE ============

export default function ItineraryBuilder() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 py-8">
          <div className="container max-w-6xl space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-[500px] w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold mb-2">Sign in to create itineraries</h2>
              <p className="text-muted-foreground mb-4 text-sm">Plan, optimize, and share your trips.</p>
              <a href={getLoginUrl()}>
                <Button>Sign In</Button>
              </a>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (params.id === "new") {
    return <CreateItinerary />;
  }

  return <ItineraryEditor id={Number(params.id)} />;
}

// ============ CREATE ITINERARY ============

function CreateItinerary() {
  const [, navigate] = useLocation();
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");

  const createMutation = trpc.itinerary.create.useMutation({
    onSuccess: (data) => {
      toast.success("Itinerary created!");
      navigate(`/itinerary/${data.id}`);
    },
    onError: () => toast.error("Failed to create itinerary"),
  });

  const duration = startDate && endDate
    ? differenceInDays(parseISO(endDate), parseISO(startDate)) + 1
    : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !destination) {
      toast.error("Title and destination are required");
      return;
    }
    createMutation.mutate({
      title,
      destination,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      duration,
      travelStyle: travelStyle || undefined,
      currency,
      description: description || undefined,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">Create New Trip</h1>
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Trip Title *</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Sicily Road Trip" />
                  </div>
                  <div>
                    <Label>Destination *</Label>
                    <Input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., Sicily, Italy" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
                </div>
                {duration && (
                  <p className="text-sm text-muted-foreground">Duration: {duration} days</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Travel Style</Label>
                    <Select value={travelStyle} onValueChange={setTravelStyle}>
                      <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo">Solo</SelectItem>
                        <SelectItem value="couple">Couple</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="group">Group</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                        <SelectItem value="SGD">SGD (S$)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                        <SelectItem value="NZD">NZD (NZ$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." rows={2} />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Itinerary"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// ============ ITINERARY EDITOR ============

function ItineraryEditor({ id }: { id: number }) {
  const { data, isLoading, refetch } = trpc.itinerary.getById.useQuery({ id });
  const [activeTab, setActiveTab] = useState("itinerary");

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 py-8">
          <div className="container max-w-6xl space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-[500px] w-full" />
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
          <p className="text-muted-foreground">Itinerary not found.</p>
        </main>
      </div>
    );
  }

  const startDate = data.startDate ? new Date(data.startDate) : null;
  const dayCount = data.duration || 7;

  // Generate day labels with actual dates
  const getDayLabel = (dayNum: number) => {
    if (startDate) {
      const date = addDays(startDate, dayNum - 1);
      return `${format(date, "EEE, MMM d")}`;
    }
    return `Day ${dayNum}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-6">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">{data.title}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                {data.destination}
                {startDate && (
                  <>
                    <span className="mx-1">•</span>
                    <Calendar className="w-3.5 h-3.5" />
                    {format(startDate, "MMM d")} - {data.endDate ? format(new Date(data.endDate), "MMM d, yyyy") : ""}
                  </>
                )}
                <span className="mx-1">•</span>
                {dayCount} days
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ExportButton itinerary={data} />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="itinerary" className="gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Itinerary
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Map
              </TabsTrigger>
              <TabsTrigger value="budget" className="gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Budget
              </TabsTrigger>
              <TabsTrigger value="booking" className="gap-1.5">
                <Hotel className="w-3.5 h-3.5" />
                Booking
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="itinerary">
              <ItineraryTab
                itineraryId={id}
                stops={data.stops || []}
                dayCount={dayCount}
                startDate={startDate}
                getDayLabel={getDayLabel}
                currency={data.currency || "USD"}
                refetch={refetch}
              />
            </TabsContent>

            <TabsContent value="map">
              <MapTab stops={data.stops || []} dayCount={dayCount} getDayLabel={getDayLabel} />
            </TabsContent>

            <TabsContent value="budget">
              <BudgetSummaryTab stops={data.stops || []} currency={data.currency || "USD"} getDayLabel={getDayLabel} />
            </TabsContent>

            <TabsContent value="booking">
              <BookingTab destination={data.destination} startDate={data.startDate} endDate={data.endDate} />
            </TabsContent>

            <TabsContent value="ai">
              <AITab itineraryId={id} destination={data.destination} stops={data.stops || []} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

// ============ ITINERARY TAB (TABLE-BASED) ============

function ItineraryTab({
  itineraryId, stops, dayCount, startDate, getDayLabel, currency, refetch
}: {
  itineraryId: number;
  stops: any[];
  dayCount: number;
  startDate: Date | null;
  getDayLabel: (day: number) => string;
  currency: string;
  refetch: () => void;
}) {
  const [expandedDay, setExpandedDay] = useState<number>(1);
  const [showAddRow, setShowAddRow] = useState<number | null>(null);

  // Group stops by day and sort by startTime
  const stopsByDay = useMemo(() => {
    const grouped: Record<number, any[]> = {};
    for (let i = 1; i <= dayCount; i++) grouped[i] = [];
    stops.forEach(s => {
      const day = s.dayNumber || 1;
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(s);
    });
    // Sort each day by startTime
    Object.values(grouped).forEach(dayStops => {
      dayStops.sort((a, b) => {
        if (!a.startTime && !b.startTime) return a.orderIndex - b.orderIndex;
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      });
    });
    return grouped;
  }, [stops, dayCount]);

  return (
    <div className="space-y-3">
      {Array.from({ length: dayCount }, (_, i) => i + 1).map(day => {
        const dayStops = stopsByDay[day] || [];
        const isExpanded = expandedDay === day;
        const dayTotal = dayStops.reduce((sum, s) => sum + (Number(s.cost) || 0), 0);

        return (
          <Card key={day} className={isExpanded ? "border-primary/30" : ""}>
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-accent/30 transition-colors"
              onClick={() => setExpandedDay(isExpanded ? 0 : day)}
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {day}
                </div>
                <div>
                  <span className="font-medium text-sm">{getDayLabel(day)}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {dayStops.length} stop{dayStops.length !== 1 ? "s" : ""}
                    {dayTotal > 0 && ` • ${currency} ${dayTotal.toFixed(0)}`}
                  </span>
                </div>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>

            {isExpanded && (
              <CardContent className="px-4 pb-4 pt-0">
                {/* Table header */}
                <div className="grid grid-cols-[80px_1fr_1fr_100px_100px_80px_40px] gap-2 text-xs font-medium text-muted-foreground border-b pb-2 mb-2">
                  <span>Time</span>
                  <span>Stop</span>
                  <span>Location</span>
                  <span>Category</span>
                  <span>Cost</span>
                  <span>Notes</span>
                  <span></span>
                </div>

                {/* Existing stops */}
                {dayStops.map(stop => (
                  <StopRow key={stop.id} stop={stop} currency={currency} refetch={refetch} />
                ))}

                {/* Add stop row */}
                {showAddRow === day ? (
                  <AddStopRow
                    itineraryId={itineraryId}
                    dayNumber={day}
                    orderIndex={dayStops.length}
                    startDate={startDate}
                    currency={currency}
                    onDone={() => { setShowAddRow(null); refetch(); }}
                    onCancel={() => setShowAddRow(null)}
                  />
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowAddRow(day)}
                  >
                    <Plus className="w-3 h-3" />
                    Add stop
                  </Button>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ============ STOP ROW ============

function StopRow({ stop, currency, refetch }: { stop: any; currency: string; refetch: () => void }) {
  const deleteMutation = trpc.stop.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Stop removed"); },
  });

  const categoryIcons: Record<string, typeof Camera> = {
    "must-see": Camera,
    "must-do": Compass,
    "must-try": Star,
    "must-eat": Utensils,
  };
  const Icon = categoryIcons[stop.category] || MapPin;

  return (
    <div className="grid grid-cols-[80px_1fr_1fr_100px_100px_80px_40px] gap-2 items-center py-2 border-b border-border/30 text-sm hover:bg-accent/20 transition-colors">
      <span className="text-xs text-muted-foreground">
        {stop.startTime || "—"}
        {stop.endTime && <span className="block text-[10px]">to {stop.endTime}</span>}
      </span>
      <div className="flex items-center gap-1.5 min-w-0">
        <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="truncate font-medium">{stop.title}</span>
      </div>
      <span className="text-xs text-muted-foreground truncate">{stop.address || "—"}</span>
      <Badge variant="outline" className="text-[10px] h-5 w-fit capitalize">{stop.category}</Badge>
      <span className="text-xs">
        {stop.cost ? `${currency} ${Number(stop.cost).toFixed(0)}` : "—"}
      </span>
      <span className="text-xs text-muted-foreground truncate">{stop.notes || "—"}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
        onClick={() => deleteMutation.mutate({ id: stop.id })}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}

// ============ ADD STOP ROW ============

const TIME_OPTIONS = (() => {
  const opts: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      opts.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return opts;
})();

function AddStopRow({
  itineraryId, dayNumber, orderIndex, startDate, currency, onDone, onCancel
}: {
  itineraryId: number;
  dayNumber: number;
  orderIndex: number;
  startDate: Date | null;
  currency: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState<string>("must-see");
  const [cost, setCost] = useState("");
  const [costCategory, setCostCategory] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null);

  // Initialize Places autocomplete service
  useEffect(() => {
    const initService = () => {
      if (window.google?.maps?.places) {
        autocompleteRef.current = new google.maps.places.AutocompleteService();
      }
    };
    if (window.google?.maps?.places) {
      initService();
    } else {
      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          initService();
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  const handleAddressChange = (value: string) => {
    setAddress(value);
    if (value.length > 2 && autocompleteRef.current) {
      autocompleteRef.current.getPlacePredictions(
        { input: value },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectPlace = (prediction: any) => {
    setAddress(prediction.description);
    setPlaceId(prediction.place_id);
    setShowSuggestions(false);

    // Get lat/lng from geocoding
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        setLat(String(results[0].geometry.location.lat()));
        setLng(String(results[0].geometry.location.lng()));
        // Auto-fill title if empty
        if (!title) {
          setTitle(prediction.structured_formatting?.main_text || prediction.description.split(",")[0]);
        }
      }
    });
  };

  const createMutation = trpc.stop.create.useMutation({
    onSuccess: () => { toast.success("Stop added"); onDone(); },
    onError: () => toast.error("Failed to add stop"),
  });

  const handleAdd = () => {
    if (!title) { toast.error("Title is required"); return; }
    const stopDate = startDate ? format(addDays(startDate, dayNumber - 1), "yyyy-MM-dd") : undefined;
    createMutation.mutate({
      itineraryId,
      dayNumber,
      orderIndex,
      title,
      address: address || undefined,
      lat: lat || undefined,
      lng: lng || undefined,
      placeId: placeId || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      category: category as any,
      cost: cost || undefined,
      costCategory: costCategory as any || undefined,
      stopDate,
      notes: notes || undefined,
    });
  };

  return (
    <div className="border border-dashed border-primary/30 rounded-lg p-3 mt-2 space-y-3 bg-primary/5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Stop Name *</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Colosseum" className="h-8 text-sm" />
        </div>
        <div className="relative">
          <Label className="text-xs">Location (auto-suggest)</Label>
          <Input
            ref={addressRef}
            value={address}
            onChange={e => handleAddressChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Start typing an address..."
            className="h-8 text-sm"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-accent transition-colors"
                  onMouseDown={() => handleSelectPlace(s)}
                >
                  <p className="font-medium text-xs">{s.structured_formatting?.main_text}</p>
                  <p className="text-[10px] text-muted-foreground">{s.structured_formatting?.secondary_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <Label className="text-xs">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="must-see">Must-See</SelectItem>
              <SelectItem value="must-do">Must-Do</SelectItem>
              <SelectItem value="must-try">Must-Try</SelectItem>
              <SelectItem value="must-eat">Must-Eat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <Label className="text-xs">Start Time</Label>
          <Select value={startTime} onValueChange={setStartTime}>
            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent className="max-h-48">
              {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">End Time</Label>
          <Select value={endTime} onValueChange={setEndTime}>
            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent className="max-h-48">
              {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Cost ({currency})</Label>
          <Input value={cost} onChange={e => setCost(e.target.value)} placeholder="0" type="number" className="h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs">Cost Type</Label>
          <Select value={costCategory} onValueChange={setCostCategory}>
            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="accommodation">Accommodation</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="activities">Activities</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Notes</Label>
          <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional" className="h-8 text-sm" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleAdd} disabled={createMutation.isPending} className="h-7 text-xs">
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} className="h-7 text-xs">Cancel</Button>
      </div>
    </div>
  );
}

// ============ MAP TAB (COLOR-CODED BY DAY) ============

const DAY_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6",
  "#e11d48", "#84cc16", "#0ea5e9", "#a855f7", "#f43f5e",
];

function MapTab({ stops, dayCount, getDayLabel }: { stops: any[]; dayCount: number; getDayLabel: (d: number) => string }) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const stopsWithCoords = useMemo(() => stops.filter(s => s.lat && s.lng), [stops]);

  const firstStop = stopsWithCoords[0];
  const center = firstStop
    ? { lat: Number(firstStop.lat), lng: Number(firstStop.lng) }
    : { lat: 37.7749, lng: -122.4194 };

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (stopsWithCoords.length === 0) return;

    const bounds = new google.maps.LatLngBounds();

    stopsWithCoords.forEach((stop, index) => {
      const position = { lat: Number(stop.lat), lng: Number(stop.lng) };
      bounds.extend(position);

      const dayColor = DAY_COLORS[(stop.dayNumber - 1) % DAY_COLORS.length];
      const markerDiv = document.createElement("div");
      markerDiv.className = "flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold shadow-lg";
      markerDiv.style.backgroundColor = dayColor;
      markerDiv.textContent = String(index + 1);

      new google.maps.marker.AdvancedMarkerElement({
        map,
        position,
        title: `${stop.title} (${getDayLabel(stop.dayNumber)})`,
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
        polylineOptions: { strokeColor: "#3b82f6", strokeWeight: 3, strokeOpacity: 0.6 },
      });

      const waypoints = stopsWithCoords.slice(1, -1).map(s => ({
        location: { lat: Number(s.lat), lng: Number(s.lng) },
        stopover: true,
      }));

      if (waypoints.length <= 23) {
        directionsService.route({
          origin: { lat: Number(stopsWithCoords[0].lat), lng: Number(stopsWithCoords[0].lng) },
          destination: { lat: Number(stopsWithCoords[stopsWithCoords.length - 1].lat), lng: Number(stopsWithCoords[stopsWithCoords.length - 1].lng) },
          waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
        }, (result, status) => {
          if (status === "OK" && result) directionsRenderer.setDirections(result);
        });
      }
    } else if (stopsWithCoords.length === 1) {
      map.setCenter(center);
      map.setZoom(14);
    }
  }, [stopsWithCoords, getDayLabel]);

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

      {/* Legend */}
      {stopsWithCoords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: Math.min(dayCount, 15) }, (_, i) => {
            const dayStops = stopsWithCoords.filter(s => s.dayNumber === i + 1);
            if (dayStops.length === 0) return null;
            return (
              <Badge key={i} variant="outline" className="text-[10px] gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DAY_COLORS[i % DAY_COLORS.length] }} />
                {getDayLabel(i + 1)} ({dayStops.length})
              </Badge>
            );
          })}
        </div>
      )}

      {stopsWithCoords.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-8">
          Add stops with locations to see them on the map.
        </p>
      )}
    </div>
  );
}

// ============ BUDGET SUMMARY TAB ============

function BudgetSummaryTab({ stops, currency, getDayLabel }: { stops: any[]; currency: string; getDayLabel: (d: number) => string }) {
  const stopsWithCost = stops.filter(s => s.cost && Number(s.cost) > 0);
  const totalCost = stopsWithCost.reduce((sum, s) => sum + Number(s.cost), 0);

  // Group by category
  const byCategory: Record<string, number> = {};
  stopsWithCost.forEach(s => {
    const cat = s.costCategory || "other";
    byCategory[cat] = (byCategory[cat] || 0) + Number(s.cost);
  });

  // Group by day
  const byDay: Record<number, number> = {};
  stopsWithCost.forEach(s => {
    byDay[s.dayNumber] = (byDay[s.dayNumber] || 0) + Number(s.cost);
  });

  const categoryLabels: Record<string, string> = {
    accommodation: "Accommodation",
    transport: "Transport",
    food: "Food & Dining",
    activities: "Activities",
    shopping: "Shopping",
    other: "Other",
  };

  return (
    <div className="space-y-4">
      {/* Total */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Trip Budget</p>
            <p className="text-3xl font-bold mt-1">{currency} {totalCost.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">{stopsWithCost.length} items across {Object.keys(byDay).length} days</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">By Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
              <div key={cat} className="flex items-center justify-between text-sm">
                <span className="capitalize">{categoryLabels[cat] || cat}</span>
                <span className="font-medium">{currency} {amount.toFixed(2)}</span>
              </div>
            ))}
            {Object.keys(byCategory).length === 0 && (
              <p className="text-sm text-muted-foreground italic">No costs added yet. Add costs to stops in the Itinerary tab.</p>
            )}
          </CardContent>
        </Card>

        {/* By Day */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">By Day</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(byDay).sort((a, b) => Number(a[0]) - Number(b[0])).map(([day, amount]) => (
              <div key={day} className="flex items-center justify-between text-sm">
                <span>{getDayLabel(Number(day))}</span>
                <span className="font-medium">{currency} {amount.toFixed(2)}</span>
              </div>
            ))}
            {Object.keys(byDay).length === 0 && (
              <p className="text-sm text-muted-foreground italic">No costs added yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed breakdown */}
      {stopsWithCost.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">All Cost Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="grid grid-cols-[1fr_120px_100px_80px] gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
                <span>Item</span>
                <span>Day</span>
                <span>Category</span>
                <span className="text-right">Amount</span>
              </div>
              {stopsWithCost.map(s => (
                <div key={s.id} className="grid grid-cols-[1fr_120px_100px_80px] gap-2 text-sm py-1.5 border-b border-border/30">
                  <span className="truncate">{s.title}</span>
                  <span className="text-xs text-muted-foreground">{getDayLabel(s.dayNumber)}</span>
                  <span className="text-xs capitalize">{s.costCategory || "—"}</span>
                  <span className="text-right font-medium">{currency} {Number(s.cost).toFixed(0)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============ BOOKING AGGREGATOR TAB ============

function BookingTab({ destination, startDate, endDate }: { destination: string; startDate?: any; endDate?: any }) {
  const [guests, setGuests] = useState("2");
  const checkIn = startDate ? format(new Date(startDate), "yyyy-MM-dd") : "";
  const checkOut = endDate ? format(new Date(endDate), "yyyy-MM-dd") : "";
  const encodedDest = encodeURIComponent(destination);

  const platforms = [
    {
      name: "Google Hotels",
      icon: "🔍",
      description: "Compare prices across all platforms",
      url: `https://www.google.com/travel/hotels/${encodedDest}?q=${encodedDest}${checkIn ? `&dates=${checkIn},${checkOut}` : ""}&adults=${guests}`,
      highlight: true,
    },
    {
      name: "Booking.com",
      icon: "🏨",
      description: "Largest selection, free cancellation",
      url: `https://www.booking.com/searchresults.html?ss=${encodedDest}${checkIn ? `&checkin=${checkIn}&checkout=${checkOut}` : ""}&group_adults=${guests}`,
    },
    {
      name: "Agoda",
      icon: "🌏",
      description: "Best for Asia-Pacific deals",
      url: `https://www.agoda.com/search?city=${encodedDest}${checkIn ? `&checkIn=${checkIn}&checkOut=${checkOut}` : ""}&adults=${guests}`,
    },
    {
      name: "Hotels.com",
      icon: "⭐",
      description: "Collect nights, earn free stays",
      url: `https://www.hotels.com/search.do?q-destination=${encodedDest}${checkIn ? `&q-check-in=${checkIn}&q-check-out=${checkOut}` : ""}&q-rooms=1&q-room-0-adults=${guests}`,
    },
    {
      name: "Trip.com",
      icon: "✈️",
      description: "Flights + hotels bundles",
      url: `https://www.trip.com/hotels/list?city=${encodedDest}${checkIn ? `&checkin=${checkIn}&checkout=${checkOut}` : ""}`,
    },
    {
      name: "Airbnb",
      icon: "🏠",
      description: "Unique stays and experiences",
      url: `https://www.airbnb.com/s/${encodedDest}/homes${checkIn ? `?checkin=${checkIn}&checkout=${checkOut}&adults=${guests}` : ""}`,
    },
  ];

  const carRentals = [
    {
      name: "Google Car Rental",
      icon: "🚗",
      description: "Compare all car rental providers",
      url: `https://www.google.com/travel/explore?q=car+rental+${encodedDest}`,
      highlight: true,
    },
    {
      name: "RentalCars.com",
      icon: "🚙",
      description: "Widest selection worldwide",
      url: `https://www.rentalcars.com/search-results?location=${encodedDest}${checkIn ? `&puDate=${checkIn}&doDate=${checkOut}` : ""}`,
    },
    {
      name: "Kayak",
      icon: "🔎",
      description: "Price comparison engine",
      url: `https://www.kayak.com/cars/${encodedDest}/${checkIn || ""}/${checkOut || ""}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Search parameters */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Destination</p>
              <p className="font-semibold text-sm">{destination}</p>
            </div>
            {checkIn && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Dates</p>
                <p className="font-semibold text-sm">{checkIn} → {checkOut}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Guests</p>
              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger className="h-8 w-24 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["1","2","3","4","5","6"].map(n => (
                    <SelectItem key={n} value={n}>{n} {n === "1" ? "guest" : "guests"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Click any platform below to search with your dates and guest count. Links open the booking site directly — WanderWiki does not handle payments.
          </p>
        </CardContent>
      </Card>

      {/* Accommodation */}
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Hotel className="w-4 h-4" />
          Accommodation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {platforms.map(p => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer">
              <Card className={`hover:shadow-md transition-shadow cursor-pointer ${p.highlight ? "border-primary/40 bg-primary/5" : ""}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-2xl">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>

      {/* Car Rental */}
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Car className="w-4 h-4" />
          Car Rental
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {carRentals.map(p => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer">
              <Card className={`hover:shadow-md transition-shadow cursor-pointer ${p.highlight ? "border-primary/40 bg-primary/5" : ""}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-2xl">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ AI TAB (MINIMIZED) ============

function AITab({ itineraryId, destination, stops }: { itineraryId: number; destination: string; stops: any[] }) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setChatHistory(prev => [...prev, { role: "assistant", content: data.content }]);
      setIsLoading(false);
    },
    onError: () => {
      toast.error("AI failed to respond");
      setIsLoading(false);
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    const newMessages: { role: "user" | "assistant" | "system"; content: string }[] = [
      ...chatHistory.map(m => ({ role: m.role as "user" | "assistant" | "system", content: m.content })),
      { role: "user" as const, content: message },
    ];
    setChatHistory(prev => [...prev, { role: "user", content: message }]);
    setIsLoading(true);
    chatMutation.mutate({
      messages: newMessages,
      itineraryContext: `Destination: ${destination}. Stops: ${stops.map(s => s.title).join(", ")}`,
    });
    setMessage("");
  };

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-3">
          Ask for hidden gems, must-eat spots, route tips, or help refining your itinerary.
        </p>

        {/* Chat messages - compact */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto mb-3">
          {chatHistory.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              Try: "What are the hidden gems in {destination}?" or "Optimize my route to avoid backtracking"
            </p>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className={`text-sm p-2 rounded-lg ${msg.role === "user" ? "bg-primary/10 ml-8" : "bg-accent/50 mr-8"}`}>
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="text-sm p-2 rounded-lg bg-accent/50 mr-8 animate-pulse">Thinking...</div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask about your trip..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!message.trim() || isLoading} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ EXPORT BUTTON ============

function ExportButton({ itinerary }: { itinerary: any }) {
  const handleExportCSV = () => {
    const stops = itinerary.stops || [];
    const headers = ["Day", "Date", "Time", "Stop", "Location", "Category", "Cost", "Notes"];
    const rows = stops.map((s: any) => [
      s.dayNumber,
      s.stopDate || "",
      s.startTime ? `${s.startTime}${s.endTime ? " - " + s.endTime : ""}` : "",
      s.title,
      s.address || "",
      s.category,
      s.cost || "",
      s.notes || "",
    ]);

    const csv = [headers, ...rows].map(row => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${itinerary.title.replace(/[^a-zA-Z0-9]/g, "_")}_itinerary.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as CSV (opens in Excel/Google Sheets)");
  };

  const handleCopyTable = () => {
    const stops = itinerary.stops || [];
    const headers = "Day\tDate\tTime\tStop\tLocation\tCategory\tCost\tNotes";
    const rows = stops.map((s: any) =>
      `${s.dayNumber}\t${s.stopDate || ""}\t${s.startTime || ""}\t${s.title}\t${s.address || ""}\t${s.category}\t${s.cost || ""}\t${s.notes || ""}`
    );
    const table = [headers, ...rows].join("\n");
    navigator.clipboard.writeText(table);
    toast.success("Copied! Paste into Excel or Google Sheets");
  };

  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1 h-7 text-xs">
        <Download className="w-3 h-3" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handleCopyTable} className="gap-1 h-7 text-xs">
        <Copy className="w-3 h-3" />
        Copy
      </Button>
    </div>
  );
}
