import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PAYMENT_METHODS } from "@/lib/constants";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  amount: number;
}

const PaymentModal = ({ isOpen, onClose, bookingId, amount }: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState("jazzcash");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const processPaymentMutation = useMutation({
    mutationFn: () => 
      apiRequest("PUT", `/api/bookings/${bookingId}/payment`, { status: "paid" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bookings/${bookingId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/student"] });
      toast({
        title: "Payment successful",
        description: "Your session has been booked successfully.",
      });
      onClose();
      navigate(`/booking/${bookingId}/confirmation`);
    },
    onError: (error) => {
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    }
  });

  const handleRequestOTP = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate OTP sending - in a real app this would call an API
    toast({
      title: "OTP sent",
      description: "A verification code has been sent to your phone",
    });
    setStep(2);
  };

  const handlePayment = () => {
    if (!otp || otp.length < 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid verification code",
        variant: "destructive",
      });
      return;
    }
    
    processPaymentMutation.mutate();
  };

  const handleClose = () => {
    setStep(1);
    setPhoneNumber("");
    setOtp("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Pay ${amount.toFixed(2)} to confirm your session booking
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select payment method</Label>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={setPaymentMethod}
                className="flex flex-col space-y-2"
              >
                {PAYMENT_METHODS.map(method => (
                  <div key={method.id} className="flex items-center space-x-2 border p-3 rounded-md">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex items-center cursor-pointer">
                      <span className="mr-2">{method.icon}</span>
                      {method.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input
                id="phone-number"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                We'll send a verification code to this number
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                placeholder="Enter the code sent to your phone"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <div className="flex justify-between">
                <p className="text-xs text-gray-500">
                  Code sent to {phoneNumber}
                </p>
                <button 
                  onClick={() => setStep(1)} 
                  className="text-xs text-primary hover:underline"
                >
                  Change
                </button>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          {step === 1 ? (
            <Button 
              onClick={handleRequestOTP}
              className="btn-primary"
            >
              Request Code
            </Button>
          ) : (
            <Button 
              onClick={handlePayment}
              className="btn-primary"
              disabled={processPaymentMutation.isPending}
            >
              {processPaymentMutation.isPending ? "Processing..." : "Complete Payment"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
