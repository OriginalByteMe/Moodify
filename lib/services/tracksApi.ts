import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { SpotifyTrack } from '@/app/utils/interfaces'

export const tracksApi = createApi({
  reducerPath: 'tracksApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  tagTypes: ['Track'],
  endpoints: (builder) => ({
    getTrackById: builder.query<SpotifyTrack | null, string>({
      query: (id) => `api/track/${encodeURIComponent(id)}`,
      providesTags: (result, _error, id) => [{ type: 'Track', id }],
      keepUnusedDataFor: 60 * 60 * 24, // 24h
    }),
  }),
})

export const { useGetTrackByIdQuery } = tracksApi

