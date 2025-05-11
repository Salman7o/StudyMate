import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Subject } from "@shared/schema";

interface TutorFilterProps {
  onFilter: (filters: TutorFilterValues) => void;
}

export interface TutorFilterValues {
  subject?: string;
  minRate?: number;
  maxRate?: number;
  availability?: string;
  program?: string;
  semester?: string;
}

export default function TutorFilter({ onFilter }: TutorFilterProps) {
  const [subject, setSubject] = useState<string>("");
  const [priceRange, setPriceRange] = useState<number[]>([0, 100]);
  const [availability, setAvailability] = useState<string>("");
  const [program, setProgram] = useState<string>("");
  const [semester, setSemester] = useState<string>("");

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
  };

  const handleFilter = () => {
    onFilter({
      subject: subject || undefined,
      minRate: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxRate: priceRange[1] < 100 ? priceRange[1] : undefined,
      availability: availability || undefined,
      program: program || undefined,
      semester: semester || undefined,
    });
  };

  const handleReset = () => {
    setSubject("");
    setPriceRange([0, 100]);
    setAvailability("");
    setProgram("");
    setSemester("");
    onFilter({});
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Filter Tutors</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Select
            value={subject}
            onValueChange={setSubject}
          >
            <SelectTrigger id="subject">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Subjects</SelectItem>
              {subjects?.map((subject) => (
                <SelectItem key={subject.id} value={subject.name}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Price Range ($/hour)</Label>
          <div className="pt-6 px-2">
            <Slider
              defaultValue={[0, 100]}
              max={100}
              step={5}
              value={priceRange}
              onValueChange={handlePriceChange}
            />
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="availability">Availability</Label>
          <Select
            value={availability}
            onValueChange={setAvailability}
          >
            <SelectTrigger id="availability">
              <SelectValue placeholder="Any availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any availability</SelectItem>
              <SelectItem value="weekdays">Weekdays</SelectItem>
              <SelectItem value="weekends">Weekends</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="program">Program/Major</Label>
          <Input
            id="program"
            placeholder="e.g. Computer Science"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="semester">Semester</Label>
          <Input
            id="semester"
            placeholder="e.g. Fall 2023"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2 pt-2">
          <Button 
            onClick={handleFilter}
            className="flex-1"
          >
            Apply Filters
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="flex-1"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
