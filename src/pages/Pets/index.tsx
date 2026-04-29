import { useEffect, useState } from 'react';
import Hero from './sections/Hero';
import Commitments from './sections/Commitments';
import PetGrid from './sections/PetGrid';
import ActionModal from './sections/ActionModal';
import CtaBanner from './sections/CtaBanner';
import type { Pet, Species } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

function mapPeludoToPet(p: {
    id: number;
    nombre: string;
    sexo: 'macho' | 'hembra';
    edad: number;
    caracteristicas: string;
    especie: string;
    peso: number | null;
    esterilizado: boolean;
    vacunado: boolean;
    desparasitado: boolean;
    especies?: { id: number; nombre: string };
    razas?: { id: number; nombre: string };
    imagenes?: { id: number; url: string }[];
    sonido_url?: string;
}): Pet {
    const speciesName = p.especies?.nombre || p.especie || 'Otra';
    const breedName = p.razas?.nombre || 'Criollo';
    
    const species: Pet['species'] =
        speciesName.toLowerCase().includes('perro') || speciesName.toLowerCase().includes('dog') ? 'dog'
            : speciesName.toLowerCase().includes('gato') || speciesName.toLowerCase().includes('cat') ? 'cat'
                : 'other';

    const age_years = Math.floor(p.edad / 12);
    const age_months = p.edad % 12;
    const size: Pet['size'] =
        p.peso == null ? 'medium' : p.peso < 10 ? 'small' : p.peso < 25 ? 'medium' : 'large';

    const soundUrl = p.sonido_url || (p as any).sound_url || null;

    return {
        id: String(p.id),
        name: p.nombre,
        species,
        species_name: speciesName,
        breed: breedName,
        age_years,
        age_months,
        size,
        gender: p.sexo === 'macho' ? 'male' : 'female',
        description: p.caracteristicas,
        image_url: p.imagenes?.[0]?.url ?? '',
        sound_url: soundUrl,
        is_available: true,
        is_urgent: false,
        esterilizado: p.esterilizado,
        vacunado: p.vacunado,
        desparasitado: p.desparasitado,
        peso_kg: p.peso,
    };
}

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
                if (species === 'dog') params.set('especie', 'perro');
                if (species === 'cat') params.set('especie', 'gato');
                if (search.trim()) params.set('search', search.trim());
                params.set('_t', Date.now().toString());

                const res = await fetch(`${SUPABASE_URL}/functions/v1/get-peludos?${params.toString()}`);
                const json = (await res.json()) as { data?: any[]; error?: string };
                if (!res.ok) throw new Error(json.error ?? 'Error al cargar peludos.');

                setPets((json.data ?? []).map((p) => mapPeludoToPet(p)));
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

    return (
        <main className="min-h-screen bg-neutral-soft">
            <Hero
                search={search} setSearch={setSearch}
                species={species} setSpecies={setSpecies}
                total={filtered.length} loading={loading}
            />
            <Commitments />
            <section className="py-16 px-4">
                <div className="w-[70%] mx-auto">
                    <PetGrid
                        pets={filtered} loading={loading}
                        onAdopt={(pet) => { setSelectedPet(pet); setActionType('adopt'); }}
                        onSponsor={(pet) => { setSelectedPet(pet); setActionType('sponsor'); }}
                        onClearFilters={() => { setSearch(''); setSpecies('all'); }}
                    />
                </div>
            </section>
            <CtaBanner />
            <ActionModal pet={selectedPet} type={actionType} onClose={() => setSelectedPet(null)} />
        </main>
    );
};

export default Pets;
