import { describe, expect, it } from 'vitest';
import { buildGalleryStoragePath, normalizeText, slugifyText } from '../constants/gallery';
import { getDefaultImageName, summarizeGalleryImages } from './gallery';

describe('gallery utilities', () => {
  it('normalizes accents and punctuation for slugs', () => {
    expect(normalizeText('  ¿Quién   llegó?  ')).toBe('¿Quién llegó?');
    expect(slugifyText('¿Quién llegó?')).toBe('quien-llego');
  });

  it('builds a deterministic storage path', () => {
    expect(buildGalleryStoragePath('Canino Feliz.png', new Date('2026-04-08T10:00:00.000Z'))).toBe(
      'galeria/2026-04-08T10-00-00.000Z-canino-feliz.png',
    );
  });

  it('derives default names and summarizes images by category relation', () => {
    expect(getDefaultImageName('¿Mi foto increíble?.jpg')).toBe('¿Mi foto increíble?');

    expect(
      summarizeGalleryImages([
        {
          id: 1,
          nombre: 'Luna',
          categoria_id: 2,
          fecha: '2026-04-08',
          url: 'https://example.com/luna.jpg',
          created_at: '2026-04-08T10:00:00.000Z',
          categoria: {
            id: 2,
            nombre: 'Rescates',
            slug: 'rescates',
            activa: true,
          },
        },
        {
          id: 2,
          nombre: 'Max',
          categoria_id: 1,
          fecha: '2026-04-07',
          url: 'https://example.com/max.jpg',
          created_at: '2026-04-07T10:00:00.000Z',
          categoria: {
            id: 1,
            nombre: 'Adopciones',
            slug: 'adopciones',
            activa: true,
          },
        },
      ]),
    ).toEqual({
      total: 2,
      latest: {
        id: 1,
        nombre: 'Luna',
        categoria_id: 2,
        fecha: '2026-04-08',
        url: 'https://example.com/luna.jpg',
        created_at: '2026-04-08T10:00:00.000Z',
        categoria: {
          id: 2,
          nombre: 'Rescates',
          slug: 'rescates',
          activa: true,
        },
      },
      categories: {
        Rescates: 1,
        Adopciones: 1,
      },
    });
  });
});
