export const SUPPORTED_CROPS = ['Irish potatoes', 'Maize', 'Beans'] as const
// The portal exposes only crops with an active multiview ML model. Add a crop
// here only after its dedicated model has been trained and enabled by the API.
export const DISEASE_DETECTION_CROPS = ['Maize'] as const

export type SupportedCrop = (typeof SUPPORTED_CROPS)[number]
