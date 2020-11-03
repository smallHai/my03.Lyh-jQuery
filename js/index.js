$(function(){

    $('#member,#logout').hide();

    $('#reg_a').click(function(){
        $('#reg').dialog('open');
    });

    $('#login_a').click(function(){
        $('#login').dialog('open');
    });

    $('#logout').click(function(){
        $.removeCookie('user');
        window.location.reload();
    });

    if($.cookie('user')){
        $('#member,#logout').show();
        $('#reg_a,#login_a').hide();
        $('#member').html($.cookie('user'));
    }else{
        $('#member,#logout').hide();
        $('#reg_a,#login_a').show();
        $('#member').html('用户');
    }

    $('#question_button').click(function(){
        if($.cookie('user')){
            $('#question').dialog('open');
        }else{
            $('#error').html('请先登录').dialog('open');
            setTimeout(function(){
                $('#error').html('请先登录').dialog('close');
                $('#login').dialog('open');
            },2000);
        }
    });

    //UI-按钮
    //查询
    $('#search_button').button({
        icon: 'ui-icon-search'
    });
    //提问
    $('#question_button').button({
        icon: 'ui-icon-lightbulb'
    });
    //单选框
    $('#reg input[type=radio]').button();

    //UI-对话框
    //loading
    $('#loading').dialog({
        autoOpen: false,
        modal: true,
        closeOnEscape: false,
        resizable: false,
        draggable: false,
        width: 180,
        height: 50,
    }).parent().parent().find('.ui-widget-header').hide();
    //error
    $('#error').dialog({
        autoOpen: false,
        modal: true,
        closeOnEscape: false,
        resizable: false,
        draggable: false,
        width: 180,
        height: 50,
    }).parent().parent().find('.ui-widget-header').hide();
    //注册
    $('#reg').dialog({
        autoOpen: false,
        modal: true,
        width: 300,
        height: 'auto',
        resizable: false,
        buttons: {
            '提交': function(){
                $(this).submit();
            }
        }
    });
    //登录
    $('#login').dialog({
        autoOpen: false,
        modal: true,
        width: 300,
        height: 'auto',
        resizable: false,
        buttons: {
            '登录': function(){
                $(this).submit();
            }
        }
    });
    //提问
    $('#question').dialog({
        autoOpen: false,
        modal: true,
        width: 600,
        height: 'auto',
        resizable: false,
        buttons: {
            '发布': function(){
                $(this).ajaxSubmit({
                    url:'add_content.php',
                    type:'post',
                    data:{
                        user:$.cookie('user'),
                    },
                    beforeSubmit: function(formData,jqForm,options){
                        $('#loading').removeClass('done').addClass('being').html('正在发布请稍后...').dialog('open');
                        $('#question').dialog('widget').find('button').eq(1).button('disable');
                    },
                    success: function(responseText,statusText){
                        var flag = responseText === "false" ? false : true;
                        if(flag){
                            $('#loading').removeClass('being').addClass('done').html('发布成功');
                            $('#question').dialog('widget').find('button').eq(1).button('enable');
                            setTimeout(function(){
                                $('#loading').dialog('close');
                                $('#question').dialog('close');
                                $('#question').resetForm();
                                $('#ueditor_0').contents().find('body').html("");
                                $('#loading').removeClass('done').addClass('being').html('正在发布请稍后...');
                            },2000);
                        }
                    }
                });
            }
        }
    });

    //显示提问的内容
    $.ajax({
        url:'show_content.php',
        type:'post',
        success:function(response,status,xhr){
            var json = $.parseJSON(response);
            var html = "";
            var arr = [];
            var summary = [];
            $.each(json,function(index,value){
                html += '<h4>'+value.user+'发表于'+value.date+'</h4>'+
                        '<h3>'+value.title+'</h3>'+
                        '<div class="editor">'+value.content+'</div>'+
                        '<div class="buttom">'+
                            '<span class="comment" data-id="'+value.id+'">'+value.count+'条评论</span>'+
                            '<span class="down">显示全部</span><span class="up">收起</span>'+
                        '</div>'+
                        '<hr noshade="noshade" size="1">'+
                        '<div class="comment_list"></div>';
            });
            $('.content').html(html);
            $.each($('.editor'),function(index,value){
                arr[index] = $(value).html();
                summary[index] = arr[index].substr(0,50);
                if(summary[index].substring(48,50) == "</"){
                    summary[index] = replacePos(summary[index],50,"");
                    summary[index] = replacePos(summary[index],49,"");
                }
                if(summary[index].substring(49,50) == "<"){
                    summary[index] = replacePos(summary[index],50,"");
                }
                if(arr[index].length >50){
                    $(value).html(summary[index]);
                }
                $('.buttom .up').hide();
            });

            $.each($('.buttom .down'),function(index,value){
                $(this).click(function(){
                    $(this).parent().prev('.editor').html(arr[index]);
                    $(this).hide();
                    $(this).next().show();
                });
            });
            $.each($('.buttom .up'),function(index,value){
                $(this).click(function(){
                    $(this).parent().prev('.editor').html(summary[index]);
                    $(this).hide();
                    $(this).prev().show();
                });
            });
            $.each($('.buttom .comment'),function(index,value){
                $(this).click(function(){
                    var comment_this = this;
                    if($.cookie('user')){
                        if(!$('.comment_list').eq(index).has('form').length){
                            $.ajax({
                                url:'show_comment.php',
                                type:'post',
                                data:{
                                    titleid:$(comment_this).attr('data-id'),
                                },
                                beforeSend:function(jqXHR,settings){
                                    $('.comment_list').eq(index).html('<dl class="comment_load">'+
                                                                            '<dd>正在加载评论</dd>'+
                                                                      '</dl>');
                                },
                                success:function(response,status){
                                    var json_comment = $.parseJSON(response);
                                    var html_comment = "";
                                    var count =0;
                                    $.each(json_comment,function(inner_index,value){
                                        count = value.count;
                                        html_comment += '<dl class="comment_content">'+
                                                            '<dt>"'+value.user+'"</dt>'+
                                                            '<dd>"'+value.comment+'"</dd>'+
                                                            '<dd class="comment_date">"'+value.date+'"</dd>'+
                                                        '</dl>';
                                    });
                                    $('.comment_list').eq(index).html(html_comment);
                                    $('.comment_list').eq(index).append('<dl><dd><span class="load_more">加载更多评论</span></dd></dl>');
                                    var page=2;
                                    if(page>count){
                                        $('.comment_list').eq(index).find('.load_more').button().off('click');
                                        $('.comment_list').eq(index).find('.load_more').button().hide();
                                    }
                                    $('.comment_list').eq(index).find('.load_more').button().on('click',function(){
                                        $('.comment_list').eq(index).find('.load_more').button('disable');
                                        $.ajax({
                                            url:'show_comment.php',
                                            type:'post',
                                            data:{
                                                titleid:$(comment_this).attr('data-id'),
                                                page:page,
                                            },
                                            beforeSend:function(jqXHR,settings){
                                                $('.comment_list').eq(index).find('.load_more').html('<img src=img/more_load.gif>');
                                            },
                                            success:function(response,status){
                                                var json_comment_more = $.parseJSON(response);
                                                var html_comment_more = "";
                                                $.each(json_comment_more,function(inner_index_more,value){
                                                    html_comment_more += '<dl class="comment_content">'+
                                                                        '<dt>"'+value.user+'"</dt>'+
                                                                        '<dd>"'+value.comment+'"</dd>'+
                                                                        '<dd class="comment_date">"'+value.date+'"</dd>'+
                                                                    '</dl>';
                                                });
                                                $('.comment_list').eq(index).find('.comment_content').last().after(html_comment_more);
                                                $('.comment_list').eq(index).find('.load_more').button('enable');
                                                $('.comment_list').eq(index).find('.load_more').html('加载更多评论');
                                                page++;
                                                if(page>count){
                                                    $('.comment_list').eq(index).find('.load_more').button().off('click');
                                                    $('.comment_list').eq(index).find('.load_more').button().hide();
                                                }
                                            }
                                        });
                                    });
                                    $('.comment_list').eq(index).append('<form><dl class="comment_add">'+
                                                                '<dt><textarea name="comment" rows="3"></textarea></dt>'+
                                                                '<dd>'+
                                                                    '<input type="hidden" name="titleid" value="'+$(comment_this).attr('data-id')+'">'+
                                                                    '<input type="hidden" name="user" value="'+$.cookie('user')+'">'+
                                                                    '<input type="button" value="发表">'+
                                                                '</dd>'+
                                                            '</dl></form>');
                                    $('.comment_list').eq(index).find('input[type=button]').button().click(function(){
                                        var _this = this;
                                        $('.comment_list').eq(index).find('form').ajaxSubmit({
                                            url:'add_comment.php',
                                            type:'post',
                                            beforeSubmit: function(formData,jqForm,options){
                                                $('#loading').removeClass('done').addClass('being').html('正在发表请稍后...').dialog('open');
                                                $(_this).button('disable');
                                            },
                                            success: function(responseText,statusText){
                                                var flag = responseText === "false" ? false : true;
                                                if(flag){
                                                    $('#loading').removeClass('being').addClass('done').html('发表成功');
                                                    $(_this).button('enable');
                                                    setTimeout(function(){
                                                        var date = new Date();
                                                        $('#loading').dialog('close');
                                                        $('.comment_list').eq(index).prepend(
                                                            '<dl class="comment_content">'+
                                                                '<dt>'+$.cookie('user')+'</dt>'+
                                                                '<dd>'+$('.comment_list').eq(index).find('textarea').val()+'</dd>'+
                                                                '<dd>'+date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+'-'+date.getHours()+'-'+date.getMinutes()+'-'+date.getSeconds()+'</dd>'+
                                                            '</dl>'
                                                        );
                                                        $('.comment_list').eq(index).find('form').resetForm();
                                                        $('#loading').removeClass('done').addClass('being').html('正在发表请稍后...');
                                                    },2000);
                                                }
                                            }
                                        });
                                    });
                                }
                            });
                        }

                        if($('.comment_list').eq(index).is(":hidden")){
                            $('.comment_list').eq(index).show();
                        }else{
                            $('.comment_list').eq(index).hide();
                        }

                    }else{
                        $('#error').html('请先登录').dialog('open');
                        setTimeout(function(){
                            $('#error').html('请先登录').dialog('close');
                            $('#login').dialog('open');
                        },2000);
                    }
                });
            });
        },
    });


    //UI-自动补全
    $('#email').autocomplete({
        delay: 0,
        autoFocus: true,
        source: function(request,response){
            var hosts = ['qq.com','163.com','sina.com','gmail.com'];
            var term = request.term;
            var name = term;
            var host = "";
            var at = term.indexOf('@');
            var result = [];
            result.push(term);
            if(at > -1){
                name = term.slice(0,at);
                host = term.slice(at+1);
            }
            if(name){
                var findedHosts = [];
                if(host){
                    findedHosts = $.grep(hosts,function(value,index){
                        return value.indexOf(host) > -1;
                    });
                }else{
                    findedHosts = hosts;
                }
                var fandedResult = $.map(findedHosts,function(value,index){
                    return name + '@' + value;
                });
                result = result.concat(fandedResult);
            }
            response(result);
        }
    });

    //UI-日历
    $('#birthday').datepicker({
        dateFormat: 'yy-mm-dd',
        dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
        dayNamesShort: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
        dayNamesMin: ['日','一','二','三','四','五','六'],
        monthNames: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
        monthNamesShort: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
        firstDay: 1,
        changeMonth: true,
        changeYear: true,
        nextText: '下个月',
        prevText: '上个月',
        showMonthAfterYear: true,
        maxDate:0,
        yearRange:'1990:2020',
        hideIfNoPrevNext:true,
        showAnim: false,
    });

    //UI-选项卡
    $('#tabs').tabs();

    //UI-折叠菜单
    $('#accordion').accordion({
        collapsible:true,
        active:false,
    });

    //Plug-表单验证
    //表单验证-注册
    $('#reg').validate({
        errorLabelContainer: 'ol.reg_error',
        wrapper: 'li',
        rules: {
            user:{
                required: true,
                minlength: 2,
                remote: {
                    url: 'is_user.php',
                    type: 'post',
                }
            },
            pass:{
                required: true,
                minlength: 6,
            },
            email:{
                required: true,
                email: true,
            },
            date:{
                date: true,
            }
        },
        messages: {
            user:{
                required: '帐号不能为空',
                minlength: $.validator.format('帐号不小于{0}位'),
                remote: '帐号已存在',
            },
            pass:{
                required: '密码不能为空',
                minlength: $.validator.format('密码不小于{0}位'),
            },
            email:{
                required: '邮箱不能为空',
                email: '请输入正确的邮箱',
            },
        },
        highlight: function(element,errorClass){
            $(element).css('border-color','red');
            $(element).parents('p').find('span').css('color','red').html('*');
        },
        unhighlight: function(element,errorClass){
            $(element).css('border-color','#ccc');
            $(element).parents('p').find('span').css('color','green').html('ok');
        },
        submitHandler: function(form){
            $(form).ajaxSubmit({
                url: 'add.php',
                type: 'post',
                beforeSubmit: function(formData,jqForm,options){
                    $('#loading').removeClass('done').addClass('being').html('正在注册请稍后...').dialog('open');
                    $('#reg').dialog('widget').find('button').eq(1).button('disable');
                },
                success: function(responseText,statusText){
                    var flag = responseText === "false" ? false : true;
                    if(flag){
                        $('#loading').removeClass('being').addClass('done').html('注册成功');
                        $('#reg').dialog('widget').find('button').eq(1).button('enable');
                        $.cookie('user',$('#user').val());
                        setTimeout(function(){
                            $('#loading').dialog('close');
                            $('#reg').dialog('close');
                            $('#reg').resetForm();
                            $('#reg').find('span.star').css('color','red').html('*');
                            $('#loading').removeClass('done').addClass('being').html('正在注册请稍后...');
                            $('#member,#logout').show();
                            $('#reg_a,#login_a').hide();
                            $('#member').html($.cookie('user'));
                        },2000);
                    }
                }
            });
        }
    });
    //表单验证-登录
    $('#login').validate({
        errorLabelContainer: 'ol.login_error',
        wrapper: 'li',
        rules: {
            login_user:{
                required: true,
                minlength: 2,
            },
            login_pass:{
                required: true,
                minlength: 6,
                remote: {
                    url: 'login.php',
                    type: 'post',
                    data: {
                        login_user: function(){
                            return $('#login_user').val();
                        }
                    }
                }
            },
        },
        messages: {
            login_user:{
                required: '帐号不能为空',
                minlength: $.validator.format('帐号不小于{0}位'),
            },
            login_pass:{
                required: '密码不能为空',
                minlength: $.validator.format('密码不小于{0}位'),
                remote: '帐号或密码错误',
            },
        },
        highlight: function(element,errorClass){
            $(element).css('border-color','red');
            $(element).parents('p').find('span').css('color','red').html('*');
        },
        unhighlight: function(element,errorClass){
            $(element).css('border-color','#ccc');
            $(element).parents('p').find('span').css('color','green').html('ok');
        },
        submitHandler: function(form){
            $(form).ajaxSubmit({
                url: 'login.php',
                type: 'post',
                beforeSubmit: function(formData,jqForm,options){
                    $('#loading').removeClass('done').addClass('being').html('正在登录请稍后...').dialog('open');
                    $('#login').dialog('widget').find('button').eq(1).button('disable');
                },
                success: function(responseText,statusText){
                    var flag = responseText === "false" ? false : true;
                    if(flag){
                        $('#loading').removeClass('being').addClass('done').html('登录成功');
                        $('#login').dialog('widget').find('button').eq(1).button('enable');

                        if($('#expires').is(':checked')){
                            $.cookie('user',$('#login_user').val(),{
                                expires: 7,
                            });
                        }else{
                            $.cookie('user',$('#login_user').val());
                        }

                        setTimeout(function(){
                            $('#loading').dialog('close');
                            $('#login').dialog('close');
                            $('#login').resetForm();
                            $('#login').find('span.star').css('color','red').html('*');
                            $('#loading').removeClass('done').addClass('being').html('正在登录请稍后...');
                            $('#member,#logout').show();
                            $('#reg_a,#login_a').hide();
                            $('#member').html($.cookie('user'));
                        },1000);
                        
                    }
                }
            });
        }
    });

    //Plug-编辑器
    var ue = UE.getEditor('content',{
        elementPathEnabled:false,
        wordCount:false,
    });

});

//替换字符的函数
var replacePos = function (strObj,pos,replaceText) {
    return strObj.substr(0,pos-1) + replaceText +strObj.substring(pos,strObj.length);
}