# Сайт бронирования билетов в кино "Идем в кино"

Этот проект представляет собой веб-сайт для бронирования билетов в кино. Он позволяет пользователям просматривать расписание сеансов, выбирать места и приобретать билеты онлайн на сеансы в кинотеатрах.

## Набор технологий

- **React**: библиотека JavaScript для создания пользовательских интерфейсов.
- **TypeScript**: Типизированный надмножество JavaScript, который компилируется в обычный JavaScript.
- **Vite**: Быстрый инструмент для создания интерфейса и сервер разработки.
- **HTML5 и CSS3**: Разметка и оформление веб-страниц.
- **Пользовательский генератор QR-кодов**: Для генерации QR-кода используется [QRCreator.js](https://github.com/slesareva-gala/QR-Code)
- **Другие пакеты и инструменты**: Различные пакеты и инструменты npm, определенные в `package.json`.

Этот проект структурирован с использованием компонентов для различных частей приложения, включая интерфейс пользователя, администратора и генерацию QR-кодов.

## Функции

#### Возможности пользователя
- Просмотр списков фильмов и расписания.
- Выбор мест в кинозалах.
- Бронирование и покупка билетов онлайн.
- Генерация QR-кодов для билетов.

#### Возможности администратора
- Создание или редактирование залов.
- Создание или редактирование списка фильмов.
- Настройка цен.
- Создание или редактирование расписания сеансов фильмов.
- Запуск/приостановка работы залов.

## Начало работы

Чтобы запустить проект локально, установите зависимости и запустите сервер разработки:

```bash
npm install
npm run dev
```

Откройте свой браузер и перейдите на страницу `http://localhost:5173`, чтобы просмотреть приложение.

Ссылка на githubPage:[Идем в кино](https://kirsk077.github.io/BookingMovie/)