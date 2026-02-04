
import { Business } from '../types';

const API_URL = 'https://data.lacity.org/resource/r4uk-afju.json';
const ZIP_CODES = ['90046', '90068', '90069'];

export const fetchBusinesses = async (limit: number = 5000): Promise<Business[]> => {
  // Use starts_with to match zip codes like '90046-1234'
  const zipQuery = ZIP_CODES.map(zip => `starts_with(zip_code, '${zip}')`).join(' OR ');
  
  // Construct the SoQL query
  // We explicitly check for location and exclude rows where location is missing or coordinates are zero
  const query = `?$where=(${zipQuery}) AND location IS NOT NULL&$limit=${limit}&$order=location_start_date DESC`;
  
  try {
    const response = await fetch(`${API_URL}${query}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`Fetched ${data.length} businesses for zips: ${ZIP_CODES.join(', ')}`);
    return data as Business[];
  } catch (error) {
    console.error('Failed to fetch business data:', error);
    return [];
  }
};
