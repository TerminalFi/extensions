import { getPreferenceValues } from '@raycast/api';

interface Preferences {
  locations: string;
}

export const getPreferences = (): Preferences => {
  return getPreferenceValues<Preferences>();
};