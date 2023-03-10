import json
from script.V3 import Chatbot
from flask import Flask, request, render_template, Response,jsonify


server = Flask(__name__)
# get config
with open("config.json", "r") as f: config = json.load(f)

# init chatbot
chatbot = Chatbot(api_key=config['api_key'],proxy=config['proxy'])


@server.route("/")
def home():
    chatbot.reset()
    return render_template("index.html")


@server.route("/stream")
def get_bot_stream_response():
    
    prompt = request.args.get('msg')
    convo_id = request.args.get('convo_id')
    print("request data:",prompt,convo_id)

    def event_stream():
       for data in chatbot.ask_stream(prompt=prompt,convo_id=convo_id):
            # print(data,end="",flush=True)
            yield 'data:'+ ("[DONE]" if  data == "[DONE]" else json.dumps(data)) +'\n\n'
           
    return Response(event_stream(), mimetype='text/event-stream')

@server.route("/log")
def get_bot_log():
    convo_id = request.args.get('convo_id');
    log_data = []
    if convo_id is not None:
        file = 'data/{}.json'.format(convo_id)
        log_data =  chatbot.load_log(10,file,convo_id)
        
    return jsonify(log_data);

@server.route("/save")
def save_bot_log():
    convo_id:str = request.args.get('convo_id')
    file = 'data/{}.json'.format(convo_id)
    print("file:",file);
    return "[DONE]" if chatbot.save(file,convo_id) else "[FAIL]";

@server.route("/truncate_log")
def truncate_log():
    convo_id:str = request.args.get('convo_id')
    file = 'data/{}.json'.format(convo_id)
    print("file:",file);
    return "[DONE]" if chatbot.truncate_log(file) else "[FAIL]";

            
if __name__ == '__main__':
    server.run(debug=False, host='0.0.0.0', port=8088)