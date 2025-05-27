import React, { useState, FormEvent } from "react";
import BackendAPI from "../../api/BackendAPI";
import "../styles/Forms.css"

type AddHallProps = {
  onAddHall: () => void;
  onCancel: () => void;
}

const AddHallForm: React.FC<AddHallProps> = ({ onAddHall, onCancel }) => {
  const [hallName, setHallName] = useState('')
  const [error, setError] = useState('')

  const handleAddHall = async (e: FormEvent) => {
    e.preventDefault()

    try {
      await BackendAPI.addHall(hallName.trim())
      onAddHall();
    } catch (error) {
      setError(`Ошибка добавления зала: ${(error as Error).message}`);
    }
  } 

  return(
    <div className="overlay">
      <form className="form" onSubmit={handleAddHall}>
        <div className="form__header-block">
          <h2 className="form__header">Добавление зала</h2>
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
              placeholder="Например, «Зал 1»"
              />
          </div>
          {error && <div className="form__error">{error}</div>}
          <div className="form__btns">
            <button type="submit" className="form__submit-btn">Добавить зал</button>
            <button type="button" className="form__decline-btn" onClick={onCancel}>Отменить</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddHallForm;
