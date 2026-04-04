import { describe, it, expect } from 'vitest';
import { calculateLocagameDays, calculateLocagamePrice } from '../pricing';
import { isFrenchHoliday, isWeekend } from '../dateHolidays';

describe('calculateLocagameDays — bloc week-end', () => {
  it('lundi to mardi = 2 days', () => {
    // Mon 2026-03-09 to Tue 2026-03-10
    expect(calculateLocagameDays('2026-03-09', '2026-03-10')).toBe(2);
  });

  it('vendredi to lundi = 1 (bloc week-end)', () => {
    // Fri 2026-03-13 to Mon 2026-03-16: Ven déclenche bloc → 1 jour
    expect(calculateLocagameDays('2026-03-13', '2026-03-16')).toBe(1);
  });

  it('lundi to vendredi = 5 jours', () => {
    // Mon 2026-03-09 to Fri 2026-03-13 = Lun+Mar+Mer+Jeu+Ven(bloc) = 5
    expect(calculateLocagameDays('2026-03-09', '2026-03-13')).toBe(5);
  });

  it('lundi to lundi suivant = 5 (bloc week-end absorbe lun)', () => {
    // Mon 2026-03-09 to Mon 2026-03-16
    // Lun9+Mar10+Mer11+Jeu12+Ven13(bloc→Mar17), 17>16 STOP = 5
    expect(calculateLocagameDays('2026-03-09', '2026-03-16')).toBe(5);
  });

  it('single weekday = 1', () => {
    expect(calculateLocagameDays('2026-03-09', '2026-03-09')).toBe(1);
  });

  it('weekend only = 1 (sam déclenche bloc)', () => {
    // Sat to Sun: Sam déclenche bloc → 1 jour
    expect(calculateLocagameDays('2026-03-14', '2026-03-15')).toBe(1);
  });

  it('two full weeks Mon-Fri = 9', () => {
    // Mon9→Fri20: Lun+Mar+Mer+Jeu+Ven(bloc→Mar17)+Mar+Mer+Jeu+Ven(bloc→Mar24) = 9
    expect(calculateLocagameDays('2026-03-09', '2026-03-20')).toBe(9);
  });
});

describe('calculateLocagamePrice', () => {
  const P = 100;

  it('1 day = 100', () => {
    expect(calculateLocagamePrice(P, 1)).toBe(100);
  });

  it('2 days = 150 (P + 50%)', () => {
    expect(calculateLocagamePrice(P, 2)).toBe(150);
  });

  it('3 days = 180', () => {
    expect(calculateLocagamePrice(P, 3)).toBe(180);
  });

  it('4 days = 205', () => {
    expect(calculateLocagamePrice(P, 4)).toBe(205);
  });

  it('5 days (1 semaine) = 220', () => {
    expect(calculateLocagamePrice(P, 5)).toBe(220);
  });

  it('6 days (semaine + 1j) = 256.67', () => {
    expect(calculateLocagamePrice(P, 6)).toBeCloseTo(256.67, 2);
  });

  it('0 days = 0', () => {
    expect(calculateLocagamePrice(P, 0)).toBe(0);
  });

  it('10 days = ~403.33', () => {
    expect(calculateLocagamePrice(P, 10)).toBeCloseTo(403.33, 0);
  });
});

describe('isWeekend', () => {
  it('samedi = true', () => {
    expect(isWeekend('2026-03-14')).toBe(true); // Saturday
  });

  it('dimanche = true', () => {
    expect(isWeekend('2026-03-15')).toBe(true); // Sunday
  });

  it('lundi = false', () => {
    expect(isWeekend('2026-03-09')).toBe(false); // Monday
  });

  it('vendredi = false', () => {
    expect(isWeekend('2026-03-13')).toBe(false); // Friday
  });
});

describe('isFrenchHoliday', () => {
  it('14 juillet = true', () => {
    expect(isFrenchHoliday('2026-07-14')).toBe(true);
  });

  it('1er janvier = true', () => {
    expect(isFrenchHoliday('2026-01-01')).toBe(true);
  });

  it('25 decembre = true', () => {
    expect(isFrenchHoliday('2026-12-25')).toBe(true);
  });

  it('lundi de paques 2026 = true', () => {
    // Easter 2026 = April 5, so Easter Monday = April 6
    expect(isFrenchHoliday('2026-04-06')).toBe(true);
  });

  it('regular day = false', () => {
    expect(isFrenchHoliday('2026-06-15')).toBe(false);
  });

  it('2 janvier = false', () => {
    expect(isFrenchHoliday('2026-01-02')).toBe(false);
  });
});
