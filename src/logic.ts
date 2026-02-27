import { randomInt } from 'crypto';

/**
 * Генерирует криптографически стойкий случайный пароль
 */
export function generatePassword(length: number = 12, charsetType: string = 'A-z9#'): string {
    const sets: Record<string, string> = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        digits: '0123456789',
        symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
    };

    // Определяем, какие наборы использовать исходя из типа
    let characters = '';
    let mustInclude: string[] = [];

    if (charsetType.includes('A')) {
        characters += sets.upper;
        mustInclude.push(sets.upper);
    }
    if (charsetType.includes('a')) {
        characters += sets.lower;
        mustInclude.push(sets.lower);
    }
    if (charsetType.includes('9')) {
        characters += sets.digits;
        mustInclude.push(sets.digits);
    }
    if (charsetType.includes('#')) {
        characters += sets.symbols;
        mustInclude.push(sets.symbols);
    }

    // Если тип не распознан, берем всё (A-z9#)
    if (characters === '') {
        characters = sets.upper + sets.lower + sets.digits + sets.symbols;
        mustInclude = [sets.upper, sets.lower, sets.digits, sets.symbols];
    }

    let password = '';

    // 1. Гарантируем наличие хотя бы одного символа из каждой выбранной группы
    mustInclude.forEach(set => {
        password += set[randomInt(0, set.length)];
    });

    // 2. Дозаполняем оставшуюся длину
    for (let i = password.length; i < length; i++) {
        password += characters[randomInt(0, characters.length)];
    }

    // 3. Перемешиваем пароль, чтобы гарантированные символы не всегда были в начале
    return password.split('').sort(() => 0.5 - Math.random()).join('');
}