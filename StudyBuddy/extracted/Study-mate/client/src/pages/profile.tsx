import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { InterestedStudents } from "@/components/tutors/interested-students";

export default function Profile() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    location: user?.location || "",
    bio: user?.bio || "",
    program: user?.program || "",
    semester: user?.semester || "",
    university: user?.university || "University",
  });
  
  // Get tutor profile if user is a tutor
  const { data: tutorProfile } = useQuery({
    queryKey: ['/api/tutors', user?.id],
    enabled: isAuthenticated && user?.role === 'tutor',
    queryFn: async () => {
      try {
        const profiles = await fetch('/api/tutors', { credentials: 'include' });
        const tutors = await profiles.json();
        return tutors.find((t: any) => t.userId === user?.id);
      } catch (error) {
        console.error("Failed to fetch tutor profile:", error);
        return null;
      }
    }
  });
  
  const [tutorFormData, setTutorFormData] = useState({
    subjects: tutorProfile?.subjects || [],
    hourlyRate: tutorProfile?.hourlyRate || 0,
    experience: tutorProfile?.experience || "",
    availability: tutorProfile?.availability || "",
    isAvailableNow: tutorProfile?.isAvailableNow || false,
  });

  // Get payment methods
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['/api/payment-methods'],
    enabled: isAuthenticated,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTutorInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'subjects') {
      // Handle comma-separated subjects
      const subjects = value.split(',').map(subject => subject.trim());
      setTutorFormData(prev => ({ ...prev, subjects }));
    } else if (name === 'hourlyRate') {
      // Convert to number
      setTutorFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else if (name === 'isAvailableNow') {
      // Handle checkbox
      setTutorFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setTutorFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Update user profile
      await apiRequest("PUT", `/api/users/${user?.id}`, formData);
      
      // If user is a tutor, update tutor profile
      if (user?.role === 'tutor') {
        if (tutorProfile) {
          // Update existing tutor profile
          await apiRequest("PUT", `/api/tutors/${tutorProfile.id}`, tutorFormData);
        } else {
          // Create new tutor profile
          await apiRequest("POST", `/api/tutors`, {
            ...tutorFormData,
            userId: user?.id
          });
        }
        
        // Refresh tutor profile data
        queryClient.invalidateQueries({ queryKey: ['/api/tutors', user?.id] });
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-12 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 max-w-md mx-auto">
          <div className="text-5xl mb-4 text-primary">
            <i className="fas fa-lock"></i>
          </div>
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to view your profile
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/login">
              <Button>Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Card className="overflow-hidden">
        <div className="relative">
          <div className="h-40 bg-gradient-to-r from-primary to-indigo-400"></div>
          <div className="absolute bottom-0 left-8 transform translate-y-1/2">
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 overflow-hidden">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary text-white flex items-center justify-center">
                  <span className="text-xl font-medium">
                    {user?.fullName.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-16 p-8">
          <div className="md:flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">{user?.fullName}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.program} {user?.role === 'student' ? 'Student' : 'Tutor'}, 
                {user?.semester ? ` ${user.semester}${getOrdinalSuffix(parseInt(user.semester))} Semester` : ''}
              </p>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="mt-4 md:mt-0"
              variant="outline"
            >
              <i className="fas fa-edit mr-2"></i>
              {isEditing ? "Cancel Editing" : "Edit Profile"}
            </Button>
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="program">Program</Label>
                  <Input
                    id="program"
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">University</h3>
                  <p className="text-gray-700 dark:text-gray-300">{user?.university || "University"}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Program</h3>
                  <p className="text-gray-700 dark:text-gray-300">{user?.program || "Not specified"}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Semester</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {user?.semester ? `${user.semester}${getOrdinalSuffix(parseInt(user.semester))} Semester` : "Not specified"}
                  </p>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Profile Details</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                      <div className="text-gray-900 dark:text-gray-100">{user?.email}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                      <div className="text-gray-900 dark:text-gray-100">{user?.phoneNumber || "Not provided"}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                      <div className="text-gray-900 dark:text-gray-100">{user?.location || "Not specified"}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Joined</label>
                      <div className="text-gray-900 dark:text-gray-100">
                        {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }) : "Unknown"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {user?.role === 'tutor' && tutorProfile && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Tutor Information</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hourly Rate</label>
                        <div className="text-gray-900 dark:text-gray-100">Rs. {tutorProfile.hourlyRate}/hour</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience</label>
                        <div className="text-gray-900 dark:text-gray-100">{tutorProfile.experience}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Availability</label>
                        <div className="text-gray-900 dark:text-gray-100">{tutorProfile.availability}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                        <div className="text-gray-900 dark:text-gray-100 flex items-center">
                          <div className="flex text-yellow-400 mr-2">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const rating = tutorProfile.rating / 10;
                              return (
                                <i
                                  key={star}
                                  className={`fas ${
                                    star <= rating
                                      ? "fa-star"
                                      : star - 0.5 <= rating
                                      ? "fa-star-half-alt"
                                      : "fa-star text-gray-300 dark:text-gray-600"
                                  }`}
                                ></i>
                              );
                            })}
                          </div>
                          {(tutorProfile.rating / 10).toFixed(1)} ({tutorProfile.reviewCount} reviews)
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subjects</label>
                      <div className="flex flex-wrap gap-2">
                        {tutorProfile.subjects.map((subject: string, index: number) => (
                          <Badge key={index} className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              

              
              {user?.role === 'student' && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Subjects of Interest</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1">
                      Data Structures
                    </Badge>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1">
                      Algorithms
                    </Badge>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1">
                      Calculus
                    </Badge>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1">
                      Database Systems
                    </Badge>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1">
                      Web Development
                    </Badge>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  {paymentMethods.length > 0 ? (
                    paymentMethods.map((method: any) => (
                      <div key={method.id} className="flex items-center justify-between mb-4 last:mb-0">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <i className={`fas fa-${method.type === 'JazzCash' ? 'money-bill-wave' : 'wallet'} text-blue-500`}></i>
                          </div>
                          <div>
                            <p className="font-medium">{method.type}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{method.accountNumber}</p>
                          </div>
                        </div>
                        {method.isDefault && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Default
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No payment methods added yet</p>
                  )}
                  <button className="text-primary hover:text-indigo-700 text-sm font-medium mt-4">
                    + Add new payment method
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

// Helper function to get ordinal suffix for numbers
function getOrdinalSuffix(n: number): string {
  if (n > 3 && n < 21) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}
