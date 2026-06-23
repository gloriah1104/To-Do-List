//📦 HTTP Headers 設定 - CORS 和內容類型設置
//📦 Request Listener 主函式 - 整個請求監聽器
//📦 監聽 data 事件 - 接收 Request Body
//📦 GET /todos - 獲取所有待辦事項
//📦 POST /todos - 新增待辦事項
//📦 DELETE /todos - 刪除待辦事項
//📦 DELETE /todos/:id - 刪除"特定"代辦事項
//📦 PATCH /todos/:id - 修改"特定"代辦事項
//📦 OPTIONS - 處理 CORS 預檢
//📦 404 Not Found - 路由不存在
//📦 伺服器啟動 - 服務器初始化

//遇到的問題：
// package.json 中缺少 "type": "module"，導致無法使用 ES6 模組語法（import/export）
// Node.js 模組演進：以前是用 require() (CommonJS)，現在主流是 import (ESM)。
// uuid 套件更新：uuid 套件在最新的版本中已經全面轉向使用 ESM 規範，所以它不再允許舊的 require() 方式來載入。

import http from 'http'; // 引入 Node.js 內建的 'http' 模組，讓我們有能力建立伺服器並處理網路請求
import { v4 as uuidv4 } from 'uuid'; // 引入 'uuid' 外部模組：並從中取出 v4 方法，重新命名為 uuidv4，這個方法用來生成獨一無二的識別碼（UUID）
import errorHandle from './errorHandle.js'; // 引入自己的模組，必須加上 .js

//* 以下是CommonJS 模組語法，與 ES6 模組語法不兼容，應該改成 import 語法 *//
//const http = require('http'); 
//const { v4: uuidv4 } = require('uuid'); 
//const errorHandle = require('./errorHandle');

const todos = []; // 建立一個空陣列 todos，用來存放待辦事項（To-Do items）。這個陣列會在伺服器運行期間保持在記憶體中，當使用者新增或刪除待辦事項時，這個陣列會被更新。

// #region HTTP Headers 設定
// 定義一個物件，裡面包含了幾個 HTTP Header 的設定
const headers =  {
   'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With', // 允許瀏覽器在跨域請求時攜帶這些 Header
   'Access-Control-Allow-Origin': '*', // 允許來自任何來源的請求（* 代表所有來源），這是 CORS（跨來源資源共享）的一部分，讓瀏覽器知道這個伺服器願意接受來自不同來源的請求
   'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE', // 允許瀏覽器使用這些 HTTP 方法來發送請求到這個伺服器，例如：PATCH、POST、GET、OPTIONS、DELETE 等等
  'Content-Type': 'application/json' // 傳送內容是 JSON 格式，這樣瀏覽器就知道如何解析和顯示這些資料
};
// #endregion

// #region Request Listener 主函式
// 定義一個函式(requestListener)，當有瀏覽器連線進來時，Node.js 就會自動執行這個函式
// req 代表 Request（需求），發出需求，例如網址、瀏覽器種類、使用者輸入的資料等等
// res 代表 Response（回應），回應使用端資訊，例如狀態碼、Header、Body 等等--------
const requestListener =  (req, res) =>{
// #region 監聽 data 事件 - 接收 Request Body
// 監聽 req 的 "data" 事件，當有資料傳入時，這個事件就會被觸發，並且把傳入的資料（chunk）累加到 body 變數中
let body = "";              // 定義一個空字串 body，用來累加使用者傳入的資料。當使用者發送 POST 請求時，這些資料會被傳入到伺服器，並且觸發 "data" 事件，讓我們可以把這些資料收集起來，最後在 "end" 事件中處理這些資料。
req.on("data", (chunk) => { //chunck 是一個 Buffer(代碼16 進位格式組合的JSON)物件
    body += chunk;
});
req.on("end", () => { // 監聽 req 的 "end" 事件，當資料傳輸完成時，這個事件就會被觸發，並且執行裡面的程式碼
     console.log("收到 body:", body);
});
// #endregion

console.log(req.url);    // 印出使用者造訪的"網址路徑"
console.log(req.method); // 印出使用者造訪的網址所使用的 HTTP 方法，例如：GET、POST、PUT、DELETE 等等

// #region GET /todos - 獲取所有待辦事項
if(req.url==="/todos" && req.method==="GET")  // 造訪的網址路徑一定是=== "/"，也就是首頁，且&& 使用的 HTTP 方法是 GET。
{   res.writeHead(200,headers); // 設定HTTP回傳狀態碼為 200（成功），並在 Header 告知瀏覽器接下來要傳送的是 //（text/plain）代表"純文字格式"
    res.write(JSON.stringify({ // (JSON.stringify) 將"物件"轉換成"字串"，這樣瀏覽器才能正確解析和顯示這些資料
       "status": "success",
       "data": todos,
})) ; // res.write() 用來寫入回應的內容，這裡我們把一个物件轉成 JSON 字串後寫入回應，這個物件包含了兩個屬性：status（表示請求的狀態）和 data（包含了目前所有的待辦事項）。當瀏覽器收到這個回應後，就會解析這個 JSON 字串，並且顯示在網頁上。};
 res.end();
}
// #endregion

// #region POST /todos - 新增待辦事項
else if(req.url==="/todos" && req.method==="POST"){
             try{  //tryun catch 是 JavaScript 中用來處理錯誤的語法結構，try 區塊中的程式碼會被執行，如果在執行過程中發生了錯誤，這個錯誤就會被 catch 區塊捕捉到，並且執行 catch 區塊中的程式碼。這樣可以避免因為錯誤而導致整個伺服器崩潰，並且讓我們有機會回應一個適當的錯誤訊息給使用者。 
                 //在這裡，我們把處理使用者傳入資料的程式碼放在 try 區塊中，這樣如果使用者傳入的資料格式不正確，或者缺少必要的欄位，就會觸發錯誤，然後被 catch 區塊捕捉到，最後呼叫 errorHandle(res) 函式來回應一個錯誤訊息給使用者。
                const title = JSON.parse(body).title; // 將累加的 body 字串轉換成物件，並取出 title 屬性的值，這個值就是使用者在前端輸入的待辦事項的標題
               if (title !== undefined && title.trim() !== "") { // 檢查 title 是否存在且不為空字串（去除前後空白），如果 title 是 undefined 或者是空字串，這個條件就會評估為 false，表示使用者沒有輸入有效的待辦事項標題
                const todo = {
                    "title": title, // 將使用者輸入的標題存入 todo 物件的 title 屬性中
                    "id": uuidv4() // 使用 uuidv4() 生成一個獨一無二的識別碼，並存入 todo 物件的 id 屬性中，這樣每個待辦事項都有一個唯一的 ID，方便後續的操作，例如刪除或修改
                }
             todos.push(todo); // 將新的待辦事項加入 todos 陣列中
             res.writeHead(200,headers);
             res.write(JSON.stringify({
                "status": "success",
                "data": todos }));
                res.end();
            }else{
                errorHandle(res); //errorHandle(res) 是一個函式，當使用者沒有輸入有效的待辦事項標題時，這個函式會被呼叫，並且使用 res 物件來設定回應的狀態碼和內容，告訴使用者 JSON 格式無效或者缺少待辦事項標題
            }
        }catch(error){
              errorHandle(res);
            }
}
// #endregion

// #region DELETE /todos - 刪除所有待辦事項，此動作不需要"body"，因為我們只是要刪除所有的待辦事項，不需要從使用者那裡接收任何資料
else if(req.url==="/todos" && req.method==="DELETE") // DELETE，這是一種 HTTP 方法，通常用來刪除資源，例如刪除待辦事項。
{
    todos.length = 0; // 清空 todos 陣列，這樣就刪除了所有的待辦事項
    res.writeHead(200,headers);
    res.write(JSON.stringify({
        "status": "success",
        "data": todos })); //todos 陣列已經被清空，所以 data 屬性會是一個空陣列，表示目前沒有任何待辦事項了
        res.end();
}
// #endregion

// startsWith() 方法用來檢查字串是否以指定的子字串開頭，這裡我們檢查 req.url 是否以 "/todos" 開頭，這樣就可以處理所有以 "/todos" 開頭的路徑，例如 "/todos/123"、"/todos/abc" 等等。
// 取得網址路徑中最後一個斜線後面的部分，這個部分就是待辦事項的 ID，例如 /todos/123，這裡的 id 就是 123

// #region DELETE /todos/:id - 刪除"特定"代辦事項
else if(req.url.startsWith("/todos") && req.method==="DELETE"){
    const id = req.url.split("/").pop(); // split("/") 將網址路徑以 "/" 為分隔符號，分割成一個陣列，並且使用 pop() 取出最後一個元素，也就是待辦事項的 ID。這樣我們就可以知道使用者想要刪除哪一個待辦事項。
    const index = todos.findIndex(element => element.id === id); // findIndex() 方法用來尋找陣列中第一個符合條件的元素的索引值，element => element.id === id 是一個箭頭函式，表示我們要尋找的條件是陣列中元素的 id 屬性是否等於使用者提供的 id。這樣我們就可以知道使用者想要刪除的待辦事項在陣列中的位置。  
    console.log(id, index); // 印出找到的索引值，這樣我們就可以知道使用者想要刪除的待辦事項在陣列中的位置。
    if(index !== -1){ // 如果找到的索引值不等於 -1，表示找到了符合條件的元素，也就是說使用者想要刪除的待辦事項存在於陣列中。
        todos.splice(index, 1); // splice() 方法用來從陣列中刪除元素，這裡我們從 todos 陣列中刪除索引值為 index 的元素，這樣就刪除了使用者想要刪除的待辦事項。
    }else{
        errorHandle(res); // 如果找不到符合條件的元素，表示使用者想要刪除的待辦事項不存在於陣列中，這時候我們就呼叫 errorHandle(res) 函式，告訴使用者找不到這個待辦事項。   
    }
    res.writeHead(200,headers); 
    res.write(JSON.stringify({
        "status": "success",
        "data": todos,
    })); //todos 陣列已經被清空，所以 data 屬性會是一個空陣列，表示目前沒有任何待辦事項了
        res.end();
}
// #endregion

// #region PATCH /todos/:id - 修改"特定"代辦事項
else if(req.url.startsWith("/todos") && req.method==="PATCH"){
    req.on('end', () => {
        try{
            const todo = JSON.parse(body).title; // 將累加的 body 字串轉換成物件，這個物件應該包含了使用者想要修改的待辦事項的資料，例如 title 屬性
            const id = req.url.split("/").pop(); // split("/") 將網址路徑以 "/" 為分隔符號，分割成一個陣列，並且使用 pop() 取出最後一個元素，也就是待辦事項的 ID。這樣我們就可以知道使用者想要修改哪一個待辦事項。
            const index = todos.findIndex(element => element.id === id); // findIndex() 方法用來尋找陣列中第一個符合條件的元素的索引值，element => element.id === id 是一個箭頭函式，表示我們要尋找的條件是陣列中元素的 id 屬性是否等於使用者提供的 id。這樣我們就可以知道使用者想要修改的待辦事項在陣列中的位置。
            if(todo !== undefined && todo.trim() !== "" && index !== -1){ // todo.trim() 用來去除 todo 字串前後的空白，這樣就可以確保使用者輸入的待辦事項內容不是空白字串。如果 todo 是 undefined 或者是空字串，這個條件就會評估為 false，表示使用者沒有輸入有效的待辦事項內容，或者找不到符合條件的元素，也就是說使用者想要修改的待辦事項不存在於陣列中。只有當 todo 不等於 undefined 且不為空字串，且 index 不等於 -1 時，這個條件才會評估為 true，表示使用者有提供新的待辦事項資料，且找到了符合條件的元素，也就是說使用者想要修改的待辦事項存在於陣列中。
                // 如果 todo !==不等於 undefined 且不為空字串，表示使用者有提供新的待辦事項資料，且 index 不等於 -1，表示找到了符合條件的元素，也就是說使用者想要修改的待辦事項存在於陣列中。
                todos[index].title = todo; // 將陣列中索引值為 index 的元素的 title 屬性，更新為使用者提供的新的待辦事項資料。這樣就完成了修改待辦事項的操作。
                res.writeHead(200,headers);
                res.write(JSON.stringify({
                    "status": "success",
                    "data": todos
                }));
                res.end();
            }else{
                errorHandle(res); // 如果 todo 等於 undefined 或為空字串，表示使用者沒有提供新的待辦事項資料，或者 index 等於 -1，表示找不到符合條件的元素，也就是說使用者想要修改的待辦事項不存在於陣列中，這時候我們就呼叫 errorHandle(res) 函式，告訴使用者 JSON 格式無效或者找不到這個待辦事項。
            }
            console.log(todo, id); // 印出使用者傳入的資料和待辦事項的 ID，這樣我們就可以知道使用者想要修改哪一個待辦事項，以及他想要修改成什麼內容。
        } catch (error){
            errorHandle(res);
        }
    });
}
// #endregion

// #region OPTIONS - 處理 CORS 預檢
else if(req.method==="OPTIONS")
       {   res.writeHead(200,headers);
           res.end();
}
// #endregion

// #region 404 Not Found - 路由不存在
else{
    res.writeHead(404,headers); // 設定HTTP回傳狀態碼為 404（找不到頁面），並在 Header 告知瀏覽器接下來要傳送的是 //（text/plain）代表"純文字格式"
    res.write(JSON.stringify({
    "status": "error",
    "message": "404 Not Found", // message 是一個描述錯誤的訊息，這裡告訴使用者找不到頁面
}));
    res.end();
    }
}
// #endregion

// #region 伺服器啟動
const server = http.createServer(requestListener);// 只要有任何使用者（瀏覽器、Postman 等）造訪或發送請求到這個網址，這個函式(requestListener)就必定會被觸發執行一次。
server.listen(process.env.PORT || 3005);// 伺服器開始監聽指定的 port，這裡使用 process.env.PORT || 3005，表示如果有設定環境變數 PORT，就使用該值，否則就使用 3005。這樣可以讓伺服器在不同的環境下運行，例如在本地開發環境使用 3005，而在部署到雲端平台時使用平台提供的 port。
// #endregion


