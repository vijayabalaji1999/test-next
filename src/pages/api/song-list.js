import axios from 'axios';
import { parseMovies, parseSongs } from './helper';

const url = 'https://masstamilan.dev';

async function fetchSongList(pageUrl) {
  try {
    const response = await axios.get(pageUrl);
    if (response.status !== 200) {
      return [];
    }
    const pageMovies = parseMovies(response.data);

    let songs = [];
    for (const movie of pageMovies) {
      const movieResponse = await axios.get(`${url}/${movie.link}`);
      if (movieResponse.status !== 200) {
        continue;
      }
      const movieSongs = parseSongs(movieResponse.data, movie.link);
      songs = [...songs, ...movieSongs.songs];
    }
    return songs;
  } catch (error) {
    console.error('Error fetching song list:', error);
    return [];
  }
}

export default async function handler(req, res) {
  const { page, random_page } = req.query;

  if (page) {
    const songs = await fetchSongList(`${url}/tamil-songs?page=${page}`);
    res.status(200).json(songs);
    return;
  }

  if (random_page) {
    const response = await axios.get(`${url}/tamil-songs?page=${random_page}`);
    if (response.status !== 200) {
      res.status(200).json([]);
      return;
    }

    const movies = parseMovies(response.data);
    let songs = [];
    for (const movie of movies) {
      const movieResponse = await axios.get(`${url}/${movie.link}`);
      if (movieResponse.status !== 200) {
        continue;
      }
      const movieSongs = parseSongs(movieResponse.data, movie.link);
      songs = [...songs, ...movieSongs.songs];
      if (songs.length >= 10) {
        break;
      }
    }

    res.status(200).json(songs);
    return;
  }

  res.status(400).json({ error: 'Invalid request' });
}
