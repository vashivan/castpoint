interface User {
  id: number,
  name: string, 
  sex: string,
  country: string,
  role: string,
  date_of_birth: string,
  height: number, 
  weight: number,
  video_url: string,
  pic_url: string,
  pic_public_id: string,
  biography: string,
  experience: string,
  email: string, 
  password: string,
  instagram?: string, 
  facebook?: string
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLogged: boolean;
  updateUser: (updatedUserData: Partial<User>) => void;
  refreshUser: () => void;
}

interface Review {
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