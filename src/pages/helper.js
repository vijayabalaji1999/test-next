import { JSDOM } from 'jsdom';
import axios from 'axios';

const url = process.env.NEXT_PUBLIC_API_URL;

export const parseMovies = (html) => {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const movieDivs = document.querySelectorAll('div.a-i');

    const movies = Array.from(movieDivs).map((movieDiv) => {
      const tempDict = {};

      // Extract movie link
      const linkTag = movieDiv.querySelector('a');
      tempDict.link = linkTag ? linkTag.href : '';

      // Extract movie name
      const movieNameTag = movieDiv.querySelector('h2');
      tempDict.name = movieNameTag ? movieNameTag.textContent.trim() : '';

      // Extract movie image URL
      const imageSources = movieDiv.querySelectorAll('source');
      tempDict.image = imageSources.length
        ? `${url}${imageSources[0].srcset}`
        : `${url}${document.querySelector('img').src}`;

      return tempDict;
    });

    return movies;
  } catch (error) {
    console.error('Error parsing movies:', error);
    return [];
  }
};
