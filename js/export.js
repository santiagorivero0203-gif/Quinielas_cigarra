// Exportación usando SheetJS (XLSX)
export function exportLeaderboard(data) {
    if (!data || data.length === 0) {
        alert("No hay datos en la tabla para exportar.");
        return;
    }

    // Formatear los datos para Excel asegurando el orden: Posición, Participante, Aciertos M1... Puntos Totales
    const excelData = data.map((row, index) => {
        return {
            "Posición": index + 1,
            "Participante": row.nombre_jugador,
            "Aciertos M1": row.aciertos_m1,
            "Aciertos M2": row.aciertos_m2,
            "Aciertos M3": row.aciertos_m3,
            "Aciertos M4": row.aciertos_m4,
            "Puntos Totales": row.puntos_totales
        };
    });

    // Crear la hoja de trabajo
    const worksheet = window.XLSX.utils.json_to_sheet(excelData);
    
    // Crear el libro de trabajo
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "Leaderboard");
    
// Generar archivo y descargar
    window.XLSX.writeFile(workbook, "LigaCigarra_Resultados.xlsx");
}

export function exportVotaciones(data) {
    if (!data || data.length === 0) {
        alert("No hay votaciones para exportar.");
        return;
    }

    // 1. Obtener lista única de partidos para usarlos como columnas
    const partidosSet = new Set();
    data.forEach(row => {
        if (row.partidos) {
            partidosSet.add(`${row.partidos.equipo_local} vs ${row.partidos.equipo_visitante}`);
        }
    });
    // Array con los nombres de los partidos en orden
    const partidosColumnas = Array.from(partidosSet);

    // 2. Agrupar las predicciones por participante
    const participantes = {};
    data.forEach(row => {
        const nombre = row.perfiles?.nombre || "Desconocido";
        
        if (!participantes[nombre]) {
            participantes[nombre] = { "Participante": nombre };
            // Inicializar las columnas de partidos en blanco para mantener el orden
            partidosColumnas.forEach(p => participantes[nombre][p] = "");
        }

        if (row.partidos) {
            const partidoNombre = `${row.partidos.equipo_local} vs ${row.partidos.equipo_visitante}`;
            participantes[nombre][partidoNombre] = row.prediccion_ganador;
        }
    });

    // 3. Convertir el objeto agrupado en un array para Excel
    const excelData = Object.values(participantes);

    const worksheet = window.XLSX.utils.json_to_sheet(excelData);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "Votaciones");
    
    window.XLSX.writeFile(workbook, "LigaCigarra_Votaciones.xlsx");
}
