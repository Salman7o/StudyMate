import React, { useState } from 'react';
import { Input } from './Input'; // Assuming Input component exists

const RegisterForm = () => {
  const [role, setRole] = useState('student');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    if (data.role === 'tutor') {
      data.tutorProfile = {
        hourlyRate: parseInt(data.hourlyRate as string),
        experience: data.experience,
        subjects: (data.subjects as string).split(',').map(s => s.trim()),
        availability: data.availability,
        isAvailableNow: false
      };
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Handle error appropriately (e.g., display error message)
        console.error('Registration failed:', response.statusText);
      } else {
        // Handle successful registration (e.g., redirect)
        console.log('Registration successful!');
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Input name="username" placeholder="Username" required />
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="password" type="password" placeholder="Password" required />
        <Input name="fullName" placeholder="Full Name" required />
        <select name="role" className="w-full rounded-md border p-2" onChange={(e) => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="tutor">Tutor</option>
        </select>

        {role === 'tutor' && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium">Tutor Profile</h3>
            <Input name="hourlyRate" type="number" placeholder="Hourly Rate (Rs.)" required />
            <Input name="experience" placeholder="Years of Experience" required />
            <textarea 
              name="subjects"
              placeholder="Subjects (comma separated)"
              className="w-full rounded-md border p-2"
              required
            />
            <Input name="availability" placeholder="Availability (e.g. Weekdays 2-6 PM)" required />
          </div>
        )}
      </div>
      <button type="submit" className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Register</button>
    </form>
  );
};

export default RegisterForm;