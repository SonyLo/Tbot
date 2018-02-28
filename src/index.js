const TelegramBot = require('node-telegram-bot-api')
const Config = require('./config')
const Helper = require('./helper')
const keyboard = require('./keyboard')
const kb = require('./keyboard_buttons')
const mongoose = require('mongoose')
const prodBD = require('../database.json')
let order = []
const bot = new TelegramBot(Config.TOKEN, { // создаю подключение к боту
    polling:true
})
mongoose.Promise = global.Promise
require('./models/Product.model')// подключаем модель
const Product = mongoose.model('products')


require('./models/Client.model')// подключаем модель
const Client = mongoose.model('clients')

const ACTION_TYPE = {
    ADD_ORDER: 'aor'
}

Helper.logStart()// есл все хорошо на консоль сообщение "Я родился"

// Работа с БД
mongoose.connect(Config.DB_URL)//подключение к бд
.then(()=>console.log('В бд'))// если все найс то выводим на консоль
.catch(e => console.log(e))// если нет выводим ошибку





//======================================================================== работа с Ботом


//принимаю сообщение
bot.on("message", msg => { 
    console.log("Kyky", msg.text, msg.from.first_name)
    const chatId = Helper.getChatId(msg)   
       // кейс клавиатур 
    switch (msg.text){
            
           case kb.home.aroll: 
            sendProdByQuery(chatId, {type_id:3})
            break
               
               
           case kb.home.kroll: 
            sendProdByQuery(chatId, {type_id:1})  
            break
           case kb.home.all: 
            sendProdByQuery(chatId, {})  
           break
        //bot.sendMessage(Helper.getChatId(msg), 'Ну выбирай)', {})
             
                           
           case kb.home.maki:
            sendProdByQuery(chatId, {type_id:2})        
         break
            case 
            kb.home.set: sendProdByQuery(chatId, {type_id:4})  
            break
           
            case kb.home.order:
                sendOrder(chatID, order)
           // тут нужно отправить выбраные товары пользователю
             break
       }
        // кейс клавиатур 
       
       })

bot.on('callback_query', query => {
let data
try {
    data = JSON.parse(query.data)
}
catch(e){
         throw new Error('Data not obj')
        }
    const {type} = data
    if(type === ACTION_TYPE.ADD_ORDER )
        {
            //console.log(data)
           //const order = new Client({
             //  telegramID: data.
            order.push(data.prodId)
            console.log(order)
        }
    
  bot.answerCallbackQuery(query.id, 'add', false)
  
})

 

// обрабатываю команду start, отвечаю приветствием
bot.onText(/\/start/, msg =>{
    const text = 'Здравствуйте, чего желаете, '+ msg.from.first_name+'?'
    bot.sendMessage(Helper.getChatId(msg), text, {
        reply_markup:{
            keyboard: keyboard.home
        }})    
})


// обрабатываю команду /p
bot.onText(/\/p(.+)/, (msg, [source, match])=>{
    const prodID = Helper.getItemUuid(source)
    const chatID = Helper.getChatId(msg)
    
//Client.findOne({telegramID:msg.from.id})
    Product.findOne({id:prodID}).then(prod => {
        const caption = `${prod.name}\nЦена: ${prod.price} руб.\nВыход: ${prod.out[0]} г \\ ${prod.out[1]} шт.\nСостав: ${prod.ingrid}  `
         bot.sendPhoto(chatID, prod.img, {
             caption: caption,
            reply_markup:{
                 inline_keyboard:[
                     [
                         {
                            text: 'Добавить в корзину',
                           callback_data: 
                            JSON.stringify( {
                            type: ACTION_TYPE.ADD_ORDER,
                            prodId: prod.id})
                                 
                             
                         }
                     ]
                 ]
             }
         } )
         
       
    }) 
   
} )



function sendProdByQuery(chatID, query)
{
    Product.find(query).then(prod =>{
      const html = prod.map((f,i)=> {
          return `<b>${i+1}</b> ${f.name} - /p${f.id}`
      
      }).join('\n')
      
      sendHTML(chatID, html, 'home')
      }) 
}

function sendHTML(chatId, html, kbName = null) {
  const options = {
    parse_mode: 'HTML'
  }

  if (kbName) {
    options['reply_markup'] = {
      keyboard: keyboard[kbName]
    }
  }

  bot.sendMessage(chatId, html, options)
}

function sendOrder(chatID, mass)
{
  console.log('я в функции')

}