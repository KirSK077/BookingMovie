import React, { useState, FormEvent } from "react";
import BackendAPI from "../../api/BackendAPI";
import '../styles/Forms.css'

type AddFilmProps = {
  onAddFilm: (updatedFilms: { id: number; film_name: string; film_duration: number; film_description: string; film_origin: string; film_poster: string; }[]) => void;
  onCancel: () => void;
}

const AddFilmForm: React.FC<AddFilmProps> = ({ onAddFilm, onCancel }) => {
  const [filmName, setFilmName] = useState('');
  const [duration, setDuration] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [origin, setOrigin] = useState('');
  const [poster, setPoster] = useState<File>();
  const [error, setError] = useState('');

  const handleAddFilm = async(e:FormEvent) => {
    e.preventDefault()

    try {
      if (filmName === '') {
        throw new Error('Укажите название фильма')
      }
      if (isNaN(duration) || duration <= 0) {
        throw new Error('Продолжительность фильма не может быть меньше или равна 0')
      }
      if (description === '') {
        throw new Error('Укажите описание фильма')
      }
      if (origin === '') {
        throw new Error('Укажите страну(ы) происхождения фильма')
      }
      if (!poster) {
        throw new Error('Необходимо загрузить постер (формат PNG, размер не более 3Мб)')
      }
      const result = await BackendAPI.addFilm(filmName.trim(), duration, description.trim(), origin.trim(), poster)
      if (result && result.films) {
        onAddFilm(result.films);
      }
    } catch (error) {
      setError((error as Error).message);
    }
  }

  return(
    <div className="overlay">
      <form className="form" onSubmit={handleAddFilm}>
        <div className="form__header-block">
          <h2 className="form__header">Добавление фильма</h2>
          <span className="form__close-btn" onClick={onCancel}></span>
        </div>
        <div className="form__input-container">
          <div className="form__input-box">
            <label className="form__input-label" htmlFor="filmName">Название фильма</label>
            <input 
              id="filmName"
              className="form__input"
              type="text" 
              value={filmName}
              onChange={e => setFilmName(e.target.value)}
              placeholder="Например, «Гражданин Кейн»"
              />
          </div>
          <div className="form__input-box">
            <label className="form__input-label" htmlFor="duration">Продолжительность фильма (мин.)</label>
            <input 
              id="duration"
              className="form__input"
              type="number" 
              defaultValue={''}
              onChange={e => setDuration(parseInt(e.target.value))}
              />
          </div>
          <div className="form__input-box">
            <label className="form__input-label" htmlFor="description">Описание фильма</label>
            <textarea 
              id="description"
              className="form__input textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              >
            </textarea>
          </div>
          <div className="form__input-box">
            <label className="form__input-label" htmlFor="origin">Страна</label>
            <input 
              id="origin"
              className="form__input"
              type="text"
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              />
          </div>
          {error && <div className="form__error">{error}</div>}
          <div className="form__btns">
            <button type="submit" className="form__submit-btn">Добавить фильм</button>
            <label className="form__input-file__label" htmlFor="input__file">
              <input 
                className="form__input-file_hidden"
                type="file" 
                name="input__file" 
                id="input__file"
                onChange={e => {
                  const file = (e.target as HTMLInputElement).files
                  if (file && file.length > 0) {
                    setPoster(file[0]);
                  }
                }}
                />
                <div className="form__submit-btn">Загрузить постер</div>
            </label>
            <button type="button" className="form__decline-btn" onClick={onCancel}>Отменить</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddFilmForm;
