//modulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')

//modulos internos
const fs = require('fs')
const { error, Console } = require('console')
const { AsyncResource } = require('async_hooks')
const { get } = require('http')

operation()

function operation () {

    inquirer.prompt([
        {
        type: 'list',
        name:  'action',
        message: 'O que você deseja fazer?',
        choices: [
            'Criar Conta',
            'Consultar Saldo',
            'Depositar',
            'Sacar',
            'Sair'],
        },
    ]).then((answer) => {
        const action = answer['action']

        if(action === 'Criar Conta') {
            createAccount()
        } else if (action === 'Consultar Saldo') {
            getAccountBalance()
        } else if (action === 'Depositar') {
            deposit()
        } else if (action === 'Sacar') {
            withdraw()
        } else if (action === 'Sair') {
            console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
            process.exit()
        }
    })
    .catch((error) => console.log(error))
}

//creat account
function createAccount() {
    console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'))
    console.log(chalk.green('Defina as opções da sua conta a sequir'))

    buildAccount()
}

function buildAccount() {
    
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para sua conta:', 
        },
    ])
    .then((answer) => {
        const accountName = answer['accountName']
        
        console.info(accountName)
    
        if (!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        if(fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Está conta já existe, escolha outro nome!'),
            )
            buildAccount()
            return
        }

        fs.writeFileSync(`accounts/${accountName}.json`, `{"balance": 0}`,
            function (error) {
                console.log(error)
            },
        )

        console.log(chalk.green('Parabéns, sua conta foi criada!'))
        operation()
    })
    .catch((error) => console.log(error))
}

//add an amount to user account
function deposit() {

    inquirer.prompt([
        {
        name: 'accountName',
        message: 'Qual o nome da conta?'
        }
    ])
    .then((answer) => {

        const accountName = answer['accountName']

        //verify if account exists
        if(!checkAccount(accountName)) {
            return deposit()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja depositar?'
            },
        ])
        .then((answer) => {
            const amount = answer['amount']

            //add an amount
            addAmount(accountName, amount)
            operation()
        })
        .catch((error) => console.log(error))
    })
    .catch((error) => console.log(error)) 
}

function checkAccount(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Esta conta não existem, escolha outro nome!'))
        return false
    }

    return true
}

function addAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if(!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (error) {
            console.log(error)
        })

    console.log(chalk.green(`Foi depositado o valor de R$ ${amount} na sua conta!`))
}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}

//Show account balance
function getAccountBalance() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ])
    .then((answer) => {
        const accountName = answer['accountName']

        //verify if account exists
        if (!checkAccount(accountName)) {
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgGreen.black(`Olá, seu saldo é de R$ ${accountData.balance}`))
        operation()
    })
    .catch((error) => console.log(error))
}

// withdraw an amount from user account
function withdraw() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ])
    .then((answer) => {
        const accountName = answer['accountName']

        if(!checkAccount(accountName)) {
            withdraw()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja sacar?'
            }
        ])
        .then((answer) => {
            const amount = answer['amount']

            removeAmount(accountName, amount)
        })
        .catch((error) => console.log(error)

    )})
    .catch((error) => console.log(error))
}

function removeAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if(!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, confira o valor!'))
    return withdraw()
    }

    if(accountData.balance < amount) {
        console.log(chalk.bgRed.black('Valor indisponível!'))
        return withdraw()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(`accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (error) {
        console.log(error)
    }
    )

    console.log(chalk.green(`foi realizado um saque de R$ ${amount} da sua conta!`))
    operation()
}