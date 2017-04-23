/**
 * Created by pc on 2017/4/6.
 */
angular.module("myApp",["ng","ngRoute"])
    .controller("startCtrl",function($timeout,$location){
       //两秒后跳转页面
        $timeout(function () {
            $location.path("/login");
        },2000);
    })
    .controller("mainCtrl",function ($scope,$http, $timeout, $location) {
        var num = 4;
        var index = 1;
        $scope.dishes = [];
        $scope.isLoadStatus = 1;//1代表未加载，2加载中 3没有更多
        $scope.searchText = "";
        function getdishes() {
            $scope.isLoadStatus = 2;
            $http(
                {
                    url: "getDishes",//向后端获取数据的路径
                    method: "get",// 传送方式
                    params: {
                        num: num,// 显示数据的条数
                        index: index, //组
                        searchText: ""
                    }//传参到后端
                }).success(function (data) {//接收后端的数据
                //console.log(data);
                if (data == 'err') {
                    alert('请先登陆');
                    $location.path('/login').replace;
                }
                $scope.dishes = $scope.dishes.concat(data);//往数组中插入数据,拼接数组，返回新的数组
                index++;
                if (data.length == 0) {
                    $scope.isLoadStatus = 3;
                } else {
                    $scope.isLoadStatus = 1;
                }
                // console.log($scope.dishes)
            });
        }
        getdishes();
        $scope.getMoreDishes = function () {
            getdishes();
        };
        $scope.searchDishes = function (event) {
            if (event.keyCode == 13) {
                if ($scope.searchText == "") {
                    $scope.dishes = [];
                    getdishes();
                } else {
                    $http(
                        {
                            url: "getDishes",//向后端获取数据的路径
                            method: "get",// 传送方式
                            params: {
                                num: num,// 显示数据的条数
                                index: index, //组
                                searchText: $scope.searchText
                            }//传参到后端
                        }).success(function (data) {//接收后端的数据
                        //console.log(data);
                        $scope.dishes = data;
                        index = 1;
                        $scope.isLoadStatus = 3;
                    })
                }
            }

        }
    })
    .controller("detailCtrl",function($scope,$routeParams,$http, $location){
        var id=$routeParams.id;
        $http({
            url:"getDish",
            method:"get",
            params:{
                id:id
            }
        }).success(function (data) {
            if (data == 'err') {
                alert('请先登陆');
                $location.path('/login').replace;
            }
            $scope.dish = data[0];
            console.log(data)
        })
    })
    .controller("orderCtrl",function ($scope,$routeParams,$http,$timeout,$location){
        var did=$routeParams.did;
        $scope.msg="";
        $scope.username=getLocalStorage('username');
        $scope.sex=getLocalStorage('sex');
        $scope.phone=getLocalStorage('phone');
        $scope.addr=getLocalStorage('addr');
        function setLocalStorage(key,val) {
            localStorage.setItem("kfl_" + key,val)
        }
        function getLocalStorage(key,val) {
           return localStorage.getItem("kfl_" + key,val)
        }
        $scope.orderDish=function () {
            var username=$scope.username;
            var sex=$scope.sex;
            var phone=$scope.phone;
            var addr=$scope.addr;
            if(username==""){
                showMsg("联系人");
                return;
            }
            if(sex==""){
                showMsg("性别");
                return;
            }
            if(phone==""){
                showMsg("联系电话");
                return;
            }
            if(addr==""){
                showMsg("订餐地址");
                return;
            }
            $http({
                url:"orderDish",
                method:"post",
                params:{
                    "username":username,
                    "phone":phone,
                    "addr":addr,
                    "sex":sex,
                    "did":did
                }
            }).success(function (data) {
                console.log(data);
                if (data == 'err') {
                    alert('请先登陆');
                    $location.path('/login').replace;
                }
                //保存数据信息到localStorage
                if(data.result>0){
                    setLocalStorage("username",username);
                    setLocalStorage("sex",sex);
                    setLocalStorage("phone",phone);
                    setLocalStorage("addr",addr);
                    $location.path("/myOrder")
                }
                //如果插入成功给出提示，并且调到订单清单
            })

            function showMsg(msg) {
                $scope.msg=msg;
                $timeout(function () {
                    $scope.msg="";
                },3000)
            }
        }
    })
    .controller("myOrderCtrl",function ($scope,$http, $location){
        $scope.currentProd=-1;

        $scope.orders=[];
        $scope.hasOrder=false;

        function getLocalStorage(key,val) {
            return localStorage.getItem("kfl_" + key,val)
        }
        var phone=getLocalStorage('phone');
        console.log(phone)
        if(phone !=null){
            $http({
                url:"getmyOrders",
                method:"get",
                params:{
                    phone:phone
                }
            }).success(function (data) {
                if (data == 'err') {
                    alert('请先登陆');
                    $location.path('/login').replace;
                }
                console.log(data)
                $scope.hasOrder=true;
                $scope.orders=data;
            })

        }else {
            $scope.hasOrder=false;
        }

        $scope.total=function () {
            var sum=0;
            for(var i=0;i<$scope.orders.length;i++){
                sum+=$scope.orders[i].price;
            }
            return sum
        };
        $scope.setCurrent=function (index) {
            $scope.currentProd=index;
        };
        $scope.del=function () {
            $scope.orders.splice( $scope.currentProd,1);
            $scope.currentProd=-1;
        };
        $scope.account=function () {
            $location.path('/account')
        }

    })
    .controller("registerCtrl",function ($scope,$http,$location){
        $scope.userdata={};
        $scope.regist=function () {
            var username=$scope.userdata.username;
            var password=$scope.userdata.password;
            $http.post("/registerInfo",{
                    "username":username,
                    "password":password
                }
            ).then(function (data) {
                console.log(data);
                if($scope.registerForm.$invalid){
                    alert('请检查您的信息')
                }else{
                    $location.path("/login")
                }
            })
        }

    })
    .controller("loginCtrl",function ($scope,$http,$location){
        $scope.userdata={
            username: '',
            password: ''
        };
        $scope.login=function () {
            $http.post("/loginInfo", $scope.userdata)
                .then(function (data) {
                    if (data.data == "err") {
                        alert('没有此用户');
                    }else {
                        $location.path("/main")
                    }

                });
        }


    })
    .controller("userMangerCtrl",function ($scope,$http,$location){
        $scope.user=[];
        function getLocalStorage(key,val) {
            return localStorage.getItem("kfl_" + key,val)
        }
        var phone=getLocalStorage('phone');
        console.log(phone)
        if(phone !=null){
            $http({
                url:"userManger",
                method:"get",
                params:{
                    phone:phone
                }
            }).success(function (data) {
                if (data == 'err') {
                    alert('请先登陆');
                    $location.path('/login').replace;
                }
                console.log(data)
                $scope.user=data[0];
            })

        }


    })
    .controller("accountCtrl",function () {
        
    })
    .directive('compare',function(){
        var o={};
        o.strict='AE';
        o.scope={
            orgText:'=compare'
        }
        o.require='ngModel';
        o.link=function (sco,ele,att,con) {
            con.$validators.compare=function (v) {
                return v==sco.orgText;

            }
            sco.$watch('orgText',function () {
                con.$validate();
            })
        }
        return o;
    })
    //添加路由
.config(function($routeProvider){
    $routeProvider
        .when("/start",{
            templateUrl:"template/start.html",
            controller:"startCtrl"
        })
        .when("/main",{
            templateUrl:"template/main.html",
            controller:"mainCtrl"
        })
        .when("/register",{
            templateUrl:"template/register.html",
            controller:"registerCtrl"
        })
        .when("/login",{
            templateUrl:"template/login.html",
            controller:"loginCtrl"
        })
        .when("/usermanger",{
            templateUrl:"template/usermanger.html",
            controller:"userMangerCtrl"
        })
        .when("/detail/:id",{
            templateUrl:"template/detail.html",
            controller:"detailCtrl"
        })
        .when("/order/:did",{
            templateUrl:"template/order.html",
            controller:"orderCtrl"
        })
        .when("/myOrder",{
            templateUrl:"template/myOrder.html",
            controller:"myOrderCtrl"
        })
        .when("/account",{
            templateUrl:"template/account.html",
            controller:"accountCtrl"
        })
        .otherwise({
            redirectTo:'/start'
        })
});