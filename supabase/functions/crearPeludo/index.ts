import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // Configuración con la llave
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Datos que se reciben del formulario
    const formData = await req.formData();
    const archivo = formData.get('foto') as File;
    const nombre = formData.get('nombre');
    const sexo = formData.get('sexo');
    const edad = formData.get('edad');
    const caracteristicas = formData.get('caracteristicas');
    const especie = formData.get('especie');
    const peso= formData.get('peso');

    // sube la imagen al storage
    const nombreArchivo = `${Date.now()}_${archivo.name}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('fotos-peludos')
      .upload(nombreArchivo, archivo);

    if (storageError) throw storageError;

    // obtiene la url
    const { data: urlData } = supabase.storage
      .from('fotos-peludos')
      .getPublicUrl(nombreArchivo);

    // hace insert en la tabla peludos
    const { data: peludo, error: peludoError } = await supabase
      .from('peludos')
      .insert([{ nombre, sexo, edad, caracteristicas, especie, peso }])
      .select()
      .single();

    if (peludoError) throw peludoError;

    // inserta en la tabla imágenes
    await supabase
      .from('imagenes')
      .insert([{ id_referencia: peludo.id, url: urlData.publicUrl }]);

    return new Response(JSON.stringify({ mensaje: "Peludo guardado exitosamente" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});