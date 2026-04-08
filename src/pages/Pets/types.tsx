export type Species = 'all' | 'dog' | 'cat' | 'other';

export interface Pet {
    id: string;
    name: string;
    species: 'dog' | 'cat' | 'other';
    breed: string;
    age_years: number;
    age_months: number;
    size: 'small' | 'medium' | 'large';
    gender: 'male' | 'female';
    description: string;
    image_url: string;
    sound_url: string | null;
    is_available: boolean;
    is_urgent: boolean;
}