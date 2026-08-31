export const featureFlags = {
  enableDeveloperSupport: process.env.NEXT_PUBLIC_ENABLE_DEVELOPER_SUPPORT === "true",
  enableCommunityChoiceAmounts:
    process.env.NEXT_PUBLIC_ENABLE_COMMUNITY_CHOICE_AMOUNTS === "true",
  enableBusinessClaims: process.env.NEXT_PUBLIC_ENABLE_BUSINESS_CLAIMS === "true",
  enableExternalBarcodeLookup:
    process.env.NEXT_PUBLIC_ENABLE_EXTERNAL_BARCODE_LOOKUP === "true",
  enableAiClassificationAssist:
    process.env.NEXT_PUBLIC_ENABLE_AI_CLASSIFICATION_ASSIST === "true",
  enableLocationDiscovery: process.env.NEXT_PUBLIC_ENABLE_LOCATION_DISCOVERY === "true"
};
