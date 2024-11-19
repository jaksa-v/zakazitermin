"use client";

import { useState, useCallback, useEffect, FC } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Phone, ChevronDown, ChevronUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sport, VenueWithCourts } from "@/lib/db/schema";
import { useThrottle } from "@/lib/hooks/use-throttle";

interface VenueBrowserProps {
  venues: VenueWithCourts[];
  sports: Sport[];
}

const VenueBrowser: FC<VenueBrowserProps> = ({ venues, sports }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for expanded venues
  const [expandedVenues, setExpandedVenues] = useState<Record<number, boolean>>(
    {}
  );

  // Local state for search input
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
  // Throttled search value for URL updates
  const throttledSearch = useThrottle(searchInput, 700);

  const currentSport = searchParams.get("sport") || "";

  // Update URL when throttled search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (throttledSearch) {
      params.set("search", throttledSearch);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [throttledSearch, router, searchParams]);

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    return params.toString();
  };

  const updateSport = (value: string) => {
    if (value === "all") {
      value = "";
    }

    router.push(`?${createQueryString("sport", value)}`, { scroll: false });
  };

  const toggleVenue = useCallback((venueId: number) => {
    setExpandedVenues((prev) => ({
      ...prev,
      [venueId]: !prev[venueId],
    }));
  }, []);

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      !throttledSearch ||
      venue.name.toLowerCase().includes(throttledSearch.toLowerCase()) ||
      venue.city.toLowerCase().includes(throttledSearch.toLowerCase());

    if (!currentSport) return matchesSearch;

    return (
      matchesSearch &&
      venue.courts.some((court) => court.sportId.toString() === currentSport)
    );
  });

  return (
    <div className="mx-auto space-y-6">
      <h1 className="my-4 text-2xl font-bold">Browse Venues</h1>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search venues by name or city..."
            className="pl-8"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Select value={currentSport} onValueChange={updateSport}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            {sports.map((sport) => (
              <SelectItem key={sport.id} value={sport.id.toString()}>
                {sport.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filteredVenues.map((venue) => (
          <Card key={venue.id} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer"
              onClick={() => toggleVenue(venue.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{venue.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4" />
                    {venue.address}, {venue.city}
                    {venue.phoneNumber && (
                      <span className="flex items-center gap-1">
                        • <Phone className="h-4 w-4" /> {venue.phoneNumber}
                      </span>
                    )}
                  </CardDescription>
                </div>
                {expandedVenues[venue.id] ? (
                  <ChevronUp className="h-6 w-6" />
                ) : (
                  <ChevronDown className="h-6 w-6" />
                )}
              </div>
            </CardHeader>

            {expandedVenues[venue.id] && (
              <CardContent>
                {venue.description && (
                  <p className="text-gray-600 mb-4">{venue.description}</p>
                )}

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(venue.amenitiesJson).map(
                      (amenity: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {amenity}
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Courts & Fields</h4>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {venue.courts
                      .filter(
                        (court) =>
                          !currentSport ||
                          court.sportId.toString() === currentSport
                      )
                      .map((court) => (
                        <Card key={court.id} className="bg-gray-50">
                          <CardContent className="p-4">
                            <div className="font-medium">{court.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {court.isIndoor ? "Indoor" : "Outdoor"} • $
                              {court.basePrice}/hour
                            </div>
                            {court.description && (
                              <p className="text-sm text-gray-600 mt-2">
                                {court.description}
                              </p>
                            )}
                            <Button className="w-full mt-3" variant="outline">
                              Book Now
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VenueBrowser;
