/**
 * Created by pc on 2017/4/7.
 */
//引入模块
var express=require("express");
var mysql=require('mysql');
var bodyParser = require('body-parser');
var session = require('express-session');
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password : 'hlh123',
    database : 'kfl',
    charset:'utf8_general_ci'
 });
conn.connect();
// app 是 express 对象的一个实例
var app=express();
// 引入静态文件
app.use(express.static("kfl"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret: 'kfl',//secret 用来防止篡改 cookie,相当于一个密钥
    key: 'kfl',//key 的值为 cookie 的名字
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//设定 cookie 的生存期，这里设置 cookie 的生存期为 30 天
    resave:true,//是否允许session重新设置，要保证session有操作的时候必须设置这个属性为true
    saveUninitialized:true,//是否保存未初始化状态
}));
app.get("/getDishes", function (req,res) {
    if (req.session.token) {
        var num=req.query.num;
        var index=req.query.index-1;
        var searchText=req.query.searchText;
        var sqlStr;
        if(searchText==""){
            sqlStr="select * from kf_dish limit "+index*num+","+num;
        }else {
            sqlStr="select * from kf_dish where name like '%"+searchText+"%' or material like '%"+searchText+"%'";
        }
        console.log(num,index,searchText,sqlStr);

        //console.log(sqlStr);
        conn.query(sqlStr,function (err, result) {
            if(err) throw err;
            // console.log(result);
            res.send(result);//传送数据给前端
        })
    }else {
        res.send('err');
    }

});
app.get("/getDish",function (req, res) {
    if (req.session.token) {
        var id = req.query.id;//取得前端传过来的菜id
        // console.log(id);
        var sqlStr = "select * from kf_dish where did=" + id;
        // console.log(sqlStr);
        conn.query(sqlStr, function (err, result) {
            if (err) throw err;
            res.send(result);
        })
    }else {
        res.send('err')
    }
});
app.post("/orderDish", function (req,res) {
    if (req.session.token) {
        //数据名与数据库定义的名字要一样
        var dish={
             user_name:req.query.username,
             sex:req.query.sex,
             phone:req.query.phone,
             addr:req.query.addr,
             did:req.query.did
        };
       console.log(dish);
        conn.query('insert into kf_order set ? ',dish,function (err, results) {
            if(err) throw err;
            res.send({"result":results.insertId});
        })
    }else {
        res.send('err')
    }
});
app.get("/getmyOrders", function (req,res) {
    if (req.session.token) {
        var phone=req.query.phone;
        var sqlstr="SELECT* from kf_order INNER JOIN kf_dish on kf_order.did=kf_dish.did where phone='"+phone+"'ORDER BY oid desc ";
        console.log(sqlstr)
        conn.query(sqlstr,function (err,result) {
            if(err) throw err;
            res.json(result);
        })
    }else {
        res.send('err')
    }
})
app.post("/registerInfo", function (req,res){
    var userInfo= req.body;
    // console.log(req.body);
    conn.query('insert into kfl_user set ? ',userInfo,function (err, results) {
        if(err) throw err;
        res.send({"result":results.insertId});
    })
})
app.post("/loginInfo",function (req,res) {
    var userInfo= req.body;
    var sqlStr="select * from kfl_user where username='"+userInfo.username+"' and password='"+userInfo.password+"'";
    conn.query(sqlStr,function (err,result) {
        if(err) throw err;
        // console.log(result.length);
        if (result.length > 0) {
            req.session.token = result[0].username;
            res.send(result);
        } else {
            res.send('err');
        }
    })
});
app.get("/userManger",function (req,res) {
    if (req.session.token) {
        var phone=req.query.phone;
        var sqlstr="select* from kf_order where phone="+phone;
        console.log(sqlstr)
        conn.query(sqlstr,function (err,result) {
            if(err) throw err;
            res.json(result);
        })
    }else {
        res.send('err')
    }
})
app.get('/logout', function (req, res) {
    req.session.token = '';
    res.redirect('/#/login');
});
app.listen(3000);