import axios from 'axios';
import { parseMovies } from './helper';

const url = process.env.NEXT_PUBLIC_API_URL;

async function fetchPageContent(pageUrl) {
  try {
    const response = await axios.get(pageUrl);
    if (response.status !== 200) {
      return [];
    }
    return parseMovies(response.data);
  } catch (error) {
    console.error('Error fetching page content:', error);
    return [];
  }
}

export default async function handler(req, res) {
  const { action, page } = req.query;

  if (!page) {
    res.status(400).json({ error: 'Page parameter is required' });
    return;
  }

  const actionPage = parseInt(page, 10);
  const actionUrl =
    action === 'next' || action === 'prev'
      ? `${url}/tamil-songs?page=${actionPage}`
      : `${url}/tamil-songs?page=${page}`;

  const movies = await fetchPageContent(actionUrl);
  res.status(200).json(movies);
}
