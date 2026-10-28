import { ARTIC_FIELDS } from './artic.mapper.js';

/**
 * Searched fields and their weight. Who and what the work is weigh most; style, subject and
 * classification let a theme ("landscape", "still life") find works that don't name it.
 */
const SEARCHED_FIELDS = [
  'title^3',
  'artist_title^3',
  'place_of_origin^2',
  'term_titles',
  'style_titles',
  'subject_titles',
  'classification_titles',
];

/**
 * Body of POST /artworks/search. The museum's plain `q` parameter only ranks: it returns every
 * public-domain work, matches first, then the rest of the collection, so a word with no match
 * (or the tail of any search) shows unrelated art. Here every word must match one of the
 * fields, so a search with no match comes back empty and the page count is real.
 */
export function articSearchBody(query: string, page: number, pageSize: number) {
  return {
    query: {
      bool: {
        must: [
          {
            multi_match: {
              query,
              type: 'cross_fields',
              operator: 'and',
              fields: SEARCHED_FIELDS,
            },
          },
        ],
        filter: [{ term: { is_public_domain: true } }],
      },
    },
    fields: ARTIC_FIELDS,
    page,
    limit: pageSize,
  };
}
