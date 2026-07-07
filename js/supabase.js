// Inicialización del cliente Supabase
// Reemplaza "TU_CLAVE_ANON_AQUI" con la clave 'anon public' de tu proyecto
const supabaseUrl = 'https://cwhhrewolvsxgeaoapqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3aGhyZXdvbHZzeGdlYW9hcHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNzQ5MTIsImV4cCI6MjA5ODk1MDkxMn0.Z3Y0mcSatohTZqR2NNgCAMxZP1_bDYwlXejdwXMYKlo'; 

// Se asume que el SDK de Supabase se carga globalmente vía CDN en el HTML
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

export default supabase;
