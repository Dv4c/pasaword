#!/usr/bin/env node

import chalk from 'chalk';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { generatePassword } from './logic.js';

const DB_PATH = path.join(os.homedir(), '.pasaword_vault.json');

const readDB = () => {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
        return [];
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
};

const writeDB = (data: any) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

const clr1 = chalk.rgb(201, 204, 161);
const clr2 = chalk.rgb(202,160,90);
const clr3 = chalk.rgb(174,106,71);
const clr4 = chalk.rgb(139,64,73);
const clr5 = chalk.rgb(84,51,68);
const clr6 = chalk.rgb(81,82,98);
const clr7 = chalk.rgb(99,120,125);
const clr8 = chalk.rgb(142,160,145);

function showLogo() {
    console.clear();
    console.log(`
${clr1('        ________')}           
${clr2('       /  ____  \\')}         
${clr3('      _| |____| |_')}                   
${clr4('     [     _      ]')}   ${clr2('             Dv4c_')}
${clr5('     |    /|\\     |')}  ${clr3(' __PASAWORD__/  _  \\        ')}
${clr6('     |    |||     |')}   ${clr4('\\_v1.4.1_/__  |_|  |')}
${clr7('     |    \\|/     |')}   ${clr5('            \\_____/')}
${clr8('     |____________|')}                     
    `);
}

const args = process.argv.slice(2); 
const command = args[0];

async function main() {
    showLogo();

    if (!command || command === '-h' || command === '--help') {
        console.log('\n ' + clr1('Usage') + ': ' + clr2('pasaword <command> [args]'));
        
        console.log('\n ' + clr1('Commands') + ':');
        console.log(`  ${clr2('-g, --generate').padEnd(20)} ${clr7('Generate:')} ${clr3('<service> <login> [type] [len]')}`);
        console.log(`  ${clr2('-l, --list').padEnd(20)} ${clr7('Show all saved credentials')}`);
        console.log(`  ${clr2('-f, --find').padEnd(20)} ${clr7('Search by service/login:')} ${clr3('<query>')}`);
        console.log(`  ${clr2('-s, --save').padEnd(20)} ${clr7('Manual save:')} ${clr3('<service> <login> <pass>')}`);
        console.log(`  ${clr2('-d, --delete').padEnd(20)} ${clr7('Delete ID, range (1-5) or all (-1)')}`);
        console.log(`  ${clr2('-u, --update').padEnd(20)} ${clr7('Update entry:')}`);
        console.log(`  ${''.padEnd(10)} ${clr3('-u -g <id> [type] [len]')} ${clr8('— Auto-generate')}`);
        console.log(`  ${''.padEnd(10)} ${clr3('-u -m <id> <pass>')}       ${clr8('— Manual input')}`);

        console.log('\n ' + clr1('Password Types (Default: A-z9#)') + ':');
        console.log(`  ${clr2('A-Z').padEnd(10)} ${clr7('Uppercase letters')}`);
        console.log(`  ${clr2('a-z').padEnd(10)} ${clr7('Lowercase letters')}`);
        console.log(`  ${clr2('A-z').padEnd(10)} ${clr7('Mixed case (guaranteed both)')}`);
        console.log(`  ${clr2('9').padEnd(10)} ${clr7('Digits (0-9)')}`);
        console.log(`  ${clr2('#').padEnd(10)} ${clr7('Symbols (!@#$%...)')}`);
        
        console.log(`\n ${clr1('Note:')} ${clr8('Combine types in any order; dashes are optional (e.g., "Az9#", "a9", "A#9z")')}`);
        
        console.log();
        process.exit(0);
    }

    switch (command) {
        case '-l':
        case '--list':
            const db = readDB();
            if (db.length === 0) {
                console.log(chalk.yellow('\n [!] Vault is empty. Generate a password first!'));
                process.exit(0);
            }
            renderTable(db);
            process.exit(0);
            break;

        case '-f':
        case '--find':
            const query = args[1]?.toLowerCase();
            if (!query) {
                console.log(chalk.red('\n [!] Error: Provide a search query (service or login).'));
                process.exit(1);
            }
            const fullDb = readDB();
            const filtered = fullDb.filter((item: any) => 
                item.service.toLowerCase().includes(query) || 
                item.login.toLowerCase().includes(query)
            );

            if (filtered.length === 0) {
                console.log(chalk.yellow(`\n [!] No records found for: "${query}"`));
            } else {
                console.log(clr1(`\n [+] Search results for: "${query}"`));
                renderTable(filtered, fullDb); // Передаем базу для корректных ID
            }
            process.exit(0);
            break;

        case '-g':
        case '--generate':
            const svcGen = args[1];
            const logGen = args[2];
            const typeGen = args[3] || 'A-z9#'; 
            const lenGen = parseInt(args[4]) || 12;

            if (!svcGen || !logGen) {
                console.log(chalk.red('\n [!] Error: Service and login are required!'));
                process.exit(1);
            }
            
            const genPass = generatePassword(lenGen, typeGen);
            const dbGen = readDB();
            dbGen.push({ service: svcGen, login: logGen, password: genPass });
            writeDB(dbGen);

            console.log(chalk.blue(`\n [+] Generated password:`));
            console.log(chalk.white.bgHex('#444').bold(`  ${genPass}  `)); 
            console.log(clr2(` [✔] Saved for ${svcGen}!`));
            process.exit(0);
            break;

        case '-s':
        case '--save':
            const svcSet = args[1];
            const logSet = args[2];
            const passSet = args[3]; 
            if (!svcSet || !logSet || !passSet) {
                console.log(chalk.red('\n [!] Error: Missing data!'));
                process.exit(1);
            }
            const dbSet = readDB();
            dbSet.push({ service: svcSet, login: logSet, password: passSet });
            writeDB(dbSet);
            console.log(clr2(`\n [✔] Manual entry for ${svcSet} saved successfully!`));
            process.exit(0);
            break;

        case '-d':
        case '--delete':
            const rangeArg = args[1];
            let list = readDB();

            if (!rangeArg) {
                console.log(chalk.red('\n [!] Error: Provide ID, range (1-5) or -1 to clear all.'));
                process.exit(1);
            }

            if (rangeArg === '-1') {
                writeDB([]);
                console.log(chalk.red('\n [!] All records have been deleted. Vault is empty.'));
                process.exit(0);
            }

            let idsToDelete: number[] = [];
            if (rangeArg.includes('-')) {
                const parts = rangeArg.split('-');
                const start = parseInt(parts[0]);
                const end = parseInt(parts[1]);

                if (isNaN(start) || isNaN(end) || start <= 0 || end <= 0 || start > end) {
                    console.log(chalk.red('\n [!] Error: Invalid range.'));
                    process.exit(1);
                }
                for (let i = start; i <= end; i++) idsToDelete.push(i);
            } else {
                const singleId = parseInt(rangeArg);
                if (!isNaN(singleId)) idsToDelete.push(singleId);
            }

            const initialLength = list.length;
            const newList = list.filter((_: any, index: number) => !idsToDelete.includes(index + 1));

            if (newList.length === initialLength) {
                console.log(chalk.red('\n [!] Error: No records found with provided IDs.'));
            } else {
                writeDB(newList);
                console.log(chalk.red(` [×] Successfully deleted ${initialLength - newList.length} record(s).`));
            }
            process.exit(0);
            break;

        case '-u':
        case '--update':
            const subCommand = args[1]; // -m или -g
            const updateId = parseInt(args[2]);
            let updateList = readDB();

            // 1. Если нет подкоманды или она неверная — на выход в хелп
            if (!subCommand || !['-m', '-g'].includes(subCommand)) {
                console.log(chalk.red('\n [!] Error: Specify update mode: -m (manual) or -g (generate).'));
                // Можно здесь не выходить, а просто вызвать логику хелпа, 
                // но проще прервать процесс, чтобы юзер чекнул --help сам
                process.exit(1);
            }

            // 2. Проверка ID
            if (isNaN(updateId) || !updateList[updateId - 1]) {
                console.log(chalk.red('\n [!] Error: Provide a valid record ID as the second argument.'));
                process.exit(1);
            }

            const currentItem = updateList[updateId - 1];
            let updatedPass: string;

            // 3. Логика по флагам
            if (subCommand === '-m') {
                // Режим MANUAL: pasaword -u -m <id> <new_pass>
                updatedPass = args[3]; 
                if (!updatedPass) {
                    console.log(chalk.red('\n [!] Error: Provide the new password for manual update.'));
                    process.exit(1);
                }
                console.log(clr2(`\n [!] Manual update for: ${currentItem.service}`));
            } else {
                // Режим GENERATE: pasaword -u -g <id> [type] [len]
                const typeUpdate = args[3] || 'A-z9#';
                const lenUpdate = parseInt(args[4]) || 12;

                updatedPass = generatePassword(lenUpdate, typeUpdate);
                console.log(clr1(`\n [+] Generated update for: ${currentItem.service} (${typeUpdate}, len: ${lenUpdate})`));
            }

            // Сохранение
            updateList[updateId - 1].password = updatedPass;
            writeDB(updateList);

            console.log(chalk.white.bgHex('#444').bold(`  ${updatedPass}  `));
            console.log(clr2(` [✔] Updated successfully!`));
            process.exit(0);
            break;

        default:
            console.log(chalk.red(`\n [!] Unknown command: ${command}`));
            process.exit(1);
    }
}

// Вспомогательная функция для отрисовки таблицы
function renderTable(data: any[], fullSource?: any[]) {
    console.log(clr1('\n ID  SERVICE      LOGIN          PASSWORD'));
    console.log(clr2(' ——————————————————————————————————————————'));
    data.forEach((item: any) => {
        // Если мы в поиске, нужно найти оригинальный индекс из полной базы
        const originalId = fullSource 
            ? fullSource.findIndex(x => x.password === item.password && x.login === item.login) + 1
            : data.indexOf(item) + 1;

        const id = clr1(String(originalId).padEnd(3));
        const svc = clr2(item.service.padEnd(12));
        const log = clr1(item.login.padEnd(14));
        const pass = clr2(item.password);
        console.log(` ${id} ${svc} ${log} ${pass}`);
    });
    console.log(clr2(' ——————————————————————————————————————————'));
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});