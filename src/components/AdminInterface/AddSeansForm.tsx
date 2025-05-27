import React, { useState, useEffect, FormEvent } from "react";
import "../styles/Forms.css"

type AddSeansProps = {
  onAddSeans: (seance: { hallId: number; filmId: number; seanceTime: string }) => void;
  onCancel: () => void;
  initialHall?: { id: number; hall_name: string };
  initialFilm?: { id: number; film_name: string };
  validateSeance?: (hallId: number, seanceTime: string, filmId: number) => string | null;
}

const AddSeansForm: React.FC<AddSeansProps> = ({ onAddSeans, onCancel, initialHall, initialFilm, validateSeance }) => {
  const [hallId, setHallId] = useState<number | null>(initialHall ? initialHall.id : 0);
  const [hallName, setHallName] = useState(initialHall ? initialHall.hall_name : '');
  const [filmId, setFilmId] = useState<number>(initialFilm ? initialFilm.id : 0);
  const [filmName, setFilmName] = useState(initialFilm ? initialFilm.film_name : '');
  const [seanceTime, setSeanceTime] = useState('');
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialHall) {
      setHallId(initialHall.id);
      setHallName(initialHall.hall_name);
    }
    if (initialFilm) {
      setFilmId(initialFilm.id);
      setFilmName(initialFilm.film_name);
    }
  }, [initialHall, initialFilm]);

  const handleAddSeanse = (e: FormEvent) => {
    e.preventDefault();

    try {
      if (!hallId) {
        throw new Error('Выберите зал');
      }
      if (filmName === '') {
        throw new Error('Выберите фильм');
      }
      if (seanceTime === '') {
        throw new Error('Укажите время сеанса')
      }
      if (validateSeance) {
        const validationError = validateSeance(hallId, seanceTime, filmId);
        if (validationError) {
          setError(validationError);
          return;
        }
      }
      onAddSeans({ hallId, filmId, seanceTime });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }

  return (
    <div className="overlay">
      <form className="form" onSubmit={handleAddSeanse}>
        <div className="form__header-block">
          <h2 className="form__header">Добавление сеанса</h2>
          <span className="form__close-btn" onClick={onCancel}></span>
        </div>
        <div className="form__input-container">
          <div className="form__input-box">
            <label className="form__input-label" htmlFor="hallName">Название зала</label>
            <input 
              id="hallName"
              className="form__input"
              type="text" 
              value={hallName}
              onChange={e => setHallName(e.target.value)}
              />
          </div>
          <div className="form__input-box">
            <label className="form__input-label" htmlFor="filmName">Название фильма</label>
            <input 
              id="filmName"
              className="form__input"
              type="text" 
              value={filmName}
              onChange={e => setFilmName(e.target.value)}
              />
          </div>
          <div className="form__input-box">
            <label className="form__input-label" htmlFor="seanceTime">Время начала</label>
            <input 
              id="seanceTime"
              className="form__input"
              type="time" 
              value={seanceTime}
              onChange={e => setSeanceTime(e.target.value)}
              />
          </div>
        </div>
        {error && <p className="form__error">{error}</p>}
        <div className="form__btns">
          <button type="submit" className="form__submit-btn">Добавить фильм</button>
          <button type="button" className="form__decline-btn" onClick={onCancel}>Отмена</button>
        </div>
      </form>
    </div>
  );
}

export default AddSeansForm;
