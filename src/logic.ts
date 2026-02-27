import { randomInt } from 'crypto';

/**
 * Генерирует криптографически стойкий пароль.
 * Поддерживает интервалы: A-Z (большие), a-z (маленькие), 0-9 или 1-9 (цифры), # (символы)
 */
export function generatePassword(length: number = 12, charsetType: string = 'A-z9#'): string {
    const sets = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        digits: '0123456789',
        symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
    };

    let allChars = '';
    const mustInclude: string[] = [];

    // 1. Проверяем на наличие больших букв (A-Z, A-z, a-Z)
    if (charsetType.includes('A') || (charsetType.includes('Z') && charsetType.toLowerCase().includes('a'))) {
        allChars += sets.upper;
        mustInclude.push(sets.upper);
    }

    // 2. Проверяем на наличие маленьких букв (a-z, A-z, a-Z)
    if (charsetType.includes('a') || (charsetType.includes('z') && charsetType.toUpperCase().includes('A'))) {
        allChars += sets.lower;
        mustInclude.push(sets.lower);
    }

    // 3. Проверяем на наличие цифр (0-9, 1-9, или просто 9)
    if (charsetType.includes('9') || charsetType.includes('0')) {
        allChars += sets.digits;
        mustInclude.push(sets.digits);
    }

    // 4. Проверяем на наличие спецсимволов (#)
    if (charsetType.includes('#')) {
        allChars += sets.symbols;
        mustInclude.push(sets.symbols);
    }

    // Фоллбек, если ввод пустой или непонятный
    if (allChars === '') {
        allChars = sets.upper + sets.lower + sets.digits + sets.symbols;
        mustInclude.push(sets.upper, sets.lower, sets.digits, sets.symbols);
    }

    let password = '';

    // Гарантируем по одному символу из каждой выбранной категории
    mustInclude.forEach(set => {
        password += set[randomInt(0, set.length)];
    });

    // Дозаполняем до нужной длины
    for (let i = password.length; i < length; i++) {
        password += allChars[randomInt(0, allChars.length)];
    }

    // Перемешивание Фишера-Йетса
    const arr = password.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = randomInt(0, i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr.join('');
}