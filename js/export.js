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
