import { getPreferenceValues } from '@raycast/api';

interface Preferences {
  locations: string;
  load_remote_html: boolean;
}

export const getPreferences = (): Preferences => {
  return getPreferenceValues<Preferences>();
};