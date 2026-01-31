import { z } from "zod";
import { isValidEthereumAddress } from "@/lib/utils";

export const electionFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  positions: z
    .array(
      z.object({
        name: z.string().min(2, "Position name must be at least 2 characters"),
      })
    )
    .min(1, "At least one position is required")
    .max(20, "Maximum 20 positions allowed"),
});

export const candidateFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  address: z
    .string()
    .refine((val) => isValidEthereumAddress(val), {
      message: "Invalid Ethereum address",
    }),
});

export const votersFormSchema = z.object({
  voters: z
    .array(z.string())
    .min(1, "At least one voter address is required")
    .refine(
      (addresses) => addresses.every((addr) => isValidEthereumAddress(addr)),
      {
        message: "All addresses must be valid Ethereum addresses",
      }
    ),
});

export const startElectionFormSchema = z.object({
  duration: z
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(525600, "Duration cannot exceed 1 year (525,600 minutes)"),
});

export type ElectionFormInput = z.infer<typeof electionFormSchema>;
export type CandidateFormInput = z.infer<typeof candidateFormSchema>;
export type VotersFormInput = z.infer<typeof votersFormSchema>;
export type StartElectionFormInput = z.infer<typeof startElectionFormSchema>;
