import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import errorHandle from './errorHandle.js';

const todos = [];

const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
    'Content-Type': 'application/json'
};

const requestListener = (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk;
    });

    // ✅ 所有路由邏輯都在 end 事件裡，確保 body 收集完畢才處理
    req.on("end", () => {
        console.log(req.url, req.method);
        //console.log("收到 body:", body); 測試錯誤訊息用

        // GET /todos
        if (req.url === "/todos" && req.method === "GET") {
            res.writeHead(200, headers);
            res.write(JSON.stringify({ "status": "success", "data": todos }));
            res.end();

        // POST /todos
        } else if (req.url === "/todos" && req.method === "POST") {
            try {
                const title = JSON.parse(body).title;
                
                if (title !== undefined && title.trim() !== "") {
                    const todo = {
                        "title": title,
                        "id": uuidv4()
                    };
                    todos.push(todo);
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({ "status": "success", "data": todos }));
                    res.end();
                } else {
                    errorHandle(res);
                    console.log("進了 else，有title "); //測試錯誤訊息用
                }
            } catch (error) {
                console.log("進了 catch，error 是:", error.message); //error.message 可以顯示錯誤訊息
                errorHandle(res);
            }

        // DELETE /todos（刪除全部）
        } else if (req.url === "/todos" && req.method === "DELETE") {
            todos.length = 0;
            res.writeHead(200, headers);
            res.write(JSON.stringify({ "status": "success", "data": todos }));
            res.end();

        // DELETE /todos:id（刪除特定）
        } else if (req.url.startsWith("/todos") && req.method === "DELETE") {
            const id = req.url.split("/").pop();
            const index = todos.findIndex(element => element.id === id);
            if (index !== -1) {
                todos.splice(index, 1);
                res.writeHead(200, headers);
                res.write(JSON.stringify({ "status": "success", "data": todos }));
                res.end();
            } else {
                errorHandle(res);
            }

        // PATCH /todos/:id（修改特定）
        } else if (req.url.startsWith("/todos") && req.method === "PATCH") {
            try {
                const title = JSON.parse(body).title;
                const id = req.url.split("/").pop();
                const index = todos.findIndex(element => element.id === id);
                if (title !== undefined && title.trim() !== "" && index !== -1) {
                    todos[index].title = title;
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({ "status": "success", "data": todos }));
                    res.end();
                } else {
                    errorHandle(res);
                }
            } catch (error) {
                errorHandle(res);
            }

        // OPTIONS（CORS 預檢）
        } else if (req.method === "OPTIONS") {
            res.writeHead(200, headers);
            res.end();

        // 404
        } else {
            res.writeHead(404, headers);
            res.write(JSON.stringify({ "status": "error", "message": "404 Not Found" }));
            res.end();
        }
    });
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);
