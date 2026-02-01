import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {

  // SESSION STORAGE
  setSession(key: string, value: any) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  getSession<T>(key: string): T | null {
    const val = sessionStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }

  removeSession(key: string) {
    sessionStorage.removeItem(key);
  }

  // LOCAL STORAGE
  setLocal(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getLocal<T>(key: string): T | null {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }

  removeLocal(key: string) {
    localStorage.removeItem(key);
  }
}
