/**
 * 
 */
angular.module('calendarApp')
.directive('calendar',['$filter','$templateRequest','$compile',calendar])

// The actual directive
function calendar($filter,$templateRequest,$compile){
	var weekdays = ["Zo","Ma","Di","Wo","Do","Vr","Za"];
	var monthNames = ["Januari","Februari","Maart","April","Mei","Juni","Juli","Augustus","September","Oktober","November","December"];
	var todayDate = new Date();
	var selectedDate = 1;
	var weekNumber = $filter('date')(todayDate, 'ww');
	var selectedMonth = todayDate.getMonth();
	var selectedYear = todayDate.getFullYear();
	var calendarMode = "month";

	function link(scope, element, attrs){
		scope.selectedMonthName = monthNames[selectedMonth];
		scope.selectedYear = selectedYear;
		scope.weekNumber = weekNumber;
		scope.next = function(calendarMode){next(scope,calendarMode);};
		scope.previous = function(calendarMode){previous(scope,calendarMode);};
		scope.today = function(){today(scope);};
		scope.show = function(config){buildCalendar(scope,element,config)};
		// the main function
		buildCalendar(scope,element,{calendarMode:calendarMode});
	}

	function buildCalendar(scope,element,config){
		// build the data structure for calendar and assign to scope
		if(config.calendarMode == "month"){
			buildMonth(scope);
		}
		else if(config.calendarMode == "week"){
			weekNumber = moment().isoWeek(config.weekNumber).isoWeek();
			updateWeek(scope);
			buildWeek(scope);
		}
		else if(config.calendarMode == "day"){
			buildDay(scope);
		}
		getTemplateUrl(scope,element,config.calendarMode);
	}
	
	// initialize the correct template (month/week/day)
	function getTemplateUrl(scope,element,calendarMode){
		var templateUrl = "";
		if(calendarMode == 'week'){
			templateUrl = "week.html";
		}
		else if(calendarMode == 'day'){
			templateUrl = "day.html";
		}
		else {
			templateUrl = "month.html";
		}	
		$templateRequest("/app/components/calendar/views/" + templateUrl).then(function(html){
			// retrieve the empty view
			var template = angular.element(html);
			element.empty();
			element.append(template);
			// compile the template
			$compile(template)(scope);
		},this);
	}
	
	function buildMonth(scope){
		var week,weeks = [];
		var weekdayOfFirstDayOfSelectedMonth = new Date(selectedYear,selectedMonth).getDay(); // this is the weekday (su,mo,etc) of the 1st of month
		var dayCounter = 1 - weekdayOfFirstDayOfSelectedMonth; // 1st week of month starts here
		var nrOfDays = new Date(selectedYear,selectedMonth+1,0).getDate() + weekdayOfFirstDayOfSelectedMonth + 1;
		var nrOfWeeks = Math.ceil(nrOfDays / 7);
		var i,j;
		for(i=0;i<nrOfWeeks;i++){
			week = [];
			for(j=0;j<7;j++){
				date = new Date(selectedYear,selectedMonth,dayCounter)
				week.push({
					day:weekdays[date.getDay()],
					date: date.getDate(),
					isToday: todayDate.getDate() == dayCounter && todayDate.getMonth() == selectedMonth && todayDate.getFullYear() == selectedYear,
					isSelected: false,
					isCurrentMonth: selectedMonth % 12 == date.getMonth(),
				});
				dayCounter++;
			}
			week.push({
				weekNumber: $filter('date')(date, 'ww')
			});
			weeks.push(week);
		}
		scope.weeks = weeks;
	}
	
	function buildWeek(scope){	
		var i;
		var week=[];
		for(i=0; i<7; i++){
			week.push({
				date: moment().isoWeek(weekNumber-1).add(i,'day').date()
			});
		}
		scope.week = week;
	}


	// ===== Update the calendar =====

	function next(scope,calendarMode){
		if(calendarMode=='month'){
			selectedMonth++;
			updateMonth(scope);
		}
		else if(calendarMode=='week'){
			// use moment to add a week and retrieve new weeknumber
			weekNumber = moment().isoWeek(weekNumber).add(1,'week').isoWeek();
			updateWeek(scope);
		}
	}

	function previous(scope,calendarMode){
		if(calendarMode=='month'){
			selectedMonth--;
			updateMonth(scope);
		}
		else if(calendarMode=='week'){
			weekNumber = moment().isoWeek(weekNumber).add(-1,'week').isoWeek();
			updateWeek(scope);
		}
		updateMonth(scope);
	}
	
	function today(scope){
		selectedMonth = todayDate.getMonth();
		updateMonth(scope);
	}

	function updateMonth(scope){
		scope.selectedMonthName = monthNames[selectedMonth % 12];
		scope.selectedYear = new Date(selectedYear,selectedMonth,1).getFullYear();
		buildMonth(scope);
	}
	
	function updateWeek(scope){
		var firstDateInWeek = getDateForWeekNumber(weekNumber);
		scope.weekNumber = weekNumber;
		scope.selectedMonthName = monthNames[moment().isoWeek(weekNumber-1).month()];
		scope.selectedYear = moment().year();
		buildWeek(scope)
	}

	return{
		restrict: 'E',
		link: link
	}
	//  ===== Private functions =====
	
	function getDateForWeekNumber(weekNumber){
		var dayInYear;
		var firstWeekDayNumber = new Date(selectedYear,0,01).getDay();
		var weekNumberDayShift = firstWeekDayNumber < 5 ? -1*firstWeekDayNumber : firstWeekDayNumber - 7 - 1;
		dayInYear = 7*(weekNumber - 1) - weekNumberDayShift;

		return new Date(selectedYear,0,dayInYear);
	}
	
}
