import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface PaymentFormProps {
  sessionId: number;
  amount: number;
  onSuccess?: () => void;
}

const paymentSchema = z.object({
  paymentMethod: z.enum(["easypaisa", "jazzcash"]),
  phoneNumber: z.string().min(11, "Phone number must be at least 11 digits").max(13, "Phone number must not exceed 13 digits"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PaymentForm({ sessionId, amount, onSuccess }: PaymentFormProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "jazzcash",
      phoneNumber: "",
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentFormValues) => {
      return apiRequest("PATCH", `/api/sessions/${sessionId}/payment`, {
        paymentStatus: "paid",
        paymentMethod: data.paymentMethod,
      });
    },
    onSuccess: () => {
      toast({
        title: "Payment successful",
        description: "Your payment has been processed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/student"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: PaymentFormValues) {
    if (step === 1) {
      setStep(2);
      return;
    }
    
    paymentMutation.mutate(data);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-6">Payment</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 ? (
            <>
              <div className="bg-primary-50 p-4 rounded-md mb-4">
                <h3 className="font-medium mb-2">Payment Summary</h3>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <div className="text-gray-500">Session ID:</div>
                  <div>#{sessionId}</div>
                  <div className="text-gray-500">Amount:</div>
                  <div className="font-bold">${amount.toFixed(2)}</div>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="jazzcash" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            <div className="flex items-center">
                              <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-md mr-2">
                                <i className="fas fa-mobile-alt text-red-600"></i>
                              </div>
                              JazzCash
                            </div>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="easypaisa" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            <div className="flex items-center">
                              <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-md mr-2">
                                <i className="fas fa-money-bill-wave text-green-600"></i>
                              </div>
                              EasyPaisa
                            </div>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 03001234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full">Continue</Button>
            </>
          ) : (
            <>
              <div className="text-center space-y-4">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-2">
                  <i className="fas fa-check text-3xl text-green-600"></i>
                </div>
                
                <h3 className="text-lg font-medium">Confirm Payment</h3>
                
                <p className="text-gray-500 text-sm">
                  You're about to pay <span className="font-bold">${amount.toFixed(2)}</span> via {form.watch("paymentMethod") === "jazzcash" ? "JazzCash" : "EasyPaisa"}
                </p>
                
                <div className="bg-gray-50 p-4 rounded-md text-left mb-4 text-sm">
                  <p>A payment request has been sent to {form.watch("phoneNumber")}</p>
                  <p className="font-medium mt-2">Please check your mobile for confirmation.</p>
                </div>
                
                <div className="pt-2 flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                    disabled={paymentMutation.isPending}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={paymentMutation.isPending}
                  >
                    {paymentMutation.isPending ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      "Confirm Payment"
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </form>
      </Form>
    </div>
  );
}
