import { useState, useEffect } from 'react';
import BackendAPI from '../../api/BackendAPI';
import '../styles/Client.css';
import QRCreator from '../QrCreator/QRCreatorWrapper';

type Hall = {
  id: number;
  hall_name: string;
  hall_rows: number;
  hall_places: number;
  hall_config: string[][];
  hall_price_standart: number;
  hall_price_vip: number;
  hall_open: number;
};

type Film = {
  id: number;
  film_name: string;
  film_duration: number;
  film_description: string;
  film_origin: string;
  film_poster?: string; 
}

type Seance = {
  id: number;
  seance_hallid: number;
  seance_filmid: number;
  seance_time: string;
}

type Ticket = {
  id: number;
  ticket_date: string;
  ticket_time: string;
  ticket_filmname: string;
  ticket_hallname: string;
  ticket_row: number;
  ticket_place: number;
  ticket_price: number;
}

// Склонение слов
const words = ['минута', 'минуты', 'минут'];
const declOfNum = (num: number) => {
  const value = (num % 100) % 10;
  if(num > 10 && num < 20) return words[2]; 
  if(value > 1 && value < 5) return words[1];
  if(value === 1) return words[0]; 
  return words[2];
}

const ClientInterface = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [films, setFilms] = useState<Film[]>([]);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [error, setError] = useState('');

  const [activeDate, setActiveDate] = useState(new Date());
  const [firsDateInArray, setFirstDateInArray] = useState(new Date())
  const [activeDateId, setActiveDateId] = useState<number | null>(null)
  
  const [filmName, setFilmName] = useState('');
  const [hallIndex, setHallIndex] = useState<number | null>(null);
  const [seanceIndex, setSeanceIndex] = useState<number | null>(null)
  const [seanceDate, setSeanceDate] = useState(new Date());
  const [seanceTime, setSeanceTime] = useState('');
  const [selectedHallConfig, setSelectedHallConfig] = useState<string[][] | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<Ticket[]>();
  const [showQrCode, setShowQrCode] = useState<boolean>(false);

  const [isActiveSubPage, setIsActiveSubPage] = useState<{[key: string]: boolean}>({
    main: true,
    booking: false,
    bookingConfirmation: false,
    getCode: false
  });

  const today = new Date().toDateString();
  const period = 6;
  const datesArray = Array.from({ length: period }).map((_, i) => {
    const newDate = new Date(firsDateInArray);
    newDate.setDate(firsDateInArray.getDate() + i);
    return newDate;
  });
  const daysOfWeek = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
  const daysOfWeekArray = Array.from({ length: period }).map((_, i) => {
    const newDay = new Date(firsDateInArray);
    newDay.setDate(firsDateInArray.getDate() + i);
    return daysOfWeek[newDay.getDay()];
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await BackendAPI.getAllData()
        const openHalls = data.halls.filter(hall => hall.hall_open === 1);
        const filteredSeances = data.seances
          .filter(seance => openHalls
          .map(hall => hall.id)
          .includes(seance.seance_hallid));
        const filteredFilms = data.films
          .filter(film => filteredSeances
          .map(seance => seance.seance_filmid)
          .includes(film.id));
        
        setHalls(openHalls);
        setSeances(filteredSeances);
        setFilms(filteredFilms);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      }
    };
    fetchData()
  }, [])

  const backToDate = () => {
    const prevDate = new Date(firsDateInArray);
    prevDate.setDate(firsDateInArray.getDate() - period);
    setFirstDateInArray(prevDate);
    setActiveDate(prevDate);
  }

  const forwardToDate = () => {
    const prevDate = new Date(firsDateInArray);
    prevDate.setDate(firsDateInArray.getDate() + period);
    setFirstDateInArray(prevDate);
    setActiveDate(prevDate);
  }


  const handleSeanceClick = (hallId: string | number, filmName: string, date: Date, time: string) => {
    const hallIndex = typeof hallId === 'string' ? parseInt(hallId, 10) : hallId;
    const seanceId = seances.find(seance => seance.seance_hallid === Number(hallId) && seance.seance_time === time)?.id ?? null;
    
    const hall = halls.find(hall => hall.id === hallIndex);
    if (hall) {
      setHallIndex(hallIndex);
      setSeanceIndex(seanceId);
      setFilmName(filmName);
      setSeanceDate(date);
      setSeanceTime(time);
      setIsActiveSubPage(prevState =>
        ({ ...prevState, main: false, booking: true })
      );
    }
  }

  useEffect(() => {
    const hallConfig = async () => {
      try {
        if (seanceIndex === null) {
          return;
        }
        const seanceDateString = seanceDate.toISOString().split('T')[0];
        const data = await BackendAPI.getHallConfig(seanceIndex, seanceDateString);
        setSelectedHallConfig(data)
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      }
    }
    hallConfig();
  }, [seanceIndex, seanceDate])
  

  const handleSeatTaking = (seat: string, seatIndex: number) => {
    if (seat === 'taken' || seat === 'disabled') {
      return;
    }
    setSelectedSeats(prevSelected => {
      if (prevSelected.includes(seatIndex)) {
        return prevSelected.filter(index => index !== seatIndex);
      } else {
        return [...prevSelected, seatIndex];
      }
    });
  };


  const handleBooking = async () => {
    if (seanceIndex === null || hallIndex === null || !selectedHallConfig) {
      return;
    }
    if (selectedSeats.length === 0) {
      return;
    }
    const hall = halls.find(h => h.id === hallIndex);
    if (!hall) {
      return;
    }
    const tickets: { row: number; place: number; coast: number }[] = selectedSeats.map(seatIndex => {
      const row = Math.floor(seatIndex / selectedHallConfig[0].length) + 1;
      const place = (seatIndex % selectedHallConfig[0].length) + 1;
      const seatType = selectedHallConfig[row - 1][place - 1];
      const coast = seatType === 'vip' ? hall.hall_price_vip : hall.hall_price_standart;
      return { row, place, coast };
    });
    const ticketDate = seanceDate.toISOString().split('T')[0];
    try {
      const result = await BackendAPI.buyTickets(seanceIndex, ticketDate, tickets);
      setBookingResult(result);
      setShowBookingConfirmation(true);
      setSelectedSeats([]);
      setIsActiveSubPage(prevState => 
        ({ ...prevState, booking: false, bookingConfirmation: true })
      );
      // setSelectedHallConfig(null);
      setShowQrCode(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  const generateQrCodeText = () => {
    if (!bookingResult || bookingResult.length === 0) return '';
    const hallName = bookingResult[0].ticket_hallname;
    const filmName = bookingResult[0].ticket_filmname;
    const date = bookingResult[0].ticket_date;
    const time = bookingResult[0].ticket_time;
    const phrase = 'Билет действителен строго на свой сеанс';

    const seatsInfo = bookingResult.map(ticket => {
      return `Ряд: ${ticket.ticket_row}, Место: ${ticket.ticket_place}, Стоимость: ${ticket.ticket_price} руб.`;
    }).join('; ');

    return `Дата: ${date}\nВремя: ${time}\nНазвание фильма: ${filmName}\nЗал: ${hallName}\n${seatsInfo}\n${phrase}`;
  };

  const handleShowQrCode = () => {
    setShowQrCode(true);
  };

  return (
    <>
      {/* Блок с датами и днями недели */}
      {error && {error}}
      {isActiveSubPage.main && (<div className='block__dates'>
        <div 
          className='block__date-btn btn__back'
          onClick={backToDate}>{"<"}
        </div>
          {datesArray.map((_, i) => (
            <div 
              key={i}
              className={`${activeDateId === i ? "block__date-btn_active" : "block__date-btn"} ${daysOfWeekArray[i] === "Вс" || daysOfWeekArray[i] === "Сб" ? "weekend" : ""}`}
              onClick={() => {
                const selectedDate = new Date(datesArray[i]);
                setActiveDate(selectedDate);
                setActiveDateId(i);                
              }}>
              <p>{new Date(datesArray[i]).toDateString() === today ? "Сегодня" : ""}</p>
              <div className={`${new Date(datesArray[i]).toDateString() === today
                  ? "block__date__row" 
                  : "block__date__col"}`}>
                <p className='block__date__day-val'>{daysOfWeekArray[i] + ','}&nbsp;</p>
                <p className='block__date__date-val'>{new Date(datesArray[i]).toLocaleString("ru-Ru", {day:"numeric"})}</p>
              </div>
            </div>)
          )}
        <div 
          className='block__date-btn btn__forward' 
          onClick={forwardToDate}>{">"}</div>
      </div>)}

      {/* Блок доступных сеансов */}
      {isActiveSubPage.main && (<div className='block__films-container'>
        {films.map(film => (
          <div 
            className='block__films-container__film'
            key={film.id}>
              <div className='block__films-container__film__poster-text'>
                <img 
                  className='block__films-container__film__poster'
                  src={film.film_poster} alt={`Постер к фильму ${film.film_name}`} />
                <div className='block__films-container__film__text'>
                  <p className='block__films-container__film__title'>
                    {film.film_name}
                  </p>
                  <p className='block__films-container__film__description'>
                    {film.film_description}
                  </p>
                  <p className='block__films-container__film__duration-origin'>
                    {film.film_duration}&nbsp;{declOfNum(film.film_duration)}&nbsp;{film.film_origin}
                  </p>
                </div>
              </div>
              <div className='block__films-container__halls-seances'>
                {(() => {
                  const filmSeances = seances.filter(seance => seance.seance_filmid === film.id);
                  const seancesByHall: { [hallId: number]: string[] } = {};
                  filmSeances.forEach(seance => {
                    if (!seancesByHall[seance.seance_hallid]) {
                      seancesByHall[seance.seance_hallid] = [];
                    }
                    seancesByHall[seance.seance_hallid].push(seance.seance_time);
                  });
                  return Object.entries(seancesByHall).map(([hallId, times]) => {
                    const hallName = halls.find(hall => hall.id === Number(hallId))?.hall_name;
                    const sortedTimes = times.slice().sort((a, b) => a.localeCompare(b));
                    return (
                      <div className='block__films-container__halls-seances__schedule'
                        key={hallId}>
                          <p 
                            className='block__films-container__halls-seances__hall-name'>
                            {hallName}
                          </p> 
                          <div 
                            className='block__films-container__halls-seances__seance-times-box'>
                            {sortedTimes.map((time, index) => {
                              const activeDateObj = new Date(activeDate);
                              const [hours, minutes] = time.split(':').map(Number);
                              const seanceDateTime = new Date(activeDateObj);
                              seanceDateTime.setHours(hours, minutes, 0, 0);
                              const now = new Date();
                              const isActive = seanceDateTime >= now;
                              const timeClass = isActive
                                ? "block__films-container__halls-seances__seance-time"
                                : "block__films-container__halls-seances__seance-time-disabled";
                              return (
                                <div 
                                  key={index} 
                                  className={timeClass}
                                  onClick={() => isActive && handleSeanceClick(hallId, film.film_name, activeDate, time)}>
                                    {time}
                                </div>
                              );
                            })}
                          </div>
                      </div>
                    );
                  });
                })()}
              </div>
          </div>
        ))}
      </div>)}
      
      {/* Блок с доступными местами и выбором места*/}
      {selectedHallConfig && isActiveSubPage.booking && (
        <div className='block__hall-container'>
          <div className='block__hall-container__info'>
            <p className='block__hall-container__info__film-title'>{filmName}</p>
            <p className='block__hall-container__info__film-time'>Начало сеанса: {seanceTime}</p>
            <p className='block__hall-container__info__hall-name'>{halls.find(hall => hall.id === hallIndex)?.hall_name}</p>
          </div>
          <div className="block__hall-grid-container">
            <p className='block__hall-grid__screen'></p>
            <div className="block__hall-grid"
              style={{
                gridTemplateColumns: `repeat(${selectedHallConfig[0].length}, 20px)`, 
                gridTemplateRows: `repeat(${selectedHallConfig.length}, 20px)`,
              }}
            >
              {selectedHallConfig.flat().map((seat, seatIndex) => (
                <div 
                  key={seatIndex} 
                  className={`block__hall-seat ${selectedSeats.includes(seatIndex) ? 'seat-selected' : `seat-${seat}`}`}
                  onClick={() => {
                    handleSeatTaking(seat, seatIndex)
                  }}
                ></div>
              ))}
            </div>
            <div className="block__hall-grid__legend">
              <div className="block__seats__description"><div className="seat-standart seat_legend"></div>Свободно ({halls.find(hall => hall.id === hallIndex)?.hall_price_standart}руб.)</div>
              <div className="block__seats__description"><div className="seat-taken seat_legend"></div>Занято</div>
              <div className="block__seats__description"><div className="seat-vip seat_legend"></div>Свободно VIP ({halls.find(hall => hall.id === hallIndex)?.hall_price_vip}руб.)</div>
              <div className="block__seats__description"><div className="seat-selected seat_legend"></div>Выбрано</div>
            </div>
          </div>
          <div className="form__btns">
            <button type="button" className="form__submit-btn sales__btn" onClick={handleBooking}>Забронировать</button>
          </div>
        </div>
      )}

      {/* Блок подтверждения бронирования */}
      {showBookingConfirmation && bookingResult && isActiveSubPage.bookingConfirmation && (
        <div className="block__booking-container">
          <div className='block__booking-container__title'>
            {!showQrCode && <h3 className='block__booking-container__title-text'>Вы выбрали билеты:</h3>} 
            {showQrCode && <h3 className='block__booking-container__title-text'>Электронный билет</h3>}
          </div>
          <div className='block__booking-container__content'>
            <p className='block__booking-container__content-text'>На фильм:&nbsp;
              <span className='block__booking-container__content-value'>{filmName}</span>
            </p>
            <p className='block__booking-container__content-text'>Места:&nbsp;
              <span className='block__booking-container__content-value'>{bookingResult.map(ticket => ticket.ticket_place).join(', ')}</span>
            </p>
            <p className='block__booking-container__content-text'>В зале:&nbsp;
              <span className='block__booking-container__content-value'>{halls.find(hall => hall.id === hallIndex)?.hall_name}</span>
            </p>
            <p className='block__booking-container__content-text'>Начало сеанса:&nbsp;
              <span className='block__booking-container__content-value'>{seanceTime}</span>
            </p>
            {!showQrCode && <p className='block__booking-container__content-text'>Стоимость:&nbsp;
              <span className='block__booking-container__content-value'>{bookingResult.reduce((sum, ticket) => sum + ticket.ticket_price, 0)}</span> рублей
            </p>}
            <div className="block__booking-btn__qr-code">
            {showQrCode && (<QRCreator text={generateQrCodeText()} />)}
            {!showQrCode && <button 
              type="button" 
              className="form__submit-btn booking__btn"
              onClick={handleShowQrCode}
              >Получить код бронирования
            </button>}
            </div>
            {showQrCode && <p className='block__booking-container__content-hint'>Покажите QR-код нашему контроллеру для подтверждения бронирования.</p>}
            {!showQrCode && <p className='block__booking-container__content-hint'>После оплаты билет будет доступен в этом окне, а также придёт вам на почту. Покажите QR-код нашему контроллёру у входа в зал.</p>}
            <p className='block__booking-container__content-hint'>Приятного просмотра!</p>
          </div>
        </div>
      )}
    </>
  );
}

export default ClientInterface;
