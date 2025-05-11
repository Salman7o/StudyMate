import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export function validateZodSchema<T extends z.ZodType>(
  schema: T, 
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return { success: false, error: validationError.message };
    }
    return { success: false, error: 'Validation failed' };
  }
}
