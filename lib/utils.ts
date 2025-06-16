import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param id String to check
 * @returns Boolean indicating if the string is a valid ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * MDFe Step Mapping Utilities
 * Optimized functions for MongoDB storage using compact aliases
 */

// Step mapping configuration for MongoDB storage optimization
export const MDFE_STEP_MAPPINGS = {
  ide: "ide",
  emit: "emit",
  rodo: "rodo",
  aquav: "aquav",
  infDoc: "infDoc",
  tot: "tot",
  infAdic: "infAdic",
} as const;

// Reverse mapping for alias to name conversion
export const MDFE_ALIAS_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(MDFE_STEP_MAPPINGS).map(([name, alias]) => [alias, name])
);

/**
 * Convert a step name to its MongoDB storage alias
 * @param stepName - The full step name
 * @returns The compact alias for storage
 */
export const getStepAlias = (stepName: string): string => {
  return (
    MDFE_STEP_MAPPINGS[stepName as keyof typeof MDFE_STEP_MAPPINGS] ||
    stepName.toLowerCase().replace(/ /g, "_")
  );
};

/**
 * Get form data for a specific step using optimized aliases
 * @param formData - The complete form data object (must use aliases)
 * @param stepName - The step name to retrieve data for
 * @returns The step data or empty object if not found
 */
export const getFormDataForStep = (formData: any, stepName: string): any => {
  if (!formData) return {};

  const alias = getStepAlias(stepName);
  return formData[alias] || {};
};

/**
 * Validate that form data contains all required step data
 * @param formData - The form data to validate (using aliases)
 * @param requiredSteps - Array of step names that must be present
 * @returns Object with validation result and missing steps
 */
export const validateStepData = (
  formData: any,
  requiredSteps: string[] = []
): { isValid: boolean; missingSteps: string[] } => {
  if (!formData) {
    return { isValid: false, missingSteps: requiredSteps };
  }

  const missingSteps: string[] = [];

  requiredSteps.forEach((stepName) => {
    const stepData = getFormDataForStep(formData, stepName);
    if (!stepData || Object.keys(stepData).length === 0) {
      missingSteps.push(stepName);
    }
  });

  return {
    isValid: missingSteps.length === 0,
    missingSteps,
  };
};

/**
 * Initialize form data with optimized structure
 * @param baseData - Base data to merge with optimized structure
 * @returns Form data using optimized aliases
 */
export const initializeOptimizedFormData = (baseData: any = {}): any => {
  return {
    ...baseData,
    ide: baseData.ide || {},
    emit: baseData.emit || {},
    rodo: baseData.rodo || {},
    aquav: baseData.aquav || {},
    infDoc: baseData.infDoc || { nfe: [], cte: [], mdf: [] },
    tot: baseData.tot || {},
    infAdic: baseData.infAdic || {},
  };
};
