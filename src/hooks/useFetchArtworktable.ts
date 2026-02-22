import { useState, useCallback } from 'react';
import { Artwork, ApiResponse } from '../types';

const FIELDS = 'id,title,place_of_origin,artist_display,inscriptions,date_start,date_end';
const API_BASE = 'https://api.artic.edu/api/v1/artworks';

interface UseFetchArtworksResult {
  artworks: Artwork[];
  totalRecords: number;
  loading: boolean;
  fetchPage: (page: number) => Promise<void>;
}

export function useFetchArtworks(): UseFetchArtworksResult {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPage = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const url = `${API_BASE}?page=${page}&fields=${FIELDS}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch artworks');
      const json: ApiResponse = await res.json();
      setArtworks(json.data);
      setTotalRecords(json.pagination.total);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { artworks, totalRecords, loading, fetchPage };
}
