import { useEffect, useState } from 'react';
import Hero from './sections/Hero';
import Commitments from './sections/Commitments';
import PetGrid from './sections/PetGrid';
import ActionModal from './sections/ActionModal';
import CtaBanner from './sections/CtaBanner';
import type { Pet, Species } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

/** Mapea un peludo de la Edge Function al tipo Pet que usa la UI */
function mapPeludoToPet(p: {
    id: number;
    nombre: string;
    sexo: 'macho' | 'hembra';
    edad: number;           // en meses
    caracteristicas: string;
    especie: string;
    peso: number | null;
    imagenes?: { id: number; url: string }[];
}): Pet {
    const especieLower = p.especie.toLowerCase();
    const species: Pet['species'] =
        especieLower.includes('perro') || especieLower.includes('dog')
            ? 'dog'
            : especieLower.includes('gato') || especieLower.includes('cat')
                ? 'cat'
                : 'other';

    const age_years = Math.floor(p.edad / 12);
    const age_months = p.edad % 12;

    const size: Pet['size'] =
        p.peso == null
            ? 'medium'
            : p.peso < 10
                ? 'small'
                : p.peso < 25
                    ? 'medium'
                    : 'large';

    return {
        id: String(p.id),
        name: p.nombre,
        species,
        breed: p.especie,
        age_years,
        age_months,
        size,
        gender: p.sexo === 'macho' ? 'male' : 'female',
        description: p.caracteristicas,
        image_url: p.imagenes?.[0]?.url ?? '',
        sound_url: null,
        is_available: true,
        is_urgent: false,
    };
}

// ─── Component ────────────────────────────────────────────────────────────────

const Pets = () => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [species, setSpecies] = useState<Species>('all');
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [actionType, setActionType] = useState<'adopt' | 'sponsor'>('adopt');

    useEffect(() => {
        async function fetchPeludos() {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (species !== 'all') params.set('especie', species === 'dog' ? 'perro' : 'gato');
                if (search.trim()) params.set('search', search.trim());

                const res = await fetch(
                    `${SUPABASE_URL}/functions/v1/get-peludos?${params.toString()}`
                );
                const json = await res.json() as { data?: unknown[]; error?: string };
                if (!res.ok) throw new Error(json.error ?? 'Error al cargar peludos.');

                const mapped = (json.data ?? []).map((p) =>
                    mapPeludoToPet(p as Parameters<typeof mapPeludoToPet>[0])
                );
                setPets(mapped);
            } catch (err) {
                console.error('Error cargando peludos:', err);
                setPets([]);
            } finally {
                setLoading(false);
            }
        }

        void fetchPeludos();
    }, [species, search]);

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