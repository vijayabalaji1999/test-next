import { JSDOM } from 'jsdom';

const url ='https://masstamilan.dev'

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

export const parseSongs = (html, movieLink) => {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const rows = document.querySelectorAll('tr[itemprop="itemListElement"]');
    const allSongs = [];

    const imageSources = document.querySelectorAll('source');
    const imageUrl = imageSources.length
      ? imageSources[0].srcset
      : document.querySelector('img').src;

    const crumsDiv = document.querySelector('div.bcrumbs');
    const movieName = crumsDiv
      ? crumsDiv
          .querySelectorAll('span[itemprop="name"]')
          [
            crumsDiv.querySelectorAll('span[itemprop="name"]').length - 1
          ].textContent.trim()
      : '';

    const songLanguageElement = document.querySelector(
      'fieldset#movie-handle b + a'
    );
    const songLanguage = songLanguageElement
      ? songLanguageElement.textContent.trim()
      : '';

    rows.forEach((row) => {
      const tempDict = {};

      // Extract the song name
      const songNameTag = row.querySelector('a[title]');
      const songName = songNameTag ? songNameTag.textContent.trim() : '';

      // Extract the duration
      const durationRow = row.querySelector('span[itemprop="duration"]');
      const songDuration = durationRow ? durationRow.textContent.trim() : '';

      // Extract the download link(s)
      const downloadLinks = [];
      const downloadTags = row.querySelectorAll('a.dlink');
      downloadTags.forEach((tag) => {
        const link = tag.href;
        if (link) {
          downloadLinks.push(`${url}${link}`);
        }
      });

      tempDict.name = songName;
      tempDict.link = downloadLinks[0] || '';
      tempDict.movie_name = movieName;
      tempDict.movie_link = movieLink.startsWith('/')
        ? movieLink.slice(1)
        : movieLink;
      tempDict.movie_image = `${url}${imageUrl}`;
      tempDict.duration = songDuration;
      tempDict.language = songLanguage;

      allSongs.push(tempDict);
    });

    return {
      songs: allSongs,
      movie_name: movieName,
      image_url: `${url}${imageUrl}`,
    };
  } catch (error) {
    console.error('Error parsing songs:', error);
    return { songs: [], movie_name: '', image_url: '' };
  }
};
