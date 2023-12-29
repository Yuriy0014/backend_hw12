import { SortDirection } from '..';
import { BlogViewModel } from '../view/blog';

export type BlogInputModel = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type BlogPostInputModel = {
  title: string;
  shortDescription: string;
  content: string;
};

export type BlogQueryParams = {
  searchNameTerm?: string | null;
  sortBy?: keyof BlogViewModel | null;
  sortDirection?: SortDirection;
  pageNumber?: number;
  pageSize?: number;
};
