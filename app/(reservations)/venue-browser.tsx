"use client";

import { useState, useCallback, FC } from "react";
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
import { Court, Sport, VenueWithCourts } from "@/lib/db/schema";
import ReservationModal from "./reservation-modal";

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

  // Local state for search
  const [searchInput, setSearchInput] = useState("");

  // URL-based filters
  const currentSport = searchParams.get("sport") || "";
  const currentIndoor = searchParams.get("indoor") || "";

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

  const updateIndoor = (value: string) => {
    if (value === "all") {
      value = "";
    }
    router.push(`?${createQueryString("indoor", value)}`, { scroll: false });
  };

  const toggleVenue = useCallback((venueId: number) => {
    setExpandedVenues((prev) => ({
      ...prev,
      [venueId]: !prev[venueId],
    }));
  }, []);

  // State for selected court and venue for reservation
  const [selectedReservation, setSelectedReservation] = useState<{
    court: Court;
    venue: VenueWithCourts;
  } | null>(null);

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      !searchInput ||
      venue.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      venue.city.toLowerCase().includes(searchInput.toLowerCase());

    const matchesSport = !currentSport
      ? true
      : venue.courts.some((court) => court.sportId.toString() === currentSport);

    const matchesIndoor = !currentIndoor
      ? true
      : venue.courts.some(
          (court) => court.isIndoor === (currentIndoor === "true")
        );

    return matchesSearch && matchesSport && matchesIndoor;
  });

  return (
    <div className="mx-auto space-y-4 sm:space-y-6">
      <h1 className="my-3 sm:my-4 text-xl sm:text-2xl font-bold">
        Browse Venues
      </h1>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-primary" />
          <Input
            placeholder="Search venues by name or city..."
            className="pl-8 w-full text-sm sm:text-base"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="flex flex-row gap-2 sm:gap-4">
          <Select value={currentSport} onValueChange={updateSport}>
            <SelectTrigger className="sm:w-[140px]">
              <SelectValue placeholder="All Sports" />
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
          <Select value={currentIndoor} onValueChange={updateIndoor}>
            <SelectTrigger className="sm:w-[140px]">
              <SelectValue placeholder="All Courts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courts</SelectItem>
              <SelectItem value="true">Indoor</SelectItem>
              <SelectItem value="false">Outdoor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {filteredVenues.map((venue) => (
          <Card key={venue.id} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer py-3 px-4 sm:p-6"
              onClick={() => toggleVenue(venue.id)}
            >
              <div className="flex justify-between items-start sm:items-center">
                <div>
                  <CardTitle className="text-lg sm:text-xl">
                    {venue.name}
                  </CardTitle>
                  <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {venue.address}, {venue.city}
                    </span>
                    {venue.phoneNumber && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" /> {venue.phoneNumber}
                      </span>
                    )}
                  </CardDescription>
                </div>
                {expandedVenues[venue.id] ? (
                  <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </div>
            </CardHeader>

            {expandedVenues[venue.id] && (
              <CardContent className="py-3 px-4 sm:p-6">
                {venue.description && (
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">
                    {venue.description}
                  </p>
                )}

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {JSON.parse(venue.amenitiesJson).map(
                      (amenity: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs sm:text-sm"
                        >
                          {amenity}
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Courts & Fields</h4>
                  <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">
                    {venue.courts
                      .filter(
                        (court) =>
                          (!currentSport ||
                            court.sportId.toString() === currentSport) &&
                          (!currentIndoor ||
                            court.isIndoor === (currentIndoor === "true"))
                      )
                      .map((court) => (
                        <Card key={court.id}>
                          <CardContent className="p-3 sm:p-4">
                            <div className="font-medium text-sm sm:text-base">
                              {court.name}
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                              {court.isIndoor ? "Indoor" : "Outdoor"} • $
                              {court.basePrice}/hour
                            </div>
                            {court.description && (
                              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                                {court.description
                                  .split(" ")
                                  .slice(0, 5)
                                  .join(" ")}
                                {court.description.split(" ").length > 5 &&
                                  "..."}
                              </p>
                            )}
                            <Button
                              className="mt-2 sm:mt-3 h-8 sm:h-10 text-sm"
                              variant="outline"
                              onClick={() =>
                                setSelectedReservation({
                                  court,
                                  venue,
                                })
                              }
                            >
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
      {selectedReservation && (
        <ReservationModal
          court={selectedReservation.court}
          venue={selectedReservation.venue}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </div>
  );
};

export default VenueBrowser;
