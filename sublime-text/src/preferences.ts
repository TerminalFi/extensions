import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  project_location: string;
}

export const getPreferences = (): Preferences => {
  return getPreferenceValues<Preferences>();
};