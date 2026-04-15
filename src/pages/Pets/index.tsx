import { useState } from 'react';
import Hero from './sections/Hero';
import Commitments from './sections/Commitments';
import PetGrid from './sections/PetGrid';
import ActionModal from './sections/ActionModal';
import CtaBanner from './sections/CtaBanner';
import type { Pet, Species } from './types';

const Pets = () => {
    const [search, setSearch] = useState('');
    const [species, setSpecies] = useState<Species>('all');
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [actionType, setActionType] = useState<'adopt' | 'sponsor'>('adopt');

    // TODO: reemplazar con fetch de Supabase
    const pets: Pet[] = [
        {
            id: '1',
            name: 'Luna',
            species: 'dog',
            breed: 'Mestiza',
            age_years: 2,
            age_months: 0,
            size: 'medium',
            gender: 'female',
            description: 'Luna es una perrita dulce y juguetona que adora los paseos y los mimos. Se lleva bien con niños y otros perros. Busca un hogar lleno de amor donde pueda dar todo lo que tiene.',
            image_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
            sound_url: null,
            is_available: true,
            is_urgent: false,
        },
        {
            id: '2',
            name: 'Mango',
            species: 'cat',
            breed: 'Común Europeo',
            age_years: 1,
            age_months: 3,
            size: 'small',
            gender: 'male',
            description: 'Mango llegó al refugio muy asustado, pero hoy es un gato curioso y cariñoso. Le encanta observar por la ventana y ronronear en el regazo de quien le dé confianza.',
            image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80',
            sound_url: null,
            is_available: true,
            is_urgent: false,
        },
        {
            id: '3',
            name: 'Thor',
            species: 'dog',
            breed: 'Labrador Mestizo',
            age_years: 0,
            age_months: 8,
            size: 'large',
            gender: 'male',
            description: 'Thor es un cachorro lleno de energía y amor. Aprende rápido y le encanta jugar con pelotas. Necesita un hogar activo que pueda canalizar toda su vitalidad.',
            image_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80',
            sound_url: null,
            is_available: true,
            is_urgent: true,
        },
        {
            id: '4',
            name: 'Canela',
            species: 'cat',
            breed: 'Siamés Mestiza',
            age_years: 3,
            age_months: 0,
            size: 'small',
            gender: 'female',
            description: 'Canela es tranquila, independiente y muy elegante. Prefiere los hogares sin mucho ruido. Ideal para personas que valoran la compañía serena y sin complicaciones.',
            image_url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&q=80',
            sound_url: null,
            is_available: true,
            is_urgent: false,
        },
        {
            id: '5',
            name: 'Rocky',
            species: 'dog',
            breed: 'Pitbull Mestizo',
            age_years: 4,
            age_months: 0,
            size: 'large',
            gender: 'male',
            description: 'Rocky carga con el estigma de su raza, pero en realidad es un perro noble, obediente y extremadamente cariñoso. Ha sido mal querido antes; ahora merece una familia de verdad.',
            image_url: 'https://images.unsplash.com/photo-1611003229204-9f8de0082e55?w=600&q=80',
            sound_url: null,
            is_available: true,
            is_urgent: true,
        },

    ];
    const loading = false;

    const filtered = pets.filter((p) => {
        const matchSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.breed.toLowerCase().includes(search.toLowerCase());
        const matchSpecies = species === 'all' || p.species === species;
        return matchSearch && matchSpecies;
    });

    const handleAdopt = (pet: Pet) => {
        setSelectedPet(pet);
        setActionType('adopt');
    };

    const handleSponsor = (pet: Pet) => {
        setSelectedPet(pet);
        setActionType('sponsor');
    };

    const clearFilters = () => {
        setSearch('');
        setSpecies('all');
    };

    return (
        <main className="min-h-screen bg-neutral-soft">
            <Hero
                search={search}
                setSearch={setSearch}
                species={species}
                setSpecies={setSpecies}
                total={filtered.length}
                loading={loading}
            />

            <Commitments />

            <section className="py-16 px-4">
                <div className="w-[70%] mx-auto">
                    <PetGrid
                        pets={filtered}
                        loading={loading}
                        onAdopt={handleAdopt}
                        onSponsor={handleSponsor}
                        onClearFilters={clearFilters}
                    />
                </div>
            </section>

            <CtaBanner />

            <ActionModal
                pet={selectedPet}
                type={actionType}
                onClose={() => setSelectedPet(null)}
            />
        </main>
    );
};

export default Pets;