<?php
    
    //防止乱码，直接设置utf8
    header('Content-Type:text/html;charset=utf-8');

    //链接数据库
    define('DB_HOST','localhost');
    define('DB_USER','root');
    define('DB_PWD','123456');
    define('DB_NAME','ziwen');

    //数据库链接失败处理
    $conn = @mysql_connect(DB_HOST,DB_USER,DB_PWD)or die('数据库链接失败：'.mysql_error());
    @mysql_select_db(DB_NAME)or die('数据库错误：'.mysql_error());
    @mysql_query('SET NAMES UTF8')or die('字符集错误：'.mysql_error());


?>