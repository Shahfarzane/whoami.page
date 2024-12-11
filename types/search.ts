import { AuthorInfo, Post } from '@/types';
import { Project, UserExperience } from '@/types/user';

export type FilterType = 'all' | 'users' | 'posts' | 'projects' | 'experiences';

export interface SearchCursor {
  all: string | null;
  users: string | null;
  posts: string | null;
  projects: string | null;
  experiences: string | null;
}

export interface SearchUser extends AuthorInfo {
  email: string;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
  onboardingComplete: boolean;
  description: string | null;
  jobTitle: string | null;
}

export interface SearchResult {
  users: SearchUser[];
  posts: Post[];
  projects: Project[];
  experiences: UserExperience[];
  nextCursor: SearchCursor;
}

export type SearchItem = SearchUser | Post | Project | UserExperience;

export interface SearchProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  searchTerm: string;
  handleSearchChange: (value: string) => void;
  activeFilter: FilterType;
  handleFilterChange: (value: FilterType) => void;
  searchResults: SearchItem[];
  handleCloseModal: () => void;
  isLoading: boolean;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  loadNextPage: () => void;
}
