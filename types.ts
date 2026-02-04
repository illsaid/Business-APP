
export interface BusinessLocation {
  latitude: string;
  longitude: string;
}

export interface Business {
  location_account: string;
  business_name: string;
  dba_name: string;
  street_address: string;
  city: string;
  zip_code: string;
  location_description: string;
  primary_naics_description: string;
  naics: string;
  council_district: string;
  location_start_date: string;
  location: BusinessLocation | null;
}

export interface Stats {
  total: number;
  topIndustries: { name: string; value: number }[];
  zipDistribution: { name: string; value: number }[];
}
