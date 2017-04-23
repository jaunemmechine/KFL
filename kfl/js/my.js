/**
 * Created by vol on 2016/12/6.
 */
angular.module("myModule",["ng",'ngRoute','ngAnimate']).
controller('startCtrl',function(){}).
controller('mainCtrl',function($scope,$http){
    $scope.dishes=[];
    $scope.groupNum = 4;
    $scope.groupIndex = 1;
    $scope.loadStatus = 0;  //0:尚未加载     1:加载中...     2:没有更多了...
    loadDish();
    $scope.loadMoreDish = function(){
        $scope.loadStatus = 1;
        loadDish();
    };
    function loadDish(){
        $http({
            url:'getDish',
            method:'post',
            params:{
                num:$scope.groupNum,
                index:$scope.groupIndex
            }
        }).success(function(data){
            if(data.length != ""){
                $scope.groupIndex++;
                $scope.dishes = $scope.dishes.concat(data);
                $scope.loadStatus = 0;
            }else{
                $scope.loadStatus = 2;
            }


            console.log(data,$scope.dishes);
        });
    }
}).
controller('detailCtrl',function($scope,$routeParams,$http){
    $http({
        url:"getDishById",
        method:"post",
        params:{
            id:$routeParams.id
        }
    }).success(function(data){
        //console.log(data);
        $scope.dish = data[0];
    });
}).
controller('myOrderCtrl',function(){}).
controller('orderCtrl',function(){}).
config(function($routeProvider){
$routeProvider.
when('/start',{
    templateUrl:'template/start.html',
    controller:'startCtrl'
}).when('/main',{
    templateUrl:'template/main.html',
    controller:'mainCtrl'
}).when('/detail/:id',{
    templateUrl:'template/detail.html',
    controller:'detailCtrl'
}).when('/order',{
    templateUrl:'template/order.html',
    controller:'orderCtrl'
}).when('/myOrder',{
    templateUrl:'template/myOrder.html',
    controller:'myOrderCtrl'
}).otherwise({
    redirectTo:'/start'
})
});