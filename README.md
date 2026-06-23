-----------------------------------------------------------------
#　Todolist RESTful API 
-----------------------------------------------------------------

●   POSTMAN API建置 ( GET, POST, OPTIONS, DELETE, PATCH )

●   RENDER 雲端部署平台

<img width="1077" height="2342" alt="image" src="https://github.com/user-attachments/assets/9e60ccaf-bac6-4aff-91f8-3bf50894964b" />
<img width="2897" height="3486" alt="image" src="https://github.com/user-attachments/assets/de1152d2-d2c8-4425-b362-c6a681d79620" />

-----------------------------------------------------------------
## 作業問題：本機 POST 成功，Render POST 失敗
-----------------------------------------------------------------

### 第一步： errorHandle 在兩個地方被呼叫，都跟 body 有關，確認 body 有沒有收到：

●   console.log("收到 body:", body)加這行測試body

●   結果Render Logs 只有顯示POST ，沒有顯示 console.log

### 第二步：代表 req.on("end") 根本沒有被觸發，把 end 移到最上面試試看。

●    改成　else if POST ...   ← 在 end 裡面，body 一定收完才執行

●    結果：POSTMAN   POST 一樣顯示    "status": "error",　但是RENDER LOGS 有收到　"title": "今天要刷牙"。

### 第三步：body 有收到、格式也對，但還是報錯，代表問題在 JSON.parse 之後。

● 　POST 裡面加上 兩行console.log
```js
} else {
errorHandle(res);
console.log("進了 else，有title "); //測試錯誤訊息用
}
} catch (error) {
console.log("進了 catch，error 是:", error.message); //測試錯誤訊息用
errorHandle(res);
} 
```
結果：還是失敗，顯示：進了 catch，error 是: crypto is not defined


### 第四步：找到了！問題不是 JSON，是uuidv4() 底層用了 crypto，但 Node.js 版本或 Render 環境沒有正確載入它。

● package.json 的 engines 改成 "node": ">=18.17.1"　（最主要問題，原本是寫"node": "18.17.1"）

● uuid 版本重裝

－－－－－－－－－－－－－－－
### 錯誤訊息 → 往回找觸發點

console.log 確認資料有沒有到達  

catch(error) 裡印 error.message 才能看到真正原因

本機成功不代表程式正確，環境差異會放大潛在問題
