import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface SearchFiltersProps {
  onSearch: (filters: {
    subjects: string;
    program: string;
    semester: string;
    maxRate: string;
    isAvailableNow: boolean;
  }) => void;
}

export function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [subjects, setSubjects] = useState<string>("All Subjects");
  const [program, setProgram] = useState<string>("All Programs");
  const [semester, setSemester] = useState<string>("All Semesters");
  const [maxRate, setMaxRate] = useState<string>("Any Price");
  const [isAvailableNow, setIsAvailableNow] = useState<boolean>(false);

  const handleSearch = () => {
    onSearch({
      subjects,
      program,
      semester,
      maxRate,
      isAvailableNow,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Find Your Ideal Tutor</h2>
      <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subject
          </Label>
          <Select onValueChange={setSubjects} defaultValue={subjects}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Subjects">All Subjects</SelectItem>
              <SelectItem value="calculas">Calculas</SelectItem>
              <SelectItem value="linear algebra">Linear Algebra</SelectItem>
              <SelectItem value="data structures">Data Structures</SelectItem>
              <SelectItem value="algorithms">Algorithms</SelectItem>
              <SelectItem value="database systems">Database Systems</SelectItem>
              <SelectItem value="programming">Programming</SelectItem>
              <SelectItem value="web development">Web Development</SelectItem>
              <SelectItem value="mechanics">Mechanics</SelectItem>
              <SelectItem value="electromagnetism">Electromagnetism</SelectItem>
              <SelectItem value="thermodynamics">Thermodynamics</SelectItem>
              <SelectItem value="organic chemistry">Organic Chemistry</SelectItem>
              <SelectItem value="biochemistry">Biochemistry</SelectItem>
              <SelectItem value="statistics">Statistics</SelectItem>
              <SelectItem value="accounting">Accounting</SelectItem>
              <SelectItem value="economics">Economics</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Program
          </Label>
          <Select onValueChange={setProgram} defaultValue={program}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Programs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Programs">All Programs</SelectItem>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Software Engineering">Software Engineering</SelectItem>
              <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
              <SelectItem value="Data Science">Data Science</SelectItem>
              <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
              <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
              <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
              <SelectItem value="Business Administration">Business Administration</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Economics">Economics</SelectItem>
              <SelectItem value="Accounting">Accounting</SelectItem>
              <SelectItem value="Media Sciences">Media Sciences</SelectItem>
              <SelectItem value="Social Sciences">Social Sciences</SelectItem>
              <SelectItem value="Law">Law</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Semester
          </Label>
          <Select onValueChange={setSemester} defaultValue={semester}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Semesters">All Semesters</SelectItem>
              <SelectItem value="1">1st Semester</SelectItem>
              <SelectItem value="2">2nd Semester</SelectItem>
              <SelectItem value="3">3rd Semester</SelectItem>
              <SelectItem value="4">4th Semester</SelectItem>
              <SelectItem value="5">5th Semester</SelectItem>
              <SelectItem value="6">6th Semester</SelectItem>
              <SelectItem value="7">7th Semester</SelectItem>
              <SelectItem value="8">8th Semester</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Price Range
          </Label>
          <Select onValueChange={setMaxRate} defaultValue={maxRate}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Any Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Any Price">Any Price</SelectItem>
              <SelectItem value="500">Under Rs. 500</SelectItem>
              <SelectItem value="1000">Rs. 500 - 1000</SelectItem>
              <SelectItem value="1500">Rs. 1000 - 1500</SelectItem>
              <SelectItem value="2000">Rs. 1500+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center">
          <Checkbox
            id="available-now"
            checked={isAvailableNow}
            onCheckedChange={(checked) => 
              setIsAvailableNow(checked as boolean)
            }
          />
          <Label
            htmlFor="available-now"
            className="ml-2 text-sm text-gray-700 dark:text-gray-300"
          >
            Available Now
          </Label>
        </div>
        <Button onClick={handleSearch}>
          Search Tutors
        </Button>
      </div>
    </div>
  );
}
