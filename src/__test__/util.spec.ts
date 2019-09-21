/**
 * @file unit test for util.ts.
 * @author vabaly
 */
import { getCount, commaSeparatedList } from '../util';

describe('getCount', () => {
    const array = [0, false, ''];
    const doubleArray = array.concat(array);

    test('show return correct count', () => {
        expect(getCount(array, 0)).toBe(1);
        expect(getCount(array, 1)).toBe(0);
        expect(getCount(doubleArray, 0)).toBe(2);

        expect(getCount(array, false)).toBe(1);
        expect(getCount(array, true)).toBe(0);
        expect(getCount(doubleArray, false)).toBe(2);

        expect(getCount(array, '')).toBe(1);
        expect(getCount(array, 'string')).toBe(0);
        expect(getCount(doubleArray, '')).toBe(2);
    });
});

describe('commaSeparatedList', () => {
    test('should separate "" to [""]', () => {
        expect(commaSeparatedList('')).toEqual(['']);
    });

    test('should separate "," to ["", ""]', () => {
        expect(commaSeparatedList(',')).toEqual(['', '']);
    });

    test('should separate "1,2" to ["1", "2"]', () => {
        expect(commaSeparatedList('1,2')).toEqual(['1', '2']);
    });
});
