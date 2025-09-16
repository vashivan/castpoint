export interface User {
  id: number,
  first_name: string,
  second_name: string,
  country_of_birth: string,
  nationality: string,
  phone: string,
  name: string, 
  sex: string,
  country: string,
  role: string,
  date_of_birth: string,
  height: string | number, 
  weight: string | number,
  video_url: string,
  pic_url: string,
  pic_public_id: string,
  biography: string,
  experience: string,
  email: string, 
  password: string,
  password2: string,
  instagram?: string, 
  facebook?: string,
  resume_url?: string,
  skills?: string
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLogged: boolean;
  updateUser: (updatedUserData: Partial<User>) => void;
  refreshUser: () => void;
}

export interface Review {
  id: number;
  artist_id: number;
  artist_name: string;
  artist_instagram: string;
  company_name: string;
  position: string;
  place_of_work: string;
  content: string;
  created_at: string;
};

export type Job = {
  id: number;
  title: string;
  company_name: string;
  location?: string;
  contract_type?: 'short' | 'medium' | 'long';
  salary_from?: number | null;
  salary_to?: number | null;
  currency?: string;
  description?: string;
};