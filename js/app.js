import supabase from './supabase.js';
import { initAuth } from './auth.js';
import { exportLeaderboard, exportVotaciones } from './export.js';

/**
 * App principal de Quinielas Liga Cigarra.
 * Maneja las pestañas, carga los partidos, envía votos y genera el leaderboard.
 */

let currentUserId = null;
let leaderboardData = [];
let allPartidos = [];
let userPredictions = {}; // Ahora guardará un objeto con { ganador, forma }

// Diccionario de Banderas y Nombres en Español (todos los equipos del torneo)
const countriesInfo = {
    'Argentina': { flag: '🇦🇷', es: 'Argentina' },
    'Egypt': { flag: '🇪🇬', es: 'Egipto' },
    'Switzerland': { flag: '🇨🇭', es: 'Suiza' },
    'Colombia': { flag: '🇨🇴', es: 'Colombia' },
    'France': { flag: '🇫🇷', es: 'Francia' },
    'Morocco': { flag: '🇲🇦', es: 'Marruecos' },
    'Spain': { flag: '🇪🇸', es: 'España' },
    'Belgium': { flag: '🇧🇪', es: 'Bélgica' },
    'Norway': { flag: '🇳🇴', es: 'Noruega' },
    'England': { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', es: 'Inglaterra' },
    'Brazil': { flag: '🇧🇷', es: 'Brasil' },
    'Portugal': { flag: '🇵🇹', es: 'Portugal' },
    'Paraguay': { flag: '🇵🇾', es: 'Paraguay' },
    'Japan': { flag: '🇯🇵', es: 'Japón' },
    'Germany': { flag: '🇩🇪', es: 'Alemania' },
    'Netherlands': { flag: '🇳🇱', es: 'Países Bajos' },
    'Croatia': { flag: '🇭🇷', es: 'Croacia' },
    'Italy': { flag: '🇮🇹', es: 'Italia' },
    'USA': { flag: '🇺🇸', es: 'Estados Unidos' },
    'Mexico': { flag: '🇲🇽', es: 'México' },
    'Ecuador': { flag: '🇪🇨', es: 'Ecuador' },
    'Sweden': { flag: '🇸🇪', es: 'Suecia' },
    'South Africa': { flag: '🇿🇦', es: 'Sudáfrica' },
    'Canada': { flag: '🇨🇦', es: 'Canadá' },
    'Austria': { flag: '🇦🇹', es: 'Austria' },
    'Bosnia': { flag: '🇧🇦', es: 'Bosnia' },
    'Bosnia and Herzegovina': { flag: '🇧🇦', es: 'Bosnia y Herz.' },
    'Senegal': { flag: '🇸🇳', es: 'Senegal' },
    'Cote d\'Ivoire': { flag: '🇨🇮', es: 'Costa de Marfil' },
    'Ivory Coast': { flag: '🇨🇮', es: 'Costa de Marfil' },
    'DR Congo': { flag: '🇨🇩', es: 'RD Congo' },
    'Cape Verde': { flag: '🇨🇻', es: 'Cabo Verde' },
    'Australia': { flag: '🇦🇺', es: 'Australia' },
    'Algeria': { flag: '🇩🇿', es: 'Argelia' },
    'Ghana': { flag: '🇬🇭', es: 'Ghana' },
    // Placeholders para rondas futuras (Semifinales y Final)
    'W97': { flag: '🏳️', es: 'Gan. CF1' },
    'W98': { flag: '🏳️', es: 'Gan. CF2' },
    'W99': { flag: '🏳️', es: 'Gan. CF3' },
    'W100': { flag: '🏳️', es: 'Gan. CF4' },
    'W101': { flag: '🏳️', es: 'Gan. SF1' },
    'W102': { flag: '🏳️', es: 'Gan. SF2' },
    'L101': { flag: '🏳️', es: 'Perd. SF1' },
    'L102': { flag: '🏳️', es: 'Perd. SF2' },
};

function getCountry(name) {
    return countriesInfo[name] || { flag: '🏳️', es: name };
}

function getFormaVictoriaText(forma) {
    if(forma === 'regular') return '90m';
    if(forma === 'prorroga') return 'Prórroga';
    if(forma === 'penales') return 'Penales';
    return forma;
}

// Inicializar la app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const tabPartidos = document.getElementById('tab-partidos');
    const tabBracket = document.getElementById('tab-bracket');
    const tabLeaderboard = document.getElementById('tab-leaderboard');
    const tabMedia = document.getElementById('tab-media');
    const sectionPartidos = document.getElementById('section-partidos');
    const sectionBracket = document.getElementById('section-bracket');
    const sectionLeaderboard = document.getElementById('section-leaderboard');
    const sectionMedia = document.getElementById('section-media');
    const btnExport = document.getElementById('btn-export');

    initAuth((userId) => {
        currentUserId = userId;
        loadPartidos();
    });

    tabPartidos.addEventListener('click', () => switchTab('partidos'));
    tabBracket.addEventListener('click', () => switchTab('bracket'));
    tabLeaderboard.addEventListener('click', () => {
        switchTab('leaderboard');
        loadLeaderboard();
    });
    tabMedia.addEventListener('click', () => {
        switchTab('media');
        initSlider();
    });

    btnExport.addEventListener('click', async () => {
        btnExport.textContent = "Generando...";
        
        // Obtenemos todas las predicciones de Supabase con un JOIN
        const { data, error } = await supabase
            .from('predicciones')
            .select(`
                prediccion_ganador,
                prediccion_forma_victoria,
                perfiles (nombre),
                partidos (equipo_local, equipo_visitante)
            `);
            
        if (error) {
            alert("Error al obtener votaciones: " + error.message);
        } else {
            exportVotaciones(data);
        }
        
        btnExport.textContent = "⬇ Exportar Votaciones";
    });

    function switchTab(tab) {
        const allTabs = [tabPartidos, tabBracket, tabLeaderboard, tabMedia];
        const allSections = [sectionPartidos, sectionBracket, sectionLeaderboard, sectionMedia];

        allTabs.forEach(t => {
            t.classList.remove('text-[#00FF87]', 'border-[#00FF87]', 'border-b-2', 'shadow-[0_4px_10px_rgba(0,255,135,0.2)]');
            t.classList.add('text-[#8B949E]');
        });
        
        allSections.forEach(s => {
            s.classList.add('hidden');
            s.classList.remove('section-enter'); // Reiniciamos animación
        });

        // Limpiar clases de fondo del body
        document.body.classList.remove('bg-pos-partidos', 'bg-pos-bracket', 'bg-pos-leaderboard', 'bg-pos-media');

        const tabMap = {
            'partidos':    { tab: tabPartidos,    section: sectionPartidos,    bgClass: 'bg-pos-partidos' },
            'bracket':     { tab: tabBracket,     section: sectionBracket,     bgClass: 'bg-pos-bracket' },
            'leaderboard': { tab: tabLeaderboard, section: sectionLeaderboard, bgClass: 'bg-pos-leaderboard' },
            'media':       { tab: tabMedia,       section: sectionMedia,       bgClass: 'bg-pos-media' },
        };

        const selected = tabMap[tab];
        if (!selected) return;
        
        selected.section.classList.remove('hidden');
        // Forzar reflow para que la animación se reproduzca cada vez
        void selected.section.offsetWidth;
        selected.section.classList.add('section-enter');
        
        selected.tab.classList.add('text-[#00FF87]', 'border-[#00FF87]', 'border-b-2', 'shadow-[0_4px_10px_rgba(0,255,135,0.2)]');
        selected.tab.classList.remove('text-[#8B949E]');

        // Cambiar el fondo dinámicamente
        document.body.classList.add(selected.bgClass);

        if (tab === 'bracket') renderBracket(allPartidos, userPredictions);
    }

    // ==========================================
    // SLIDER DE MEDIA
    // ==========================================
    const playerImages = [
        './IMAGES/players/gettyimages-2240506681-612x612.jpg',
        './IMAGES/players/gettyimages-2259623257-612x612.jpg',
        './IMAGES/players/gettyimages-2268751469-612x612.jpg',
        './IMAGES/players/gettyimages-2276645122-612x612.jpg',
        './IMAGES/players/gettyimages-2277920167-612x612.jpg',
        './IMAGES/players/gettyimages-2279254710-612x612.jpg',
        './IMAGES/players/gettyimages-2280503529-612x612.jpg',
        './IMAGES/players/gettyimages-2280976434-612x612.jpg',
        './IMAGES/players/gettyimages-2284220982-612x612.jpg',
        './IMAGES/players/gettyimages-2284252185-612x612.jpg',
        './IMAGES/players/gettyimages-2284397096-612x612.jpg',
        './IMAGES/players/gettyimages-2284794314-612x612.jpg',
        './IMAGES/players/gettyimages-2284812576-612x612.jpg',
        './IMAGES/players/gettyimages-2284947322-612x612.jpg',
    ];

    let sliderIndex = 0;
    let sliderAutoPlay = null;
    let sliderInitialized = false;

    /**
     * Inicializa el slider de medias una sola vez.
     * Genera los slides, miniaturas y dots, y conecta los controles.
     */
    function initSlider() {
        if (sliderInitialized) { updateSlider(); return; }
        sliderInitialized = true;

        const track = document.getElementById('slider-track');
        const dots = document.getElementById('slider-dots');
        const thumbs = document.getElementById('slider-thumbnails');
        const counter = document.getElementById('slide-counter');
        const btnPrev = document.getElementById('slider-prev');
        const btnNext = document.getElementById('slider-next');
        const btnPlay = document.getElementById('slider-play');

        // Construir slides
        playerImages.forEach((src, i) => {
            // Slide principal
            const slide = document.createElement('div');
            slide.className = 'slide-item';
            slide.innerHTML = `<img src="${src}" alt="Jugador ${i + 1}" loading="lazy">`;
            track.appendChild(slide);

            // Dot
            const dot = document.createElement('button');
            dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goTo(i));
            dots.appendChild(dot);

            // Miniatura
            const thumb = document.createElement('div');
            thumb.className = 'slider-thumb' + (i === 0 ? ' active' : '');
            thumb.innerHTML = `<img src="${src}" alt="Miniatura ${i + 1}" loading="lazy">`;
            thumb.addEventListener('click', () => goTo(i));
            thumbs.appendChild(thumb);
        });

        counter.textContent = `1 / ${playerImages.length}`;

        // Controles
        btnPrev.addEventListener('click', () => goTo((sliderIndex - 1 + playerImages.length) % playerImages.length));
        btnNext.addEventListener('click', () => goTo((sliderIndex + 1) % playerImages.length));

        // Teclado
        document.addEventListener('keydown', (e) => {
            if (!sectionMedia.classList.contains('hidden')) {
                if (e.key === 'ArrowLeft') goTo((sliderIndex - 1 + playerImages.length) % playerImages.length);
                if (e.key === 'ArrowRight') goTo((sliderIndex + 1) % playerImages.length);
            }
        });

        // Auto-play
        btnPlay.addEventListener('click', () => {
            if (sliderAutoPlay) {
                clearInterval(sliderAutoPlay);
                sliderAutoPlay = null;
                btnPlay.textContent = '▶ Auto-play';
                btnPlay.classList.remove('bg-[#00FF87]', 'text-black');
            } else {
                sliderAutoPlay = setInterval(() => goTo((sliderIndex + 1) % playerImages.length), 3000);
                btnPlay.textContent = '⏸ Pausar';
                btnPlay.classList.add('bg-[#00FF87]', 'text-black');
            }
        });
    }

    /**
     * Mueve el slider al index dado y actualiza dots, miniaturas y contador.
     */
    function goTo(index) {
        sliderIndex = index;
        updateSlider();
    }

    function updateSlider() {
        const track = document.getElementById('slider-track');
        const counter = document.getElementById('slide-counter');
        if (!track) return;
        track.style.transform = `translateX(-${sliderIndex * 100}%)`;
        counter.textContent = `${sliderIndex + 1} / ${playerImages.length}`;
        document.querySelectorAll('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === sliderIndex));
        document.querySelectorAll('.slider-thumb').forEach((t, i) => t.classList.toggle('active', i === sliderIndex));
        // Scroll miniatura activa al centro
        const activeThumb = document.querySelectorAll('.slider-thumb')[sliderIndex];
        if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    async function loadPartidos() {
        sectionPartidos.innerHTML = '<div class="col-span-full text-center py-12 text-[#8B949E] font-medium">Cargando información...</div>';
        
        const { data: partidos, error } = await supabase
            .from('partidos')
            .select('*')
            .order('fecha_inicio', { ascending: true });

        if (error) {
            sectionPartidos.innerHTML = `<div class="col-span-full text-red-500 text-center py-12">Error cargando partidos: ${error.message}</div>`;
            return;
        }
        allPartidos = partidos;

        const { data: predicciones } = await supabase
            .from('predicciones')
            .select('partido_id, prediccion_ganador, prediccion_forma_victoria')
            .eq('usuario_id', currentUserId);

        userPredictions = {};
        if (predicciones) {
            predicciones.forEach(p => {
                userPredictions[p.partido_id] = {
                    ganador: p.prediccion_ganador,
                    forma: p.prediccion_forma_victoria
                };
            });
        }

        renderPartidos(allPartidos, userPredictions);
        if (!sectionBracket.classList.contains('hidden')) {
            renderBracket(allPartidos, userPredictions);
        }
    }

    function renderPartidos(partidos, userPreds) {
        if (!partidos || partidos.length === 0) {
            sectionPartidos.innerHTML = '<div class="col-span-full text-center py-12 text-[#8B949E] font-medium">No hay partidos disponibles. Esperando al admin.</div>';
            return;
        }

        sectionPartidos.innerHTML = '';
        
        // Ordenar: Pendientes primero, finalizados después
        const sortedPartidos = [...partidos].sort((a, b) => {
            if (a.estado === 'pendiente' && b.estado !== 'pendiente') return -1;
            if (a.estado !== 'pendiente' && b.estado === 'pendiente') return 1;
            return 0; // Mantener orden cronológico relativo
        });

        sortedPartidos.forEach(p => {
            const pred = userPreds[p.id];
            const isPending = p.estado === 'pendiente';
            const card = document.createElement('div');
            card.className = 'apple-card p-6 flex flex-col gap-5';
            
            const localInfo = getCountry(p.equipo_local);
            const visitInfo = getCountry(p.equipo_visitante);

            card.innerHTML = `
                <div class="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                    <span class="text-[#8B949E] font-medium">${new Date(p.fecha_inicio).toLocaleDateString()}</span>
                    <span class="px-2.5 py-1 rounded-md text-[10px] md:text-[11px] font-bold tracking-wide uppercase ${isPending ? 'bg-[#8A2BE2]/20 text-[#8A2BE2] border border-[#8A2BE2]/50' : 'bg-white/10 text-[#8B949E]'}">
                        ${isPending ? 'Por Iniciar' : 'Finalizado'}
                    </span>
                </div>
                
                <!-- Layout responsivo para tarjetas PENDIENTES -->
                <div class="flex justify-between items-center mt-2">
                    <div class="flex-1 min-w-0 text-center md:text-right pr-2">
                        <p class="font-bold text-sm md:text-lg tracking-tight text-white truncate" title="${localInfo.es}">${localInfo.flag} ${localInfo.es}</p>
                    </div>
                    <div class="w-12 flex-shrink-0 text-center flex flex-col items-center justify-center">
                        ${!isPending && p.goles_local != null ? `
                            <span class="text-white font-black text-xl md:text-2xl tracking-tighter">${p.goles_local} <span class="text-[#8B949E] text-sm md:text-base">-</span> ${p.goles_visitante}</span>
                        ` : `<span class="text-[#8B949E] font-semibold text-xs md:text-sm">VS</span>`}
                    </div>
                    <div class="flex-1 min-w-0 text-center md:text-left pl-2">
                        <p class="font-bold text-sm md:text-lg tracking-tight text-white truncate" title="${visitInfo.es}">${visitInfo.flag} ${visitInfo.es}</p>
                    </div>
                </div>
                
                ${isPending ? `
                    <div class="mt-4" id="vote-container-${p.id}">
                        ${pred ? `
                            <div class="bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/30 p-3 rounded-xl text-center text-xs md:text-sm shadow-[0_0_15px_rgba(0,255,135,0.1)]">
                                Tu voto: <span class="font-bold text-white">${getCountry(pred.ganador).es}</span> en <span class="font-bold">${getFormaVictoriaText(pred.forma)}</span>
                                <p class="text-[#8B949E] text-[10px] mt-1">(Ley del Muletto: Bloqueado)</p>
                            </div>
                        ` : `
                            <p class="text-[11px] md:text-xs text-[#8B949E] text-center mb-3 font-medium">Elige al ganador de este encuentro</p>
                            <div class="flex gap-2">
                                <button onclick="window.elegirGanador(${p.id}, '${p.equipo_local}')" class="vote-btn flex-1 truncate text-xs md:text-sm py-2 px-1">${localInfo.es}</button>
                                <button onclick="window.elegirGanador(${p.id}, '${p.equipo_visitante}')" class="vote-btn flex-1 truncate text-xs md:text-sm py-2 px-1">${visitInfo.es}</button>
                            </div>
                        `}
                    </div>
                ` : `
                    <!-- Layout responsivo para tarjetas FINALIZADAS -->
                    <div class="mt-4 bg-[#0D1117] p-3 md:p-4 rounded-xl border border-white/10">
                        ${p.forma_victoria ? `<p class="text-[10px] md:text-xs text-center text-[#8A2BE2] font-semibold uppercase tracking-widest mb-2">Definido en ${getFormaVictoriaText(p.forma_victoria)}</p>` : ''}
                        
                        <div class="mt-2 pt-2 border-t border-white/5 text-center">
                        ${pred ? `
                            <p class="text-xs md:text-sm font-medium ${(pred.ganador === p.resultado_ganador) ? 'text-[#00FF87]' : 'text-red-400'}">
                                ${(pred.ganador === p.resultado_ganador) ? '✅' : '❌'} Tú votaste: ${getCountry(pred.ganador).es} (${getFormaVictoriaText(pred.forma)})
                            </p>
                        ` : `<p class="text-xs text-[#8B949E]">No participaste en este partido</p>`}
                        </div>
                    </div>
                `}
            `;
            sectionPartidos.appendChild(card);
        });
    }

    // Funciones globales para manejar el flujo de votación en dos pasos
    window.elegirGanador = (partidoId, ganador) => {
        const container = document.getElementById(`vote-container-${partidoId}`);
        const winnerInfo = getCountry(ganador);
        
        container.innerHTML = `
            <p class="text-[11px] md:text-xs text-[#8B949E] text-center mb-2 font-medium">¿Cómo ganará ${winnerInfo.es}?</p>
            <p class="text-[10px] text-[#00FF87]/80 text-center mb-3">Solo decoración. Los puntos se asignan según cómo termine el partido real.</p>
            <div class="grid grid-cols-1 gap-2 mb-2">
                <button onclick="window.votar(${partidoId}, '${ganador}', 'regular')" class="vote-btn w-full !py-2 text-sm">
                    ⏱️ 90 Minutos
                </button>
                <button onclick="window.votar(${partidoId}, '${ganador}', 'prorroga')" class="vote-btn w-full !py-2 text-sm">
                    ⏳ Prórroga
                </button>
                <button onclick="window.votar(${partidoId}, '${ganador}', 'penales')" class="vote-btn w-full !py-2 text-[#8A2BE2] hover:text-white border-[#8A2BE2]/50 hover:bg-[#8A2BE2] text-sm">
                    🎯 Penales
                </button>
            </div>
            <button onclick="window.cancelarVoto()" class="text-xs text-[#8B949E] hover:text-white w-full text-center mt-2">← Cancelar y elegir otro</button>
        `;
    };

    window.cancelarVoto = () => {
        loadPartidos(); // Simplemente recarga para reiniciar el estado UI
    };

    window.votar = async (partido_id, prediccion_ganador, prediccion_forma) => {
        if (!currentUserId) return;
        
        const { error } = await supabase
            .from('predicciones')
            .insert({
                usuario_id: currentUserId,
                partido_id: partido_id,
                prediccion_ganador: prediccion_ganador,
                prediccion_forma_victoria: prediccion_forma
            });

        if (error) {
            alert("Atención: " + (error.code === '23505' ? 'Ya enviaste una predicción para este partido.' : error.message));
        } else {
            loadPartidos();
        }
    };

    function renderBracket(partidos, userPreds) {
        const container = document.getElementById('bracket-container');
        // Distribuir partidos por ronda según orden de inserción
        let r32  = partidos.slice(0, 16);   // Dieciseisavos  (16 partidos)
        let r16  = partidos.slice(16, 24);  // Octavos        (8 partidos)
        let qf   = partidos.slice(24, 28);  // Cuartos        (4 partidos)
        let sf   = partidos.slice(28, 30);  // Semifinales    (2 partidos)
        let fin  = partidos.slice(30, 31);  // Final          (1 partido)

        /**
         * Construye una columna agrupando los partidos en pares.
         * Cada par genera un .bracket-pair con la línea vertical correcta.
         * @param {string} title - Título de la ronda
         * @param {Array}  matchArray - Partidos de la ronda
         * @param {number} requiredCount - Cantidad total de slots (incluyendo TBDs)
         * @param {boolean} isFinal - Si es la columna final (sin pares, sin línea saliente)
         * @param {boolean} hasIncoming - Si los matches tienen línea horizontal entrante
         */
        const buildColumn = (title, matchArray, requiredCount, isFinal = false, hasIncoming = false) => {
            const finalClass = isFinal ? 'bracket-column-final' : '';
            let html = `<div class="bracket-column ${finalClass}">
                <h4 class="text-center text-[#8B949E] text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-3 px-1">${title}</h4>`;

            if (isFinal) {
                // Final: un solo match, sin pares
                const matchHtml = matchArray[0]
                    ? createBracketMatch(matchArray[0], userPreds, hasIncoming)
                    : createEmptyMatch(hasIncoming);
                html += matchHtml;
            } else {
                // Agrupar en pares
                for (let i = 0; i < requiredCount; i += 2) {
                    html += `<div class="bracket-pair">`;
                    const m1 = matchArray[i];
                    const m2 = matchArray[i + 1];
                    html += m1 ? createBracketMatch(m1, userPreds, hasIncoming) : createEmptyMatch(hasIncoming);
                    html += m2 ? createBracketMatch(m2, userPreds, hasIncoming) : createEmptyMatch(hasIncoming);
                    html += `</div>`;
                }
            }

            html += `</div>`;
            return html;
        };

        // Espaciador entre columnas (visualiza la línea horizontal entrante)
        const spacer = `<div class="bracket-spacer"></div>`;

        container.innerHTML = `
            <div class="bracket-wrapper">
                ${buildColumn('Dieciseisavos', r32, 16, false, false)}
                ${spacer}
                ${buildColumn('Octavos', r16, 8, false, true)}
                ${spacer}
                ${buildColumn('Cuartos', qf, 4, false, true)}
                ${spacer}
                ${buildColumn('Semifinal', sf, 2, false, true)}
                ${spacer}
                ${buildColumn('Final 🏆', fin, 1, true, true)}
            </div>
        `;
    }

    function createBracketMatch(p, userPreds, hasIncoming = false) {
        const pred = userPreds[p.id];
        const isPending = p.estado === 'pendiente';
        
        // Clases visuales para el ganador
        let localClass = p.resultado_ganador === p.equipo_local ? 'winner' : '';
        let visitClass = p.resultado_ganador === p.equipo_visitante ? 'winner' : '';
        
        // Mostrar goles reales si existen, '-' si no
        const scoreLocal = isPending ? '' : (p.goles_local ?? (p.resultado_ganador === p.equipo_local ? '✓' : '-'));
        const scoreVisit = isPending ? '' : (p.goles_visitante ?? (p.resultado_ganador === p.equipo_visitante ? '✓' : '-'));

        let tooltip = '';
        if (isPending && pred) {
            tooltip = ` title="Tú votaste: ${getCountry(pred.ganador).es} (${getFormaVictoriaText(pred.forma)})"`;
            if(pred.ganador === p.equipo_local) localClass = 'text-[#00FF87]';
            if(pred.ganador === p.equipo_visitante) visitClass = 'text-[#00FF87]';
        }

        const localInfo = getCountry(p.equipo_local);
        const visitInfo = getCountry(p.equipo_visitante);

        return `
            <div class="bracket-match-wrapper ${hasIncoming ? 'has-incoming' : ''}">
                <div class="bracket-match" ${tooltip} onclick="document.getElementById('tab-partidos').click();">
                    <div class="bracket-team ${localClass}">
                        <div class="flex items-center gap-2">
                            <span>${localInfo.flag}</span>
                            <span class="truncate max-w-[100px]">${localInfo.es}</span>
                        </div>
                        <span class="text-xs font-bold ${!isPending && p.resultado_ganador === p.equipo_local ? 'text-[#00FF87]' : 'text-[#8B949E]'}">${scoreLocal}</span>
                    </div>
                    <div class="bracket-team ${visitClass}">
                        <div class="flex items-center gap-2">
                            <span>${visitInfo.flag}</span>
                            <span class="truncate max-w-[100px]">${visitInfo.es}</span>
                        </div>
                        <span class="text-xs font-bold ${!isPending && p.resultado_ganador === p.equipo_visitante ? 'text-[#00FF87]' : 'text-[#8B949E]'}">${scoreVisit}</span>
                    </div>
                </div>
            </div>
        `;
    }

    function createEmptyMatch(hasIncoming = false) {
        return `
            <div class="bracket-match-wrapper bracket-match-wrapper-empty opacity-50 ${hasIncoming ? 'has-incoming' : ''}">
                <div class="bracket-match cursor-default hover:transform-none hover:border-[rgba(255,255,255,0.1)]">
                    <div class="bracket-team text-[#8B949E]">
                        <span>TBD</span>
                        <span>-</span>
                    </div>
                    <div class="bracket-team text-[#8B949E]">
                        <span>TBD</span>
                        <span>-</span>
                    </div>
                </div>
            </div>
        `;
    }

    async function loadLeaderboard() {
        const tbody = document.getElementById('leaderboard-body');
        tbody.innerHTML = '<tr><td colspan="3" class="p-8 text-center text-[#8B949E] font-medium">Calculando posiciones...</td></tr>';
        
        const { data, error } = await supabase.rpc('get_leaderboard');
        
        if (error) {
            tbody.innerHTML = `<tr><td colspan="3" class="p-8 text-center text-red-500">Error: ${error.message}</td></tr>`;
            return;
        }
        
        leaderboardData = data || [];
        renderLeaderboard(leaderboardData);
    }

    function renderLeaderboard(data) {
        const tbody = document.getElementById('leaderboard-body');
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="p-8 text-center text-[#8B949E] font-medium">Aún no hay puntuaciones en la liga.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        data.forEach((row, index) => {
            const isTop = index === 0;
            const tr = document.createElement('tr');
            tr.className = `transition-colors hover:bg-white/5 ${isTop ? 'bg-[#00FF87]/10' : ''}`;
            
            tr.innerHTML = `
                <td class="p-5 font-medium ${isTop ? 'text-[#00FF87]' : 'text-[#8B949E]'}">${index + 1}</td>
                <td class="p-5 text-white font-medium flex items-center gap-2">
                    ${row.nombre_jugador} ${isTop ? '<span title="Líder">👑</span>' : ''}
                </td>
                <td class="p-5 text-center font-bold text-lg text-[#00FF87]">${row.puntos_totales}</td>
            `;
            tbody.appendChild(tr);
        });
    }
});
