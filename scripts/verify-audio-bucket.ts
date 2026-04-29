/**
 * Script para verificar y configurar el bucket de sonidos de peludos en Supabase.
 * Uso: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/verify-audio-bucket.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Faltan variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function verifyAndSetupBucket() {
    try {
        console.log('Verificando bucket de sonidos...');
        
        // Intentar obtener información del bucket
        const { data: buckets, error: listError } = await adminClient.storage.listBuckets();
        
        if (listError) {
            console.error('Error al listar buckets:', listError);
            return;
        }
        
        const soundBucket = buckets?.find(b => b.name === 'sonidos-peludos');
        
        if (!soundBucket) {
            console.log('Bucket "sonidos-peludos" no existe. Creando...');
            const { data: created, error: createError } = await adminClient.storage.createBucket(
                'sonidos-peludos',
                {
                    public: true,
                    fileSizeLimit: 10485760, // 10MB
                }
            );
            
            if (createError) {
                console.error('Error al crear bucket:', createError);
                return;
            }
            
            console.log('OK: Bucket "sonidos-peludos" creado exitosamente');
        } else {
            console.log('OK: Bucket "sonidos-peludos" ya existe');
            console.log('   - ID:', soundBucket.id);
            console.log('   - Es publico:', soundBucket.public);
        }
        
        // Verificar que se puede subir un archivo de prueba
        console.log('\nProbando subida de archivo...');
        const testFile = new File(['test audio data'], 'test.mp3', { type: 'audio/mpeg' });
        const testPath = `test/${Date.now()}.mp3`;
        
        const { error: uploadError } = await adminClient.storage
            .from('sonidos-peludos')
            .upload(testPath, testFile);
        
        if (uploadError) {
            console.error('Error al subir archivo de prueba:', uploadError);
            return;
        }
        
        console.log('OK: Archivo de prueba subido exitosamente');
        
        // Obtener URL publica
        const { data: urlData } = adminClient.storage
            .from('sonidos-peludos')
            .getPublicUrl(testPath);
        
        if (urlData?.publicUrl) {
            console.log('OK: URL publica disponible:', urlData.publicUrl);
        }
        
        // Limpiar archivo de prueba
        const { error: deleteError } = await adminClient.storage
            .from('sonidos-peludos')
            .remove([testPath]);
        
        if (!deleteError) {
            console.log('OK: Archivo de prueba eliminado');
        }
        
        console.log('\nTodo esta configurado correctamente para audio de peludos!');
        
    } catch (err) {
        console.error('Error inesperado:', err);
    }
}

verifyAndSetupBucket();
