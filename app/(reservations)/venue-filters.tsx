"use client";

import { FC } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sport } from "@/lib/db/schema";

interface VenueFiltersProps {
  sports: Sport[];
  searchInput: string;
  onSearchChange: (value: string) => void;
}

const VenueFilters: FC<VenueFiltersProps> = ({
  sports,
  searchInput,
  onSearchChange,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-primary" />
        <Input
          placeholder="Search venues by name or city..."
          className="pl-8 w-full text-sm sm:text-base"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
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
  );
};

export default VenueFilters;
