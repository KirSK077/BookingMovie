import { useState, useEffect } from "react";
import BackendAPI from "../../api/BackendAPI";
import AddHallForm from "./AddHallForm";
import AddFilmForm from "./AddFilmForm";
import AddSeansForm from "./AddSeansForm";
import SeanceSchedule from "./SeanceSchedule";
import "../styles/Admin.css"

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

type SeatType = "standart" | "vip" | "disabled";

type Seat = {
  row: number;
  col: number;
  seatType: SeatType;
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

// Цвета для карточек фильмов в блоке "Сетка сеансов"
const colors = ['#CAFF85', '#85FF89', '#85FFD3', '#85E2FF', '#8599FF'];

// Склонение слов
const words = ['минута', 'минуты', 'минут'];
const declOfNum = (num: number) => {
  const value = (num % 100) % 10;
  if(num > 10 && num < 20) return words[2]; 
  if(value > 1 && value < 5) return words[1];
  if(value === 1) return words[0]; 
  return words[2];
}

const AdminInterface = () => {
  // Конфигурация аккордеонов
  const [isOpenAccordion, setIsOpenAccordion] = useState<{[key: string]: boolean}>({
    halls: true,
    config: true,
    prices: true,
    seances: true,
    sales: true
  });
  // Создание залов
  const [halls, setHalls] = useState<Hall[]>([]);
  const [hallToDelete, setHallToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hallsError, setHallsError] = useState('');
  // Конфигурация залов
  const [selectedHallId, setSelectedHallId] = useState<number | null>(null);
  const [activeHallIdToConfig, setActiveHallIdToConfig] = useState<number | null>(null);
  const [rowsInput, setRowsInput] = useState<number>(10);
  const [colsInput, setColsInput] = useState<number>(10);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [seatsInfo, setSeatsInfo] = useState('');
  const [seatsError, setSeatsError] = useState('');
  // Конфигурация цен
  const [activeHallToPricing, setActiveHallToPricing] = useState<number | null>(null);
  const [standardPrice, setStandardPrice] = useState<number>(250);
  const [vipPrice, setVipPrice] = useState<number>(500);
  const [pricingInfo, setPricingInfo] = useState('');
  const [pricingError, setPricingError] = useState('');
  // Конфигурация фильмов
  const [films, setFilms] = useState<Film[]>([]);
  const [filmToDelete, setFilmToDelete] = useState<number | null>(null);
  // Конфигурация сеансов
  const [seances, setSeances] = useState<Seance[]>([]);
  const [seancesInfo, setSeancesInfo] = useState('');
  const [seancesError, setSeancesError] = useState('');
  // Конфигурация всплывающих окон для добавления залов, фильмов
  const [showAddHallForm, setShowAddHallForm] = useState<boolean>(false);
  const [showAddFilmForm, setShowAddFilmForm] = useState<boolean>(false);
  // Конфигурация drag&drop фильмов
  const [showAddSeansForm, setShowAddSeansForm] = useState<boolean>(false);
  const [selectedFilmForSeans, setSelectedFilmForSeans] = useState<Film | null>(null);
  const [selectedHallForSeans, setSelectedHallForSeans] = useState<Hall | null>(null);
  // Конфигураця для открытия/закрытия продаж
  const [openCloseValue, setOpenCloseValue] = useState<0 | 1>(0);
  const [activeHallToSales, setActiveHallIdToSales] = useState<number | null>(null)
  const [salesError, setSalesError] = useState('');
  // Конфигурация размера экрана
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  // Установка активных вкладок
  useEffect(() => {
    if (halls.length > 0) {
      if (activeHallIdToConfig === null) {
        setActiveHallIdToConfig(halls[0].id);
      }
      if (activeHallToPricing === null) {
        setActiveHallToPricing(halls[0].id);
      }
      if (activeHallToSales === null) {
        setActiveHallIdToSales(halls[0].id);
      }
    }
  }, [halls, activeHallIdToConfig, activeHallToPricing, activeHallToSales]);

  // Load hall configuration when activeHallIdToConfig changes
  useEffect(() => {
    const loadHallConfig = async () => {
      if (activeHallIdToConfig === null) return;
      try {
        const data = await BackendAPI.getAllData();
        const hall = data.halls.find((h: Hall) => h.id === activeHallIdToConfig);
        if (!hall) {
          setSeatsError('Зал не найден');
          return;
        }
        setRowsInput(hall.hall_rows);
        setColsInput(hall.hall_places);
        const initialSeats: Seat[] = [];
        hall.hall_config.forEach((rowArr, rowIndex) => {
          rowArr.forEach((seatTypeStr, colIndex) => {
            const seatType = ["standart", "vip", "disabled"].includes(seatTypeStr) ? seatTypeStr as SeatType : "standart";
            initialSeats.push({ row: rowIndex, col: colIndex, seatType });
          });
        });
        setSeats(initialSeats);
        setSeatsError('');
      } catch (error) {
        if (error instanceof Error) {
          setSeatsError(error.message);
        }
      }
    };
    loadHallConfig();
  }, [activeHallIdToConfig]);

  // Load hall pricing when activeHallToPricing changes
  useEffect(() => {
    const loadHallPricing = async () => {
      if (activeHallToPricing === null) return;
      try {
        const data = await BackendAPI.getAllData();
        const hall = data.halls.find((h: Hall) => h.id === activeHallToPricing);
        if (!hall) {
          setPricingError('Зал не найден');
          return;
        }
        setStandardPrice(hall.hall_price_standart);
        setVipPrice(hall.hall_price_vip);
        setPricingError('');
      } catch (error) {
        if (error instanceof Error) {
          setPricingError(error.message);
        }
      }
    };
    loadHallPricing();
  }, [activeHallToPricing]);

  // Load hall sales open/close status when activeHallToSales changes
  useEffect(() => {
    const loadHallSalesStatus = async () => {
      if (activeHallToSales === null) return;
      try {
        const data = await BackendAPI.getAllData();
        const hall = data.halls.find((h: Hall) => h.id === activeHallToSales);
        if (!hall) {
          setSalesError('Зал не найден');
          return;
        }
        setOpenCloseValue(hall.hall_open === 1 ? 1 : 0);
        setSalesError('');
      } catch (error) {
        if (error instanceof Error) {
          setSalesError(error.message);
        }
      }
    };
    loadHallSalesStatus();
  }, [activeHallToSales]);
  
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await BackendAPI.getAllData();
        setHalls(data.halls);
        setFilms(data.films);
        setSeances(data.seances);
        setIsLoading(false);
        // console.log(data);
      } catch (error) {
        console.log('Ошибка получения данных:', (error as Error).message);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleAccordion = (key: string) => {
    setIsOpenAccordion(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  }

  const handleDeleteHall = async () => {
    if (hallToDelete !== null) {
      try {
        const result = await BackendAPI.deleteHall(hallToDelete);
        setHalls(result.halls);
        setSeances(result.seances);
        setHallToDelete(null);
        if (selectedHallId === hallToDelete) {
          setSelectedHallId(null);
          setSeats([]);
        }
      } catch (error) {
        if (error instanceof Error) {
          setHallsError(error.message);
        }
      }
    }
  }
  useEffect(() => {
    if (hallToDelete !== null) {
      const deletedHallId = hallToDelete;
      handleDeleteHall().then(() => {
        // After deletion, update active hall states if needed
        if (halls.length > 0) {
          // Find next hall id after deletion
          const nextHall = halls.find(hall => hall.id !== deletedHallId);
          const nextHallId = nextHall ? nextHall.id : null;

          if (activeHallIdToConfig === deletedHallId) {
            setActiveHallIdToConfig(nextHallId);
          }
          if (activeHallToPricing === deletedHallId) {
            setActiveHallToPricing(nextHallId);
          }
          if (activeHallToSales === deletedHallId) {
            setActiveHallIdToSales(nextHallId);
          }
        } else {
          // No halls left, set active states to null
          if (activeHallIdToConfig === deletedHallId) {
            setActiveHallIdToConfig(null);
          }
          if (activeHallToPricing === deletedHallId) {
            setActiveHallToPricing(null);
          }
          if (activeHallToSales === deletedHallId) {
            setActiveHallIdToSales(null);
          }
        }
      });
    }
  });

  const toggleAddHall = (updatedHalls: Hall[]) => {
    setHalls(updatedHalls);
    setShowAddHallForm(false);
  }

  const cycleSeatType = (currentType: SeatType): SeatType => {
    switch (currentType) {
      case "standart":
        return "vip";
      case "vip":
        return "disabled";
      case "disabled":
        return "standart";
      default:
        return "standart";
    }
  };

  useEffect(() => {
    setSeats(prevSeats => {
      const updatedSeats: Seat[] = [];
      for (let row = 0; row < rowsInput; row++) {
        for (let col = 0; col < colsInput; col++) {
          const existingSeat = prevSeats.find(s => s.row === row && s.col === col);
          if (existingSeat) {
            updatedSeats.push(existingSeat);
          } else {
            updatedSeats.push({ row, col, seatType: "standart" });
          }
        }
      }
      return updatedSeats;
    });
  }, [rowsInput, colsInput]);

  const updateConfigHall = async() => {
    try {
      if (activeHallIdToConfig === null) {
        setSeatsError('Зал не выбран');
        return;
      }
      const config: string[][] = [];
      for (let row = 0; row < rowsInput; row++) {
        const rowArr: string[] = [];
        for (let col = 0; col < colsInput; col++) {
          const seat = seats.find(s => s.row === row && s.col === col);
          rowArr.push(seat ? seat.seatType : "standart");
        }
        config.push(rowArr);
      }
      await BackendAPI.updateHallConfig(activeHallIdToConfig, rowsInput, colsInput, config);
      setSeatsInfo('Конфигурация зала сохранена');
    } catch (error) {
      if (error instanceof Error)
      setSeatsError(error.message);
    }
  }

  const resetConfigHall = () => {
    setRowsInput(10);
    setColsInput(10);
    const defaultSeats: Seat[] = [];
    for (let row = 0; row < rowsInput; row++) {
      for (let col = 0; col < colsInput; col++) {
        defaultSeats.push({ row, col, seatType: "standart" });
      }
    }
    setSeats(defaultSeats);
  }

  // Изменение размера сетки рядов/мест при изменении ширины экрана 
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);      
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const updatePrices = async() => {
    try {
      if (activeHallToPricing === null) {
        setPricingError('Зал не выбран')
        return;
      }
      await BackendAPI.updateTicketPrices(activeHallToPricing, standardPrice, vipPrice)
      setPricingInfo('Цены сохранены');
    } catch (error) {
      if (error instanceof Error)
        setPricingError(error.message);
    }
  }
  const resetPrices = () => {
    setStandardPrice(100);
    setVipPrice(350);
  }

  const toggleAddFilm = async() => {
    const data = await BackendAPI.getAllData();
    setFilms(data.films);
    setShowAddFilmForm(!showAddFilmForm);
  }

  const handleDeleteFilm = async () => {
    if (filmToDelete !== null) {
      try {
        const result = await BackendAPI.deleteFilm(filmToDelete);
        setFilms(result.films);
        setSeances(result.seances);
        setFilmToDelete(null);
        } catch (error) {
          if (error instanceof Error) {
            setSeancesError(error.message);
          }
      }
    }
  }
  useEffect(() => {
    if (filmToDelete !== null) {
      handleDeleteFilm();
    }
  });
  
  const handleDeleteSeance = (seanceId: number) => {
    const filteredSeances = seances.filter(seance => seance.id !== seanceId)
    setSeances(filteredSeances)
  }

  const handleAddSeans = (newSeance: { hallId: number; filmId: number; seanceTime: string }) => {
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const newStart = timeToMinutes(newSeance.seanceTime);
    const film = films.find(f => f.id === newSeance.filmId);
    if (!film) {
      console.log("Фильм не найден");
      return;
    }
    const newEnd = newStart + film.film_duration;

    if (newEnd > 24 * 60) {
      throw new Error("Ошибка: сеанс должен заканчиваться не позднее 23:59.");
    }

    const overlap = seances.some(seance => {
      if (seance.seance_hallid !== newSeance.hallId) return false;
      const existingFilm = films.find(f => f.id === seance.seance_filmid);
      if (!existingFilm) return false;
      const existingStart = timeToMinutes(seance.seance_time);
      const existingEnd = existingStart + existingFilm.film_duration;
      return (newStart < existingEnd) && (newEnd > existingStart);
    });

    if (overlap) {
      throw new Error("Ошибка: сеанс пересекается с уже существующим сеансом.");
    }

    const tempId = Date.now();
    const seanceToAdd: Seance = {
      id: tempId,
      seance_hallid: newSeance.hallId,
      seance_filmid: newSeance.filmId,
      seance_time: newSeance.seanceTime,
    };
    setSeances(prevSeances => [...prevSeances, seanceToAdd]);
    setShowAddSeansForm(false);
    setSelectedFilmForSeans(null);
    setSelectedHallForSeans(null);
  };

  const saveSeances = async () => {
    try {
      const fentchSeances = (await BackendAPI.getAllData()).seances; 
      const fentchSeancesId = (await BackendAPI.getAllData()).seances.map(seances => seances.id);
      const seancesToSave = seances.filter(seance => !fentchSeancesId.includes(seance.id))
      if (fentchSeances.length !== seances.length) {
        await Promise.all(fentchSeances.map(seance => BackendAPI.deleteSeance(seance.id)));
        await Promise.all(seances.map(seance => BackendAPI.addSeance(seance.seance_hallid, seance.seance_filmid, seance.seance_time)));
      } else {
        await Promise.all(seancesToSave.map(seance => BackendAPI.addSeance(seance.seance_hallid, seance.seance_filmid, seance.seance_time)));
      }
      setSeancesInfo('Сеансы сохранены');
    } catch (error) {
      if (error instanceof Error) {
        setSeancesError(error.message)
      }
    }
  };

  const resetSeances = async () => {
    try {
      const fentchSeances = (await BackendAPI.getAllData()).seances;
      if (fentchSeances.length > 0) {
        await Promise.all(seances.map(seance => BackendAPI.deleteSeance(seance.id)));
      }
      setSeances([]);
      setSeancesInfo('Сеансы сброшены и шкала времени очищена');
    } catch (error) {
      if (error instanceof Error) {
        setSeancesError(error.message);
      }
    }
  }; 
  
  const handleOpenCloseHall = async () => {
    try {
      if (activeHallToSales === null) {
        setSalesError('Зал не выбран');
        return;
      }
      const newValue = openCloseValue === 0 ? 1 : 0;
      await BackendAPI.openCloseHall(activeHallToSales, newValue);
      setOpenCloseValue(newValue);
      const data = await BackendAPI.getAllData();
      setHalls(data.halls)
      // console.log(data.halls.filter(hall => hall.hall_open === 1).map(hall => hall.hall_name));
    } catch (error) {
      if (error instanceof Error) {
        setSalesError(error.message)
      }
    }
  }

  return (
    <>
      {/* Блок "Управление залами" */}
      <div className="block">
        <span className="block__line line__trimmed-top" onClick={() => toggleAccordion('halls')}>
          <h2 className="block__title">Управление залами</h2>
        </span>
        {isOpenAccordion.halls && <div className="block__content">
          <p className="block__config-title">Доступные залы:</p>
          {isLoading ? (
            <p className="block__config__loading">Загрузка залов...</p>
          ) : (
            <ul className="block__hall-list">
              {halls.length > 0 ? (
                halls.map(hall => (
                  <li className="block__hall-list__el" key={hall.id}>
                    {hall.hall_name} 
                    <button
                      className="block__delete-btn"
                      onClick={() => setHallToDelete(hall.id)}
                      disabled={hallToDelete === hall.id}
                      >
                    </button>
                  </li>
                ))
              ) : (
                <li className="block__hall-list__el">Залы не найдены</li>
              )}
            </ul>
          )}
          {hallsError && <p className="block__error">{hallsError}</p>}
          <button className="form__submit-btn" onClick={() => setShowAddHallForm(true)}>Создать зал</button>
          {showAddHallForm && <AddHallForm onAddHall={toggleAddHall} onCancel={() => setShowAddHallForm(false)} />}
        </div>}
      </div>

      {/* Блок "Конфигурация залов" */}
      <div className="block">
        <span className="block__line" onClick={() => toggleAccordion('config')}>
          <h2 className="block__title">Конфигурация залов</h2>
        </span>
        {isOpenAccordion.config && <div className="block__content">
        <p className="block__config-title">Выберите зал для конфигурации:</p>
        <div className="block__hall__btns">
          {halls.map(hall => (
            <div
              key={hall.id}
              onClick={async () => {
                try {
                  const data = await BackendAPI.getAllData();
                  const freshHall = data.halls.find((h: Hall) => h.id === hall.id);
                  if (!freshHall) {
                    setSeatsError('Зал не найден');
                    return;
                  }
                  setActiveHallIdToConfig(freshHall.id);
                  setRowsInput(freshHall.hall_rows);
                  setColsInput(freshHall.hall_places);
                  const initialSeats: Seat[] = [];
                  freshHall.hall_config.forEach((rowArr, rowIndex) => {
                    rowArr.forEach((seatTypeStr, colIndex) => {
                      const seatType = ["standart", "vip", "disabled"].includes(seatTypeStr) ? seatTypeStr as SeatType : "standart";
                      initialSeats.push({ row: rowIndex, col: colIndex, seatType });
                    });
                  });
                  setSeats(initialSeats);
                } catch (error) {
                  if (error instanceof Error) {
                    setSeatsError(error.message);
                  }
                }
              }}
              className={activeHallIdToConfig === hall.id ? "block__hall-btn_active" : "block__hall-btn"}
            >
              {hall.hall_name}
            </div>
          ))}
        </div>
        <p className="block__config-title">Укажите количество рядов и максимальное количество кресел в ряду:</p>
        <div className="block__input-rows-cols-container">
          <div className="block__input-box">
            <label htmlFor="rows" className="block__input__label">Рядов, шт.</label>
            <input
              className="block__input"
              type="number" 
              name="rows" 
              id="rows" 
              min={1}
              value={rowsInput}
              onChange={e => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val > 0) {
                  setRowsInput(val);
                }
              }}
              />
          </div>
          <p className="block__rows-cols-mult">X</p>
          <div className="block__input-box">
            <label htmlFor="cols" className="block__input__label">Мест, шт.</label>
            <input
              className="block__input" 
              type="number" 
              name="cols" 
              id="cols" 
              min={1}
              value={colsInput}
              onChange={e => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val > 0) {
                  setColsInput(val);
                }
              }}
              />
          </div>
        </div>
        <p className="block__config-title">Теперь вы можете указать типы кресел на схеме зала:</p>
        <div className="block__seats-type-container">
          <div className="block__seats__description"><div className="standart seat_legend"></div>— обычные кресла</div>
          <div className="block__seats__description"><div className="vip seat_legend"></div>— VIP кресла</div>
          <div className="block__seats__description"><div className="disabled seat_legend"></div>— заблокированные (нет кресла)</div>
        </div>
        <p className="block__config-title__seats-grid">Чтобы изменить вид кресла, нажмите по нему левой кнопкой мыши</p>
        <div className="block__seats-grid__container">
          <p className="block__seats-grid__title">Экран</p>
          <div className="block__seats-grid" 
            style={{
              gridTemplateColumns: `repeat(${colsInput}, ${windowWidth < 400 ? 16 : windowWidth < 576 ? 20: 26}px)`, 
              gridTemplateRows: `repeat(${rowsInput}, ${windowWidth < 400 ? 16 : windowWidth < 576 ? 20: 26}px)`}}
            >
            {activeHallIdToConfig !== null && (() => {
              const hall = halls.find(h => h.id === activeHallIdToConfig);
              if (!hall) return null;
              const seatsGrid = [];
              for (let row = 0; row < rowsInput; row++) {
                for (let col = 0; col < colsInput; col++) {
                  const seatIndex = seats.findIndex(s => s.row === row && s.col === col);
                  const seatType = seatIndex !== -1 ? seats[seatIndex].seatType : "standart";
                  seatsGrid.push(
                    <div
                      key={`${row}-${col}`}
                      className={`block__seat ${seatType}`}
                      onClick={() => {
                        const newSeatType = cycleSeatType(seatType);
                        setSeats(prevSeats => {
                          const updatedSeats = [...prevSeats];
                          if (seatIndex !== -1) {
                            updatedSeats[seatIndex] = { row, col, seatType: newSeatType };
                          } else {
                            updatedSeats.push({ row, col, seatType: newSeatType });
                          }
                          return updatedSeats;
                        });
                      }}
                    >
                    </div>
                  );
                }
              }
              return seatsGrid;
            })()}
          </div>
        </div>
        {seatsInfo && <p className="block__info">{seatsInfo}</p>}
        {seatsError && !seatsInfo && !activeHallIdToConfig && <p className="block__error">{seatsError}</p>}
        <div className="form__btns">
          <button type="button" className="form__decline-btn" onClick={resetConfigHall}>Отмена</button>
          <button type="button" className="form__submit-btn" onClick={updateConfigHall}>Сохранить</button>
        </div>
        </div>}
      </div>

      {/* Конфигурация цен */}
      <div className="block">
        <span className="block__line" onClick={() => toggleAccordion('prices')}>
          <h2 className="block__title">Конфигурация цен</h2>
        </span>
        {isOpenAccordion.prices && <div className="block__content">
          <p className="block__config-title">Выберите зал для конфигурации:</p>
          <div className="block__hall__btns">
            {halls.map(hall => (
              <div
                key={hall.id}
                onClick={async () => {
                  try {
                    const data = await BackendAPI.getAllData();
                    const freshHall = data.halls.find((h: Hall) => h.id === hall.id);
                    if (!freshHall) {
                      setPricingError('Зал не найден');
                      return;
                    }
                    setActiveHallToPricing(freshHall.id);
                    setStandardPrice(freshHall.hall_price_standart);
                    setVipPrice(freshHall.hall_price_vip);
                  } catch (error) {
                    if (error instanceof Error) {
                      setPricingError(error.message);
                    }
                  }
                }}
                className={activeHallToPricing === hall.id ? "block__hall-btn_active" : "block__hall-btn"}
              >
                {hall.hall_name}
              </div>
            ))}
            </div>
            <p className="block__config-title">Установите цены для типов кресел:</p>
            <div className="block__input-rows-cols-container">
              <div className="block__input-box">
                <label htmlFor="standart_price" className="block__input__label">Цена, рублей</label>
                <div className="block__pricing">
                  <input
                    className="block__input"
                    type="number" 
                    name="rows" 
                    id="standart_price" 
                    min={0}
                    step={1}
                    value={standardPrice}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 0) {
                        setStandardPrice(val);
                      }
                    }}
                  />
                  <div className="block__seats__description">за<div className="standart seat_legend"></div>обычные кресла</div>
                </div>
                <label htmlFor="vip_price" className="block__input__label">Цена, рублей</label>
                <div className="block__pricing">
                  <input
                    className="block__input"
                    type="number" 
                    name="rows" 
                    id="vip_price" 
                    min={0}
                    step={1}
                    value={vipPrice}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 0) {
                        setVipPrice(val);
                      }
                    }}
                  />
                  <div className="block__seats__description">за<div className="vip seat_legend"></div>VIP кресла</div>
                </div>
              </div>   
            </div>
            {pricingInfo && <p className="block__info">{pricingInfo}</p>}
            {pricingError && !activeHallToPricing && <p className="block__error">{pricingError}</p>}
            <div className="form__btns">
              <button type="button" className="form__decline-btn" onClick={resetPrices}>Отмена</button>
              <button type="button" className="form__submit-btn" onClick={updatePrices}>Сохранить</button>
            </div>
          </div>}  
        </div>

        {/* Сетка сеансов */}
        <div className="block">
          <span className="block__line" onClick={() => toggleAccordion('seances')}>
            <h2 className="block__title">Сетка сеансов</h2>
          </span>
          {isOpenAccordion.seances && <div className="block__content">
            <button type="submit" className="form__submit-btn" onClick={() => setShowAddFilmForm(true)}>Добавить фильм</button>
            {showAddFilmForm && <AddFilmForm onAddFilm={toggleAddFilm} onCancel={toggleAddFilm}/>}
            <ul className="block__films-list">
              {films.map(film => (
                <li
                  className="block__films-list__film-el"
                  key={film.id}
                  style={{ backgroundColor: colors[film.id % colors.length] }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", film.id.toString());
                    e.dataTransfer.effectAllowed = "move";
                  }}
                >
                  <div className="block__films-list__film-el__film">
                    <img src={film.film_poster} alt="Постер" className="block__films-box__film-poster"/>
                    <div className="block__films-list__film-el__film-text">
                      <div className="block__films-list__film-el__film-name">{film.film_name}</div>
                      <div className="block__films-list__film-el__film-duration">{`${film.film_duration} ${declOfNum(film.film_duration)}`}</div>
                    </div>
                  </div>
                  <button
                      className="block__delete-btn delete-film"
                      onClick={() => setFilmToDelete(film.id)}
                      disabled={hallToDelete === film.id}
                    >
                  </button>
                </li>
              ))}
            </ul>
            <div className="block__seances-container">
              {halls.map(hall => (
                <div className="block__seance-box" key={hall.id}>
                  <p className="block__hall-title">{hall.hall_name}</p>
                  <SeanceSchedule
                    hall={hall}
                    seances={seances}
                    films={films}
                    colors={colors}
                    key={hall.id}
                    onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                      e.preventDefault();
                      const filmIdStr = e.dataTransfer.getData("text/plain");
                      const filmId = parseInt(filmIdStr);
                      const film = films.find(f => f.id === filmId);
                      if (film) {
                        setSelectedFilmForSeans(film);
                        setSelectedHallForSeans(hall);
                        setShowAddSeansForm(true);
                      }
                    }}
                    onDeleteSeance={handleDeleteSeance}
                  />
                </div>
              ))}
            </div>
            {seancesInfo && !seancesError && <p className="block__info">{seancesInfo}</p>}
            {seancesError && !seancesInfo && <p className="block__error">{seancesError}</p>}
            <div className="form__btns">
              <button type="button" className="form__decline-btn" onClick={resetSeances}>Отмена</button>
              <button type="button" className="form__submit-btn" onClick={saveSeances}>Сохранить</button>
            </div>
          </div>}
          </div>
          {showAddSeansForm && selectedFilmForSeans && selectedHallForSeans && (
            <AddSeansForm
              initialHall={{ id: selectedHallForSeans.id, hall_name: selectedHallForSeans.hall_name }}
              initialFilm={{ id: selectedFilmForSeans.id, film_name: selectedFilmForSeans.film_name }}
              onAddSeans={handleAddSeans}
              onCancel={() => {
                setShowAddSeansForm(false);
                setSelectedFilmForSeans(null);
                setSelectedHallForSeans(null);
              }}
            />
          )}

        {/* Открытие продаж */}
        <div className="block">
          <span className="block__line" onClick={() => toggleAccordion('sales')}>
              <h2 className="block__title">Открыть продажи</h2>
          </span>
          {isOpenAccordion.sales && <div className="block__content">
            <p className="block__config-title sales__title">Выберите зал для открытия/закрытия продаж:</p>
            <div className="block__hall__btns">
              {halls.map(hall => (
                <div
                  key={hall.id}
                  onClick={async () => {
                    try {
                      const data = (await BackendAPI.getAllData()).halls;
                      const freshHall = data.find((h: Hall) => h.id === hall.id);
                      const freshHallIsOpen = freshHall?.hall_open
                      if (!freshHall) {
                        setSalesError('Зал не найден');
                        return;
                      }
                      setActiveHallIdToSales(freshHall.id);
                      setOpenCloseValue((freshHallIsOpen === 1) ? 1 : 0)
                    } catch (error) {
                      if (error instanceof Error) {
                        setSalesError(error.message)
                      }
                    }
                  }}
                  className={activeHallToSales === hall.id ? "block__hall-btn_active" : "block__hall-btn"}
                >
                  {hall.hall_name}
                </div>
              ))}
            </div>
            {activeHallToSales && openCloseValue === 0 && <p className="block__config-title sales__open-text">Всё готово к открытию</p>}
            {salesError && !activeHallToSales && <p className="block__error">{salesError}</p>}
            <div className="form__btns">
              <button type="button" className="form__submit-btn sales__btn" onClick={handleOpenCloseHall}>
                {openCloseValue === 0 ? "Открыть продажу билетов" : "Приостановить продажу билетов"}
              </button>
            </div>
          </div>}
        </div>
    </>
  );
}

export default AdminInterface;