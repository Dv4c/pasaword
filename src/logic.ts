// src/logic.ts

/**
 * Генерирует случайный пароль заданной длины
 */
export function generatePassword(length: number = 8, charsetType: string = 'A-z9#'): string {
    const charsets: Record<string, string> = {
        'A-Z': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'a-z': 'abcdefghijklmnopqrstuvwxyz',
        'A-z': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        'A-9': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        'a-9': 'abcdefghijklmnopqrstuvwxyz0123456789',
        '1-9': '0123456789',
        'A-z9': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        'A-z9#': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+'
    };

    // Если ввели неизвестный код, используем полный набор по умолчанию
    const characters = charsets[charsetType] || charsets['A-z9#'];
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}