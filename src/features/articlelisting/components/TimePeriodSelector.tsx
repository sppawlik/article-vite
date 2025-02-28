import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimePeriodSelectorProps {
  selectedAge: number;
  onAgeChange: (age: number) => void;
}

export function TimePeriodSelector({ selectedAge, onAgeChange }: TimePeriodSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="age-select" className="text-sm font-medium">
        Time Period:
      </label>
      <Select 
        onValueChange={(value) => onAgeChange(Number(value))}
        defaultValue="7"
        value={selectedAge.toString()}
      >
        <SelectTrigger className="w-[180px]" id="age-select">
          <SelectValue placeholder="Select age filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1 day</SelectItem>
          <SelectItem value="3">3 days</SelectItem>
          <SelectItem value="7">1 week</SelectItem>
          <SelectItem value="14">2 weeks</SelectItem>
          <SelectItem value="30">1 month</SelectItem>
          <SelectItem value="1000">Any</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 