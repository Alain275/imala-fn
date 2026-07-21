export const SUPPORTED_CROPS = ['Irish potatoes', 'Maize', 'Beans'] as const

export type SupportedCrop = (typeof SUPPORTED_CROPS)[number]
