import React, { useState, useRef } from "react";
import DelSeance from "./DelSeance";
import "../styles/SeanceSchedule.css"


type Film = {
  id: number;
  film_name: string;
  film_duration: number;
  film_description: string;
  film_origin: string;
  film_poster?: string;
};

type Seance = {
  id: number;
  seance_hallid: number;
  seance_filmid: number;
  seance_time: string;
};

type Hall = {
  id: number;
  hall_name: string;
};

type SeanceScheduleProps = {
  hall: Hall;
  seances: Seance[];
  films: Film[];
  colors: string[];
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDeleteSeance: (seanceId: number) => void;
};

const SeanceSchedule: React.FC<SeanceScheduleProps> = ({ hall, seances, films, colors, onDrop, onDeleteSeance }) => {
  const totalMinutes = 24 * 60;
  const [delSeanceVisible, setDelSeanceVisible] = useState(false);
  const [selectedSeance, setSelectedSeance] = useState<Seance | null>(null);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [trashId, setTrashId] = useState<number | null>(null) 
  const scheduleRef = useRef<HTMLDivElement>(null);

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const isLastSeanceValid = (): boolean => {
    let lastEnd = 0;
    for (const seance of seances.filter(s => s.seance_hallid === hall.id)) {
      const film = films.find(f => f.id === seance.seance_filmid);
      if (!film) continue;
      const start = timeToMinutes(seance.seance_time);
      const end = start + film.film_duration;
      if (end > lastEnd) lastEnd = end;
    }
    return lastEnd <= 24 * 60;
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, seance: Seance, film: Film) => {
    e.dataTransfer.setData("text/plain", seance.id.toString());
    setSelectedSeance(seance);
    setSelectedFilm(film);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (!scheduleRef.current) return;
    const rect = scheduleRef.current.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if ((x < rect.left - 5 && x > rect.left - 50) && (y > rect.top - 10 && y < rect.bottom + 10)) {
      setDelSeanceVisible(true);
    }
    // Clear trashId to hide basket icon if drag ends without drop
    setTrashId(null);
  };

  // Confirm deletion of seance and hide basket icon
  const handleDelSeance = () => {
    if (selectedSeance) {
      onDeleteSeance(selectedSeance.id);
      // Hide basket icon after deletion
      setTrashId(null);
    }
    
    setDelSeanceVisible(false);
    setSelectedSeance(null);
    setSelectedFilm(null);
  };

  // Cancel deletion and hide basket icon
  const handleCancel = () => {
    setDelSeanceVisible(false);
    setSelectedSeance(null);
    setSelectedFilm(null);
    // Hide basket icon on cancel
    setTrashId(null);
  };

  const renderSeance = (seance: Seance) => {
    const film = films.find((f) => f.id === seance.seance_filmid);
    if (!film) return null;
    const startMinutes = timeToMinutes(seance.seance_time);
    const duration = film.film_duration;
    const leftPercent = (startMinutes / totalMinutes) * 100;
    const widthPercent = (duration / totalMinutes) * 100;
    const color = colors[film.id % colors.length];
    
    const lastValid = isLastSeanceValid();

    const style = {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      backgroundColor: color,
    };

    const onDragStartHandler = (e: React.DragEvent<HTMLDivElement>) => {
      if (!lastValid) {
        e.preventDefault();
        return;
      }
      setTrashId(hall.id)
      handleDragStart(e, seance, film);
    };

    return (
      <div className="block__seance-schedule-seance-el"
        key={seance.id}
        draggable={lastValid}
        onDragStart={onDragStartHandler}
        onDragEnd={handleDragEnd}
        title={`${film.film_name} (${seance.seance_time} - ${minutesToTime(startMinutes + duration)})`}
        style={style}
      >
        {film.film_name}
      </div>
    );
  };

  return (
    <div className="block__seance-schedule"
      ref={scheduleRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        onDrop(e);
        setTrashId(null);
      }}
    >
      {/* Сеансы на шкале времени */}
      <div className="block__seance-schedule-seance-list">
        {seances
          .filter((seance) => seance.seance_hallid === hall.id)
          .map(renderSeance)}
      </div>
      {/* Шкала времени */}
      <div className="block__seance-schedule__timeline">
        {seances
          .filter((seance) => seance.seance_hallid === hall.id)
          .map((seance) => {
            const startMinutes = timeToMinutes(seance.seance_time);
            const leftPercent = (startMinutes / totalMinutes) * 100;
            return (
              <span className="block__seance-schedule__time-value"
                key={seance.id}
                style={{ left: `${leftPercent}%` }}
              >
                {seance.seance_time}
              </span>
            );
          })}
      </div>
      <span className={trashId === hall.id ? "block__trash" : "block__trash_hidden"}></span>
      {delSeanceVisible && selectedSeance && selectedFilm && (
        <DelSeance
          seanceId={selectedSeance.id}
          filmName={selectedFilm.film_name}
          onDelSeance={handleDelSeance}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default SeanceSchedule;