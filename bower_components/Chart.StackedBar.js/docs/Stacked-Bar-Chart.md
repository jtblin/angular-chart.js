---
title: StackedBar Chart
anchor: stacked-bar-chart
---

### Introduction
A stacked bar chart is a way of showing data as bars.

<div class="canvas-holder">
	<canvas width="250" height="125"></canvas>
</div>

### Example usage
```javascript
var myStackedBarChart = new Chart(ctx).StackedBar(data, options);
```

### Data structure

```javascript
var data = {
	labels: ["January", "February", "March", "April", "May", "June", "July"],
	datasets: [
		{
			label: "My First dataset",
			fillColor: "rgba(220,220,220,0.5)",
			strokeColor: "rgba(220,220,220,0.8)",
			highlightFill: "rgba(220,220,220,0.75)",
			highlightStroke: "rgba(220,220,220,1)",
			data: [65, 59, 80, 81, 56, 55, 40]
		},
		{
			label: "My Second dataset",
			fillColor: "rgba(151,187,205,0.5)",
			strokeColor: "rgba(151,187,205,0.8)",
			highlightFill: "rgba(151,187,205,0.75)",
			highlightStroke: "rgba(151,187,205,1)",
			data: [28, 48, 40, 19, 86, 27, 90]
		}
	]
};
```

### Chart Options

These are the customisation options specific to StackedBar charts. These options are merged with the [global chart configuration options](#getting-started-global-chart-configuration), and form the options of the chart.

```javascript
{
	//Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
	scaleBeginAtZero : true,

	//Boolean - Whether grid lines are shown across the chart
	scaleShowGridLines : true,

	//String - Colour of the grid lines
	scaleGridLineColor : "rgba(0,0,0,.05)",

	//Number - Width of the grid lines
	scaleGridLineWidth : 1,

	//Boolean - If there is a stroke on each bar
	barShowStroke : true,

	//Number - Pixel width of the bar stroke
	barStrokeWidth : 2,

	//Number - Spacing between each of the X value sets
	barValueSpacing : 5,

	//Boolean - Whether bars should be rendered on a percentage base
	relativeBars : false,

	{% raw %}
	//String - A legend template
	legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",
	{% endraw %}
	
	//Boolean - Hide labels with value set to 0
	tooltipHideZero: false
}
```

You can override these for your `Chart` instance by passing a second argument into the `StackedBar` method as an object with the keys you want to override.

For example, we could have a stacked bar chart without a stroke on each bar by doing the following:

```javascript
new Chart(ctx).StackedBar(data, {
	barShowStroke: false
});
// This will create a chart with all of the default options, merged from the global config,
//  and the StackedBar chart defaults but this particular instance will have `barShowStroke` set to false.
```

We can also change these defaults values for each StackedBar type that is created, this object is available at `Chart.defaults.StackedBar`.

### Prototype methods

#### .getBarsAtEvent( event )

Calling `getBarsAtEvent(event)` on your Chart instance passing an argument of an event, or jQuery event, will return the bar elements that are at that the same position of that event.

```javascript
canvas.onclick = function(evt){
	var activeBars = myStackedBarChart.getBarsAtEvent(evt);
	// => activeBars is an array of bars on the canvas that are at the same position as the click event.
};
```

This functionality may be useful for implementing DOM based tooltips, or triggering custom behaviour in your application.

#### .update( )

Calling `update()` on your Chart instance will re-render the chart with any updated values, allowing you to edit the value of multiple existing points, then render those in one animated render loop.

```javascript
myStackedBarChart.datasets[0].bars[2].value = 50;
// Would update the first dataset's value of 'March' to be 50
myStackedBarChart.update();
// Calling update now animates the position of March from 90 to 50.
```

#### .addData( valuesArray, label )

Calling `addData(valuesArray, label)` on your Chart instance passing an array of values for each dataset, along with a label for those bars.

```javascript
// The values array passed into addData should be one for each dataset in the chart
myStackedBarChart.addData([40, 60], "August");
// The new data will now animate at the end of the chart.
```

#### .removeData( )

Calling `removeData()` on your Chart instance will remove the first value for all datasets on the chart.

```javascript
myStackedBarChart.removeData();
// The chart will now animate and remove the first bar
```
