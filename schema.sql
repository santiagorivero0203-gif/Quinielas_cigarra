-- ==============================================================================
-- QUINIELAS MUNDIAL 2026 - LIGA CIGARRA - SUPABASE SCHEMA
-- ==============================================================================

-- 1. EXTENSIÓN PARA UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. TABLA: perfiles (Perfiles de Usuario)
-- ==========================================
CREATE TABLE public.perfiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad para Perfiles
CREATE POLICY "Lectura pública de perfiles" ON public.perfiles
    FOR SELECT USING (true);

-- Permite que un usuario cree su propio perfil al registrarse
CREATE POLICY "Usuarios pueden crear su propio perfil" ON public.perfiles
    FOR INSERT WITH CHECK (auth.uid() = id);
    
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.perfiles
    FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- 3. TABLA: partidos
-- ==========================================
CREATE TYPE partido_estado AS ENUM ('pendiente', 'finalizado');
CREATE TYPE partido_forma_victoria AS ENUM ('regular', 'prorroga', 'penales');

CREATE TABLE public.partidos (
    id SERIAL PRIMARY KEY,
    equipo_local TEXT NOT NULL,
    equipo_visitante TEXT NOT NULL,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_curso', 'finalizado')),
    resultado_ganador TEXT, 
    forma_victoria partido_forma_victoria,
    goles_local TEXT,
    goles_visitante TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.partidos ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad para Partidos
CREATE POLICY "Cualquiera puede leer partidos" ON public.partidos
    FOR SELECT USING (true);

-- ==========================================
-- 4. TABLA: predicciones
-- ==========================================
CREATE TABLE public.predicciones (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
    partido_id INT REFERENCES public.partidos(id) ON DELETE CASCADE,
    prediccion_ganador TEXT NOT NULL,
    prediccion_forma_victoria partido_forma_victoria,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Restricción para un solo voto por usuario y partido
    UNIQUE(usuario_id, partido_id)
);
ALTER TABLE public.predicciones ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad para Predicciones (Reglas del Muletto y Ventanas)
CREATE POLICY "Cualquiera puede ver las predicciones" ON public.predicciones
    FOR SELECT USING (true);

CREATE POLICY "Usuarios solo pueden insertar si el partido está pendiente" ON public.predicciones
    FOR INSERT WITH CHECK (
        auth.uid() = usuario_id 
        AND 
        EXISTS (
            SELECT 1 FROM public.partidos 
            WHERE id = partido_id AND estado = 'pendiente'
        )
    );

-- Artículo 6: Ley del Respeto al Muletto (No se permiten modificaciones)
-- No hay política de UPDATE para predicciones, lo que deniega implícitamente cualquier edición.

-- ==========================================
-- 5. FUNCIÓN RPC: Tabla de Posiciones
-- ==========================================
-- Esta función calcula los puntos SOLAMENTE si el usuario acertó AL EQUIPO Y A LA FORMA DE VICTORIA.
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
    usuario_id UUID,
    nombre_jugador TEXT,
    aciertos_m1 INT,
    aciertos_m2 INT,
    aciertos_m3 INT,
    aciertos_m4 INT,
    puntos_totales INT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS usuario_id,
        p.nombre AS nombre_jugador,
        COALESCE(SUM(CASE WHEN pa.id = 1 AND pr.prediccion_ganador = pa.resultado_ganador THEN 1 ELSE 0 END), 0)::INT AS aciertos_m1,
        COALESCE(SUM(CASE WHEN pa.id = 2 AND pr.prediccion_ganador = pa.resultado_ganador THEN 1 ELSE 0 END), 0)::INT AS aciertos_m2,
        COALESCE(SUM(CASE WHEN pa.id = 3 AND pr.prediccion_ganador = pa.resultado_ganador THEN 1 ELSE 0 END), 0)::INT AS aciertos_m3,
        COALESCE(SUM(CASE WHEN pa.id = 4 AND pr.prediccion_ganador = pa.resultado_ganador THEN 1 ELSE 0 END), 0)::INT AS aciertos_m4,
        -- Sumatoria dinámica: suma puntos basados en cómo terminó el partido (1 normal, 2 prorroga, 3 penales)
        -- SOLO se dan los puntos si el usuario acertó el GANADOR del partido.
        COALESCE(SUM(
            CASE 
                WHEN pr.prediccion_ganador = pa.resultado_ganador THEN 
                    CASE 
                        WHEN pa.forma_victoria = 'regular' THEN 1
                        WHEN pa.forma_victoria = 'prorroga' THEN 2
                        WHEN pa.forma_victoria = 'penales' THEN 3
                        ELSE 0
                    END
                ELSE 0 
            END
        ), 0)::INT AS puntos_totales
    FROM 
        public.perfiles p
    LEFT JOIN 
        public.predicciones pr ON p.id = pr.usuario_id
    LEFT JOIN 
        public.partidos pa ON pr.partido_id = pa.id AND pa.estado = 'finalizado'
    GROUP BY 
        p.id, p.nombre
    ORDER BY 
        puntos_totales DESC, nombre_jugador ASC;
END;
$$;
