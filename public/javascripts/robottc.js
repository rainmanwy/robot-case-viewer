
var robot = angular.module('robottc', ['ngTable', 'ngSanitize', 'ngCsv']);

angular.module('robottc').filter('ie', function(){
    return function(v, yes, no){
        var a = v ? yes : no;
        return a;
    };
});


robot.controller('ViewerController',
    function($scope, $filter, $http, ngTableParams) {

        $scope.filter_tags = {
            ftt: false,
            acceptance_test: false,
            cm: false,
            fm: false,
            pm: false,
            neac: false,
            em: false,
            not_ready: false
        };
        $scope.tags = [];
        $scope.selectedTags = [];
        var myData = {};


        $scope.suites = {};
        $scope.caseTable = new ngTableParams({
            page: 1,
            count: 10
        }, {
            total: 0,
            getData: function($defer, params) {
                var project = $('#project').text();
                $scope.projectName = project;
                $http.post(project, JSON.stringify($scope.selectedTags)).success(function(data) {
                    $scope.suites = data;
                    myData = data;
                    $scope.toCSV = [];
                    for(var index in $scope.suites) {
                        $scope.toCSV.push({a:$scope.suites[index].name})
                        var tests = $scope.suites[index].testcases;
                        for (var tIndex in tests) {
                            $scope.toCSV.push({a:'', b:tests[tIndex].name});
                        }
                    }

                    params.total(data.length);
                    if((params.page()-1)*params.count()>data.length) {
                        params.page(Math.ceil(data.length/params.count()));
                    }

                    $defer.resolve(myData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                    console.log('post finished');
                });
            }
        });

        $scope.get_filter_tags = function() {
            $http.get('tag').then(function(results) {
                console.log(results.data);
                $scope.tags = results.data;
            });
        };

        $scope.get_filter_tags();

        $scope.toggleSelection = function toggleSelection(tag) {
            var idx = $scope.selectedTags.indexOf(tag);

            // is currently selected
            if (idx > -1) {
              $scope.selectedTags.splice(idx, 1);
            }

            // is newly selected
            else {
              $scope.selectedTags.push(tag);
            }
            $scope.caseTable.reload();
        };

    }
);

