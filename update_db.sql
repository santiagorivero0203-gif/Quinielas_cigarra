-- ==============================================================================
-- ACTUALIZACIÓN DE BASE DE DATOS - QUINIELAS LIGA CIGARRA
-- Fecha: 7 de Julio 2026
-- Descripción: Inserta/actualiza TODOS los partidos del Mundial 2026
--              con resultados reales hasta Octavos de Final.
--              Cuartos, Semifinales y Final quedan como 'pendiente'.
-- ==============================================================================

-- PASO 1: Limpiar partidos existentes para reinsertar con datos correctos
DELETE FROM public.predicciones; -- Preservar integridad referencial
DELETE FROM public.partidos;

-- Resetear la secuencia del ID para que empiece desde 1
ALTER SEQUENCE partidos_id_seq RESTART WITH 1;

-- ==============================================================================
-- DIECISEISAVOS DE FINAL (Round of 32) — 16 partidos FINALIZADOS
-- ==============================================================================

-- Partido 1: Alemania 1(3) vs Paraguay 1(4) → Paraguay gana en Penales
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Germany', 'Paraguay', '2026-06-20 18:00:00+00', 'finalizado', 'Paraguay', 'penales', '1 (3)', '1 (4)');

-- Partido 2: Francia 3 vs Suecia 0 → Francia gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('France', 'Sweden', '2026-06-20 21:00:00+00', 'finalizado', 'France', 'regular', '3', '0');

-- Partido 3: Sudáfrica 0 vs Canadá 1 → Canadá gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('South Africa', 'Canada', '2026-06-21 18:00:00+00', 'finalizado', 'Canada', 'regular', '0', '1');

-- Partido 4: Países Bajos 1(2) vs Marruecos 1(3) → Marruecos gana en Penales
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Netherlands', 'Morocco', '2026-06-21 21:00:00+00', 'finalizado', 'Morocco', 'penales', '1 (2)', '1 (3)');

-- Partido 5: Portugal 2 vs Croacia 1 → Portugal gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Portugal', 'Croatia', '2026-06-22 18:00:00+00', 'finalizado', 'Portugal', 'regular', '2', '1');

-- Partido 6: España 3 vs Austria 0 → España gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Spain', 'Austria', '2026-06-22 21:00:00+00', 'finalizado', 'Spain', 'regular', '3', '0');

-- Partido 7: EE.UU. 2 vs Bosnia 0 → EE.UU. gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('USA', 'Bosnia and Herzegovina', '2026-06-23 18:00:00+00', 'finalizado', 'USA', 'regular', '2', '0');

-- Partido 8: Bélgica 3 vs Senegal 2 → Bélgica gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Belgium', 'Senegal', '2026-06-23 21:00:00+00', 'finalizado', 'Belgium', 'regular', '3', '2');

-- Partido 9: Brasil 2 vs Japón 1 → Brasil gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Brazil', 'Japan', '2026-06-24 18:00:00+00', 'finalizado', 'Brazil', 'regular', '2', '1');

-- Partido 10: Costa de Marfil 1 vs Noruega 2 → Noruega gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Ivory Coast', 'Norway', '2026-06-24 21:00:00+00', 'finalizado', 'Norway', 'regular', '1', '2');

-- Partido 11: México 2 vs Ecuador 0 → México gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Mexico', 'Ecuador', '2026-06-25 18:00:00+00', 'finalizado', 'Mexico', 'regular', '2', '0');

-- Partido 12: Inglaterra 2 vs RD Congo 1 → Inglaterra gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('England', 'DR Congo', '2026-06-25 21:00:00+00', 'finalizado', 'England', 'regular', '2', '1');

-- Partido 13: Argentina 3 vs Cabo Verde 2 → Argentina gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Argentina', 'Cape Verde', '2026-06-26 18:00:00+00', 'finalizado', 'Argentina', 'regular', '3', '2');

-- Partido 14: Australia 1(2) vs Egipto 1(4) → Egipto gana en Penales
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Australia', 'Egypt', '2026-06-26 21:00:00+00', 'finalizado', 'Egypt', 'penales', '1 (2)', '1 (4)');

-- Partido 15: Suiza 2 vs Argelia 0 → Suiza gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Switzerland', 'Algeria', '2026-06-27 18:00:00+00', 'finalizado', 'Switzerland', 'regular', '2', '0');

-- Partido 16: Colombia 1 vs Ghana 0 → Colombia gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Colombia', 'Ghana', '2026-06-27 21:00:00+00', 'finalizado', 'Colombia', 'regular', '1', '0');


-- ==============================================================================
-- OCTAVOS DE FINAL (Round of 16) — 8 partidos FINALIZADOS
-- ==============================================================================

-- Partido 17: Paraguay 0 vs Francia 1 → Francia gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Paraguay', 'France', '2026-07-01 18:00:00+00', 'finalizado', 'France', 'regular', '0', '1');

-- Partido 18: Canadá 0 vs Marruecos 3 → Marruecos gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Canada', 'Morocco', '2026-07-01 21:00:00+00', 'finalizado', 'Morocco', 'regular', '0', '3');

-- Partido 19: Portugal 0 vs España 1 → España gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Portugal', 'Spain', '2026-07-02 18:00:00+00', 'finalizado', 'Spain', 'regular', '0', '1');

-- Partido 20: EE.UU. 1 vs Bélgica 4 → Bélgica gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('USA', 'Belgium', '2026-07-02 21:00:00+00', 'finalizado', 'Belgium', 'regular', '1', '4');

-- Partido 21: Brasil 1 vs Noruega 2 → Noruega gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Brazil', 'Norway', '2026-07-03 18:00:00+00', 'finalizado', 'Norway', 'regular', '1', '2');

-- Partido 22: México 2 vs Inglaterra 3 → Inglaterra gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Mexico', 'England', '2026-07-03 21:00:00+00', 'finalizado', 'England', 'regular', '2', '3');

-- Partido 23: Argentina 3 vs Egipto 2 → Argentina gana en Tiempo Regular
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Argentina', 'Egypt', '2026-07-04 18:00:00+00', 'finalizado', 'Argentina', 'regular', '3', '2');

-- Partido 24: Suiza 0(4) vs Colombia 0(3) → Suiza gana en Penales
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado, resultado_ganador, forma_victoria, goles_local, goles_visitante)
VALUES ('Switzerland', 'Colombia', '2026-07-04 21:00:00+00', 'finalizado', 'Switzerland', 'penales', '0 (4)', '0 (3)');


-- ==============================================================================
-- CUARTOS DE FINAL — 4 partidos PENDIENTES
-- ==============================================================================

-- Partido 25: Francia vs Marruecos → 9 Jul 18:00
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado)
VALUES ('France', 'Morocco', '2026-07-09 18:00:00+00', 'pendiente');

-- Partido 26: España vs Bélgica → 10 Jul 18:00
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado)
VALUES ('Spain', 'Belgium', '2026-07-10 18:00:00+00', 'pendiente');

-- Partido 27: Noruega vs Inglaterra → 11 Jul 17:00
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado)
VALUES ('Norway', 'England', '2026-07-11 17:00:00+00', 'pendiente');

-- Partido 28: Argentina vs Suiza → 11 Jul 21:00
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado)
VALUES ('Argentina', 'Switzerland', '2026-07-11 21:00:00+00', 'pendiente');


-- ==============================================================================
-- SEMIFINALES — 2 partidos PENDIENTES
-- ==============================================================================

-- Partido 29: Ganador Q1 vs Ganador Q2 → 14 Jul 19:00
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado)
VALUES ('W97', 'W98', '2026-07-14 19:00:00+00', 'pendiente');

-- Partido 30: Ganador Q3 vs Ganador Q4 → 15 Jul 19:00
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado)
VALUES ('W99', 'W100', '2026-07-15 19:00:00+00', 'pendiente');


-- ==============================================================================
-- FINAL Y TERCER PUESTO — PENDIENTES
-- ==============================================================================

-- Partido 31: Final → 19 Jul 19:00
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado)
VALUES ('W101', 'W102', '2026-07-19 19:00:00+00', 'pendiente');

-- Partido 32: Tercer Puesto → 18 Jul 17:00
INSERT INTO public.partidos (equipo_local, equipo_visitante, fecha_inicio, estado)
VALUES ('L101', 'L102', '2026-07-18 17:00:00+00', 'pendiente');


-- ==============================================================================
-- VERIFICACIÓN
-- ==============================================================================
-- Ejecutar para confirmar que se insertaron correctamente:
-- SELECT id, equipo_local, equipo_visitante, estado, resultado_ganador, goles_local, goles_visitante FROM public.partidos ORDER BY id;
