# ChatGPT Web Demo

**ChatGPT API 套壳web版本,简单快捷上手前端无复杂框架，默认使用 gpt-3.5-turbo**



**项目依赖**

- 服务端：python3\Flask
- 前端: jquery showdown higlight html(无vue 等框架)

**启动**
```shell
# 修改 config.json ,替换API_KEY、proxy

python3 main.py

# 浏览器访问 http://localhost:8088

```
 
 **项目结构**
```
 |--- data                    // 保存会话历史数据
 |--- script                  // python 业务逻辑脚本
 |------ V3.py                // 服务端核心调用openai逻辑
 |------ utils.py
 |--- static                  // web 静态文件
 |------ css
 |------ js
 |------ favicon.ico
 |--- templates               // web html 文件
 |------ index.html
 |--- config.json             // 配置文件(API_KEY\Proxy...)
 |--- main.py                 // 项目运行脚本(flask web server)
 |--- README.md
 ```

 > 项目服务端来自 [acheong08/ChatGPT](https://github.com/acheong08/ChatGPT)
 >
 > 前端web页面及js来自  [dirk1983/chatgpt](https://github.com/dirk1983/chatgpt)
 > 
 > 基于以上两个项目，做了小小改动
 >
 >
  <br/>

 **更多说明**

 ```python
""" 
    config.json
    以下是基础的两个参数，更多参数可自行添加
    参考 script/V3.py 方法：__init__() 或者 ask_stream()
"""

{
    "api_key":"YOUR API_KEY",
    "proxy": "127.0.0.1:7890"
}

 ```

*每个前端页面设置一个7天有效期的session id 有效期内页面保留最近5条对话纪录*

```javascript
 // static/js/chat.js 20-30 行
  $.cookie('data', JSON.stringify({"convo_id":convo_id}), {expires: 7});

```
*服务端保留20条对话纪录在data/[session_id].json*

```python
# main.py  save_bot_log()
@server.route("/save")
def save_bot_log():

# script/V3.py 
    def save(self, file: str, *convo_ids: str) -> bool
```

*OpenAI官网的模型和接口调用介绍：*

https://platform.openai.com/docs/models/moderation

https://platform.openai.com/docs/api-reference/chat/create

https://platform.openai.com/docs/guides/chat/introduction

https://platform.openai.com/docs/api-reference/models/list


<br/>

**再次感谢下面两位 developer**

[dik1983](https://github.com/dirk1983/chatgpt)

[acheong08](https://github.com/acheong08/ChatGPT)