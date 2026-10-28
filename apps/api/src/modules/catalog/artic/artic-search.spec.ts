import { describe, expect, it } from 'vitest';
import { articSearchBody } from './artic-search.js';

describe('articSearchBody', () => {
  const body = articSearchBody('van gogh', 2, 12);

  it('requires every word to match instead of only ranking by them', () => {
    const [match] = body.query.bool.must;
    expect(match?.multi_match).toMatchObject({ query: 'van gogh', operator: 'and' });
  });

  it('keeps only public-domain works', () => {
    expect(body.query.bool.filter).toEqual([{ term: { is_public_domain: true } }]);
  });

  it('asks for the requested page with the lean field list', () => {
    expect(body).toMatchObject({ page: 2, limit: 12 });
    expect(body.fields).toContain('image_id');
  });
});
