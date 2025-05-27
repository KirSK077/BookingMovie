import React from "react";
import "../styles/Forms.css"

type removeFilmProps = {
  seanceId: number;
  filmName: string;
  onDelSeance: () => void;
  onCancel: () => void;
}

const DelSeance: React.FC<removeFilmProps> = ({ filmName, onDelSeance, onCancel }) => {

  const handleDelSeanse = () => {
    onDelSeance();
  }

  return (
    <div className="overlay">
      <div className="form">
        <div className="form__header-block">
          <h2 className="form__header">Удалить сеанс</h2>
          <span className="form__close-btn" onClick={onCancel}></span>
        </div>
        <div className="form__content">
          <p className="form__content__text">Вы действительно хотите снять с сеанса фильм <span className="form__content__film-name">{filmName}</span>?</p>
        </div>
        <div className="form__btns">
          <button type="button" className="form__submit-btn" onClick={handleDelSeanse}>Удалить</button>
          <button type="button" className="form__decline-btn" onClick={onCancel}>Отменить</button>
        </div>
      </div>
    </div>
  )
}

export default DelSeance;