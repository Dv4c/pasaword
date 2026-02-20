#!/usr/bin/env node

import chalk from 'chalk';
import fs from 'fs';
import os from 'os';
import path from 'path';

import clipboard from 'clipboardy'; // Добавили библиотеку для буфера
import { generatePassword } from './logic.js';

const DB_PATH = path.join(os.homedir(), '.pasaword_vault.json');

// И ПРОВЕРЬ: создается ли файл, если его нет
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
    
    // Определяем цвета заранее, чтобы код был читабельным
    


    console.log(`
${clr1('         _______')}             ${clr1('<-P-A-S-A-W-O-R-D->')}
${clr1('        /  ___  \\')}
${clr2('       /  /   \\  \\')}           ${clr2('v1.1.0 (Custom Engine)')}
${clr3('      _| |_____| |_')}          ${clr3('Author: Dv4c')}
${clr4('     [     __      ]')}         
${clr5('     |    /  \\     |')}         
${clr6('     |    |  |     |')}
${clr7('     |    ||||     |')}
${clr8('     |_____________|')}
    `);
}

const args = process.argv.slice(2); 
const command = args[0]; 

async function main() {
    showLogo();

    if (!command || command === '-h' || command === '--help') {
        console.log('\n '+clr1('Options')+':');
        console.log(`  ${clr2('-l, --list').padEnd(25)} ${clr7('Show list with all saved info')}`);
        
        console.log(`  ${clr2('-g, --generate').padEnd(25)} ${clr7('Generate password : ') + clr3('<service> <login>') + clr3(' [type] [len]')}`);
        console.log('      '+clr1('Default')+ ': ' + clr7('type') + clr7(' : ') + clr3('A-z9#') + ', ' + clr7('length') +clr7(' : ') + clr3('8'));
        console.log('      '+clr1('Types') +':   '+ clr3('A-Z, A-z, a-z, A-9, a-9, 1-9, A-z9, A-z9#'));
        
        console.log(`  ${clr2('-s, --save').padEnd(25)} ${clr7('Save manual password: ') + clr3('<service> <login> <pass>')}`);
        console.log(`  ${clr2('-cp, --copy').padEnd(25)} ${clr7('Copy password to clipboard: ') + clr3('<id>')}`);
        console.log(`  ${clr2('-d, --delete').padEnd(25)} ${clr7('Delete record by number: ') + clr3('<id>')}`);
        
        console.log();
        process.exit(0);
    }

    switch (command) {
        case '-l':
        case '--list':
            const db = readDB();
            // Названия столбцов в первый цвет (clr1)
            console.log(clr1('\n ID  SERVICE      LOGIN          PASSWORD'));
            // Линии во второй цвет (clr2)
            console.log(clr2(' ——————————————————————————————————————————'));
            
            db.forEach((item: any, i: number) => {
                // Номера (ID) — clr1
                const id = clr1(String(i + 1).padEnd(3));
                // Сервисы — clr2
                const svc = clr2(item.service.padEnd(12));
                // Логины — clr1
                const log = clr1(item.login.padEnd(14));
                // Пароли — clr2
                const pass = clr2(item.password);

                console.log(` ${id} ${svc} ${log} ${pass}`);
            });

            console.log(clr2(' ——————————————————————————————————————————'));
            
            // Tips в clr1
            console.log(clr1('\n Tips:'));
            // Команда в clr2, Описание в clr3
            console.log(`  ${clr2('-cp, --copy').padEnd(25)} ${clr7('Copy password to clipboard:')} ${clr3('<id>')}`);            
            break;

       case '-g':
        case '--generate':
            const svcGen = args[1];
            const logGen = args[2];
            const typeGen = args[3] || 'A-z9#'; 
            const lenGen = parseInt(args[4]) || 8;

            if (!svcGen || !logGen) {
                console.log(chalk.red('\n [!] Error: Service and login are required!'));
                return;
            }
            
            const genPass = generatePassword(lenGen, typeGen);
            const dbGen = readDB();
            dbGen.push({ service: svcGen, login: logGen, password: genPass });
            writeDB(dbGen);
            clipboard.writeSync(genPass);
            console.log(chalk.blue(` [+] Generated (${typeGen}, len: ${lenGen}): ${clr7(genPass)}`));
            console.log(clr2(` [✔] Saved and copied to clipboard!`));
            break;

        case '-s':
        case '--save':
            const svcSet = args[1];
            const logSet = args[2];
            const passSet = args[3]; 
            if (!svcSet || !logSet || !passSet) {
                console.log(chalk.red('\n [!] Error: Missing data!'));
                return;
            }
            const dbSet = readDB();
            dbSet.push({ service: svcSet, login: logSet, password: passSet });
            writeDB(dbSet);
            console.log(clr2(`\n [✔] Manual entry for ${svcSet} saved successfully!`));
            break;

        case '-cp':
        case '--copy':
            const idCp = parseInt(args[1]);
            const dbCp = readDB();
            if (dbCp[idCp - 1]) {
                clipboard.writeSync(dbCp[idCp - 1].password);
                console.log(clr2(`\n [✔] Password for ${chalk.bold(dbCp[idCp - 1].service)} copied to clipboard!`));
            } else {
                console.log(chalk.red('\n [!] Error: Record with this ID not found!'));
            }
            break;

        case '-d':
        case '--delete':
            const id = parseInt(args[1]);
            let list = readDB();
            if (list[id - 1]) {
                const removed = list.splice(id - 1, 1);
                writeDB(list);
                console.log(chalk.red(` [×] Deleted record for: ${removed[0].service}`));
            } else {
                console.log(chalk.red(' [!] Error: Record with this ID not found!'));
            }
            break;

        default:
            console.log(chalk.red(`\n [!] Unknown command: ${command}`));
    }
    
}

main();