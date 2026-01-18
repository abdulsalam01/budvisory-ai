export const getLocationLabel = (city?: string, region?: string) => {
  if (city && region) {
    return `${city}, ${region}`;
  }
  if (city) {
    return city;
  }
  if (region) {
    return region;
  }
  return "Current location";
};
