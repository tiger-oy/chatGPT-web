
$(document).ready(function () {

    const article_wrapper = $("#article-wrapper");
    const kw_target = $("#kw-target");
    let loading_timer=0;

    kw_target.on('keydown', function (event) {
        if (event.keyCode == 13) {
            send_post();
            return false;
        }
    });
    $("#ai-btn").click(function () {
        send_post();
        return false;
    });
   
     //set conversation id with cookie effect 7 days
     let c_data_str = $.cookie("data");
     let c_data; 
     let convo_id;
     if (c_data_str){
         c_data = JSON.parse(c_data_str);
         convo_id = c_data['convo_id'];
         log_convo(convo_id);
         console.log('convo_id:'+convo_id);
     } else {
         convo_id = randomString();
     }
     $.cookie('data', JSON.stringify({"convo_id":convo_id}), {expires: 7});


    // send post for promp
    function send_post() {
        
        var prompt = kw_target.val();

        if (prompt == "") {
            layer.msg("请输入您的问题", { icon: 5 });
            return;
        }
        if("q" == prompt){
            clear_log(convo_id);
            return;
        }
        streaming(prompt, convo_id);

    }

    const converter = new showdown.Converter();

    function streaming(prompt, convo_id) {

        let answer = randomString(16);
        article_wrapper.append('<li class="article-title" id="q' + answer + '"><pre> > '+prompt+'</pre></li>');
        answer_loading();

        var es = new EventSource("/stream?msg="+prompt+"&convo_id="+convo_id);
        var isstarted = true;
        var alltext = "";
        var isalltext = false;
        var strforcode = '';

        es.onerror = function (event) {
            console.log("error:"+JSON.stringify(event));
            clear_loading();
            layer.msg("服务异常:(", { icon: 5 });
            es.close();
            return;
        }
    
       
        es.onmessage = function(event) {
            // console.log(event.data);
            if (isstarted) {
            
                kw_target.val("请等待AI输出完成…").attr("disabled", true);
                clear_loading();
                isstarted = false;
                article_wrapper.append('<li class="article-content" id="' + answer + '"></li>');
                let str_ = '';
                let i = 0;
                let timer = setInterval(() => {
                    alltext = alltext.replace(/\\n/g, '\n');
                    if (str_.length < alltext.length) {
                        str_ += alltext[i++];
                        strforcode = str_ + "_";
                        if ((str_.split("```").length % 2) == 0) strforcode += "\n```\n";
                    } else {
                        if (isalltext) {
                            clearInterval(timer);
                            strforcode = str_;
                
                        }
                    }
                    
                    $("#" + answer).html(converter.makeHtml(strforcode));
                    hljs.highlightAll();
                    document.getElementById("article-wrapper").scrollTop = 100000;
                }, 30);
            }


            if (event.data == "[DONE]") {
                kw_target.val("")
                .attr('placeholder',"继续输入...,发送q清空对话")
                .attr("disabled", false);
                isalltext = true;

                es.close();
                // console.log(alltext);
                save_convo(convo_id);
                return;
            }
            var json = eval("(" + event.data + ")");
            var data = json.content;
            if (alltext == "") {
                alltext = data.replace(/^\n+/, '');
            } else {
                alltext += data;
            }
        }
    }

    //save convo
    function save_convo(convo_id){
        $.ajax({
            type: "get",
            url: "/save?convo_id="+convo_id,
            success: function (results) {
                console.log('save success')
            }
        });

    }

    function clear_loading(){
        clearInterval(loading_timer);
        $("#article-loading").remove();
    }
    // logind answer 
    function answer_loading(){
        article_wrapper.append('<li class="article-content" id="article-loading">.../</li>');
        a_loading = $("#article-loading");
        var flag = true;
        loading_timer = setInterval(()=>{

            if(flag) {
                a_loading.html(".../"); 
                flag=false;
            } else {
                a_loading.html("../");
                flag = true;
            } 
        },160);
        
        document.getElementById("article-wrapper").scrollTop = 100000;
    }
    //list convosation log
    function log_convo(convo_id) {
        $.ajax({
            type: "get",
            url: "/log?convo_id="+convo_id,
            success: function (results) {
                
                for (const i in results) {
                    const item = results[i];
                    
                    const q_id = randomString(16);
                    
                    if (item['role'] == 'user') {
                       article_wrapper.append('<li class="article-title" id="q' + q_id + '"><pre>'+converter.makeHtml(" &gt; "+item['content'])+'</pre></li>');
                    } else if(item['role'] =='assistant') {
                       article_wrapper.append('<li class="article-content" id="' + q_id + '">'+converter.makeHtml(item['content'])+'</li>');
                    }
                    
                }
                hljs.highlightAll();
                document.getElementById("article-wrapper").scrollTop = 100000;
            }
        });
    }

    //clear log
    function clear_log(convo_id){
        $.ajax({
            type: "get",
            url: "/truncate_log?convo_id="+convo_id,
            success: function (results) {
                console.log("clear "+results+":)");
                article_wrapper.html('');
                kw_target.val("").attr('placeholder',"继续输入...");
                
            }
        });
    }
    
    function randomString(len) {
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var pwd = '';
        for (i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }
});
