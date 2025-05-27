const BASE_URL = 'https://shfe-diplom.neto-server.ru';

type ApiResponse<T> = {
  success: boolean;
  result?: T;
  error?: string;
}

type Hall = {
  id: number;
  hall_name: string;
  hall_rows: number;
  hall_places: number;
  hall_config: string[][];
  hall_price_standart: number;
  hall_price_vip: number;
  hall_open: number;
}

type Film = {
  id: number;
  film_name: string;
  film_duration: number;
  film_description: string;
  film_origin: string;
  film_poster: string;
}

type Seance = {
  id: number;
  seance_filmid: number;
  seance_hallid: number;
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

class BackendAPI {
  private static async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options);
    const data: ApiResponse<T> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }
    return data.result as T;
  }

  static async getAllData(): Promise<{ halls: Hall[]; films: Film[]; seances: Seance[] }> {
    return this.request(`${BASE_URL}/alldata`);
  }

  static async login(login: string, password: string): Promise<string> {
    const params = new FormData();
    params.set('login', login);
    params.set('password', password);
    return this.request(`${BASE_URL}/login`, {
      method: 'POST',
      body: params,
    });
  }

  static async addHall(hallName: string): Promise<{ halls: Hall[] }> {
    const params = new FormData();
    params.set('hallName', hallName);
    return this.request(`${BASE_URL}/hall`, {
      method: 'POST',
      body: params,
    });
  }

  static async deleteHall(hallId: number): Promise<{ halls: Hall[]; seances: Seance[] }> {
    return this.request(`${BASE_URL}/hall/${hallId}`, {
      method: 'DELETE',
    });
  }

  static async updateHallConfig(
    hallId: number,
    rowCount: number,
    placeCount: number,
    config: string[][]
  ): Promise<Hall> {
    const params = new FormData();
    params.set('rowCount', rowCount.toString());
    params.set('placeCount', placeCount.toString());
    params.set('config', JSON.stringify(config));
    return this.request(`${BASE_URL}/hall/${hallId}`, {
      method: 'POST',
      body: params,
    });
  }

  static async updateTicketPrices(
    hallId: number,
    priceStandart: number,
    priceVip: number
  ): Promise<Hall> {
    const params = new FormData();
    params.set('priceStandart', priceStandart.toString());
    params.set('priceVip', priceVip.toString());
    return this.request(`${BASE_URL}/price/${hallId}`, {
      method: 'POST',
      body: params,
    });
  }

  static async openCloseHall(hallId: number, hallOpen: 0 | 1): Promise<Hall> {
    const params = new FormData();
    params.set('hallOpen', hallOpen.toString());
    return this.request(`${BASE_URL}/open/${hallId}`, {
      method: 'POST',
      body: params,
    });
  }

  static async addFilm(
    filmName: string,
    filmDuration: number,
    filmDescription: string,
    filmOrigin: string,
    filePoster: File
  ): Promise<{ films: Film[] }> {
    const params = new FormData();
    params.set('filmName', filmName);
    params.set('filmDuration', filmDuration.toString());
    params.set('filmDescription', filmDescription);
    params.set('filmOrigin', filmOrigin);
    params.append('filePoster', filePoster);
    return this.request(`${BASE_URL}/film`, {
      method: 'POST',
      body: params,
    });
  }

  static async deleteFilm(filmId: number): Promise<{ films: Film[]; seances: Seance[] }> {
    return this.request(`${BASE_URL}/film/${filmId}`, {
      method: 'DELETE',
    });
  }

  static async addSeance(
    seanceHallid: number,
    seanceFilmid: number,
    seanceTime: string
  ): Promise<{ seances: Seance[] }> {
    const params = new FormData();
    params.set('seanceHallid', seanceHallid.toString());
    params.set('seanceFilmid', seanceFilmid.toString());
    params.set('seanceTime', seanceTime);
    return this.request(`${BASE_URL}/seance`, {
      method: 'POST',
      body: params,
    });
  }

  static async deleteSeance(seanceId: number): Promise<{ seances: Seance[] }> {
    return this.request(`${BASE_URL}/seance/${seanceId}`, {
      method: 'DELETE',
    });
  }

  static async getHallConfig(seanceId: number, date: string): Promise<string[][]> {
    const url = new URL(`${BASE_URL}/hallconfig`);
    url.searchParams.set('seanceId', seanceId.toString());
    url.searchParams.set('date', date);
    return this.request(url.toString());
  }

  static async buyTickets(
    seanceId: number,
    ticketDate: string,
    tickets: { row: number; place: number; coast: number }[]
  ): Promise<Ticket[]> {
    const params = new FormData();
    params.set('seanceId', seanceId.toString());
    params.set('ticketDate', ticketDate);
    params.set('tickets', JSON.stringify(tickets));
    return this.request(`${BASE_URL}/ticket`, {
      method: 'POST',
      body: params,
    });
  }
}


export default BackendAPI;
